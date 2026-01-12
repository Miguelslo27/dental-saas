import { useEffect, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Search } from 'lucide-react'
import type { Labwork, CreateLabworkData } from '@/lib/labwork-api'
import { getPatients } from '@/lib/patient-api'

// ============================================================================
// Validation Schema
// ============================================================================

const labworkFormSchema = z.object({
  patientId: z.string().min(1, 'El paciente es requerido'),
  lab: z.string().min(1, 'El nombre del laboratorio es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  price: z.coerce.number().min(0, 'El precio debe ser 0 o mayor'),
  isPaid: z.boolean().optional(),
  isDelivered: z.boolean().optional(),
  notes: z.string().max(2000, 'Las notas no pueden exceder 2000 caracteres').optional(),
})

type LabworkFormData = z.infer<typeof labworkFormSchema>

// ============================================================================
// Patient Search Component
// ============================================================================

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
}

interface PatientSearchProps {
  value: string
  onChange: (patientId: string) => void
  selectedPatient: PatientOption | null
  onSelectPatient: (patient: PatientOption | null) => void
  error?: string
}

function PatientSearch({ value, onChange, selectedPatient, onSelectPatient, error }: PatientSearchProps) {
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!search || search.length < 2) {
      setPatients([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await getPatients({ search, limit: 10 })
        setPatients(results)
      } catch {
        setPatients([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleSelectPatient = (patient: PatientOption) => {
    onSelectPatient(patient)
    onChange(patient.id)
    setSearch('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onSelectPatient(null)
    onChange('')
    setSearch('')
  }

  if (selectedPatient) {
    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <p className="font-medium text-blue-900">
            {selectedPatient.firstName} {selectedPatient.lastName}
          </p>
          {selectedPatient.phone && (
            <p className="text-sm text-blue-700">{selectedPatient.phone}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-blue-600 hover:text-blue-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar paciente por nombre..."
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-300' : 'border-gray-300'
            }`}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && search.length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {patients.length === 0 && !isSearching && (
            <div className="p-3 text-sm text-gray-500">No se encontraron pacientes</div>
          )}
          {patients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => handleSelectPatient(patient)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
            >
              <span className="font-medium">
                {patient.firstName} {patient.lastName}
              </span>
              {patient.phone && <span className="text-sm text-gray-500">{patient.phone}</span>}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      <input type="hidden" value={value} />
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

interface LabworkFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLabworkData) => Promise<void>
  labwork?: Labwork | null
  isLoading?: boolean
}

export function LabworkFormModal({
  isOpen,
  onClose,
  onSubmit,
  labwork,
  isLoading = false,
}: LabworkFormModalProps) {
  const isEditing = !!labwork
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LabworkFormData>({
    resolver: zodResolver(labworkFormSchema),
    defaultValues: {
      patientId: '',
      lab: '',
      date: new Date().toISOString().split('T')[0],
      price: 0,
      isPaid: false,
      isDelivered: false,
      notes: '',
    },
  })

  const watchedPatientId = watch('patientId')

  // Reset form when labwork changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (labwork) {
        reset({
          patientId: labwork.patientId || '',
          lab: labwork.lab,
          date: labwork.date.split('T')[0],
          price: labwork.price,
          isPaid: labwork.isPaid,
          isDelivered: labwork.isDelivered,
          notes: labwork.note || '',
        })
        if (labwork.patient && labwork.patientId) {
          setSelectedPatient({
            id: labwork.patientId,
            firstName: labwork.patient.firstName,
            lastName: labwork.patient.lastName,
            phone: labwork.patient.phone,
          })
        }
      } else {
        reset({
          patientId: '',
          lab: '',
          date: new Date().toISOString().split('T')[0],
          price: 0,
          isPaid: false,
          isDelivered: false,
          notes: '',
        })
        setSelectedPatient(null)
      }
    }
  }, [isOpen, labwork, reset])

  const handleFormSubmit = async (data: LabworkFormData) => {
    const submitData: CreateLabworkData = {
      patientId: data.patientId,
      lab: data.lab,
      date: data.date,
      price: data.price,
      isPaid: data.isPaid ?? false,
      isDelivered: data.isDelivered ?? false,
      ...(data.notes && { notes: data.notes }),
    }

    await onSubmit(submitData)
  }

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting && !isLoading) {
        onClose()
      }
    },
    [onClose, isSubmitting, isLoading]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const modalTitleId = 'labwork-form-modal-title'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          className="relative w-full max-w-lg bg-white rounded-xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id={modalTitleId} className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Trabajo de Laboratorio' : 'Nuevo Trabajo de Laboratorio'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Patient Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente <span className="text-red-500">*</span>
                </label>
                <PatientSearch
                  value={watchedPatientId}
                  onChange={(id) => setValue('patientId', id, { shouldValidate: true })}
                  selectedPatient={selectedPatient}
                  onSelectPatient={setSelectedPatient}
                  error={errors.patientId?.message}
                />
              </div>

              {/* Lab name */}
              <div>
                <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1">
                  Laboratorio <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('lab')}
                  type="text"
                  id="lab"
                  placeholder="Ej: Lab Dental Central"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lab ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.lab && <p className="mt-1 text-sm text-red-500">{errors.lab.message}</p>}
              </div>

              {/* Date and Price row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('date')}
                    type="date"
                    id="date"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('price')}
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('isPaid')}
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pagado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('isDelivered')}
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Entregado</span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  {...register('notes')}
                  id="notes"
                  rows={3}
                  placeholder="Notas adicionales sobre el trabajo..."
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.notes ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes.message}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {(isSubmitting || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Trabajo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
