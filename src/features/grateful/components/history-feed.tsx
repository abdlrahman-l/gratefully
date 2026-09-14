import type { GratitudeEntry } from '@/types/gratitude'
import { CalendarIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HistoryFeedProps {
  entries: GratitudeEntry[]
  filterDate: string
  isLoading: boolean
  onDelete: (id: string) => Promise<void>
  onEdit: (entry: GratitudeEntry) => void
  onFilterDateChange: (date: string) => void
}

export function HistoryFeed({
  entries,
  filterDate,
  isLoading,
  onDelete,
  onEdit,
  onFilterDateChange,
}: HistoryFeedProps) {
  return (
    <section className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='font-h2 text-xl font-semibold text-on-surface'>
          Recent Moments
        </h2>
        <label className='flex items-center gap-2 font-label text-sm text-outline'>
          Filter by date
          <input
            className='h-8 rounded-md border border-outline-variant/30 bg-transparent px-2 text-on-surface outline-none focus:border-primary'
            type='date'
            value={filterDate}
            onChange={(event) => onFilterDateChange(event.target.value)}
          />
          {filterDate && (
            <Button
              size='sm'
              type='button'
              variant='ghost'
              onClick={() => onFilterDateChange('')}
            >
              Clear
            </Button>
          )}
        </label>
      </div>
      <div className='flex flex-col gap-4'>
        {isLoading ? (
          <p className='font-body-md text-outline'>Loading your journal…</p>
        ) : entries.length === 0 ? (
          <p className='font-body-md text-outline'>No gratitude entries yet.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className='group flex flex-col gap-2 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-ambient transition-shadow duration-300 hover:shadow-md'
            >
              <div className='flex items-center justify-between gap-3'>
                <p className='flex items-center gap-1.5 font-label text-sm font-medium text-outline'>
                  <CalendarIcon className='size-4' />
                  {entry.date}
                </p>
                <div className='flex gap-1'>
                  <Button
                    aria-label={`Edit entry from ${entry.date}`}
                    size='icon'
                    type='button'
                    variant='ghost'
                    onClick={() => onEdit(entry)}
                  >
                    <PencilIcon className='size-4' />
                  </Button>
                  <Button
                    aria-label={`Delete entry from ${entry.date}`}
                    size='icon'
                    type='button'
                    variant='ghost'
                    onClick={() => void onDelete(entry.id)}
                  >
                    <Trash2Icon className='size-4' />
                  </Button>
                </div>
              </div>
              <p className='font-body-md text-base text-on-surface'>
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
