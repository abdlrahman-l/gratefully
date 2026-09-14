import type { SupportedLanguage } from '@/i18n'

export function getDateLocale(language: SupportedLanguage): string {
  return language === 'id' ? 'id-ID' : 'en-US'
}

function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatJournalDate(
  date: string,
  language: SupportedLanguage,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(getDateLocale(language), options).format(
    parseDate(date)
  )
}
