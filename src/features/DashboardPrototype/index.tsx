import { StreakCelebrationCard } from '@/features/Dashboard/components/streak-celebration-card'
import { BackupStatusCard } from '@/features/DashboardPrototype/components/backup-status-card'
import { DashboardSummary } from '@/features/DashboardPrototype/components/dashboard-summary'
import { LatestReflectionCard } from '@/features/DashboardPrototype/components/latest-reflection-card'
import { WeeklyPracticeCard } from '@/features/DashboardPrototype/components/weekly-practice-card'
import { useDashboardPrototype } from '@/features/DashboardPrototype/hooks/use-dashboard-prototype'

export function DashboardPrototype() {
  const {
    backupStatus,
    completedDays,
    currentWeekIndex,
    isBackupNeedsAttention,
    latestEntry,
    monthlyEntries,
    pendingCount,
    streakDays,
    todayComplete,
    totalEntries,
    week,
  } = useDashboardPrototype()

  return (
    <main className='w-full px-4 pt-4 pb-28'>
      <div className='flex flex-col gap-5'>
        <WeeklyPracticeCard
          completedDays={completedDays}
          currentWeekIndex={currentWeekIndex}
          week={week}
        />

        <StreakCelebrationCard
          streakDays={streakDays}
          todayComplete={todayComplete}
        />

        {latestEntry && <LatestReflectionCard entry={latestEntry} />}

        <DashboardSummary
          totalEntries={totalEntries}
          monthlyEntries={monthlyEntries}
        />

        <BackupStatusCard
          status={backupStatus}
          pendingCount={pendingCount}
          needsAttention={isBackupNeedsAttention}
        />
      </div>
    </main>
  )
}
