import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { requestNewAccessToken } from '@/services/google-token.service'
import { useAuthStore } from '@/stores/auth-store'
import { AuthView } from '@/features/auth/components/auth-view'

const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

interface GoogleUserInfo {
  sub: string
  email: string
  name?: string
  picture?: string
}

export const AuthContainer = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.auth.setUser)

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true)

    try {
      const accessToken = await requestNewAccessToken({ interactive: true, prompt: 'consent' })
      const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!profileResponse.ok) {
        throw new Error('Unable to load the Google account profile.')
      }

      const profile = (await profileResponse.json()) as GoogleUserInfo
      const expiresAt = useAuthStore.getState().auth.expiresAt
      setUser({
        accountNo: profile.sub,
        email: profile.email,
        exp: Math.floor((expiresAt ?? Date.now()) / 1000),
        name: profile.name,
        picture: profile.picture,
        role: ['user'],
      })
      toast.success('Signed in with Google')
      navigate({ to: '/grateful' })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to sign in with Google.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [navigate, setUser])

  return <AuthView onGoogleSignIn={handleGoogleSignIn} isLoading={isLoading} />
}
