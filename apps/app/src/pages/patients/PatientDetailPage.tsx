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
} from 'lucide-react'
import { DentalChart, ToothNoteModal } from '@/components/dental-chart'
import {
  type Patient,
  getPatientById,
  updateToothNote,
  deleteToothNote,
  calculateAge,
  getPatientInitials,
} from '@/lib/patient-api'

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

  // Handle tooth selection
  const handleToothSelect = useCallback((toothNumber: string) => {
    setSelectedTooth(toothNumber)
    setIsToothModalOpen(true)
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

        <DentalChart
          teeth={teeth}
          onToothSelect={handleToothSelect}
          selectedTooth={selectedTooth}
          showPrimary={showPrimaryTeeth}
        />

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
                  onClick={() => handleToothSelect(toothNumber)}
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
        }}
        onSave={handleSaveToothNote}
        onDelete={teeth[selectedTooth || ''] ? handleDeleteToothNote : undefined}
        toothNumber={selectedTooth || ''}
        currentNote={selectedTooth ? teeth[selectedTooth] || '' : ''}
        isLoading={isSavingTooth}
      />
    </div>
  )
}
