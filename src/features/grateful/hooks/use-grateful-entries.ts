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

type EntryInput = {
  date: string
  content: string
}

export function useGratefulEntries() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<GratefullyEntry[]>([])
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

  useEffect(() => {
    const refreshEntries = () => {
      void loadEntries()
    }
    window.addEventListener('gratefully:sync-complete', refreshEntries)
    return () => {
      window.removeEventListener('gratefully:sync-complete', refreshEntries)
    }
  }, [loadEntries])

  const saveEntry = useCallback(
    async (input: EntryInput) => {
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
        await loadEntries()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t('grateful.saveError')
        )
      } finally {
        setIsSaving(false)
      }
    },
    [editingEntry, loadEntries, t]
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        await softDeleteEntry(id)
        if (editingEntry?.id === id) setEditingEntry(undefined)
        await loadEntries()
        toast.success(t('grateful.deleted'))
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t('grateful.deleteError')
        )
      }
    },
    [editingEntry, loadEntries, t]
  )

  return {
    entries,
    editingEntry,
    formVersion,
    isLoading,
    isSaving,
    loadEntries,
    saveEntry,
    deleteEntry,
    setEditingEntry,
  }
}
