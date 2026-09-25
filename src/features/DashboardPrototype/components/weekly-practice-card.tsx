import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { DashboardWeekDay } from '@/features/Dashboard/hooks/use-dashboard-data'

type WeeklyPracticeCardProps = {
  completedDays: number
  currentWeekIndex: number
  week: DashboardWeekDay[]
}

export function WeeklyPracticeCard({
  completedDays,
  currentWeekIndex,
  week,
}: WeeklyPracticeCardProps) {
  const { t } = useTranslation()

  return (
    <section className='rounded-2xl bg-surface-container-lowest p-5 shadow-ambient'>
      <p className='font-label text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
        {t('home.prototype.weeklyPractice')}
      </p>
      <h2 className='mt-1 font-h1 text-xl font-medium tracking-tight text-primary'>
        {t('home.days', { count: completedDays })}
      </h2>

      <div
        className='mt-5 grid grid-cols-7 gap-1'
        aria-label={t('home.weeklyProgress')}
      >
        {week.map(({ key, complete }, index) => (
          <div key={key} className='flex min-w-0 flex-col items-center gap-1.5'>
            <span className='font-label text-[0.625rem] font-medium text-outline'>
              {t(`home.week.${key}`)}
            </span>
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full border text-transparent',
                complete
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : index > currentWeekIndex
                    ? 'border-outline-variant/40 bg-surface'
                    : 'border-outline-variant bg-surface'
              )}
            >
              {complete && (
                <Check className='size-3.5' strokeWidth={3} aria-hidden />
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
