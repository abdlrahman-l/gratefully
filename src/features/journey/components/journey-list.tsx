import { getCurrentLanguage } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { formatJournalDate } from '@/lib/date-locale'
import type { GratefullyEntry } from '../types'
import { JourneyEntry } from './journey-entry'

function formatMonth(date: string) {
  return formatJournalDate(date, getCurrentLanguage(), {
    month: 'long',
    year: 'numeric',
  })
}

export function JourneyEmptyState({ searchActive }: { searchActive: boolean }) {
  const { t } = useTranslation()

  return (
    <div className='rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-12 text-center shadow-ambient'>
      <h2 className='font-h2 text-lg font-semibold text-on-surface'>
        {searchActive ? t('journey.noResults') : t('journey.noJourney')}
      </h2>
      <p className='mt-2 font-body-md text-sm text-outline'>
        {searchActive
          ? t('journey.noResultsDescription')
          : t('journey.noJourneyDescription')}
      </p>
    </div>
  )
}

type JourneyListProps = {
  entries: GratefullyEntry[]
  onOpen: (entry: GratefullyEntry) => void
  onEdit: (entry: GratefullyEntry) => void
  onDelete: (entry: GratefullyEntry) => void
}

export function JourneyList({
  entries,
  onOpen,
  onEdit,
  onDelete,
}: JourneyListProps) {
  const groupedEntries = entries.reduce<Record<string, GratefullyEntry[]>>(
    (groups, entry) => {
      const month = formatMonth(entry.date)
      groups[month] = [...(groups[month] ?? []), entry]
      return groups
    },
    {}
  )

  return (
    <div className='flex flex-col gap-7'>
      {Object.entries(groupedEntries).map(([month, monthEntries]) => (
        <section key={month} aria-labelledby={`month-${month}`}>
          <h2
            id={`month-${month}`}
            className='mb-3 font-h2 text-base font-semibold text-primary'
          >
            {month}
          </h2>
          <div className='rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-ambient'>
            {monthEntries.map((entry) => (
              <JourneyEntry
                key={entry.id}
                entry={entry}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
