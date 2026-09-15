import { useTranslation } from 'react-i18next'
import { getRewardImage } from '@/features/Dashboard/utils/streak'

type StreakCelebrationCardProps = {
  streakDays: number
}

export function StreakCelebrationCard({
  streakDays,
}: StreakCelebrationCardProps) {
  const { t } = useTranslation()

  return (
    <section className='flex flex-col gap-3 rounded-2xl bg-primary-container/10 p-5 shadow-ambient'>
      <img
        className='size-32 shrink-0 self-center object-contain animate-streak-celebration motion-reduce:animate-none'
        src={getRewardImage(streakDays)}
        alt=''
      />
      <p className='font-quote text-lg leading-7 text-primary italic'>
        {t('home.streak', { count: streakDays })}
      </p>
    </section>
  )
}
