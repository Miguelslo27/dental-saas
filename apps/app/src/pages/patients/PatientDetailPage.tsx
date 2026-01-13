import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  AlertCircle,
  Loader2,
  ChevronRight,
  X,
} from 'lucide-react'
import { Odontogram } from 'react-odontogram'
import '@/assets/odontogram.css'
import {
  type Patient,
  getPatientById,
  updateToothNote,
  deleteToothNote,
  calculateAge,
  getPatientInitials,
} from '@/lib/patient-api'

// ============================================================================
// Types
// ============================================================================

interface ToothDetail {
  id: string
  notations: {
    fdi: string
    universal: string
    palmer: string
  }
  type: string
}

// ============================================================================
// Tooth Note Modal Component
// ============================================================================

interface ToothNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: string) => void
  onDelete?: () => void
  toothNumber: string
  toothType: string
  currentNote?: string
  isLoading?: boolean
}

function ToothNoteModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  toothNumber,
  toothType,
  currentNote = '',
  isLoading = false,
}: ToothNoteModalProps) {
  const [note, setNote] = useState(currentNote)

  useEffect(() => {
    setNote(currentNote)
  }, [currentNote, toothNumber])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(note.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tooth-modal-title"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 id="tooth-modal-title" className="text-lg font-semibold text-gray-900">
              Diente #{toothNumber}
            </h2>
            <p className="text-sm text-gray-500">{toothType}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas clínicas
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ingrese observaciones sobre este diente..."
            rows={4}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {note.length}/1000 caracteres
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div>
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
              >
                Eliminar nota
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !note.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Patient Detail Page
// ============================================================================

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dental chart state
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
  const [selectedToothType, setSelectedToothType] = useState<string>('')
  const [isToothModalOpen, setIsToothModalOpen] = useState(false)
  const [isSavingTooth, setIsSavingTooth] = useState(false)
  const [showPrimaryTeeth, setShowPrimaryTeeth] = useState(false)

  // Fetch patient data
  useEffect(() => {
    if (!id) return

    const fetchPatient = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPatientById(id)
        setPatient(data)

        // Auto-show primary teeth for children
        if (data.dob) {
          const age = calculateAge(data.dob)
          if (age !== null && age < 14) {
            setShowPrimaryTeeth(true)
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar el paciente')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  // Handle odontogram change - when a tooth is clicked
  const handleOdontogramChange = useCallback((selected: ToothDetail[]) => {
    // When user clicks a tooth, the last selected tooth is the one we want
    if (selected.length > 0) {
      const lastTooth = selected[selected.length - 1]
      const fdiNumber = lastTooth.notations.fdi
      setSelectedTooth(fdiNumber)
      setSelectedToothType(lastTooth.type)
      setIsToothModalOpen(true)
    }
  }, [])

  // Handle save tooth note
  const handleSaveToothNote = useCallback(async (note: string) => {
    if (!patient || !selectedTooth) return

    setIsSavingTooth(true)
    try {
      const updated = await updateToothNote(patient.id, selectedTooth, note)
      setPatient(updated)
      setIsToothModalOpen(false)
      setSelectedTooth(null)
      setSelectedToothType('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar la nota')
    } finally {
      setIsSavingTooth(false)
    }
  }, [patient, selectedTooth])

  // Handle delete tooth note
  const handleDeleteToothNote = useCallback(async () => {
    if (!patient || !selectedTooth) return

    setIsSavingTooth(true)
    try {
      const updated = await deleteToothNote(patient.id, selectedTooth)
      setPatient(updated)
      setIsToothModalOpen(false)
      setSelectedTooth(null)
      setSelectedToothType('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar la nota')
    } finally {
      setIsSavingTooth(false)
    }
  }, [patient, selectedTooth])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Error state
  if (error && !patient) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver a pacientes
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) return null

  const age = patient.dob ? calculateAge(patient.dob) : null
  const initials = getPatientInitials(patient)
  const teeth = patient.teeth || {}

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/patients" className="hover:text-gray-700">
          Pacientes
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">
          {patient.firstName} {patient.lastName}
        </span>
      </nav>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Patient Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">{initials}</span>
            </div>

            {/* Name and status */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {patient.isActive ? 'Activo' : 'Inactivo'}
                </span>
                {age !== null && (
                  <span className="text-gray-500 text-sm">{age} años</span>
                )}
              </div>
            </div>
          </div>

          {/* Edit button */}
          <Link
            to={`/patients?edit=${patient.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </Link>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {patient.email && (
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-sm">{patient.email}</span>
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-sm">{patient.phone}</span>
            </div>
          )}
          {patient.dob && (
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm">
                {new Date(patient.dob).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-sm">{patient.address}</span>
            </div>
          )}
          {patient.gender && (
            <div className="flex items-center gap-3 text-gray-600">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm capitalize">
                {patient.gender === 'male' && 'Masculino'}
                {patient.gender === 'female' && 'Femenino'}
                {patient.gender === 'other' && 'Otro'}
                {patient.gender === 'prefer_not_to_say' && 'Prefiere no decir'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dental Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Odontograma</h2>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPrimaryTeeth}
              onChange={(e) => setShowPrimaryTeeth(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar dientes temporales
          </label>
        </div>

        <div className="flex justify-center">
          <Odontogram
            onChange={handleOdontogramChange}
            theme="light"
            colors={{}}
            notation="FDI"
            maxTeeth={showPrimaryTeeth ? 5 : 8}
            showTooltip={true}
            tooltip={{
              placement: 'top',
              margin: 8,
            }}
          />
        </div>

        {/* Teeth notes summary */}
        {Object.keys(teeth).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Notas registradas ({Object.keys(teeth).length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(teeth).map(([toothNumber, note]) => (
                <button
                  key={toothNumber}
                  onClick={() => {
                    setSelectedTooth(toothNumber)
                    setSelectedToothType('')
                    setIsToothModalOpen(true)
                  }}
                  className="text-left p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <span className="text-sm font-medium text-amber-800">
                    Diente #{toothNumber}
                  </span>
                  <p className="text-sm text-amber-700 mt-1 line-clamp-2">{note}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tooth Note Modal */}
      <ToothNoteModal
        isOpen={isToothModalOpen}
        onClose={() => {
          setIsToothModalOpen(false)
          setSelectedTooth(null)
          setSelectedToothType('')
        }}
        onSave={handleSaveToothNote}
        onDelete={teeth[selectedTooth || ''] ? handleDeleteToothNote : undefined}
        toothNumber={selectedTooth || ''}
        toothType={selectedToothType}
        currentNote={selectedTooth ? teeth[selectedTooth] || '' : ''}
        isLoading={isSavingTooth}
      />
    </div>
  )
}
