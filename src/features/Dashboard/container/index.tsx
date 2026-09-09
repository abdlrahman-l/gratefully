import { StatCard } from '@/features/Dashboard/components/stat-card'
import { StreakCelebrationCard } from '@/features/Dashboard/components/streak-celebration-card'
import { WeeklyProgressCard } from '@/features/Dashboard/components/weekly-progress-card'

const week = [
  { day: 'SEN', complete: true },
  { day: 'SEL', complete: true },
  { day: 'RAB', complete: true },
  { day: 'KAM', complete: true },
  { day: 'JUM', complete: true },
  { day: 'SAB', complete: false },
  { day: 'MIN', complete: false },
]

const summary = [
  { label: 'Total Syukur', value: 124 },
  { label: 'Bulan Ini', value: 18 },
]

export function DashboardContainer() {
  const completedDays = week.filter(({ complete }) => complete).length

  return (
    <main className='container w-full max-w-md px-4 py-5'>
      <div className='flex flex-col gap-5'>
        <WeeklyProgressCard completedDays={completedDays} week={week} />
        <StreakCelebrationCard streakDays={completedDays} />
        <section
          className='grid grid-cols-2 gap-2.5'
          aria-label='Ringkasan syukur'
        >
          {summary.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>
      </div>
    </main>
  )
}
