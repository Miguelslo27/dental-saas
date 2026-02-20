import { useEffect, useRef, useState } from 'react'
import { X, Loader2, Search } from 'lucide-react'
import { getPatients } from '@/lib/patient-api'

export interface PatientOption {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
}

interface PatientSearchComboboxProps {
  selectedPatient: PatientOption | null
  onSelect: (patient: PatientOption) => void
  onClear: () => void
  disabled?: boolean
  error?: string
}

export function PatientSearchCombobox({ selectedPatient, onSelect, onClear, disabled, error }: PatientSearchComboboxProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<PatientOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (!search || search.length < 1) {
      setResults([])
      setHighlightIndex(-1)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const patients = await getPatients({ search, limit: 10 })
        setResults(patients as unknown as PatientOption[])
        setHighlightIndex(-1)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (patient: PatientOption) => {
    onSelect(patient)
    setSearch('')
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < results.length) {
        handleSelect(results[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setIsOpen(false)
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-combobox-item]')
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  // Selected patient chip
  if (selectedPatient) {
    return (
      <div className={`flex items-center justify-between px-3 py-2 border rounded-lg ${disabled ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-200'}`}>
        <span className={`font-medium text-sm truncate ${disabled ? 'text-gray-700' : 'text-blue-900'}`}>
          {selectedPatient.firstName} {selectedPatient.lastName}
          {selectedPatient.phone && (
            <span className={`font-normal ml-2 ${disabled ? 'text-gray-500' : 'text-blue-700'}`}>{selectedPatient.phone}</span>
          )}
        </span>
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="text-blue-600 hover:text-blue-800 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => { if (search.length >= 1) setIsOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar paciente por nombre..."
          className={`w-full pl-9 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${error ? 'border-red-300' : 'border-gray-300'}`}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && search.length >= 1 && (
        <div
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {results.length === 0 && !isSearching && (
            <div className="p-3 text-sm text-gray-500">No se encontraron pacientes</div>
          )}
          {results.map((patient, index) => (
            <button
              key={patient.id}
              type="button"
              data-combobox-item
              onClick={() => handleSelect(patient)}
              className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between ${index === highlightIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'}`}
            >
              <span className="font-medium">
                {patient.firstName} {patient.lastName}
              </span>
              {patient.phone && <span className="text-xs text-gray-500">{patient.phone}</span>}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
