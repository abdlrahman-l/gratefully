import { Sparkles } from 'lucide-react'

type StreakCelebrationCardProps = {
  streakDays: number
}

export function StreakCelebrationCard({
  streakDays,
}: StreakCelebrationCardProps) {
  return (
    <section className='flex flex-col gap-3 rounded-2xl bg-primary-container/10 p-5 shadow-ambient'>
      <div className='flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm'>
        <Sparkles className='size-5' strokeWidth={2} />
      </div>
      <p className='font-quote text-lg leading-7 text-primary italic'>
        You&apos;ve reached a {streakDays}-Day Streak! You are building a
        beautiful habit of mindfulness.
      </p>
    </section>
  )
}
