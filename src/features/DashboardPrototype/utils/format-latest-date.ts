import { getDateLocale } from '@/lib/date-locale'

export function formatLatestDate(date: string, language: string) {
  const [year, month, day] = date.split('-').map(Number)

  return new Intl.DateTimeFormat(
    getDateLocale(language === 'id' ? 'id' : 'en'),
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  ).format(new Date(year, month - 1, day))
}
