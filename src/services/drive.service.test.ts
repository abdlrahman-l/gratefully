import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const localUser = {
  accountNo: 'ACC-1',
  email: 'user@example.com',
  role: ['user'],
  exp: 1_700_000_000,
}

async function setDriveCredentials(
  token = 'valid-token',
  expiresAt = Date.now() + 3_600_000
) {
  const { useAuthStore } = await import('@/stores/auth-store')
  useAuthStore.getState().auth.setUser(localUser)
  useAuthStore.getState().auth.setCredentials(token, expiresAt)
}

describe('Drive service authorization', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
    vi.unstubAllGlobals()
    window.google = undefined
  })

  it('uses a valid persisted token without requesting GIS', async () => {
    await setDriveCredentials()
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ files: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', fetchMock)
    const { findAppDataFile } = await import('./drive.service')

    await expect(findAppDataFile('metadata.json')).resolves.toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(window.google).toBeUndefined()
  })

  it('does not perform a Drive request or open GIS with an expired token', async () => {
    await setDriveCredentials('expired-token', Date.now() - 1_000)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { findAppDataFile, DriveServiceError } =
      await import('./drive.service')

    await expect(findAppDataFile('metadata.json')).rejects.toBeInstanceOf(
      DriveServiceError
    )
    expect(fetchMock).not.toHaveBeenCalled()
    expect(window.google).toBeUndefined()
    const auth = (await import('@/stores/auth-store')).useAuthStore.getState().auth
    expect(auth.status).toBe('authenticated')
    expect(auth.driveConnectionStatus).toBe('disconnected')
    expect(auth.user).toEqual(localUser)
  })

  it('invalidates centralized auth on 401 without retrying or requesting GIS', async () => {
    await setDriveCredentials('rejected-token')
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    const { findAppDataFile, DriveServiceError } =
      await import('./drive.service')

    await expect(findAppDataFile('metadata.json')).rejects.toBeInstanceOf(
      DriveServiceError
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(window.google).toBeUndefined()
    const auth = (await import('@/stores/auth-store')).useAuthStore.getState().auth
    expect(auth.status).toBe('authenticated')
    expect(auth.driveConnectionStatus).toBe('disconnected')
    expect(auth.user).toEqual(localUser)
  })
})
