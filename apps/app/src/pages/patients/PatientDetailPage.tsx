import { useEffect, useState, useCallback, useId } from 'react'
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
  FileText,
} from 'lucide-react'
import { Odontogram } from 'react-odontogram'
import '@/assets/odontogram.css'
import {
  type Patient,
  getPatientById,
  updateToothData,
  deleteToothData,
  calculateAge,
  getPatientInitials,
} from '@/lib/patient-api'
import { downloadPatientHistoryPdf } from '@/lib/pdf-api'
import { ToothStatus, type ToothData } from '@dental/shared'

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
// Helper Functions
// ============================================================================

function getStatusLabel(status: ToothStatus): string {
  const labels: Record<ToothStatus, string> = {
    [ToothStatus.HEALTHY]: 'Saludable',
    [ToothStatus.CARIES]: 'Caries',
    [ToothStatus.FILLED]: 'Empastado',
    [ToothStatus.CROWN]: 'Corona',
    [ToothStatus.ROOT_CANAL]: 'Endodoncia',
    [ToothStatus.MISSING]: 'Ausente',
    [ToothStatus.EXTRACTED]: 'Extraído',
    [ToothStatus.IMPLANT]: 'Implante',
    [ToothStatus.BRIDGE]: 'Puente',
  }
  return labels[status]
}

function getStatusColorClass(status: ToothStatus): string {
  const classes: Record<ToothStatus, string> = {
    [ToothStatus.CARIES]: 'bg-red-50 border-red-200',
    [ToothStatus.FILLED]: 'bg-blue-50 border-blue-200',
    [ToothStatus.CROWN]: 'bg-blue-50 border-blue-200',
    [ToothStatus.ROOT_CANAL]: 'bg-blue-50 border-blue-200',
    [ToothStatus.MISSING]: 'bg-gray-50 border-gray-300',
    [ToothStatus.EXTRACTED]: 'bg-gray-50 border-gray-300',
    [ToothStatus.IMPLANT]: 'bg-purple-50 border-purple-200',
    [ToothStatus.BRIDGE]: 'bg-purple-50 border-purple-200',
    [ToothStatus.HEALTHY]: 'bg-amber-50 border-amber-200',
  }
  return classes[status]
}

function getStatusTextColorClass(status: ToothStatus): string {
  const classes: Record<ToothStatus, string> = {
    [ToothStatus.CARIES]: 'text-red-800',
    [ToothStatus.FILLED]: 'text-blue-800',
    [ToothStatus.CROWN]: 'text-blue-800',
    [ToothStatus.ROOT_CANAL]: 'text-blue-800',
    [ToothStatus.MISSING]: 'text-gray-700',
    [ToothStatus.EXTRACTED]: 'text-gray-700',
    [ToothStatus.IMPLANT]: 'text-purple-800',
    [ToothStatus.BRIDGE]: 'text-purple-800',
    [ToothStatus.HEALTHY]: 'text-amber-800',
  }
  return classes[status]
}

// ============================================================================
// Tooth Details Modal Component
// ============================================================================

interface ToothDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ToothData) => void
  onDelete?: () => void
  toothNumber: string
  toothType: string
  currentData?: ToothData
  isLoading?: boolean
}

function ToothDetailsModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  toothNumber,
  toothType,
  currentData = { note: '', status: ToothStatus.HEALTHY },
  isLoading = false,
}: ToothDetailsModalProps) {
  const [note, setNote] = useState(currentData.note)
  const [status, setStatus] = useState(currentData.status)
  const titleId = useId()
  const textareaId = useId()
  const statusId = useId()

  useEffect(() => {
    setNote(currentData.note)
    setStatus(currentData.status)
  }, [currentData, toothNumber])

  if (!isOpen) return null

  const handleSave = () => {
    onSave({ note: note.trim(), status })
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
      aria-labelledby={titleId}
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
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Diente #{toothNumber}
            </h2>
            <p className="text-sm text-gray-500">{toothType}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Status Selector */}
          <div>
            <label htmlFor={statusId} className="block text-sm font-medium text-gray-700 mb-2">
              Estado del diente
            </label>
            <select
              id={statusId}
              value={status}
              onChange={(e) => setStatus(e.target.value as ToothStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value={ToothStatus.HEALTHY}>Saludable</option>
              <option value={ToothStatus.CARIES}>Caries</option>
              <option value={ToothStatus.FILLED}>Empastado</option>
              <option value={ToothStatus.CROWN}>Corona</option>
              <option value={ToothStatus.ROOT_CANAL}>Endodoncia</option>
              <option value={ToothStatus.MISSING}>Ausente</option>
              <option value={ToothStatus.EXTRACTED}>Extraído</option>
              <option value={ToothStatus.IMPLANT}>Implante</option>
              <option value={ToothStatus.BRIDGE}>Puente</option>
            </select>
          </div>

          {/* Notes Textarea */}
          <div>
            <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-2">
              Notas clínicas
            </label>
            <textarea
              id={textareaId}
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div>
            {(currentData.note || currentData.status !== ToothStatus.HEALTHY) && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

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

  // Handle save tooth data
  const handleSaveToothData = useCallback(async (data: ToothData) => {
    if (!patient || !selectedTooth) return

    setIsSavingTooth(true)
    try {
      const updated = await updateToothData(patient.id, selectedTooth, data)
      setPatient(updated)
      setIsToothModalOpen(false)
      setSelectedTooth(null)
      setSelectedToothType('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar los datos del diente')
    } finally {
      setIsSavingTooth(false)
    }
  }, [patient, selectedTooth])

  // Handle delete tooth data
  const handleDeleteToothData = useCallback(async () => {
    if (!patient || !selectedTooth) return

    setIsSavingTooth(true)
    try {
      const updated = await deleteToothData(patient.id, selectedTooth)
      setPatient(updated)
      setIsToothModalOpen(false)
      setSelectedTooth(null)
      setSelectedToothType('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar los datos del diente')
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
  // Normalize teeth data (handle both old string format and new ToothData format)
  const teeth: Record<string, ToothData> = {}
  if (patient.teeth) {
    for (const [toothNumber, value] of Object.entries(patient.teeth)) {
      if (typeof value === 'string') {
        teeth[toothNumber] = { note: value, status: ToothStatus.HEALTHY }
      } else if (typeof value === 'object' && value !== null) {
        teeth[toothNumber] = value as ToothData
      }
    }
  }

  // Generate color map based on tooth status
  const teethColors: Record<string, string> = {}
  for (const [toothNumber, toothData] of Object.entries(teeth)) {
    switch (toothData.status) {
      case ToothStatus.CARIES:
        teethColors[toothNumber] = '#ef4444' // red
        break
      case ToothStatus.FILLED:
      case ToothStatus.CROWN:
      case ToothStatus.ROOT_CANAL:
        teethColors[toothNumber] = '#3b82f6' // blue
        break
      case ToothStatus.MISSING:
      case ToothStatus.EXTRACTED:
        teethColors[toothNumber] = '#9ca3af' // gray
        break
      case ToothStatus.IMPLANT:
      case ToothStatus.BRIDGE:
        teethColors[toothNumber] = '#8b5cf6' // purple
        break
      case ToothStatus.HEALTHY:
        if (toothData.note) {
          teethColors[toothNumber] = '#f59e0b' // amber (has notes)
        }
        break
    }
  }

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

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setIsDownloadingPdf(true)
                try {
                  await downloadPatientHistoryPdf(patient.id)
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Error al descargar el PDF')
                } finally {
                  setIsDownloadingPdf(false)
                }
              }}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Exportar PDF
            </button>
            <Link
              to={`/patients?edit=${patient.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Link>
          </div>
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

        {/* Combined Dental Chart - Permanent with Primary overlaid */}
        <div className="relative flex flex-col items-center">
          {/* Permanent Teeth (base layer) */}
          <div className="odontogram-permanent">
            <Odontogram
              onChange={handleOdontogramChange}
              theme="light"
              colors={teethColors}
              notation="FDI"
              maxTeeth={8}
              showTooltip={true}
              tooltip={{ placement: 'top', margin: 8 }}
            />
          </div>

          {/* Primary Teeth (overlaid, smaller, centered) */}
          {showPrimaryTeeth && (
            <div
              className="odontogram-primary absolute inset-0 flex items-center justify-center pointer-events-none [&_.Odontogram_g]:pointer-events-auto"
              style={{ transform: 'scale(0.55)' }}
            >
              <Odontogram
                onChange={handleOdontogramChange}
                theme="light"
                colors={teethColors}
                notation="FDI"
                maxTeeth={5}
                showTooltip={true}
                tooltip={{ placement: 'bottom', margin: 4 }}
              />
            </div>
          )}
        </div>

        {/* Status Color Legend - outside relative container to avoid affecting primary teeth overlay */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Leyenda de estados</h3>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-gray-600">Caries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-gray-600">Tratado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-400" />
              <span className="text-gray-600">Ausente/Extraído</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-gray-600">Implante/Puente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-gray-600">Saludable con notas</span>
            </div>
          </div>
        </div>

        {/* Legend when showing primary teeth */}
        {showPrimaryTeeth && (
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border border-blue-400 bg-blue-100" />
              Permanentes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border border-emerald-500 bg-emerald-100" />
              Temporales
            </span>
          </div>
        )}

        {/* Teeth data summary */}
        {Object.keys(teeth).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Dientes registrados ({Object.keys(teeth).length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(teeth).map(([toothNumber, toothData]) => (
                <button
                  key={toothNumber}
                  onClick={() => {
                    setSelectedTooth(toothNumber)
                    setSelectedToothType('')
                    setIsToothModalOpen(true)
                  }}
                  className={`text-left p-3 border rounded-lg hover:opacity-80 transition-opacity ${getStatusColorClass(toothData.status)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${getStatusTextColorClass(toothData.status)}`}>
                      Diente #{toothNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/50 font-medium">
                      {getStatusLabel(toothData.status)}
                    </span>
                  </div>
                  {toothData.note && (
                    <p className={`text-sm mt-1 line-clamp-2 ${getStatusTextColorClass(toothData.status)}`}>
                      {toothData.note}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tooth Details Modal */}
      <ToothDetailsModal
        isOpen={isToothModalOpen}
        onClose={() => {
          setIsToothModalOpen(false)
          setSelectedTooth(null)
          setSelectedToothType('')
        }}
        onSave={handleSaveToothData}
        onDelete={teeth[selectedTooth || ''] ? handleDeleteToothData : undefined}
        toothNumber={selectedTooth || ''}
        toothType={selectedToothType}
        currentData={selectedTooth ? teeth[selectedTooth] : { note: '', status: ToothStatus.HEALTHY }}
        isLoading={isSavingTooth}
      />
    </div>
  )
}
