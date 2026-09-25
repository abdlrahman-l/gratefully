import { useTranslation } from 'react-i18next'
import { GoogleAuthButton } from './google-auth-button'
import { LeafLogo } from './leaf-logo'

interface AuthViewProps {
  onGoogleSignIn?: () => void
  isLoading?: boolean
}

export function AuthView({ onGoogleSignIn, isLoading = false }: AuthViewProps) {
  const { t } = useTranslation()
  return (
    <div className='container flex w-full flex-1 flex-col items-center justify-center self-center text-center'>
      {/* Decorative leaf icon badge */}
      <LeafLogo className='mb-8' />

      {/* Main heading */}
      <h1 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
        Welcome to Gratefully
      </h1>

      {/* Subtitle with elegant serif quote font */}
      <p className='mt-2.5 font-quote text-base text-stone-600 italic sm:text-lg dark:text-stone-400'>
        Find stillness in your blessings.
      </p>

      {/* Google Login Action */}
      <div className='mt-12 flex w-full items-center justify-center'>
        <GoogleAuthButton onClick={onGoogleSignIn} isLoading={isLoading} />
      </div>

      {/* Terms & Privacy Notice */}
      <p className='mt-14 max-w-xs text-xs leading-relaxed text-muted-foreground'>
        {t('legal.authNotice')}{' '}
        <a
          href='/terms'
          className='text-stone-600 underline underline-offset-2 transition-colors hover:text-foreground dark:text-stone-400'
        >
          {t('legal.termsLink')}
        </a>{' '}
        {t('legal.and')}{' '}
        <a
          href='/privacy'
          className='text-stone-600 underline underline-offset-2 transition-colors hover:text-foreground dark:text-stone-400'
        >
          {t('legal.privacyLink')}
        </a>
        .
      </p>
    </div>
  )
}
