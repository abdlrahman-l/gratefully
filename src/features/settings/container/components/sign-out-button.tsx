import { useNavigate } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const reset = useAuthStore((state) => state.auth.reset)

  const handleSignOut = () => {
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

    reset()
    navigate({ to: '/auth', replace: true })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          className='h-12 w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive'
        >
          <LogOutIcon aria-hidden />
          {t('settings.signOut')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='rounded-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('settings.signOutTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('settings.signOutDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-white hover:bg-destructive/90'
            onClick={handleSignOut}
          >
            {t('settings.signOut')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
