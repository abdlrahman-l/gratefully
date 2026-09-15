import {
  getAllEntries,

  getPendingEntries,
  getMonthKey,
  markEntriesSynced,
  mergeAndUpsertEntries,
  upsertEntries,
} from '@/db/entries.repository'
import { getSyncMetadata, updateSyncMetadata } from '@/db/metadata.repository'
import {
  createJsonFile,
  downloadJsonFile,
  DriveServiceError,
  findAppDataFile,
  LEGACY_DATABASE_FILE_NAME,
  uploadJsonFile,
} from '@/services/drive.service'
import {
  driveDatabaseToEntries,
  entriesToMonthlyDriveFile,
  getMonthlyFileName,
  monthlyFileToEntries,
  parseDriveDatabase,
  parseMonthlyDriveFile,
  parseRemoteSyncMetadata,
  type RemoteSyncMetadata,
} from '@/sync/mapper'
import { mergeEntries } from '@/sync/merge'
import type { GratefullyEntry } from '@/types/gratefully'

const METADATA_FILE_NAME = 'metadata.json'

export class SyncOfflineError extends Error {
  public constructor() { super('Cloud sync is unavailable while the browser is offline.'); this.name = 'SyncOfflineError' }
}

let activeSync: Promise<void> | null = null
let activeRefresh: Promise<void> | null = null

function emptyRemoteMetadata(): RemoteSyncMetadata {
  return { version: 1, updatedAt: new Date().toISOString(), months: {} }
}

async function loadRemoteMetadata(): Promise<{ id: string; metadata: RemoteSyncMetadata } | null> {
  const file = await findAppDataFile(METADATA_FILE_NAME)
  if (!file) return null
  return { id: file.id, metadata: parseRemoteSyncMetadata(await downloadJsonFile(file.id)) }
}

async function readRemoteMonth(month: string, metadata: RemoteSyncMetadata): Promise<{ id: string | null; entries: GratefullyEntry[] }> {
  if (!metadata.months[month]) return { id: null, entries: [] }
  const file = await findAppDataFile(getMonthlyFileName(month))
  if (!file) return { id: null, entries: [] }
  return { id: file.id, entries: monthlyFileToEntries(parseMonthlyDriveFile(await downloadJsonFile(file.id), month)) }
}

/**
 * One-time compatibility bridge for the former single-file layout. The legacy
 * file is deliberately retained as a Drive backup after all monthly files and
 * metadata are written, so retries are idempotent and data is never discarded.
 */
async function migrateLegacyIfNeeded(): Promise<void> {
  if (await findAppDataFile(METADATA_FILE_NAME)) return
  const legacy = await findAppDataFile(LEGACY_DATABASE_FILE_NAME)
  if (!legacy) return

  const legacyEntries = driveDatabaseToEntries(parseDriveDatabase(await downloadJsonFile(legacy.id)))
  const months = [...new Set(legacyEntries.map((entry) => getMonthKey(entry.date)))].sort()
  const remoteMetadata = emptyRemoteMetadata()
  for (const month of months) {
    const name = getMonthlyFileName(month)
    const existing = await findAppDataFile(name)
    const existingEntries = existing
      ? monthlyFileToEntries(parseMonthlyDriveFile(await downloadJsonFile(existing.id), month))
      : []
    const file = entriesToMonthlyDriveFile(month, mergeEntries(existingEntries, legacyEntries.filter((entry) => getMonthKey(entry.date) === month)))
    const saved = existing ? await uploadJsonFile(existing.id, name, file) : await createJsonFile(name, file)
    remoteMetadata.months[month] = { updatedAt: file.updatedAt || saved.modifiedTime || new Date().toISOString() }
  }
  await createJsonFile(METADATA_FILE_NAME, remoteMetadata)
}

