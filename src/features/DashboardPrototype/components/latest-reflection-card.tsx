import { Link } from '@tanstack/react-router'
import { ArrowRight, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { GratefullyEntry } from '@/types/gratefully'
import { formatLatestDate } from '@/features/DashboardPrototype/utils/format-latest-date'

type LatestReflectionCardProps = {
  entry: GratefullyEntry
}

export function LatestReflectionCard({ entry }: LatestReflectionCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <section className='rounded-2xl border border-primary/10 bg-primary/5 p-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 text-primary'>
          <Heart className='size-4' fill='currentColor' aria-hidden />
          <p className='font-label text-xs font-semibold tracking-wide uppercase'>
            {t('home.prototype.latestReflection')}
          </p>
        </div>
        <span className='font-label text-xs text-on-surface-variant'>
          {formatLatestDate(entry.date, i18n.language)}
        </span>
      </div>
      <p className='mt-3 line-clamp-3 font-quote text-base leading-7 text-primary'>
        “{entry.content}”
      </p>
      <Link
        to='/journey'
        className='mt-4 inline-flex items-center gap-1 font-label text-sm font-semibold text-primary'
      >
        {t('home.prototype.viewJourney')}
        <ArrowRight className='size-4' aria-hidden />
      </Link>
    </section>
  )
}
