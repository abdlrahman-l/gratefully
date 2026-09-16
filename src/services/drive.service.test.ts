import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCookies } from '@/test-utils/cookies'

type TokenClientConfig = {
  client_id: string
  scope: string
  callback: (response: google.accounts.oauth2.TokenResponse) => void
  error_callback?: (error: google.accounts.oauth2.ErrorResponse) => void
}

const localUser = {
  accountNo: 'ACC-1',
  email: 'user@example.com',
  role: ['user'],
  exp: 1_700_000_000,
}

function setGoogleTokenResponse(
  response: google.accounts.oauth2.TokenResponse
): ReturnType<typeof vi.fn> {
  let config: TokenClientConfig | undefined
  const requestAccessToken = vi.fn(() => config?.callback(response))
  window.google = {
    accounts: {
      oauth2: {
        initTokenClient: vi.fn((nextConfig: TokenClientConfig) => {
          config = nextConfig
          return { requestAccessToken }
        }),
        revoke: vi.fn(),
      },
    },
  }
  return requestAccessToken
}

async function setValidDriveCredentials(token = 'valid-token') {
  const { useAuthStore } = await import('@/stores/auth-store')
  useAuthStore.getState().auth.setUser(localUser)
  useAuthStore.getState().auth.setCredentials(token, Date.now() + 3_600_000)
}

describe('Drive service authorization', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
    vi.unstubAllGlobals()
    window.google = undefined
  })

  it('uses a valid persisted token without requesting GIS during a Drive refresh', async () => {
    await setValidDriveCredentials()
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

  it('retries a 401 at most once using silent GIS recovery and requires reconnection when it fails', async () => {
    await setValidDriveCredentials('stale-token')
    const requestAccessToken = setGoogleTokenResponse({
      access_token: '',
      expires_in: 0,
      scope: '',
      token_type: '',
      error: 'interaction_required',
    })
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    const { findAppDataFile, DriveServiceError } = await import('./drive.service')

    await expect(findAppDataFile('metadata.json')).rejects.toBeInstanceOf(
      DriveServiceError
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: 'none' })
    expect((await import('@/stores/auth-store')).useAuthStore.getState().auth.status).toBe('reconnection-required')
  })

  it('retries a 401 once after successful silent recovery', async () => {
    await setValidDriveCredentials('stale-token')
    const requestAccessToken = setGoogleTokenResponse({
      access_token: 'replacement-token',
      expires_in: 3_600,
      scope: 'https://www.googleapis.com/auth/drive.appdata',
      token_type: 'Bearer',
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ files: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    vi.stubGlobal('fetch', fetchMock)
    const { findAppDataFile } = await import('./drive.service')

    await expect(findAppDataFile('metadata.json')).resolves.toBeNull()
    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: 'none' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
