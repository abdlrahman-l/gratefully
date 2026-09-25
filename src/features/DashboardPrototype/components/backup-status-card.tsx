import { Link } from '@tanstack/react-router'
import { ArrowRight, Cloud, LockKeyhole } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { BackupStatus } from '@/features/DashboardPrototype/hooks/use-dashboard-prototype'

type BackupStatusCardProps = {
  status: BackupStatus
  pendingCount: number
  needsAttention: boolean
}

export function BackupStatusCard({
  status,
  pendingCount,
  needsAttention,
}: BackupStatusCardProps) {
  const { t } = useTranslation()
  const label = getBackupLabel(status, pendingCount, t)

  return (
    <Link
      to='/settings'
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-4 transition-colors',
        needsAttention
          ? 'border-amber-300/60 bg-amber-50 text-amber-950'
          : 'border-primary/10 bg-surface-container-lowest text-on-surface'
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          needsAttention
            ? 'bg-amber-100 text-amber-700'
            : 'bg-primary/10 text-primary'
        )}
      >
        {needsAttention ? (
          <Cloud className='size-5' aria-hidden />
        ) : (
          <LockKeyhole className='size-5' aria-hidden />
        )}
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block font-label text-sm font-semibold'>
          {t('home.prototype.backupTitle')}
        </span>
        <span className='mt-0.5 block font-body-md text-xs text-on-surface-variant'>
          {label}
        </span>
      </span>
      <ArrowRight
        className='size-5 shrink-0 text-on-surface-variant'
        aria-hidden
      />
    </Link>
  )
}

function getBackupLabel(
  status: BackupStatus,
  pendingCount: number,
  t: ReturnType<typeof useTranslation>['t']
) {
  switch (status) {
    case 'error':
      return t('home.prototype.backupError')
    case 'disconnected':
      return t('home.prototype.backupDisconnected')
    case 'pending':
      return t('home.prototype.backupPending', { count: pendingCount })
    case 'ready':
      return t('home.prototype.backupReady')
    case 'notStarted':
      return t('home.prototype.backupNotStarted')
  }
}
