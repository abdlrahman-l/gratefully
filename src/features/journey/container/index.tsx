import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JourneyDialogs } from '@/features/journey/components/journey-dialogs'
import { JourneyFilters } from '@/features/journey/components/journey-filters'
import {
  JourneyEmptyState,
  JourneyList,
} from '@/features/journey/components/journey-list'
import { useUrlSearchState } from '@/features/journey/hooks/use-url-search-state'
import { INITIAL_ENTRIES, type GratefullyEntry } from '@/features/journey/types'

export function JourneyContainer() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState(INITIAL_ENTRIES)
  const { states, debouncedStates, updateKey } = useUrlSearchState({
    query: '',
    date: '',
  })
  const [selectedEntry, setSelectedEntry] = useState<GratefullyEntry | null>(
    null
  )
  const [editingEntry, setEditingEntry] = useState<GratefullyEntry | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<GratefullyEntry | null>(null)
  const [editContent, setEditContent] = useState('')

  const query = states?.query ?? ''
  const filterDate = states?.date ?? ''
  const filteredEntries = useMemo(() => {
    const normalizedQuery = (debouncedStates?.query ?? '').trim().toLowerCase()
    const date = debouncedStates?.date ?? ''

    return entries.filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        entry.content.toLowerCase().includes(normalizedQuery)
      return matchesQuery && (!date || entry.date === date)
    })
  }, [debouncedStates, entries])

  const openEdit = (entry: GratefullyEntry) => {
    setSelectedEntry(null)
    setEditingEntry(entry)
    setEditContent(entry.content)
  }

  const saveEdit = () => {
    const content = editContent.trim()
    if (!editingEntry || !content) return
    setEntries((current) =>
      current.map((entry) =>
        entry.id === editingEntry.id ? { ...entry, content } : entry
      )
    )
    setEditingEntry(null)
  }

  const confirmDelete = () => {
    if (!deleteEntry) return
    setEntries((current) =>
      current.filter((entry) => entry.id !== deleteEntry.id)
    )
    setSelectedEntry(null)
    setDeleteEntry(null)
  }

  return (
    <div className='flex flex-col gap-6 px-4 pt-2 pb-28'>
      <header>
        <h1 className='font-h1 text-2xl font-bold tracking-tight text-on-surface'>
          {t('journey.title')}
        </h1>
        <p className='mt-2 font-body-md text-sm leading-6 text-outline'>
          {t('journey.subtitle')}
        </p>
      </header>

      <JourneyFilters
        query={query}
        filterDate={filterDate}
        onQueryChange={(value) => updateKey('query', value)}
        onDateChange={(value) => updateKey('date', value)}
      />

      {filteredEntries.length === 0 ? (
        <JourneyEmptyState
          searchActive={query.trim().length > 0 || filterDate.length > 0}
        />
      ) : (
        <JourneyList
          entries={filteredEntries}
          onOpen={setSelectedEntry}
          onEdit={openEdit}
          onDelete={setDeleteEntry}
        />
      )}

      <JourneyDialogs
        selectedEntry={selectedEntry}
        editingEntry={editingEntry}
        deleteEntry={deleteEntry}
        editContent={editContent}
        onCloseSelected={() => setSelectedEntry(null)}
        onEdit={openEdit}
        onRequestDelete={(entry) => {
          setSelectedEntry(null)
          setDeleteEntry(entry)
        }}
        onCloseEdit={() => setEditingEntry(null)}
        onContentChange={setEditContent}
        onSave={saveEdit}
        onCloseDelete={() => setDeleteEntry(null)}
        onConfirmDelete={confirmDelete}
      />
    </div>
  )
}
