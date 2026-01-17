import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { languages, type LanguageCode } from '@/i18n'

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons'
  showLabel?: boolean
  className?: string
}

export function LanguageSelector({
  variant = 'dropdown',
  showLabel = false,
  className = '',
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation()

  const handleLanguageChange = (code: LanguageCode) => {
    i18n.changeLanguage(code)
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showLabel && (
          <span className="text-sm text-gray-500 mr-2">{t('settings.language')}:</span>
        )}
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              i18n.language === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={lang.name}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('settings.language')}
        </label>
      )}
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
          className="w-full pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
