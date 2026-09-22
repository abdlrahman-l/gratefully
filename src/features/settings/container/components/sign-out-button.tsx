import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { logout } from '@/services/google-token.service'
import { LogOutIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ConfirmSheet } from '@/components/confirm-sheet'

export function SignOutButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleSignOut = () => {
    logout()
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
        illustrationSrc='/images/logout.webp'
        destructive
      />
    </>
  )
}
