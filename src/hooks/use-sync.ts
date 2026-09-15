import { useCallback, useEffect, useState } from 'react'
import { getPendingCount } from '@/db/entries.repository'
import { getSyncMetadata } from '@/db/metadata.repository'
import { SyncOfflineError, refreshFromGoogleDrive, syncNow } from '@/sync/sync.service'
import { useAuthStore } from '@/stores/auth-store'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

type SyncState = {
  status: SyncStatus
  lastSyncedAt: string | null
  pendingCount: number
  error: Error | null
  sync: () => Promise<void>
}

export function useSync(): SyncState {
  const user = useAuthStore((state) => state.auth.user)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const loadLocalState = useCallback(async () => {
    const [metadata, count] = await Promise.all([getSyncMetadata(), getPendingCount()])
    setLastSyncedAt(metadata?.lastSyncedAt ?? null)
    setPendingCount(count)
  }, [])

  const sync = useCallback(async () => {
    if (!user) return
    if (!navigator.onLine) { setStatus('offline'); return }
    setStatus('syncing')
    setError(null)
    try {
      await syncNow()
      await loadLocalState()
      setStatus('synced')
    } catch (cause) {
      if (cause instanceof SyncOfflineError) { setStatus('offline'); return }
      setError(cause instanceof Error ? cause : new Error('Cloud sync failed.'))
      setStatus('error')
    }
  }, [loadLocalState, user])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadLocalState(), 0)
    const refresh = () => void loadLocalState()
    window.addEventListener('gratefully:local-change', refresh)
    window.addEventListener('gratefully:sync-complete', refresh)
    return () => {
      window.clearTimeout(initialLoad)
      window.removeEventListener('gratefully:local-change', refresh)
      window.removeEventListener('gratefully:sync-complete', refresh)
    }
  }, [loadLocalState])

  useEffect(() => {
    if (!user || !navigator.onLine) return
    // Local IndexedDB has already rendered. This is intentionally download-only.
    void refreshFromGoogleDrive().then(loadLocalState).catch((cause: unknown) => {
      if (!(cause instanceof SyncOfflineError)) setError(cause instanceof Error ? cause : new Error('Cloud refresh failed.'))
    })
  }, [loadLocalState, user])

  return { status, lastSyncedAt, pendingCount, error, sync }
}
