import { getActiveAccountNamespace } from '@/db/account'
import { openDatabase } from '@/db/db'
import { requestToPromise } from '@/db/request'
import type { SyncMetadata } from '@/types/gratefully'

const SCHEMA_VERSION = 2

function getSyncMetadataKey(accountId: string): string {
  return `sync:${accountId}`
}

const initialMetadata = (accountId: string): SyncMetadata => ({
  key: getSyncMetadataKey(accountId),
  accountId,
  schemaVersion: SCHEMA_VERSION,
  lastSyncedAt: null,
  lastLocalChangeAt: null,
  remoteMonths: {},
})

function normalizeMetadata(value: unknown, accountId: string): SyncMetadata {
  const metadata = value as Partial<SyncMetadata> | undefined
  return {
    ...initialMetadata(accountId),
    ...metadata,
    key: getSyncMetadataKey(accountId),
    accountId,
    schemaVersion: SCHEMA_VERSION,
    remoteMonths: metadata?.remoteMonths ?? {},
  }
}

export async function getSyncMetadata(
  accountId = getActiveAccountNamespace()
): Promise<SyncMetadata | undefined> {
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readonly')
  const stored = await requestToPromise(
    transaction.objectStore('metadata').get(getSyncMetadataKey(accountId))
  )
  return stored ? normalizeMetadata(stored, accountId) : undefined
}

export async function initializeSyncMetadata(
  accountId = getActiveAccountNamespace()
): Promise<SyncMetadata> {
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readwrite')
  const store = transaction.objectStore('metadata')
  const existing = await requestToPromise(
    store.get(getSyncMetadataKey(accountId))
  )
  const metadata = existing
    ? normalizeMetadata(existing, accountId)
    : initialMetadata(accountId)
  await requestToPromise(store.put(metadata))
  return metadata
}

export async function updateSyncMetadata(
  updates: Partial<Omit<SyncMetadata, 'key' | 'accountId'>>,
  accountId = getActiveAccountNamespace()
): Promise<SyncMetadata> {
  const current = await initializeSyncMetadata(accountId)
  const metadata: SyncMetadata = {
    ...current,
    ...updates,
    key: getSyncMetadataKey(accountId),
    accountId,
    remoteMonths: updates.remoteMonths ?? current.remoteMonths,
  }
  const database = await openDatabase()
  const transaction = database.transaction('metadata', 'readwrite')
  await requestToPromise(transaction.objectStore('metadata').put(metadata))
  return metadata
}

export async function markLocalChange(): Promise<SyncMetadata> {
  const accountId = getActiveAccountNamespace()
  const metadata = await updateSyncMetadata(
    {
      lastLocalChangeAt: new Date().toISOString(),
    },
    accountId
  )
  window.dispatchEvent(new Event('gratefully:local-change'))
  return metadata
}
