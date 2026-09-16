import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { ConfirmSheet } from '@/components/confirm-sheet'

export function SignOutButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
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
    <>
      <Button
        variant='outline'
        className='h-12 w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive'
        onClick={() => setSheetOpen(true)}
      >
        <LogOutIcon aria-hidden />
        {t('settings.signOut')}
      </Button>
      <ConfirmSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={t('settings.signOutTitle')}
        description={t('settings.signOutDescription')}
        cancelText={t('common.cancel')}
        confirmText={t('settings.signOut')}
        onConfirm={handleSignOut}
        destructive
      />
    </>
  )
}
