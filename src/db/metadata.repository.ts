import { openDatabase } from '@/db/db'
import { requestToPromise } from '@/db/request'
import type { SyncMetadata } from '@/types/gratitude'

const SYNC_METADATA_KEY = 'sync' as const
const SCHEMA_VERSION = 1

const initialMetadata = (): SyncMetadata => ({
  key: SYNC_METADATA_KEY,
  schemaVersion: SCHEMA_VERSION,
  lastSyncedAt: null,
  lastLocalChangeAt: null,
  driveModifiedTime: null,
  driveFileId: null,
})

export async function getSyncMetadata(): Promise<SyncMetadata | undefined> {
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readonly')
  const store = transaction.objectStore('metadata')

  return requestToPromise(store.get(SYNC_METADATA_KEY))
}

export async function initializeSyncMetadata(): Promise<SyncMetadata> {
  const existingMetadata = await getSyncMetadata()
  if (existingMetadata) return existingMetadata

  const metadata = initialMetadata()
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readwrite')
  const store = transaction.objectStore('metadata')

  await requestToPromise(store.add(metadata))
  return metadata
}

export async function updateSyncMetadata(
  updates: Partial<Omit<SyncMetadata, 'key'>>
): Promise<SyncMetadata> {
  const currentMetadata = await initializeSyncMetadata()
  const metadata: SyncMetadata = {
    ...currentMetadata,
    ...updates,
    key: SYNC_METADATA_KEY,
  }
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readwrite')
  const store = transaction.objectStore('metadata')

  await requestToPromise(store.put(metadata))
  return metadata
}

export function markLocalChange(): Promise<SyncMetadata> {
  return updateSyncMetadata({ lastLocalChangeAt: new Date().toISOString() })
}
