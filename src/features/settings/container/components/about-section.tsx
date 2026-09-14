import { InfoIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionTitle } from './settings-primitives'

export function AboutSection() {
  const { t } = useTranslation()

  return (
    <section className='space-y-3' aria-label={t('settings.about')}>
      <SectionTitle>{t('settings.about')}</SectionTitle>
      <div className='overflow-hidden rounded-2xl border border-outline-variant/20 bg-card shadow-ambient'>
        <div className='flex items-center gap-3 px-4 py-4'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <InfoIcon className='size-5' aria-hidden />
          </span>
          <span className='flex-1 font-label text-sm font-semibold text-foreground'>
            {t('settings.aboutGratefully')}
          </span>
        </div>
        <div className='ml-16 border-t border-outline-variant/20' />
        <div className='flex items-center justify-between px-4 py-4'>
          <span className='font-label text-sm font-semibold text-foreground'>
            {t('settings.version')}
          </span>
          <span className='font-body-md text-sm text-muted-foreground'>
            1.0.0
          </span>
        </div>
      </div>
    </section>
  )
}
