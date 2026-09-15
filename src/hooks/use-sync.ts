import { useCallback, useEffect, useRef, useState } from 'react'
import { getSyncMetadata } from '@/db/metadata.repository'
import { SyncOfflineError, syncWithGoogleDrive } from '@/sync/sync.service'
import { useAuthStore } from '@/stores/auth-store'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

type SyncState = {
  status: SyncStatus
  lastSyncedAt: string | null
  error: Error | null
  sync: () => Promise<void>
}

const DEBOUNCE_MS = 3_000

export function useSync(): SyncState {
  const user = useAuthStore((state) => state.auth.user)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const debounceTimer = useRef<number | null>(null)
  const initialSyncAccount = useRef<string | null>(null)

  const sync = useCallback(async () => {
    if (!user) return
    if (!navigator.onLine) {
      setStatus('offline')
      return
    }

    setStatus('syncing')
    setError(null)
    try {
      await syncWithGoogleDrive()
      const metadata = await getSyncMetadata()
      setLastSyncedAt(metadata?.lastSyncedAt ?? null)
      setStatus('synced')
    } catch (cause) {
      if (cause instanceof SyncOfflineError) {
        setStatus('offline')
        return
      }
      const syncError =
        cause instanceof Error ? cause : new Error('Cloud sync failed.')
      // eslint-disable-next-line no-console
      if (import.meta.env.DEV) console.error('[sync] sync failed', syncError)
      setError(syncError)
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      initialSyncAccount.current = null
      return
    }
    if (initialSyncAccount.current === user.accountNo) return

    initialSyncAccount.current = user.accountNo
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[sync] auth ready')
      // eslint-disable-next-line no-console
      console.debug('[sync] initial sync requested')
    }
    void sync()
  }, [user, sync])

  useEffect(() => {
    if (!user) return

    const scheduleSync = () => {
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = window.setTimeout(() => {
        debounceTimer.current = null
        void sync()
      }, DEBOUNCE_MS)
    }
    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') void sync()
    }

    window.addEventListener('online', sync)
    window.addEventListener('gratefully:local-change', scheduleSync)
    document.addEventListener('visibilitychange', syncWhenVisible)

    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('gratefully:local-change', scheduleSync)
      document.removeEventListener('visibilitychange', syncWhenVisible)
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current)
      }
    }
  }, [user, sync])

  return { status, lastSyncedAt, error, sync }
}
