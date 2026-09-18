import {
  useAuthStore,
  type AuthStatus,
  type AuthUser,
} from '@/stores/auth-store'

const GOOGLE_CLIENT_SCRIPT = 'https://accounts.google.com/gsi/client'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const TOKEN_EXPIRY_SAFETY_MARGIN_MS = 60_000
const GOOGLE_SCOPE = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.appdata',
].join(' ')

type InteractivePrompt = '' | 'consent' | 'select_account'

type GoogleUserInfo = {
  sub: string
  email: string
  name?: string
  picture?: string
}

export class AuthRequiredError extends Error {
  public constructor(message = 'Google authentication is required.') {
    super(message)
    this.name = 'AuthRequiredError'
  }
}

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let pendingTokenRequest: Promise<string> | null = null
let resolveToken: ((token: string) => void) | null = null
let rejectToken: ((error: Error) => void) | null = null
let initializationComplete = false
let pendingInitialization: Promise<AuthStatus> | null = null

function tokenError(message: string): Error {
  return new Error(message)
}

function settleTokenRequest(error?: Error, token?: string): void {
  if (error) rejectToken?.(error)
  else if (token) resolveToken?.(token)
  resolveToken = null
  rejectToken = null
}

function waitForGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts.oauth2) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_CLIENT_SCRIPT}"]`
    )
    const scriptElement = script ?? document.createElement('script')
    const startedAt = Date.now()
    let settled = false

    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      window.clearInterval(interval)
      if (error) reject(error)
      else resolve()
    }

    const interval = window.setInterval(() => {
      if (window.google?.accounts.oauth2) finish()
      else if (Date.now() - startedAt >= 10_000) {
        finish(tokenError('Google Identity Services could not be loaded.'))
      }
    }, 100)

    scriptElement.addEventListener('error', () => {
      finish(tokenError('Unable to load Google Identity Services.'))
    })

    if (!script) {
      scriptElement.src = GOOGLE_CLIENT_SCRIPT
      scriptElement.async = true
      scriptElement.defer = true
      document.head.appendChild(scriptElement)
    }
  })
}

async function getTokenClient(): Promise<google.accounts.oauth2.TokenClient> {
  if (tokenClient) return tokenClient

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw tokenError('VITE_GOOGLE_CLIENT_ID is not configured.')

  await waitForGoogleIdentityServices()
  const oauth2 = window.google?.accounts.oauth2
  if (!oauth2) throw tokenError('Google Identity Services is unavailable.')

  tokenClient = oauth2.initTokenClient({
    client_id: clientId,
    scope: GOOGLE_SCOPE,
    callback: (response) => {
      if (response.error || !response.access_token) {
        settleTokenRequest(
          tokenError(
            response.error_description ??
              response.error ??
              'Google did not return an access token.'
          )
        )
        return
      }

      const expiresAt = Date.now() + response.expires_in * 1000
      useAuthStore
        .getState()
        .auth.setCredentials(response.access_token, expiresAt, 'connecting')
      settleTokenRequest(undefined, response.access_token)
    },
    error_callback: (error) => {
      settleTokenRequest(
        tokenError(error.message ?? 'Google authorization was cancelled.')
      )
    },
  })

  return tokenClient
}

export function isAccessTokenValid(): boolean {
  const { accessToken, expiresAt } = useAuthStore.getState().auth
  return Boolean(
    accessToken.trim() &&
    expiresAt &&
    Date.now() < expiresAt - TOKEN_EXPIRY_SAFETY_MARGIN_MS
  )
}

/** Restores the local session and validates persisted Drive credentials without opening GIS. */
export function initializeAuth(): Promise<AuthStatus> {
  if (initializationComplete) {
    return Promise.resolve(useAuthStore.getState().auth.status)
  }
  if (pendingInitialization) return pendingInitialization

  pendingInitialization = Promise.resolve()
    .then(() => {
      const auth = useAuthStore.getState().auth
      if (!auth.user) {
        auth.reset()
      } else {
        auth.setStatus('authenticated')
        if (isAccessTokenValid()) {
          auth.setDriveConnectionStatus('connected')
        } else {
          auth.resetAccessToken()
        }
      }
      initializationComplete = true
      return useAuthStore.getState().auth.status
    })
    .finally(() => {
      pendingInitialization = null
    })

  return pendingInitialization
}

