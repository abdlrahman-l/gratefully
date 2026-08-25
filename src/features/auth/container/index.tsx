import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { AuthView } from '@/features/auth/components/auth-view'

export const AuthContainer = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSignIn = useCallback(() => {
    setIsLoading(true)

    // Check if Google Sign-In script is loaded
    if (typeof window !== 'undefined' && 'google' in window) {
      try {
        const googleObj = (
          window as unknown as {
            google?: { accounts?: { id?: { prompt: () => void } } }
          }
        ).google
        if (googleObj?.accounts?.id?.prompt) {
          googleObj.accounts.id.prompt()
          setIsLoading(false)
          return
        }
      } catch {
        // Ignore if prompt not available
      }
    }

    // Fallback demonstration / navigation
    setTimeout(() => {
      setIsLoading(false)
      toast.info('Google authentication initiated')
      navigate({ to: '/grateful' })
    }, 600)
  }, [navigate])

  return <AuthView onGoogleSignIn={handleGoogleSignIn} isLoading={isLoading} />
}
