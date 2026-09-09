import { useAuthStore } from '@/stores/auth-store'

/**
 * Adapter for the existing authentication state. Drive services deliberately do
 * not own token refresh or sign-in; callers receive the current GIS token only.
 */
export function getAccessToken(): string | null {
  const token = useAuthStore.getState().auth.accessToken.trim()
  return token.length > 0 ? token : null
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isIsoDateString(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value
  )
}

export function isJournalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}
