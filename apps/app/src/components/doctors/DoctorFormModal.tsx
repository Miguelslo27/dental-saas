import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import type { Doctor, CreateDoctorData } from '@/lib/doctor-api'

// ============================================================================
// Validation Schema
// ============================================================================

const doctorFormSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  workingDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  consultingRoom: z.string().optional(),
  bio: z.string().max(5000, 'La biografía no puede exceder 5000 caracteres').optional(),
  hourlyRate: z.coerce.number().positive('Debe ser un número positivo').optional().or(z.literal('')),
})

type DoctorFormData = z.infer<typeof doctorFormSchema>

// ============================================================================
// Constants
// ============================================================================

const WORKING_DAYS = [
  { value: 'MON', label: 'Lunes' },
  { value: 'TUE', label: 'Martes' },
  { value: 'WED', label: 'Miércoles' },
  { value: 'THU', label: 'Jueves' },
  { value: 'FRI', label: 'Viernes' },
  { value: 'SAT', label: 'Sábado' },
  { value: 'SUN', label: 'Domingo' },
] as const

// ============================================================================
// Component
// ============================================================================

interface DoctorFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateDoctorData) => Promise<void>
  doctor?: Doctor | null
  isLoading?: boolean
}

export function DoctorFormModal({
  isOpen,
  onClose,
  onSubmit,
  doctor,
  isLoading = false,
}: DoctorFormModalProps) {
  const isEditing = !!doctor

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      licenseNumber: '',
      workingDays: [],
      workingHoursStart: '',
      workingHoursEnd: '',
      consultingRoom: '',
      bio: '',
      hourlyRate: '',
    },
  })

  const watchedWorkingDays = watch('workingDays') || []

  // Reset form when doctor changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (doctor) {
        reset({
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email || '',
          phone: doctor.phone || '',
          specialty: doctor.specialty || '',
          licenseNumber: doctor.licenseNumber || '',
          workingDays: (doctor.workingDays as Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>) || [],
          workingHoursStart: doctor.workingHours?.start || '',
          workingHoursEnd: doctor.workingHours?.end || '',
          consultingRoom: doctor.consultingRoom || '',
          bio: doctor.bio || '',
          hourlyRate: doctor.hourlyRate ?? '',
        })
      } else {
        reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          specialty: '',
          licenseNumber: '',
          workingDays: [],
          workingHoursStart: '',
          workingHoursEnd: '',
          consultingRoom: '',
          bio: '',
          hourlyRate: '',
        })
      }
    }
  }, [isOpen, doctor, reset])

  const handleFormSubmit = async (data: DoctorFormData) => {
    const submitData: CreateDoctorData = {
      firstName: data.firstName,
      lastName: data.lastName,
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
      ...(data.specialty && { specialty: data.specialty }),
      ...(data.licenseNumber && { licenseNumber: data.licenseNumber }),
      ...(data.workingDays?.length && { workingDays: data.workingDays }),
      ...(data.workingHoursStart &&
        data.workingHoursEnd && {
          workingHours: { start: data.workingHoursStart, end: data.workingHoursEnd },
        }),
      ...(data.consultingRoom && { consultingRoom: data.consultingRoom }),
      ...(data.bio && { bio: data.bio }),
      ...(typeof data.hourlyRate === 'number' && { hourlyRate: data.hourlyRate }),
    }

    await onSubmit(submitData)
  }

  const toggleWorkingDay = (day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN') => {
    const current = watchedWorkingDays
    if (current.includes(day)) {
      setValue(
        'workingDays',
        current.filter((d) => d !== day)
      )
    } else {
      setValue('workingDays', [...current, day])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Doctor' : 'Nuevo Doctor'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-6 py-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Juan"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Pérez"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="doctor@clinica.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              {/* Professional info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    {...register('specialty')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Odontología General"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Licencia
                  </label>
                  <input
                    type="text"
                    {...register('licenseNumber')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="LIC-12345"
                  />
                </div>
              </div>

              {/* Working days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de Trabajo
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKING_DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWorkingDay(day.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        watchedWorkingDays.includes(day.value)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Working hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    {...register('workingHoursStart')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    {...register('workingHoursEnd')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Additional info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultorio
                  </label>
                  <input
                    type="text"
                    {...register('consultingRoom')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Consultorio 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarifa por Hora
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('hourlyRate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100.00"
                  />
                  {errors.hourlyRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biografía
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Breve descripción profesional..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {(isSubmitting || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DoctorFormModal
