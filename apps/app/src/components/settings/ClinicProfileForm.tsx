import { useState, useEffect } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { useSettingsStore } from '@/stores/settings.store'
import type { TenantProfile, UpdateTenantProfileData } from '@/lib/settings-api'

// Common timezones for dental clinics
const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'America/Santiago', label: 'Chile (Santiago)' },
  { value: 'America/Bogota', label: 'Colombia (Bogotá)' },
  { value: 'America/Mexico_City', label: 'México (Ciudad de México)' },
  { value: 'America/Lima', label: 'Perú (Lima)' },
  { value: 'America/Caracas', label: 'Venezuela (Caracas)' },
  { value: 'America/New_York', label: 'Estados Unidos (Nueva York)' },
  { value: 'America/Los_Angeles', label: 'Estados Unidos (Los Ángeles)' },
  { value: 'Europe/Madrid', label: 'España (Madrid)' },
  { value: 'UTC', label: 'UTC' },
]

// Common currencies
const CURRENCIES = [
  { value: 'ARS', label: 'Peso Argentino (ARS)' },
  { value: 'CLP', label: 'Peso Chileno (CLP)' },
  { value: 'COP', label: 'Peso Colombiano (COP)' },
  { value: 'MXN', label: 'Peso Mexicano (MXN)' },
  { value: 'PEN', label: 'Sol Peruano (PEN)' },
  { value: 'USD', label: 'Dólar Estadounidense (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'BRL', label: 'Real Brasileño (BRL)' },
]

interface ClinicProfileFormProps {
  profile: TenantProfile | null
  canEdit: boolean
}

export function ClinicProfileForm({ profile, canEdit }: ClinicProfileFormProps) {
  const { updateTenantProfile, isSaving } = useSettingsStore()

  const [formData, setFormData] = useState<UpdateTenantProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    timezone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
  })

  // Sync form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        address: profile.address || '',
        logo: profile.logo || '',
        timezone: profile.timezone,
        currency: profile.currency,
      })
    }
  }, [profile])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return

    // Clean empty strings to null for optional fields
    const dataToSend: UpdateTenantProfileData = {
      ...formData,
      phone: formData.phone || null,
      address: formData.address || null,
      logo: formData.logo || null,
    }

    await updateTenantProfile(dataToSend)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Read-only notice for non-owners */}
      {!canEdit && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          <Lock className="h-4 w-4" />
          Solo el propietario puede editar el perfil de la clínica
        </div>
      )}

      {/* Clinic Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre de la Clínica *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={!canEdit}
          required
          minLength={2}
          maxLength={100}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email de Contacto *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!canEdit}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          disabled={!canEdit}
          maxLength={30}
          placeholder="+54 11 1234-5678"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          disabled={!canEdit}
          rows={2}
          maxLength={500}
          placeholder="Av. Corrientes 1234, CABA, Argentina"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Logo URL */}
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
          URL del Logo
        </label>
        <input
          type="url"
          id="logo"
          name="logo"
          value={formData.logo || ''}
          onChange={handleChange}
          disabled={!canEdit}
          placeholder="https://example.com/logo.png"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {formData.logo && (
          <div className="mt-2">
            <img
              src={formData.logo}
              alt="Logo preview"
              className="h-16 w-16 object-contain rounded border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Timezone & Currency Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
            Zona Horaria
          </label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            disabled={!canEdit}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Moneda
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            disabled={!canEdit}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.value} value={curr.value}>
                {curr.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slug (read-only info) */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-500">
          URL de la Clínica
        </label>
        <p className="mt-1 text-sm text-gray-600">
          <code className="px-2 py-1 bg-gray-100 rounded">
            {window.location.origin}/{profile.slug}
          </code>
        </p>
      </div>

      {/* Submit Button */}
      {canEdit && (
        <div className="flex justify-end pt-4">
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
