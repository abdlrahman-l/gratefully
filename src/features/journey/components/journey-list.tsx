import { useState } from 'react'
import { getCurrentLanguage } from '@/i18n'
import { useTranslation } from 'react-i18next'
import { formatJournalDate } from '@/lib/date-locale'
import { Button } from '@/components/ui/button'
import type { GratefullyEntry } from '../types'
import { JourneyEntry } from './journey-entry'

const INITIAL_ENTRIES_PER_DAY = 3

function formatMonth(date: string) {
  return formatJournalDate(date, getCurrentLanguage(), {
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(date: string) {
  return formatJournalDate(date, getCurrentLanguage(), {
    day: 'numeric',
    month: 'short',
  })
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}



type JourneyDayGroupProps = {
  date: string
  entries: GratefullyEntry[]
  onOpen: (entry: GratefullyEntry) => void
  onEdit: (entry: GratefullyEntry) => void
  onDelete: (entry: GratefullyEntry) => void
}

function JourneyDayGroup({
  date,
  entries,
  onOpen,
  onEdit,
  onDelete,
}: JourneyDayGroupProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const hiddenEntryCount = entries.length - INITIAL_ENTRIES_PER_DAY
  const visibleEntries = isExpanded
    ? entries
    : entries.slice(0, INITIAL_ENTRIES_PER_DAY)
  const today = getLocalDateKey()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const shortDate = formatShortDate(date)
  const dayLabel =
    date === today
      ? t('journey.today', { date: shortDate })
      : date === getLocalDateKey(yesterday)
        ? t('journey.yesterday', { date: shortDate })
        : shortDate

  return (
    <div className='border-b border-outline-variant/20 py-5 first:pt-0 last:border-b-0 last:pb-0'>
      <h3 className='mb-2 font-label text-sm font-semibold text-on-surface'>
        {dayLabel}
      </h3>
      <div>
        {visibleEntries.map((entry) => (
          <JourneyEntry
            key={entry.id}
            entry={entry}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {hiddenEntryCount > 0 && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='mt-3 h-9 px-0 text-primary hover:bg-transparent'
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded
            ? t('journey.showLess')
            : t('journey.viewMore', { count: hiddenEntryCount })}
        </Button>
      )}
    </div>
  )
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
  const groupedEntries = new Map<
    string,
    { label: string; days: Map<string, GratefullyEntry[]> }
  >()

  for (const entry of [...entries].sort((firstEntry, secondEntry) =>
    secondEntry.date.localeCompare(firstEntry.date)
  )) {
    const monthKey = entry.date.slice(0, 7)
    const month = groupedEntries.get(monthKey) ?? {
      label: formatMonth(entry.date),
      days: new Map<string, GratefullyEntry[]>(),
    }
    const dayEntries = month.days.get(entry.date) ?? []

    dayEntries.push(entry)
    month.days.set(entry.date, dayEntries)
    groupedEntries.set(monthKey, month)
  }

  return (
    <div className='flex flex-col gap-7'>
      {Array.from(groupedEntries).map(([monthKey, month]) => (
        <section key={monthKey} aria-labelledby={`month-${monthKey}`}>
          <h2
            id={`month-${monthKey}`}
            className='mb-3 font-h2 text-base font-semibold text-primary'
          >
            {month.label}
          </h2>
          <div className='rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-ambient'>
            {Array.from(month.days).map(([date, dayEntries]) => (
              <JourneyDayGroup
                key={date}
                date={date}
                entries={dayEntries}
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
