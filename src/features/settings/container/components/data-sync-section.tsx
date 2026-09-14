import { CloudIcon, ShieldCheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SectionTitle } from './settings-primitives'

export function DataSyncSection() {
  const { t } = useTranslation()

  return (
    <section className='space-y-3' aria-label={t('settings.dataSync')}>
      <SectionTitle>{t('settings.dataSync')}</SectionTitle>
      <div className='rounded-2xl border border-outline-variant/20 bg-card p-4 shadow-ambient'>
        <div className='flex items-start gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <CloudIcon className='size-5' aria-hidden />
          </span>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <p className='font-label text-sm font-semibold text-foreground'>
                Google Drive
              </p>
              <span className='flex items-center gap-1 text-xs font-medium text-primary'>
                <span className='size-2 rounded-full bg-primary' aria-hidden />
                {t('settings.connected')}
              </span>
            </div>
            <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
              {t('settings.storageDescription')}
            </p>
            <p className='mt-3 font-label text-xs font-medium text-muted-foreground'>
              {t('settings.lastSynced')}
            </p>
          </div>
        </div>
      </div>
      <div className='rounded-2xl border border-primary/10 bg-primary/5 p-4'>
        <div className='flex gap-3'>
          <ShieldCheckIcon
            className='mt-0.5 size-5 shrink-0 text-primary'
            aria-hidden
          />
          <div>
            <h3 className='font-label text-sm font-semibold text-foreground'>
              {t('settings.ownershipTitle')}
            </h3>
            <p className='mt-1.5 font-body-md text-sm leading-6 text-muted-foreground'>
              {t('settings.ownershipBody')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
