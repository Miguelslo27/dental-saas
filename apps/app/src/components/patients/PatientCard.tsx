import { Phone, Mail, Calendar, Pencil, Trash2, RotateCcw, ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import type { Patient } from '@/lib/patient-api'
import { calculateAge, getPatientInitials } from '@/lib/patient-api'

const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
  prefer_not_to_say: 'Prefiere no decir',
}

interface PatientCardProps {
  patient: Patient
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
  onRestore?: (patient: Patient) => void
}

export function PatientCard({ patient, onEdit, onDelete, onRestore }: PatientCardProps) {
  const initials = getPatientInitials(patient)
  const age = calculateAge(patient.dob)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
        patient.isActive ? 'border-gray-200' : 'border-orange-200 bg-orange-50/30'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">{initials}</span>
            </div>

            {/* Name & info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {patient.gender && (
                  <span className="text-sm text-gray-600">
                    {GENDER_LABELS[patient.gender] || patient.gender}
                  </span>
                )}
                {patient.gender && age !== null && (
                  <span className="text-gray-300">•</span>
                )}
                {age !== null && (
                  <span className="text-sm text-gray-600">{age} años</span>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          {!patient.isActive && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Inactivo
            </span>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-2 mb-4">
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
          {patient.dob && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(patient.dob)}</span>
            </div>
          )}
        </div>

        {/* Address */}
        {patient.address && (
          <div className="text-sm text-gray-600 line-clamp-2">
            <span className="text-gray-500">Dirección:</span> {patient.address}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-between">
        <Link
          to={`/patients/${patient.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver ficha
        </Link>
        <div className="flex gap-2">
        {!patient.isActive && onRestore ? (
          <button
            onClick={() => onRestore(patient)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>
        ) : (
          <>
            <button
              onClick={() => onEdit(patient)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => onDelete(patient)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  )
}

export default PatientCard
