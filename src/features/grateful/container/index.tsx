import { useCallback, useEffect, useState } from 'react'
import {
  createEntry,
  getActiveEntries,
  getEntriesByDate,
  softDeleteEntry,
  updateEntry,
} from '@/db/entries.repository'
import { initializeSyncMetadata } from '@/db/metadata.repository'
import type { GratefullyEntry } from '@/types/gratefully'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { HistoryFeed } from '@/features/grateful/components/history-feed'
import { JournalInput } from '@/features/grateful/components/journal-input'
import { WisdomCard } from '@/features/grateful/components/wisdom-card'

export const GratefulContainer = () => {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<GratefullyEntry[]>([])
  const [filterDate, setFilterDate] = useState('')
  const [editingEntry, setEditingEntry] = useState<GratefullyEntry>()
  const [formVersion, setFormVersion] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadEntries = useCallback(async (date?: string) => {
    const loadedEntries = date
      ? await getEntriesByDate(date)
      : await getActiveEntries()
    setEntries(
      [...loadedEntries].sort((firstEntry, secondEntry) =>
        secondEntry.updatedAt.localeCompare(firstEntry.updatedAt)
      )
    )
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        await initializeSyncMetadata()
        if (isMounted) await loadEntries()
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

  const handleFilterDateChange = async (date: string) => {
    setFilterDate(date)
    setIsLoading(true)

    try {
      await loadEntries(date || undefined)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('grateful.filterError')
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (input: { date: string; content: string }) => {
    setIsSaving(true)

    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, input)
        setEditingEntry(undefined)
        toast.success(t('grateful.updated'))
      } else {
        await createEntry(input)
        toast.success(t('grateful.saved'))
      }

      setFormVersion((version) => version + 1)
      await loadEntries(filterDate || undefined)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('grateful.saveError')
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await softDeleteEntry(id)
      if (editingEntry?.id === id) setEditingEntry(undefined)
      await loadEntries(filterDate || undefined)
      toast.success(t('grateful.deleted'))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('grateful.deleteError')
      )
    }
  }

  return (
    <div className='container flex flex-col gap-12'>
      <WisdomCard />
      <JournalInput
        key={`${editingEntry?.id ?? 'new'}-${formVersion}`}
        editingEntry={editingEntry}
        isSaving={isSaving}
        onCancelEdit={() => setEditingEntry(undefined)}
        onSave={handleSave}
      />
      <HistoryFeed
        entries={entries}
        filterDate={filterDate}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={setEditingEntry}
        onFilterDateChange={(date) => void handleFilterDateChange(date)}
      />
    </div>
  )
}
