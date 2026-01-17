import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

export const resources = {
  es: { translation: es },
  en: { translation: en },
  ar: { translation: ar },
} as const

export const languages = [
  { code: 'es', name: 'Español', nativeName: 'Español', dir: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
] as const

export type LanguageCode = (typeof languages)[number]['code']

export const defaultLanguage: LanguageCode = 'es'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
  })

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  const language = languages.find((l) => l.code === lng)
  if (language) {
    document.documentElement.dir = language.dir
    document.documentElement.lang = lng
  }
})

// Set initial direction
const initialLang = languages.find((l) => l.code === i18n.language) || languages[0]
document.documentElement.dir = initialLang.dir
document.documentElement.lang = initialLang.code

export default i18n
