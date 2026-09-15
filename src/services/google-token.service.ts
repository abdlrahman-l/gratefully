import { useAuthStore } from '@/stores/auth-store'

const GOOGLE_CLIENT_SCRIPT = 'https://accounts.google.com/gsi/client'
const GOOGLE_SCOPE = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.appdata',
].join(' ')

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let tokenRequest: Promise<string> | null = null
let resolveToken: ((token: string) => void) | null = null
let rejectToken: ((error: Error) => void) | null = null

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
        .auth.setCredentials(response.access_token, expiresAt)
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
    accessToken.trim() && expiresAt && Date.now() < expiresAt - 60_000
  )
}

export function invalidateAccessToken(): void {
  useAuthStore.getState().auth.resetAccessToken()
}

export function requestNewAccessToken(
  prompt: '' | 'consent' | 'select_account' = ''
): Promise<string> {
  if (tokenRequest) return tokenRequest

  const auth = useAuthStore.getState().auth
  auth.setStatus('reauthorizing')
  tokenRequest = new Promise<string>((resolve, reject) => {
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
      useAuthStore.getState().auth.setStatus('unauthenticated')
      throw error
    })
    .finally(() => {
      tokenRequest = null
    })

  return tokenRequest
}

export async function getValidAccessToken(): Promise<string> {
  if (isAccessTokenValid()) {
    return useAuthStore.getState().auth.accessToken
  }

  invalidateAccessToken()
  return requestNewAccessToken()
}
