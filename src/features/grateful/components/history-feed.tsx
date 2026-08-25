import { CalendarIcon } from 'lucide-react'

export function HistoryFeed() {
  return (
    <section className='flex flex-col gap-4'>
      <h2 className='mb-2 font-h2 text-xl font-semibold text-on-surface'>
        Recent Moments
      </h2>
      <div className='flex flex-col gap-4'>
        {/* Card 1 */}
        <div className='group flex flex-col gap-2 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-ambient transition-shadow duration-300 hover:shadow-md'>
          <p className='flex items-center gap-1.5 font-label text-sm font-medium text-outline'>
            <CalendarIcon className='size-4' />
            Yesterday
          </p>
          <p className='font-body-md text-base text-on-surface'>
            Finished a difficult project today and felt a sense of peace.
          </p>
        </div>
        {/* Card 2 */}
        <div className='group flex flex-col gap-2 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-ambient transition-shadow duration-300 hover:shadow-md'>
          <p className='flex items-center gap-1.5 font-label text-sm font-medium text-outline'>
            <CalendarIcon className='size-4' />
            May 2
          </p>
          <p className='font-body-md text-base text-on-surface'>
            Had a warm cup of tea while watching the rain.
          </p>
        </div>
        {/* Card 3 */}
        <div className='group flex flex-col gap-2 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-ambient transition-shadow duration-300 hover:shadow-md'>
          <p className='flex items-center gap-1.5 font-label text-sm font-medium text-outline'>
            <CalendarIcon className='size-4' />
            May 1
          </p>
          <p className='font-body-md text-base text-on-surface'>
            A kind stranger helped me with directions.
          </p>
        </div>
      </div>
    </section>
  )
}
