import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getActiveEntries,
  softDeleteEntry,
  updateEntry,
} from '@/db/entries.repository'
import type { GratefullyEntry } from '@/types/gratefully'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { JourneyDialogs } from '@/features/journey/components/journey-dialogs'
import { JourneyFilters } from '@/features/journey/components/journey-filters'
import {
  JourneyEmptyState,
  JourneyList,
} from '@/features/journey/components/journey-list'
import { useUrlSearchState } from '@/features/journey/hooks/use-url-search-state'

export function JourneyContainer() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<GratefullyEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { states, debouncedStates, updateKey, reset } = useUrlSearchState({
    query: '',
    date: '',
  })
  const [selectedEntry, setSelectedEntry] = useState<GratefullyEntry | null>(
    null
  )
  const [editingEntry, setEditingEntry] = useState<GratefullyEntry | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<GratefullyEntry | null>(null)
  const [editContent, setEditContent] = useState('')

  const loadEntries = useCallback(async () => {
    const loadedEntries = await getActiveEntries()
    setEntries(
      [...loadedEntries].sort((firstEntry, secondEntry) =>
        secondEntry.date.localeCompare(firstEntry.date)
      )
    )
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        await loadEntries()
      } catch (error) {
        if (isMounted) {
          toast.error(
            error instanceof Error ? error.message : t('grateful.loadError')
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void initialize()

    return () => {
      isMounted = false
    }
  }, [loadEntries, t])

  useEffect(() => {
    const refreshEntries = () => {
      void loadEntries()
    }
    window.addEventListener('gratefully:sync-complete', refreshEntries)
    return () => {
      window.removeEventListener('gratefully:sync-complete', refreshEntries)
    }
  }, [loadEntries])

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

  const saveEdit = async () => {
    const content = editContent.trim()
    if (!editingEntry || !content) return

    try {
      await updateEntry(editingEntry.id, { content })
      await loadEntries()
      setEditingEntry(null)
      toast.success(t('grateful.updated'))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('grateful.saveError')
      )
    }
  }

  const confirmDelete = async () => {
    if (!deleteEntry) return

    try {
      await softDeleteEntry(deleteEntry.id)
      await loadEntries()
      setSelectedEntry(null)
      setDeleteEntry(null)
      toast.success(t('grateful.deleted'))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('grateful.deleteError')
      )
    }
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
        journalDates={entries.map((entry) => entry.date)}
        onQueryChange={(value) => updateKey('query', value)}
        onDateChange={(value) => updateKey('date', value)}
        onReset={reset}
      />

      {isLoading ? (
        <p className='rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-6 py-12 text-center font-body-md text-sm text-outline shadow-ambient'>
          {t('common.loading')}
        </p>
      ) : filteredEntries.length === 0 ? (
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
