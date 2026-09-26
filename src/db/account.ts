import { useAuthStore } from '@/stores/auth-store'

/**
 * Google `sub` is stable for this OAuth client and safer than using email as
 * the local account identity. The provider prefix keeps the namespace
 * extensible if another auth provider is added later.
 */
export function getAccountNamespace(accountNo: string): string {
  return `google:${accountNo}`
}

export function getActiveAccountNamespace(): string {
  const accountNo = useAuthStore.getState().auth.user?.accountNo
  if (!accountNo) {
    throw new Error(
      'An authenticated account is required for local journal data.'
    )
  }
  return getAccountNamespace(accountNo)
}
