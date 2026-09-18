import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { signInWithGoogle } from '@/services/google-token.service'
import { toast } from 'sonner'
import { AuthView } from '@/features/auth/components/auth-view'

export const AuthContainer = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true)

    try {
      await signInWithGoogle()
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
  }, [navigate])

  return <AuthView onGoogleSignIn={handleGoogleSignIn} isLoading={isLoading} />
}
