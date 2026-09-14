import { LeafIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function WisdomCard() {
  const { t } = useTranslation()

  return (
    <section className='flex flex-col gap-4'>
      <div className='relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-primary-container/10 p-6 shadow-ambient'>
        <p className='relative z-10 font-quote text-xl leading-relaxed text-on-surface-variant italic'>
          <span className='mr-1 text-primary opacity-50'>"</span>
          {t('grateful.wisdom')}
          <span className='ml-1 text-primary opacity-50'>"</span>
        </p>
        <div className='relative z-10 mt-2 flex items-end justify-between'>
          <p className='font-label text-sm font-medium text-outline'>
            {t('grateful.wisdomSource')}
          </p>
          <div className='flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-3 py-1.5 shadow-sm'>
            <LeafIcon className='size-4 text-primary' />
            <span className='font-label text-sm font-medium text-primary'>
              {t('grateful.wisdomStreak', { count: 5 })}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
