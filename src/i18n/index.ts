import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { id } from './locales/id'

export const supportedLanguages = ['id', 'en'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const resources = {
  id: { translation: id },
  en: { translation: en },
} as const

export function isSupportedLanguage(
  value: string | null
): value is SupportedLanguage {
  return (
    value !== null && supportedLanguages.includes(value as SupportedLanguage)
  )
}

const savedLanguage =
  typeof window !== 'undefined' ? localStorage.getItem('language') : null
const initialLanguage: SupportedLanguage = isSupportedLanguage(savedLanguage)
  ? savedLanguage
  : 'id'

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'id',
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
})

function updateDocumentLanguage(language: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = isSupportedLanguage(language)
      ? language
      : 'id'
  }
}

updateDocumentLanguage(initialLanguage)
i18n.on('languageChanged', updateDocumentLanguage)

export function getCurrentLanguage(): SupportedLanguage {
  const language = i18n.resolvedLanguage ?? null
  return isSupportedLanguage(language) ? language : 'id'
}

export async function changeLanguage(language: SupportedLanguage) {
  await i18n.changeLanguage(language)
  localStorage.setItem('language', language)
}

export default i18n
