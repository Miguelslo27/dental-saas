import { useState, useEffect } from 'react'
import { Loader2, Lock, AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settings.store'
import type { TenantProfile, UpdateTenantProfileData } from '@/lib/settings-api'

// Common timezones for dental clinics
const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'America/Santiago', label: 'Chile (Santiago)' },
  { value: 'America/Bogota', label: 'Colombia (Bogotá)' },
  { value: 'America/Mexico_City', label: 'México (Ciudad de México)' },
  { value: 'America/Lima', label: 'Perú (Lima)' },
  { value: 'America/Montevideo', label: 'Uruguay (Montevideo)' },
  { value: 'America/Caracas', label: 'Venezuela (Caracas)' },
  { value: 'America/New_York', label: 'Estados Unidos (Nueva York)' },
  { value: 'America/Los_Angeles', label: 'Estados Unidos (Los Ángeles)' },
  { value: 'Europe/Madrid', label: 'España (Madrid)' },
  { value: 'UTC', label: 'UTC' },
]

// Common currencies
const CURRENCIES = [
  { value: 'ARS', label: 'Peso Argentino (ARS)' },
  { value: 'BRL', label: 'Real Brasileño (BRL)' },
  { value: 'CLP', label: 'Peso Chileno (CLP)' },
  { value: 'COP', label: 'Peso Colombiano (COP)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'MXN', label: 'Peso Mexicano (MXN)' },
  { value: 'PEN', label: 'Sol Peruano (PEN)' },
  { value: 'USD', label: 'Dólar Estadounidense (USD)' },
  { value: 'UYU', label: 'Peso Uruguayo (UYU)' },
]

interface ClinicProfileFormProps {
  profile: TenantProfile | null
  canEdit: boolean
}

export function ClinicProfileForm({ profile, canEdit }: ClinicProfileFormProps) {
  const { t } = useTranslation()
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

  const [showCurrencyWarning, setShowCurrencyWarning] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)

  // Sync form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({ // eslint-disable-line react-hooks/set-state-in-effect
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

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value
    const isActualChange = profile?.currency && profile.currency !== newCurrency

    if (isActualChange) {
      setPendingCurrency(newCurrency)
      setShowCurrencyWarning(true)
    } else {
      setFormData((prev) => ({ ...prev, currency: newCurrency }))
    }
  }

  const confirmCurrencyChange = () => {
    if (pendingCurrency) {
      setFormData((prev) => ({ ...prev, currency: pendingCurrency }))
    }
    setShowCurrencyWarning(false)
    setPendingCurrency(null)
  }

  const cancelCurrencyChange = () => {
    setShowCurrencyWarning(false)
    setPendingCurrency(null)
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
            onChange={handleCurrencyChange}
            disabled={!canEdit || isSaving}
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

      {/* Currency Warning Modal */}
      {showCurrencyWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('settings.currencyWarning.title')}
                </h3>
              </div>
              <button
                onClick={cancelCurrencyChange}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700 mb-4">
                {t('settings.currencyWarning.changeFrom')} <strong>{profile?.currency}</strong>{' '}
                {t('settings.currencyWarning.changeTo')} <strong>{pendingCurrency}</strong>.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  {t('settings.currencyWarning.importantTitle')}
                </p>
                <p className="text-sm text-yellow-700">
                  {t('settings.currencyWarning.message')}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {t('settings.currencyWarning.question')}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={cancelCurrencyChange}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmCurrencyChange}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                {t('settings.currencyWarning.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

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
