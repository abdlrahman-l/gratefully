import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function KitabisaBanner() {
  const { t } = useTranslation()

  return (
    <a
      href='https://kitabisa.com/explore/all'
      target='_blank'
      rel='noreferrer'
      aria-label={t('home.kitabisaBanner')}
      className='block overflow-hidden rounded-2xl bg-[#e6f8fe] text-[#10a8e5]! shadow-ambient'
    >
      <div className='px-5 py-4'>
        <p className='mt-1 font-h1 text-base leading-6 font-semibold'>
          {t('home.kitabisa.title')}
        </p>
        <span className='mt-3 inline-flex items-center gap-1 font-label text-sm font-semibold'>
          {t('home.kitabisa.cta')}
          <ArrowUpRight className='size-4' aria-hidden />
        </span>
      </div>

      <img
        src='/images/kitabisa_banner.webp'
        alt=''
        className='h-auto w-full -mb-3'
      />
    </a>
  )
}
