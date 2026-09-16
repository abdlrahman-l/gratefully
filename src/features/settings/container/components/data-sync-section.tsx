import { CloudIcon, ShieldCheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrentLanguage } from '@/i18n'
import { requestNewAccessToken } from '@/services/google-token.service'
import { useSync } from '@/hooks/use-sync'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { SectionTitle } from './settings-primitives'

export function DataSyncSection() {
  const { t } = useTranslation()
  const language = getCurrentLanguage()
  const authStatus = useAuthStore((state) => state.auth.status)
  const isConnected = authStatus === 'authenticated'
  const isReauthorizing = authStatus === 'reauthorizing'
  const needsReconnection = authStatus === 'reconnection-required'
  const { status, pendingCount, lastSyncedAt, error, sync } = useSync()

  const backupNow = async () => {
    await sync()
  }

  const reconnect = async () => {
    try {
      await requestNewAccessToken({ interactive: true, prompt: 'consent' })
      toast.success('Google Drive reconnected')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to reconnect Google.'
      )
    }
  }

  return (
    <section className='space-y-3' aria-label={t('settings.dataSync')}>
      <SectionTitle>{t('settings.dataSync')}</SectionTitle>
      <div className='rounded-2xl border border-outline-variant/20 bg-card p-4 shadow-ambient'>
        <div className='flex items-start gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <CloudIcon className='size-5' aria-hidden />
          </span>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <p className='font-label text-sm font-semibold text-foreground'>
                Google Drive
              </p>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${isConnected ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <span
                  className={`size-2 rounded-full ${isConnected ? 'bg-primary' : 'bg-muted-foreground'}`}
                  aria-hidden
                />
                {isConnected
                  ? t('settings.connected')
                  : isReauthorizing
                    ? 'Reconnecting…'
                    : needsReconnection
                      ? 'Reconnection required'
                      : 'Disconnected'}
              </span>
            </div>
            <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
              {t('settings.storageDescription')}
            </p>
            <p className='mt-3 font-label text-xs font-medium text-muted-foreground'>
              {pendingCount
                ? t('settings.pendingBackup', { count: pendingCount })
                : lastSyncedAt
                  ? t('settings.everythingBackedUp', {
                      date: new Date(lastSyncedAt).toLocaleString(
                        language === 'id' ? 'id-ID' : 'en-US'
                      ),
                    })
                  : t('settings.lastSynced')}
            </p>
            {error && <p className='mt-1 text-xs text-destructive'>{error.message}</p>}
            {isConnected && (
              <Button className='mt-3' size='sm' variant='outline' disabled={status === 'syncing'} onClick={() => void backupNow()}>
                {status === 'syncing' ? 'Backing up…' : 'Back up now'}
              </Button>
            )}
            {!isConnected && (
              <>
                {needsReconnection && (
                  <p className='mt-3 text-xs text-muted-foreground'>
                    Google Drive needs to be reconnected before backup.
                  </p>
                )}
                <Button
                className='mt-3'
                size='sm'
                variant='outline'
                disabled={isReauthorizing}
                onClick={() => void reconnect()}
              >
                Reconnect Google
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className='rounded-2xl border border-primary/10 bg-primary/5 p-4'>
        <div className='flex gap-3'>
          <ShieldCheckIcon
            className='mt-0.5 size-5 shrink-0 text-primary'
            aria-hidden
          />
          <div>
            <h3 className='font-label text-sm font-semibold text-foreground'>
              {t('settings.ownershipTitle')}
            </h3>
            <p className='mt-1.5 font-body-md text-sm leading-6 text-muted-foreground'>
              {t('settings.ownershipBody')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
