import { openDatabase } from '@/db/db'
import { requestToPromise } from '@/db/request'
import type { SyncMetadata } from '@/types/gratefully'

const SYNC_METADATA_KEY = 'sync' as const
const SCHEMA_VERSION = 2

const initialMetadata = (): SyncMetadata => ({
  key: SYNC_METADATA_KEY,
  schemaVersion: SCHEMA_VERSION,
  lastSyncedAt: null,
  lastLocalChangeAt: null,
  remoteMonths: {},
})

function normalizeMetadata(value: unknown): SyncMetadata {
  const metadata = value as Partial<SyncMetadata> | undefined
  return {
    ...initialMetadata(),
    ...metadata,
    key: SYNC_METADATA_KEY,
    schemaVersion: SCHEMA_VERSION,
    remoteMonths: metadata?.remoteMonths ?? {},
  }
}

export async function getSyncMetadata(): Promise<SyncMetadata | undefined> {
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readonly')
  const stored = await requestToPromise(
    transaction.objectStore('metadata').get(SYNC_METADATA_KEY)
  )
  return stored ? normalizeMetadata(stored) : undefined
}

export async function initializeSyncMetadata(): Promise<SyncMetadata> {
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readwrite')
  const store = transaction.objectStore('metadata')
  const existing = await requestToPromise(store.get(SYNC_METADATA_KEY))
  const metadata = existing ? normalizeMetadata(existing) : initialMetadata()
  await requestToPromise(store.put(metadata))
  return metadata
}

export async function updateSyncMetadata(
  updates: Partial<Omit<SyncMetadata, 'key'>>
): Promise<SyncMetadata> {
  const current = await initializeSyncMetadata()
  const metadata: SyncMetadata = {
    ...current,
    ...updates,
    key: SYNC_METADATA_KEY,
    remoteMonths: updates.remoteMonths ?? current.remoteMonths,
  }
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readwrite')
  await requestToPromise(transaction.objectStore('metadata').put(metadata))
  return metadata
}

export async function markLocalChange(): Promise<SyncMetadata> {
  const metadata = await updateSyncMetadata({
    lastLocalChangeAt: new Date().toISOString(),
  })
  window.dispatchEvent(new Event('gratefully:local-change'))
  return metadata
}
