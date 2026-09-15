import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { AuthView } from '@/features/auth/components/auth-view'

const GOOGLE_CLIENT_SCRIPT = 'https://accounts.google.com/gsi/client'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const GOOGLE_SCOPE = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.appdata',
].join(' ')

interface GoogleUserInfo {
  sub: string
  email: string
  name?: string
  picture?: string
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
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }

    const interval = window.setInterval(() => {
      if (window.google?.accounts.oauth2) {
        finish()
      } else if (Date.now() - startedAt >= 10000) {
        finish(new Error('Google Identity Services could not be loaded.'))
      }
    }, 100)

    scriptElement.addEventListener('error', () => {
      finish(new Error('Unable to load Google Identity Services.'))
    })

    if (!script) {
      scriptElement.src = GOOGLE_CLIENT_SCRIPT
      scriptElement.async = true
      scriptElement.defer = true
      document.head.appendChild(scriptElement)
    }
  })
}

export const AuthContainer = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAccessToken = useAuthStore((state) => state.auth.setAccessToken)
  const setUser = useAuthStore((state) => state.auth.setUser)

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true)

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new Error('VITE_GOOGLE_CLIENT_ID is not configured.')
      }

      await waitForGoogleIdentityServices()
      const googleAccounts = window.google?.accounts
      if (!googleAccounts) {
        throw new Error('Google Identity Services is unavailable.')
      }

      const tokenClient = googleAccounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPE,
        callback: async (tokenResponse) => {
          try {
            if (tokenResponse.error || !tokenResponse.access_token) {
              throw new Error(
                tokenResponse.error_description ??
                  tokenResponse.error ??
                  'Google did not return an access token.'
              )
            }

            const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            })
            if (!profileResponse.ok) {
              throw new Error('Unable to load the Google account profile.')
            }

            const profile = (await profileResponse.json()) as GoogleUserInfo
            setAccessToken(tokenResponse.access_token)
            setUser({
              accountNo: profile.sub,
              email: profile.email,
              exp: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
              name: profile.name,
              picture: profile.picture,
              role: ['user'],
            })
            setIsLoading(false)
            toast.success('Signed in with Google')
            navigate({ to: '/grateful' })
          } catch (error) {
            setIsLoading(false)
            toast.error(
              error instanceof Error
                ? error.message
                : 'Unable to complete Google sign-in.'
            )
          }
        },
        error_callback: (error) => {
          setIsLoading(false)
          toast.error(error.message ?? 'Google sign-in was cancelled.')
        },
      })

      tokenClient.requestAccessToken({ prompt: 'consent' })
    } catch (error) {
      setIsLoading(false)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to sign in with Google.'
      )
    }
  }, [navigate, setAccessToken, setUser])

  return <AuthView onGoogleSignIn={handleGoogleSignIn} isLoading={isLoading} />
}
