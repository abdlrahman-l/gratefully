import { useAuthStore } from '@/stores/auth-store'
import { useSync } from '@/hooks/use-sync'
import { useDashboardData } from '@/features/Dashboard/hooks/use-dashboard-data'
import { useGratefulEntries } from '@/features/grateful/hooks/use-grateful-entries'

export type BackupStatus =
  | 'error'
  | 'disconnected'
  | 'pending'
  | 'ready'
  | 'notStarted'

export function useDashboardPrototype() {
  const driveConnectionStatus = useAuthStore(
    (state) => state.auth.driveConnectionStatus
  )
  const dashboardData = useDashboardData()
  const { entries } = useGratefulEntries()
  const { error: syncError, lastSyncedAt, pendingCount } = useSync()

  const currentWeekIndex = (new Date().getDay() + 6) % 7
  const todayComplete =
    dashboardData.week[currentWeekIndex]?.complete ?? false
  const isDriveConnected = driveConnectionStatus === 'connected'

  const backupStatus: BackupStatus = syncError
    ? 'error'
    : !isDriveConnected
      ? 'disconnected'
      : pendingCount
        ? 'pending'
        : lastSyncedAt
          ? 'ready'
          : 'notStarted'

  return {
    ...dashboardData,
    latestEntry: entries[0],
    currentWeekIndex,
    todayComplete,
    backupStatus,
    pendingCount,
    isBackupNeedsAttention:
      backupStatus === 'error' ||
      backupStatus === 'disconnected' ||
      backupStatus === 'pending',
  }
}