/** Invalidates only the Drive credential, preserving the local Gratefully session. */
export function invalidateAccessToken(): void {
  initializationComplete = true
  useAuthStore.getState().auth.resetAccessToken()
}

/**
 * Starts GIS's popup token flow. Concurrent callers share the same in-flight
 * GIS request. Calls without a user gesture may be rejected by popup policy.
 */
export function requestAccessToken(
  prompt: InteractivePrompt = 'consent'
): Promise<string> {
  if (pendingTokenRequest) return pendingTokenRequest

  useAuthStore.getState().auth.setDriveConnectionStatus('connecting')
  pendingTokenRequest = new Promise<string>((resolve, reject) => {
    resolveToken = resolve
    rejectToken = reject

    void getTokenClient()
      .then((client) => client.requestAccessToken({ prompt }))
      .catch((error: unknown) => {
        settleTokenRequest(
          error instanceof Error
            ? error
            : tokenError('Unable to request Google authorization.')
        )
      })
  })
    .catch((error: unknown) => {
      invalidateAccessToken()
      throw error
    })
    .finally(() => {
      pendingTokenRequest = null
    })

  return pendingTokenRequest
}

/** Returns a usable token without ever initiating GIS UI. */
export async function getValidAccessToken(): Promise<string> {
  if (useAuthStore.getState().auth.status === 'initializing') {
    await initializeAuth()
  }

  const auth = useAuthStore.getState().auth
  if (
    auth.status === 'authenticated' &&
    auth.driveConnectionStatus === 'connected' &&
    isAccessTokenValid()
  ) {
    return auth.accessToken
  }

  if (pendingTokenRequest) return pendingTokenRequest

  invalidateAccessToken()
  throw new AuthRequiredError()
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) {
    if (response.status === 401) invalidateAccessToken()
    throw tokenError('Unable to load the Google account profile.')
  }
  return (await response.json()) as GoogleUserInfo
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const accessToken = await requestAccessToken('select_account')

  try {
    const profile = await getGoogleUserInfo(accessToken)
    const expiresAt = useAuthStore.getState().auth.expiresAt
    const user: AuthUser = {
      accountNo: profile.sub,
      email: profile.email,
      exp: Math.floor((expiresAt ?? Date.now()) / 1000),
      name: profile.name,
      picture: profile.picture,
      role: ['user'],
    }
    const auth = useAuthStore.getState().auth
    auth.setUser(user)
    auth.setDriveConnectionStatus('connected')
    return user
  } catch (error) {
    invalidateAccessToken()
    throw error
  }
}

export async function reconnectGoogleDrive(): Promise<void> {
  const localUser = useAuthStore.getState().auth.user
  if (!localUser) throw new AuthRequiredError('A local Gratefully session is required.')

  const accessToken = await requestAccessToken('select_account')
  try {
    const profile = await getGoogleUserInfo(accessToken)
    if (profile.sub !== localUser.accountNo) {
      invalidateAccessToken()
      throw tokenError(
        `Please select ${localUser.email} to reconnect this Gratefully session.`
      )
    }
    useAuthStore.getState().auth.setDriveConnectionStatus('connected')
  } catch (error) {
    invalidateAccessToken()
    throw error
  }
}

export function logout(): void {
  const { accessToken, reset } = useAuthStore.getState().auth
  if (accessToken) {
    if (window.google?.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken)
    } else {
      void fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${encodeURIComponent(accessToken)}`,
      }).catch(() => {
        // Local sign-out must still complete if token revocation is unavailable.
      })
    }
  }

  initializationComplete = true
  reset()
}
