import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Calendar, Clock, User, Stethoscope } from 'lucide-react'
import type { Appointment, CreateAppointmentData, UpdateAppointmentData, AppointmentStatus } from '../../lib/appointment-api'
import { getStatusLabel } from '../../lib/appointment-api'
import * as patientApi from '../../lib/patient-api'
import * as doctorApi from '../../lib/doctor-api'
import { PatientSearchCombobox, type PatientOption } from '../ui/PatientSearchCombobox'

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED',
]

// Input schema (before transform)
const appointmentFormSchemaInput = z.object({
  patientId: z.string().min(1, 'El paciente es requerido'),
  doctorId: z.string().min(1, 'El doctor es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  startTime: z.string().min(1, 'La hora de inicio es requerida'),
  endTime: z.string().min(1, 'La hora de fin es requerida'),
  type: z.string().optional(),
  notes: z.string().optional(),
  cost: z.string().optional(),
  isPaid: z.boolean().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime
  }
  return true
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['endTime'],
})

type FormData = z.input<typeof appointmentFormSchemaInput>

interface DoctorOption {
  id: string
  firstName: string
  lastName: string
  specialty: string | null
}

interface AppointmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAppointmentData | UpdateAppointmentData) => Promise<void>
  appointment?: Appointment | null
  isLoading?: boolean
  defaultDate?: Date
  defaultPatientId?: string
}

export function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  isLoading = false,
  defaultDate,
  defaultPatientId,
}: AppointmentFormModalProps) {
  const modalTitleId = useId()
  const isEditing = !!appointment

  // State for doctor options
  const [doctors, setDoctors] = useState<DoctorOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  // Selected patient state for the combobox
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(appointmentFormSchemaInput),
    defaultValues: {
      patientId: '',
      doctorId: '',
      date: '',
      startTime: '',
      endTime: '',
      type: '',
      notes: '',
      cost: '',
      isPaid: false,
      status: 'SCHEDULED',
    },
  })

  // Fetch doctors (and resolve patient name if needed) when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const fetchOptions = async () => {
    setLoadingOptions(true)
    try {
      const doctorsRes = await doctorApi.getDoctors({ limit: 100 })
      setDoctors(doctorsRes as unknown as DoctorOption[])

      // Resolve patient name for defaultPatientId or editing
      if (defaultPatientId || appointment?.patientId) {
        const patientIdToResolve = defaultPatientId || appointment?.patientId
        const patientsRes = await patientApi.getPatients({ limit: 100 })
        const found = (patientsRes as unknown as PatientOption[]).find(p => p.id === patientIdToResolve)
        if (found) {
          setSelectedPatient(found)
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    } finally {
      setLoadingOptions(false)
    }
  }

  // Reset form when appointment changes or modal opens (after options are loaded)
  useEffect(() => {
    if (isOpen && !loadingOptions) {
      if (appointment) {
        const startDate = new Date(appointment.startTime)
        const endDate = new Date(appointment.endTime)

        reset({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          date: formatDateForInput(startDate),
          startTime: formatTimeForInput(startDate),
          endTime: formatTimeForInput(endDate),
          type: appointment.type || '',
          notes: appointment.notes || '',
          cost: appointment.cost?.toString() || '',
          isPaid: appointment.isPaid || false,
          status: appointment.status,
        })
      } else {
        const dateToUse = defaultDate || new Date()
        reset({
          patientId: defaultPatientId || '',
          doctorId: '',
          date: formatDateForInput(dateToUse),
          startTime: '09:00',
          endTime: '09:30',
          type: '',
          notes: '',
          cost: '',
          isPaid: false,
          status: 'SCHEDULED',
        })
      }
    }
  }, [appointment, isOpen, defaultDate, defaultPatientId, reset, loadingOptions])

  // Clear selected patient when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPatient(null)
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleFormSubmit = async (data: FormData) => {
    // Combine date and time into ISO strings
    const startDateTime = new Date(`${data.date}T${data.startTime}:00`)
    const endDateTime = new Date(`${data.date}T${data.endTime}:00`)

    const appointmentData: CreateAppointmentData | UpdateAppointmentData = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      type: data.type || undefined,
      notes: data.notes || undefined,
      cost: data.cost ? parseFloat(data.cost) : undefined,
      isPaid: data.isPaid || undefined,
      status: data.status || undefined,
    }

    await onSubmit(appointmentData)
  }

  const handlePatientSelect = (patient: PatientOption) => {
    setSelectedPatient(patient)
    setValue('patientId', patient.id, { shouldValidate: true })
  }

  const handlePatientClear = () => {
    setSelectedPatient(null)
    setValue('patientId', '', { shouldValidate: true })
  }

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
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id={modalTitleId} className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {isEditing ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar formulario"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-6 py-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Patient and Doctor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4" />
                    Paciente *
                  </label>
                  <PatientSearchCombobox
                    selectedPatient={selectedPatient}
                    onSelect={handlePatientSelect}
                    onClear={handlePatientClear}
                    disabled={!!defaultPatientId}
                    error={errors.patientId?.message}
                  />
                  <input type="hidden" {...register('patientId')} />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Stethoscope className="h-4 w-4" />
                    Doctor *
                  </label>
                  <select
                    {...register('doctorId')}
                    disabled={loadingOptions}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.firstName} {doctor.lastName} {doctor.specialty ? `(${doctor.specialty})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.doctorId && (
                    <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
                  )}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="h-4 w-4" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Clock className="h-4 w-4" />
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    {...register('startTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Clock className="h-4 w-4" />
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    {...register('endTime')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Cita
                  </label>
                  <input
                    type="text"
                    {...register('type')}
                    placeholder="Ej: Limpieza, Revisión, Ortodoncia..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {APPOINTMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Cost and Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('cost')}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isPaid')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Pagado
                    </span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Notas adicionales sobre la cita..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading || loadingOptions}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {(isSubmitting || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

export default AppointmentFormModal
