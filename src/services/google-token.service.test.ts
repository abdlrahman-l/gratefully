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

async function setupGoogle(
  onRequest: (config: TokenClientConfig, prompt: '' | 'none' | 'consent' | 'select_account' | undefined) => void
) {
  let config: TokenClientConfig | undefined
  const requestAccessToken = vi.fn((options?: { prompt?: '' | 'none' | 'consent' | 'select_account' }) => {
    if (config) onRequest(config, options?.prompt)
  })

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

describe('google token service', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
    window.google = undefined
  })

  it('uses GIS prompt none for background recovery and marks Drive reconnection required when silent recovery fails', async () => {
    const requestAccessToken = await setupGoogle((config) => {
      config.callback({
        access_token: '',
        expires_in: 0,
        scope: '',
        token_type: '',
        error: 'interaction_required',
      })
    })
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.getState().auth.setUser(localUser)
    const { getValidAccessToken } = await import('./google-token.service')

    await expect(getValidAccessToken({ interactive: false })).rejects.toThrow(
      'interaction_required'
    )

    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: 'none' })
    expect(useAuthStore.getState().auth.user).toEqual(localUser)
    expect(useAuthStore.getState().auth.status).toBe('reconnection-required')
  })

  it('allows an interactive reconnect to obtain and store a replacement token', async () => {
    const requestAccessToken = await setupGoogle((config) => {
      config.callback({
        access_token: 'replacement-token',
        expires_in: 3_600,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        token_type: 'Bearer',
      })
    })
    const { requestNewAccessToken } = await import('./google-token.service')

    await expect(
      requestNewAccessToken({ interactive: true, prompt: 'consent' })
    ).resolves.toBe('replacement-token')

    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: 'consent' })
    expect((await import('@/stores/auth-store')).useAuthStore.getState().auth.status).toBe('authenticated')
  })
})
