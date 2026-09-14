import { LogOutIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
          <AlertDialogAction className='bg-destructive text-white hover:bg-destructive/90'>
            {t('settings.signOut')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
