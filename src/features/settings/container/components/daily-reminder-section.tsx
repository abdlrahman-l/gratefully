import { useEffect, useState } from 'react'
import {
  enableNotifications,
  getFCMToken,
  getNotificationPermission,
  isNotificationSupported,
  type NotificationEnableError,
} from '@/services/notification.service'
import { BellIcon, CheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { SectionTitle } from './settings-primitives'

type ReminderState = NotificationPermission | 'unsupported'

export function DailyReminderSection() {
  const { t } = useTranslation()
  const [state, setState] = useState<ReminderState>('unsupported')
  const [isLoading, setIsLoading] = useState(true)
  const [isEnabling, setIsEnabling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadNotificationState = async () => {
      const supported = await isNotificationSupported()
      if (!isMounted) return

      const permission = supported ? getNotificationPermission() : 'unsupported'
      setState(permission)
      setIsLoading(false)

      if (permission === 'granted') {
        void getFCMToken().catch((cause) => {
          // eslint-disable-next-line no-console
          console.error(
            '[notifications] Unable to refresh the existing FCM token.',
            cause
          )
        })
      }
    }

    void loadNotificationState()
    return () => {
      isMounted = false
    }
  }, [])

  const handleEnable = async () => {
    setError(null)
    setIsEnabling(true)

    try {
      const token = await enableNotifications()

      await fetch(
        'https://green-limit-4b3b.abdulrahmaninformatics.workers.dev/notifications/subscribe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
          }),
        }
      )
      setState('granted')
    } catch (cause) {
      const notificationError = cause as NotificationEnableError
      setState(getNotificationPermission())
      setError(
        notificationError.code === 'DENIED'
          ? t('settings.notificationsBlocked')
          : notificationError.code === 'UNSUPPORTED'
            ? t('settings.notificationsUnsupported')
            : t('settings.notificationsError')
      )
    } finally {
      setIsEnabling(false)
    }
  }

  const isGranted = state === 'granted'
  const isDenied = state === 'denied'
  const isUnsupported = state === 'unsupported'

  return (
    <section className='space-y-3' aria-label={t('settings.dailyReminder')}>
      <SectionTitle>{t('settings.dailyReminder')}</SectionTitle>
      <div className='rounded-2xl border border-outline-variant/20 bg-card p-4 shadow-ambient'>
        <div className='flex items-start gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <BellIcon className='size-5' aria-hidden />
          </span>
          <div className='min-w-0 flex-1'>
            <h3 className='font-label text-sm font-semibold text-foreground'>
              {t('settings.dailyReminder')}
            </h3>
            <p className='mt-1.5 font-body-md text-sm leading-6 text-muted-foreground'>
              {t('settings.dailyReminderDescription')}
            </p>

            {isGranted ? (
              <p className='mt-3 flex items-center gap-1.5 font-label text-sm font-medium text-primary'>
                <CheckIcon className='size-4' aria-hidden />
                {t('settings.notificationsEnabled')}
              </p>
            ) : isDenied ? (
              <p className='mt-3 text-sm leading-6 text-destructive'>
                {t('settings.notificationsBlocked')}
              </p>
            ) : isUnsupported ? (
              <p className='mt-3 text-sm leading-6 text-muted-foreground'>
                {t('settings.notificationsUnsupported')}
              </p>
            ) : (
              <Button
                className='mt-3'
                size='sm'
                disabled={isLoading || isEnabling}
                onClick={() => void handleEnable()}
              >
                {isEnabling
                  ? t('settings.enablingNotifications')
                  : t('settings.enableNotifications')}
              </Button>
            )}

            <p className='mt-3 font-label text-xs font-medium text-muted-foreground'>
              {t('settings.dailyReminderTime')}
            </p>
            {error && !isDenied && !isUnsupported && (
              <p className='mt-2 text-sm text-destructive'>{error}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
