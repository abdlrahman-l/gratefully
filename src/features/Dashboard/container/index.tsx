import { useTranslation } from 'react-i18next'
import { StatCard } from '@/features/Dashboard/components/stat-card'
import { StreakCelebrationCard } from '@/features/Dashboard/components/streak-celebration-card'
import { WeeklyProgressCard } from '@/features/Dashboard/components/weekly-progress-card'

const week = [
  { key: 'mon', complete: true },
  { key: 'tue', complete: true },
  { key: 'wed', complete: true },
  { key: 'thu', complete: true },
  { key: 'fri', complete: true },
  { key: 'sat', complete: false },
  { key: 'sun', complete: false },
] as const

export function DashboardContainer() {
  const { t } = useTranslation()
  const completedDays = week.filter(({ complete }) => complete).length
  const summary = [
    { label: t('home.totalGratitude'), value: 124 },
    { label: t('home.thisMonth'), value: 18 },
  ]
  const localizedWeek = week.map(({ key, complete }) => ({
    day: t(`home.week.${key}`),
    complete,
  }))

  return (
    <main className='container w-full max-w-md px-4 py-5'>
      <div className='flex flex-col gap-5'>
        <WeeklyProgressCard
          completedDays={completedDays}
          week={localizedWeek}
        />
        <StreakCelebrationCard streakDays={completedDays} />
        <section
          className='grid grid-cols-2 gap-2.5'
          aria-label={t('home.summary')}
        >
          {summary.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>
      </div>
    </main>
  )
}
