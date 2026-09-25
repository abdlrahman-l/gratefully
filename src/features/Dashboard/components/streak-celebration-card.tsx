import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getNextStreakMilestone,
  getRewardImage,
  getStreakMilestoneProgress,
} from '@/features/Dashboard/utils/streak'

type StreakCelebrationCardProps = {
  streakDays: number
  todayComplete: boolean
}

export function StreakCelebrationCard({
  streakDays,
  todayComplete,
}: StreakCelebrationCardProps) {
  const { t } = useTranslation()
  const nextMilestone = getNextStreakMilestone(streakDays)
  const milestoneProgress = getStreakMilestoneProgress(streakDays)
  const message =
    streakDays === 0
      ? t('home.streakStart')
      : todayComplete
        ? t('home.streakComplete')
        : t('home.streakPending')

  return (
    <section
      className={`rounded-2xl p-5 shadow-ambient ${todayComplete ? 'bg-primary-container/10' : 'border border-primary/15 bg-primary/5'}`}
    >
      <div className='flex items-start gap-4'>
        <img
          className='size-20 shrink-0 animate-streak-celebration object-contain motion-reduce:animate-none'
          src={getRewardImage(streakDays)}
          alt=''
        />
        <div className='min-w-0 flex-1 pt-1'>
          <div className='flex items-center gap-1.5 text-primary'>
            <Flame className='size-4' fill='currentColor' aria-hidden />
            <span className='font-label text-xs font-semibold tracking-wide uppercase'>
              {t('home.currentStreak')}
            </span>
          </div>
          <p className='mt-1 font-h1 text-2xl leading-none font-semibold text-primary'>
            {t('home.streakDays', { count: streakDays })}
          </p>
        </div>
      </div>
      <p className='mt-4 font-quote text-base leading-6 text-primary italic'>
        {message}
      </p>
      <div className='mt-4'>
        <div className='flex items-center justify-between gap-3'>
          <span className='font-label text-xs text-on-surface-variant'>
            {t('home.streakNextMilestone', { count: nextMilestone })}
          </span>
          <span className='font-label text-xs font-semibold text-primary'>
            {milestoneProgress}%
          </span>
        </div>
        <div className='mt-2 h-2 overflow-hidden rounded-full bg-primary/10'>
          <div
            className='h-full rounded-full bg-primary transition-[width] duration-500'
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
      </div>
      {!todayComplete && (
        <Link
          to='/grateful'
          className='mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-label text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        >
          {t('home.keepStreak')}
          <ArrowRight className='size-4' aria-hidden />
        </Link>
      )}
      {todayComplete && (
        <p className='mt-4 flex items-center gap-2 font-label text-xs font-semibold text-primary'>
          <Check className='size-4' strokeWidth={3} aria-hidden />
          {t('home.streakTodayComplete')}
        </p>
      )}
    </section>
  )
}