async function refreshFromDriveInternal(): Promise<void> {
  if (!navigator.onLine) throw new SyncOfflineError()
  await migrateLegacyIfNeeded()
  const remote = await loadRemoteMetadata()
  if (!remote) return // A new Drive account is initialized by the first manual backup.

  const localMetadata = await getSyncMetadata()
  const knownMonths = localMetadata?.remoteMonths ?? {}
  const changedMonths = Object.entries(remote.metadata.months)
    .filter(([month, value]) => knownMonths[month] !== value.updatedAt)
    .map(([month]) => month)

  for (const month of changedMonths) {
    const remoteMonth = await readRemoteMonth(month, remote.metadata)
    // Parse/download happens before IndexedDB mutation; corrupt Drive data cannot erase local data.
    await mergeAndUpsertEntries(remoteMonth.entries)
  }
  await updateSyncMetadata({ remoteMonths: Object.fromEntries(Object.entries(remote.metadata.months).map(([month, value]) => [month, value.updatedAt])) })
  if (changedMonths.length) window.dispatchEvent(new Event('gratefully:sync-complete'))
}

/** Background, download-only startup refresh. It never uploads user changes. */
export function refreshFromGoogleDrive(): Promise<void> {
  if (activeRefresh) return activeRefresh
  activeRefresh = refreshFromDriveInternal().finally(() => { activeRefresh = null })
  return activeRefresh
}

function localEntriesForMonth(entries: GratefullyEntry[], month: string): GratefullyEntry[] {
  const current = entries.filter((entry) => getMonthKey(entry.date) === month)
  const movedTombstones = entries
    .filter((entry) => entry.syncStatus === 'pending' && entry.previousDate && getMonthKey(entry.previousDate) === month && getMonthKey(entry.date) !== month)
    .map((entry) => ({ ...entry, date: entry.previousDate!, deletedAt: entry.updatedAt }))
  return [...current, ...movedTombstones]
}

async function performSync(): Promise<void> {
  if (!navigator.onLine) throw new SyncOfflineError()
  if (activeRefresh) await activeRefresh
  await migrateLegacyIfNeeded()

  const pending = await getPendingEntries()
  if (!pending.length) return
  const affectedMonths = [...new Set(pending.flatMap((entry) => entry.pendingMonths?.length ? entry.pendingMonths : [getMonthKey(entry.date)]))].sort()
  const remote = (await loadRemoteMetadata()) ?? { id: null, metadata: emptyRemoteMetadata() }
  const allLocal = await getAllEntries()
  const nextMetadata: RemoteSyncMetadata = { ...remote.metadata, months: { ...remote.metadata.months } }

  for (const month of affectedMonths) {
    const remoteMonth = await readRemoteMonth(month, remote.metadata)
    const localMonth = localEntriesForMonth(allLocal, month)
    const merged = mergeEntries(localMonth, remoteMonth.entries)
    const file = entriesToMonthlyDriveFile(month, merged)
    const name = getMonthlyFileName(month)
    await (remoteMonth.id ? uploadJsonFile(remoteMonth.id, name, file) : createJsonFile(name, file))
    nextMetadata.months[month] = { updatedAt: file.updatedAt }
    // Persist remote winners now, but retain local pending entries until metadata succeeds.
    await upsertEntries(merged)
  }

  const metadataDocument: RemoteSyncMetadata = { version: 1, updatedAt: new Date().toISOString(), months: nextMetadata.months }
  if (remote.id) await uploadJsonFile(remote.id, METADATA_FILE_NAME, metadataDocument)
  else await createJsonFile(METADATA_FILE_NAME, metadataDocument)

  await markEntriesSynced(pending)
  await updateSyncMetadata({
    lastSyncedAt: metadataDocument.updatedAt,
    remoteMonths: Object.fromEntries(Object.entries(metadataDocument.months).map(([month, value]) => [month, value.updatedAt])),
  })
  window.dispatchEvent(new Event('gratefully:sync-complete'))
}

/** Manual upload sync. Concurrent calls share one operation and cannot overlap. */
export function syncNow(): Promise<void> {
  if (activeSync) return activeSync
  activeSync = performSync().finally(() => { activeSync = null })
  return activeSync
}

/** Backwards-compatible name used by the existing hook. */
export const syncWithGoogleDrive = syncNow

export function isDriveNotFound(error: unknown): boolean {
  return error instanceof DriveServiceError && error.code === 'NOT_FOUND'
}
