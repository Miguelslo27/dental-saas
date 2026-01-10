import { Stethoscope, Phone, Mail, Pencil, Trash2, RotateCcw } from 'lucide-react'
import type { Doctor } from '@/lib/doctor-api'

const DAYS_MAP: Record<string, string> = {
  MON: 'L',
  TUE: 'M',
  WED: 'X',
  THU: 'J',
  FRI: 'V',
  SAT: 'S',
  SUN: 'D',
}

const DAYS_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface DoctorCardProps {
  doctor: Doctor
  onEdit: (doctor: Doctor) => void
  onDelete: (doctor: Doctor) => void
  onRestore?: (doctor: Doctor) => void
}

export function DoctorCard({ doctor, onEdit, onDelete, onRestore }: DoctorCardProps) {
  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase()

  const sortedWorkingDays = [...(doctor.workingDays || [])].sort(
    (a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b)
  )

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${doctor.isActive ? 'border-gray-200' : 'border-orange-200 bg-orange-50/30'
        }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {doctor.avatar ? (
              <img
                src={doctor.avatar}
                alt={`${doctor.firstName} ${doctor.lastName}`}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-lg font-semibold text-white">{initials}</span>
              </div>
            )}

            {/* Name & specialty */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              {doctor.specialty && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Stethoscope className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{doctor.specialty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          {!doctor.isActive && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Inactivo
            </span>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-2 mb-4">
          {doctor.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{doctor.phone}</span>
            </div>
          )}
          {doctor.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{doctor.email}</span>
            </div>
          )}
        </div>

        {/* Working days */}
        {sortedWorkingDays.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Días de trabajo</p>
            <div className="flex gap-1.5">
              {DAYS_ORDER.map((day) => {
                const isWorking = sortedWorkingDays.includes(day)
                return (
                  <span
                    key={day}
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${isWorking
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-400'
                      }`}
                  >
                    {DAYS_MAP[day]}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Working hours */}
        {doctor.workingHours && (
          <div className="text-sm text-gray-600">
            <span className="text-gray-500">Horario:</span>{' '}
            {doctor.workingHours.start} - {doctor.workingHours.end}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-end gap-2">
        {!doctor.isActive && onRestore ? (
          <button
            onClick={() => onRestore(doctor)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>
        ) : (
          <>
            <button
              onClick={() => onEdit(doctor)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => onDelete(doctor)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default DoctorCard
