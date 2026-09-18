import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  accountNo: 'ACC-1',
  email: 'user@example.com',
  role: ['user'],
  exp: 1_700_000_000,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('starts disconnected when nothing is persisted', async () => {
    const useAuthStore = await importAuthStore()
    const { accessToken, expiresAt, status, user } =
      useAuthStore.getState().auth

    expect(accessToken).toBe('')
    expect(expiresAt).toBeNull()
    expect(status).toBe('initializing')
    expect(user).toBeNull()
  })

  it('persists a valid access token and expiration together', async () => {
    const useAuthStore = await importAuthStore()
    const expiresAt = Date.now() + 3_600_000
    useAuthStore.getState().auth.setCredentials('session-token', expiresAt)

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()
    const auth = useAuthStoreAfterReload.getState().auth

    expect(auth.accessToken).toBe('session-token')
    expect(auth.expiresAt).toBe(expiresAt)
    expect(auth.status).toBe('initializing')
  })

  it('hydrates persisted credentials for the auth initializer to validate', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setUser({ ...sampleUser })
    useAuthStore
      .getState()
      .auth.setCredentials('expired-token', Date.now() - 1_000)

    vi.resetModules()
    const auth = (await importAuthStore()).getState().auth

    expect(auth.user).toEqual(sampleUser)
    expect(auth.accessToken).toBe('expired-token')
    expect(auth.expiresAt).not.toBeNull()
    expect(auth.status).toBe('initializing')
  })

  it('keeps the local session authenticated when Drive credentials are cleared', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setUser({ ...sampleUser })
    useAuthStore
      .getState()
      .auth.setCredentials('to-clear', Date.now() + 3_600_000)

    useAuthStore.getState().auth.resetAccessToken()

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
    expect(useAuthStore.getState().auth.status).toBe('authenticated')
    expect(useAuthStore.getState().auth.driveConnectionStatus).toBe(
      'disconnected'
    )
  })

  it('clears persisted access token and expiration together', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore
      .getState()
      .auth.setCredentials('to-clear', Date.now() + 3_600_000)
    useAuthStore.getState().auth.resetAccessToken()

    vi.resetModules()
    const auth = (await importAuthStore()).getState().auth

    expect(auth.accessToken).toBe('')
    expect(auth.expiresAt).toBeNull()
  })

  it('persists the signed-in user so a new store instance reads it back', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.user).toEqual(sampleUser)
  })

  it('reset clears user, access token, expiration, and persistence', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore
      .getState()
      .auth.setCredentials('will-be-cleared', Date.now() + 3_600_000)
    useAuthStore.getState().auth.setUser({ ...sampleUser })

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.expiresAt).toBeNull()

    vi.resetModules()
    const auth = (await importAuthStore()).getState().auth

    expect(auth.user).toBeNull()
    expect(auth.accessToken).toBe('')
    expect(auth.expiresAt).toBeNull()
  })
})
