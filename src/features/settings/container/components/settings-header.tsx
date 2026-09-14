import { useTranslation } from 'react-i18next'

export function SettingsHeader() {
  const { t } = useTranslation()

  return (
    <header>
      <h1 className='font-h1 text-2xl font-bold tracking-tight text-foreground'>
        {t('settings.title')}
      </h1>
      <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
        {t('settings.subtitle')}
      </p>
    </header>
  )
}
