import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Cloud,
  Heart,
  LockKeyhole,
  Pencil,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { getDateLocale } from '@/lib/date-locale'
import { cn } from '@/lib/utils'
import { useSync } from '@/hooks/use-sync'
import { useDashboardData } from '@/features/Dashboard/hooks/use-dashboard-data'
import { useGratefulEntries } from '@/features/grateful/hooks/use-grateful-entries'

function formatLatestDate(date: string, language: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(
    getDateLocale(language === 'id' ? 'id' : 'en'),
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  ).format(new Date(year, month - 1, day))
}

export function DashboardPrototype() {
  const { t, i18n } = useTranslation()
  const driveConnectionStatus = useAuthStore(
    (state) => state.auth.driveConnectionStatus
  )
  const {
    completedDays,
    isLoading,
    monthlyEntries,
    streakDays,
    totalEntries,
    week,
  } = useDashboardData()
  const { entries } = useGratefulEntries()
  const { error: syncError, lastSyncedAt, pendingCount } = useSync()

  const latestEntry = entries[0]
  const isFirstEntry = !isLoading && totalEntries === 0
  const currentWeekIndex = (new Date().getDay() + 6) % 7
  const isDriveConnected = driveConnectionStatus === 'connected'
  const isBackupNeedsAttention = Boolean(
    syncError || pendingCount || !isDriveConnected
  )

  const backupLabel = syncError
    ? t('home.prototype.backupError')
    : !isDriveConnected
      ? t('home.prototype.backupDisconnected')
      : pendingCount
        ? t('home.prototype.backupPending', { count: pendingCount })
        : lastSyncedAt
          ? t('home.prototype.backupReady')
          : t('home.prototype.backupNotStarted')

  return (
    <main className='w-full px-4 pt-4 pb-28'>
      <div className='flex flex-col gap-5'>
        <section className='overflow-hidden rounded-3xl bg-primary p-5 text-white shadow-ambient'>
          <div className='relative z-10'>
            <div className='flex items-center gap-2 text-white/75'>
              <Sparkles className='size-4' aria-hidden />
              <p className='font-label text-xs font-semibold tracking-wide uppercase'>
                {isFirstEntry
                  ? t('home.prototype.firstMomentEyebrow')
                  : t('home.prototype.todayEyebrow')}
              </p>
            </div>
            <h2 className='mt-3 max-w-[15rem] font-h1 text-2xl leading-tight font-semibold tracking-tight'>
              {isFirstEntry
                ? t('home.prototype.firstMomentTitle')
                : t('home.prototype.todayTitle')}
            </h2>
            <p className='mt-2 max-w-[19rem] text-sm leading-6 text-white/75'>
              {isFirstEntry
                ? t('home.prototype.firstMomentDescription')
                : t('home.prototype.todayDescription')}
            </p>
            <Link
              to='/grateful'
              className='mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-label text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              {isFirstEntry
                ? t('home.prototype.startWriting')
                : t('home.writeToday')}
              <Pencil className='size-4' strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
          <div
            className='mt-[-3rem] -mr-16 -mb-20 ml-auto size-40 rounded-full bg-white/10'
            aria-hidden
          />
        </section>

        <section className='rounded-2xl bg-surface-container-lowest p-5 shadow-ambient'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='font-label text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
                {t('home.prototype.weeklyPractice')}
              </p>
              <h2 className='mt-1 font-h1 text-xl font-medium tracking-tight text-primary'>
                {t('home.days', { count: completedDays })}
              </h2>
            </div>
            <div className='flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary'>
              <span className='font-label text-xs font-semibold'>
                {t('home.prototype.currentStreak', { count: streakDays })}
              </span>
            </div>
          </div>
          <div
            className='mt-5 grid grid-cols-7 gap-1'
            aria-label={t('home.weeklyProgress')}
          >
            {week.map(({ key, complete }, index) => (
              <div
                key={key}
                className='flex min-w-0 flex-col items-center gap-1.5'
              >
                <span className='font-label text-[0.625rem] font-medium text-outline'>
                  {t(`home.week.${key}`)}
                </span>
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border text-transparent',
                    complete
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : index > currentWeekIndex
                        ? 'border-outline-variant/40 bg-surface text-transparent'
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

        {latestEntry ? (
          <section className='rounded-2xl border border-primary/10 bg-primary/5 p-5'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2 text-primary'>
                <Heart className='size-4' fill='currentColor' aria-hidden />
                <p className='font-label text-xs font-semibold tracking-wide uppercase'>
                  {t('home.prototype.latestReflection')}
                </p>
              </div>
              <span className='font-label text-xs text-on-surface-variant'>
                {formatLatestDate(latestEntry.date, i18n.language)}
              </span>
            </div>
            <p className='mt-3 line-clamp-3 font-quote text-base leading-7 text-primary'>
              “{latestEntry.content}”
            </p>
            <Link
              to='/journey'
              className='mt-4 inline-flex items-center gap-1 font-label text-sm font-semibold text-primary'
            >
              {t('home.prototype.viewJourney')}
              <ArrowRight className='size-4' aria-hidden />
            </Link>
          </section>
        ) : null}

        <section
          className='grid grid-cols-2 gap-2.5'
          aria-label={t('home.summary')}
        >
          <article className='rounded-2xl bg-surface-container-lowest p-4 shadow-ambient'>
            <p className='font-body-lg text-xs leading-snug text-on-surface-variant'>
              {t('home.prototype.totalEntries')}
            </p>
            <p className='mt-3 font-h1 text-3xl leading-none font-semibold tracking-tight text-primary'>
              {totalEntries}
            </p>
          </article>
          <article className='rounded-2xl bg-surface-container-lowest p-4 shadow-ambient'>
            <p className='font-body-lg text-xs leading-snug text-on-surface-variant'>
              {t('home.thisMonth')}
            </p>
            <p className='mt-3 font-h1 text-3xl leading-none font-semibold tracking-tight text-primary'>
              {monthlyEntries}
            </p>
          </article>
        </section>

        <Link
          to='/settings'
          className={cn(
            'flex items-center gap-3 rounded-2xl border p-4 transition-colors',
            isBackupNeedsAttention
              ? 'border-amber-300/60 bg-amber-50 text-amber-950'
              : 'border-primary/10 bg-surface-container-lowest text-on-surface'
          )}
        >
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full',
              isBackupNeedsAttention
                ? 'bg-amber-100 text-amber-700'
                : 'bg-primary/10 text-primary'
            )}
          >
            {isBackupNeedsAttention ? (
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
              {backupLabel}
            </span>
          </span>
          <ArrowRight
            className='size-5 shrink-0 text-on-surface-variant'
            aria-hidden
          />
        </Link>
      </div>
    </main>
  )
}
