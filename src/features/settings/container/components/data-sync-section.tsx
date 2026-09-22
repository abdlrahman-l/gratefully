import { useState } from 'react'
import { getCurrentLanguage } from '@/i18n'
import { reconnectGoogleDrive } from '@/services/google-token.service'
import { CloudIcon, ShieldCheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { useSync } from '@/hooks/use-sync'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SectionTitle } from './settings-primitives'

export function DataSyncSection() {
  const { t } = useTranslation()
  const language = getCurrentLanguage()
  const driveConnectionStatus = useAuthStore(
    (state) => state.auth.driveConnectionStatus
  )
  const [reconnectError, setReconnectError] = useState<string | null>(null)
  const isConnected = driveConnectionStatus === 'connected'
  const isConnecting = driveConnectionStatus === 'connecting'
  const { status, pendingCount, lastSyncedAt, error, sync } = useSync()

  const backupNow = async () => {
    await sync()
  }

  const reconnect = async () => {
    setReconnectError(null)
    try {
      await reconnectGoogleDrive()
      await sync()
    } catch (cause) {
      setReconnectError(
        cause instanceof Error
          ? cause.message
          : 'Unable to reconnect Google Drive.'
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
                {isConnecting
                  ? 'Connecting…'
                  : isConnected
                    ? t('settings.connected')
                    : 'Disconnected'}
              </span>
            </div>
            <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
              {isConnected
                ? t('settings.storageDescription')
                : 'Your journals are still saved on this device. Reconnect to sync them with Google Drive.'}
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
            {(error || reconnectError) && (
              <p className='mt-1 text-xs text-destructive'>
                {reconnectError ?? error?.message}
              </p>
            )}
            {!isConnected && (
              <Button
                className='mt-3'
                size='sm'
                variant='outline'
                disabled={isConnecting}
                onClick={() => void reconnect()}
              >
                {isConnecting ? 'Connecting…' : 'Reconnect'}
              </Button>
            )}
            {isConnected && (
              <Button
                className='mt-3'
                size='sm'
                variant='outline'
                disabled={status === 'syncing'}
                onClick={() => void backupNow()}
              >
                {status === 'syncing'
                  ? t('settings.backingUp')
                  : t('settings.backUpNow')}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Sheet open={status === 'syncing'} onOpenChange={() => undefined}>
        <SheetContent
          side='bottom'
          className='mx-auto max-w-md rounded-t-3xl border-outline-variant/20 px-4 pb-8'
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <SheetHeader className='items-center px-0 pt-2 text-center'>
            <img
              src='/images/backup.webp'
              alt=''
              className='w-48 animate-backup-sync motion-reduce:animate-none'
              aria-hidden
            />
            <SheetTitle className='font-h2 text-xl text-on-surface'>
              {t('settings.backingUpJournals')}
            </SheetTitle>
            <SheetDescription>
              {t('settings.backupInProgressDescription')}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

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
