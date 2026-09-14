import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/features/Dashboard/components/stat-card'
import { StreakCelebrationCard } from '@/features/Dashboard/components/streak-celebration-card'
import { WeeklyProgressCard } from '@/features/Dashboard/components/weekly-progress-card'
import { useDashboardData } from '@/features/Dashboard/hooks/use-dashboard-data'

function DashboardSkeleton() {
  return (
    <div className='flex flex-col gap-5' aria-hidden='true'>
      <section className='rounded-2xl bg-surface-container-lowest p-5 shadow-ambient'>
        <div className='flex flex-col gap-3'>
          <Skeleton className='h-7 w-40' />
          <Skeleton className='h-8 w-24 rounded-full' />
        </div>
        <Skeleton className='mt-6 h-5 w-11/12' />
        <Skeleton className='mt-2 h-5 w-2/3' />
        <div className='mt-6 grid grid-cols-7 gap-1'>
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className='flex flex-col items-center gap-1.5'>
              <Skeleton className='h-2.5 w-6' />
              <Skeleton className='size-8 rounded-full' />
            </div>
          ))}
        </div>
        <Skeleton className='mt-6 h-14 w-full rounded-full' />
      </section>

      <section className='flex flex-col gap-3 rounded-2xl bg-primary-container/10 p-5 shadow-ambient'>
        <Skeleton className='size-11 rounded-full' />
        <Skeleton className='h-7 w-full' />
        <Skeleton className='h-7 w-3/4' />
      </section>

      <section className='grid grid-cols-2 gap-2.5'>
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className='rounded-2xl bg-surface-container-lowest p-4 shadow-ambient'
          >
            <Skeleton className='h-4 w-20' />
            <Skeleton className='mt-3 h-8 w-14' />
          </div>
        ))}
      </section>
    </div>
  )
}

export function DashboardContainer() {
  const { t } = useTranslation()
  const {
    completedDays,
    isLoading,
    monthlyEntries,
    streakDays,
    totalEntries,
    week,
  } = useDashboardData()

  const summary = [
    { label: t('home.totalGratefully'), value: totalEntries },
    { label: t('home.thisMonth'), value: monthlyEntries },
  ]
  const localizedWeek = week.map(({ key, complete }) => ({
    day: t(`home.week.${key}`),
    complete,
  }))

  return (
    <main
      className='container w-full max-w-md px-4 py-5'
      aria-busy={isLoading}
    >
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className='flex flex-col gap-5'>
        <WeeklyProgressCard
          completedDays={completedDays}
          week={localizedWeek}
        />
        <StreakCelebrationCard streakDays={streakDays} />
        <section
          className='grid grid-cols-2 gap-2.5'
          aria-label={t('home.summary')}
        >
          {summary.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>
        </div>
      )}
    </main>
  )
}
