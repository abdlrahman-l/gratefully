import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

function setupGoogle(
  onRequest: (
    config: TokenClientConfig,
    prompt: '' | 'none' | 'consent' | 'select_account' | undefined
  ) => void
) {
  let config: TokenClientConfig | undefined
  const requestAccessToken = vi.fn(
    (options?: { prompt?: '' | 'none' | 'consent' | 'select_account' }) => {
      if (config) onRequest(config, options?.prompt)
    }
  )

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

  it('initializes a valid persisted credential without contacting GIS', async () => {
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.getState().auth.setUser(localUser)
    useAuthStore
      .getState()
      .auth.setCredentials('persisted-token', Date.now() + 3_600_000)

    vi.resetModules()
    const { initializeAuth } = await import('./google-token.service')
    const reloadedStore = (await import('@/stores/auth-store')).useAuthStore

    expect(reloadedStore.getState().auth.status).toBe('initializing')
    await expect(initializeAuth()).resolves.toBe('authenticated')
    expect(reloadedStore.getState().auth.accessToken).toBe('persisted-token')
    expect(window.google).toBeUndefined()
  })

  it('keeps a local session and disconnects Drive for an expired token without GIS', async () => {
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.getState().auth.setUser(localUser)
    useAuthStore
      .getState()
      .auth.setCredentials('expired-token', Date.now() - 1_000)

    vi.resetModules()
    const requestToken = setupGoogle(() => {
      throw new Error('GIS must not run during initialization')
    })
    const { initializeAuth } = await import('./google-token.service')
    const reloadedStore = (await import('@/stores/auth-store')).useAuthStore

    await expect(initializeAuth()).resolves.toBe('authenticated')
    expect(requestToken).not.toHaveBeenCalled()
    expect(reloadedStore.getState().auth.accessToken).toBe('')
    expect(reloadedStore.getState().auth.expiresAt).toBeNull()
    expect(reloadedStore.getState().auth.user).toEqual(localUser)
    expect(reloadedStore.getState().auth.driveConnectionStatus).toBe(
      'disconnected'
    )
  })

  it('does not open GIS for a first-time visitor', async () => {
    const requestToken = setupGoogle(() => {
      throw new Error('GIS must not be called without a previous session')
    })
    const { initializeAuth } = await import('./google-token.service')

    await expect(initializeAuth()).resolves.toBe('unauthenticated')
    expect(requestToken).not.toHaveBeenCalled()
  })

  it('does not reopen the account chooser after explicit logout', async () => {
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.getState().auth.setUser(localUser)
    useAuthStore
      .getState()
      .auth.setCredentials('session-token', Date.now() + 3_600_000)

    setupGoogle(() => undefined)
    const { logout } = await import('./google-token.service')
    logout()

    vi.resetModules()
    const requestToken = setupGoogle(() => {
      throw new Error('GIS must not be called after explicit logout')
    })
    const { initializeAuth } = await import('./google-token.service')

    await expect(initializeAuth()).resolves.toBe('unauthenticated')
    expect(requestToken).not.toHaveBeenCalled()
    expect(
      (await import('@/stores/auth-store')).useAuthStore.getState().auth.user
    ).toBeNull()
  })

  it('does not initiate GIS when a caller asks for a missing valid token', async () => {
    const requestAccessToken = setupGoogle(() => {
      throw new Error('GIS must only be called by an interactive action')
    })
    const { getValidAccessToken } = await import('./google-token.service')

    await expect(getValidAccessToken()).rejects.toThrow(
      'Google authentication is required.'
    )
    expect(requestAccessToken).not.toHaveBeenCalled()
  })

  it('reconnects Drive interactively for the persisted Google account', async () => {
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.getState().auth.setUser(localUser)
    useAuthStore.getState().auth.resetAccessToken()
    const requestToken = setupGoogle((config, prompt) => {
      expect(prompt).toBe('select_account')
      config.callback({
        access_token: 'reconnected-token',
        expires_in: 3_600,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        token_type: 'Bearer',
      })
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ sub: localUser.accountNo, email: localUser.email }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )
    const { reconnectGoogleDrive } = await import('./google-token.service')

    await expect(reconnectGoogleDrive()).resolves.toBeUndefined()
    expect(requestToken).toHaveBeenCalledTimes(1)
    const auth = useAuthStore.getState().auth
    expect(auth.status).toBe('authenticated')
    expect(auth.driveConnectionStatus).toBe('connected')
  })

  it('returns to disconnected without ending the local session when reconnect is cancelled', async () => {
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.getState().auth.setUser(localUser)
    useAuthStore.getState().auth.resetAccessToken()
    setupGoogle((config) => {
      config.error_callback?.({
        type: 'popup_closed',
        message: 'The popup was closed.',
      })
    })
    const { reconnectGoogleDrive } = await import('./google-token.service')

    await expect(reconnectGoogleDrive()).rejects.toThrow('The popup was closed.')
    const auth = useAuthStore.getState().auth
    expect(auth.status).toBe('authenticated')
    expect(auth.driveConnectionStatus).toBe('disconnected')
    expect(auth.user).toEqual(localUser)
  })

  it('rejects reconnecting a different Google account', async () => {
    const { useAuthStore } = await import('@/stores/auth-store')
    useAuthStore.getState().auth.setUser(localUser)
    useAuthStore.getState().auth.resetAccessToken()
    setupGoogle((config) => {
      config.callback({
        access_token: 'other-account-token',
        expires_in: 3_600,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        token_type: 'Bearer',
      })
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ sub: 'ACC-2', email: 'other@example.com' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )
    const { reconnectGoogleDrive } = await import('./google-token.service')

    await expect(reconnectGoogleDrive()).rejects.toThrow(
      `Please select ${localUser.email}`
    )
    const auth = useAuthStore.getState().auth
    expect(auth.status).toBe('authenticated')
    expect(auth.driveConnectionStatus).toBe('disconnected')
  })

  it('single-flights interactive token acquisition and stores the result', async () => {
    let respond: (() => void) | undefined
    const requestToken = setupGoogle((config, prompt) => {
      expect(prompt).toBe('consent')
      respond = () =>
        config.callback({
          access_token: 'replacement-token',
          expires_in: 3_600,
          scope: 'https://www.googleapis.com/auth/drive.appdata',
          token_type: 'Bearer',
        })
    })
    const { requestAccessToken } = await import('./google-token.service')

    const first = requestAccessToken('consent')
    const second = requestAccessToken('consent')
    await vi.waitFor(() => expect(requestToken).toHaveBeenCalledTimes(1))
    respond?.()

    await expect(Promise.all([first, second])).resolves.toEqual([
      'replacement-token',
      'replacement-token',
    ])
    expect(
      (await import('@/stores/auth-store')).useAuthStore.getState().auth
        .driveConnectionStatus
    ).toBe('connecting')
  })
})
