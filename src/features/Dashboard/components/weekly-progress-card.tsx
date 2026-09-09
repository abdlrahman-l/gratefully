import { Link } from '@tanstack/react-router'
import { Check, Heart, Pencil } from 'lucide-react'

type WeekDay = {
  day: string
  complete: boolean
}

type WeeklyProgressCardProps = {
  completedDays: number
  week: WeekDay[]
}

export function WeeklyProgressCard({
  completedDays,
  week,
}: WeeklyProgressCardProps) {
  return (
    <section className='rounded-2xl bg-surface-container-lowest p-5 shadow-ambient'>
      <div className='flex flex-col gap-3'>
        <h1 className='font-h1 text-[1.375rem] leading-tight font-medium tracking-tight text-primary'>
          Kalender Syukurmu
        </h1>
        <div className='flex w-fit items-center gap-1.5 rounded-full border border-outline-variant/40 bg-surface px-3 py-1.5 text-primary'>
          <Heart className='size-4' strokeWidth={2} />
          <span className='font-label text-xs font-semibold'>
            {completedDays} hari
          </span>
        </div>
      </div>

      <p className='mt-6 font-body-lg text-sm leading-relaxed tracking-tight text-on-surface-variant'>
        Terus istiqomah mencatat syukurmu
      </p>

      <div
        className='mt-6 grid grid-cols-7 gap-1'
        aria-label='Progress syukur mingguan'
      >
        {week.map(({ day, complete }) => (
          <div key={day} className='flex min-w-0 flex-col items-center gap-1.5'>
            <span className='font-label text-[0.625rem] font-medium text-outline'>
              {day}
            </span>
            <span
              className={`flex size-8 items-center justify-center rounded-full border transition-colors ${
                complete
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-outline-variant bg-surface text-transparent'
              }`}
            >
              {complete && <Check className='size-3.5' strokeWidth={3} />}
            </span>
          </div>
        ))}
      </div>

      <Link
        to='/grateful'
        className='mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-label text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-primary/90 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
      >
        Catat Syukur Hari Ini
        <Pencil className='size-5' strokeWidth={3} />
      </Link>
    </section>
  )
}
