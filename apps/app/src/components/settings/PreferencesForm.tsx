import { useState, useEffect } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { useSettingsStore } from '@/stores/settings.store'
import type { TenantSettings, UpdateSettingsData } from '@/lib/settings-api'

const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' },
]

const TIME_FORMATS = [
  { value: '24h', label: '24 horas (14:30)' },
  { value: '12h', label: '12 horas (2:30 PM)' },
]

const APPOINTMENT_DURATIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
]

const REMINDER_HOURS = [
  { value: 1, label: '1 hora antes' },
  { value: 2, label: '2 horas antes' },
  { value: 4, label: '4 horas antes' },
  { value: 12, label: '12 horas antes' },
  { value: 24, label: '24 horas antes' },
  { value: 48, label: '48 horas antes' },
  { value: 72, label: '72 horas antes' },
]

interface PreferencesFormProps {
  settings: TenantSettings | null
  canEdit: boolean
}

export function PreferencesForm({ settings, canEdit }: PreferencesFormProps) {
  const { updateSettings, isSaving } = useSettingsStore()

  const [formData, setFormData] = useState<UpdateSettingsData>({
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    defaultAppointmentDuration: 30,
    appointmentBuffer: 0,
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reminderHoursBefore: 24,
  })

  // Sync form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        language: settings.language,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        defaultAppointmentDuration: settings.defaultAppointmentDuration,
        appointmentBuffer: settings.appointmentBuffer,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        appointmentReminders: settings.appointmentReminders,
        reminderHoursBefore: settings.reminderHoursBefore,
      })
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return
    await updateSettings(formData)
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Read-only notice */}
      {!canEdit && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <Lock className="h-4 w-4" />
          Solo el propietario o administradores pueden editar las preferencias
        </div>
      )}

      {/* Localization Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Localización</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Idioma
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={!canEdit}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
              Formato de Fecha
            </label>
            <select
              id="dateFormat"
              name="dateFormat"
              value={formData.dateFormat}
              onChange={handleChange}
              disabled={!canEdit}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {DATE_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Format */}
          <div>
            <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
              Formato de Hora
            </label>
            <select
              id="timeFormat"
              name="timeFormat"
              value={formData.timeFormat}
              onChange={handleChange}
              disabled={!canEdit}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {TIME_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Citas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Duration */}
          <div>
            <label
              htmlFor="defaultAppointmentDuration"
              className="block text-sm font-medium text-gray-700"
            >
              Duración por defecto
            </label>
            <select
              id="defaultAppointmentDuration"
              name="defaultAppointmentDuration"
              value={formData.defaultAppointmentDuration}
              onChange={handleChange}
              disabled={!canEdit}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {APPOINTMENT_DURATIONS.map((dur) => (
                <option key={dur.value} value={dur.value}>
                  {dur.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buffer Between Appointments */}
          <div>
            <label
              htmlFor="appointmentBuffer"
              className="block text-sm font-medium text-gray-700"
            >
              Tiempo entre citas (minutos)
            </label>
            <input
              type="number"
              id="appointmentBuffer"
              name="appointmentBuffer"
              value={formData.appointmentBuffer}
              onChange={handleChange}
              disabled={!canEdit}
              min={0}
              max={60}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tiempo de descanso entre citas consecutivas
            </p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
        <div className="space-y-4">
          {/* Email Notifications */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleChange}
              disabled={!canEdit}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-gray-700">
              Recibir notificaciones por email
            </span>
          </label>

          {/* SMS Notifications */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="smsNotifications"
              checked={formData.smsNotifications}
              onChange={handleChange}
              disabled={!canEdit}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-gray-700">
              Recibir notificaciones por SMS
            </span>
            <span className="text-xs text-gray-400">(Próximamente)</span>
          </label>

          {/* Appointment Reminders */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="appointmentReminders"
              checked={formData.appointmentReminders}
              onChange={handleChange}
              disabled={!canEdit}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-gray-700">
              Enviar recordatorios de citas a pacientes
            </span>
          </label>

          {/* Reminder Hours */}
          {formData.appointmentReminders && (
            <div className="ml-7">
              <label
                htmlFor="reminderHoursBefore"
                className="block text-sm font-medium text-gray-700"
              >
                Enviar recordatorio
              </label>
              <select
                id="reminderHoursBefore"
                name="reminderHoursBefore"
                value={formData.reminderHoursBefore}
                onChange={handleChange}
                disabled={!canEdit}
                className="mt-1 block w-48 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {REMINDER_HOURS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {canEdit && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar Cambios
          </button>
        </div>
      )}
    </form>
  )
}
