import { getAllEntries, mergeAndUpsertEntries } from '@/db/entries.repository'
import { getSyncMetadata, updateSyncMetadata } from '@/db/metadata.repository'
import {
  downloadGratitudeDatabase,
  findGratitudeDatabaseFile,
  getGratitudeDatabaseFile,
  createGratitudeDatabaseFile,
  uploadGratitudeDatabase,
  DriveServiceError,
} from '@/services/drive.service'
import {
  driveDatabaseToEntries,
  entriesToDriveDatabase,
  parseDriveDatabase,
} from '@/sync/mapper'
import { normalizeDriveDatabase } from '@/sync/normalize'
import type { DriveFile } from '@/types/drive'

export class SyncOfflineError extends Error {
  public constructor() {
    super('Cloud sync is unavailable while the browser is offline.')
    this.name = 'SyncOfflineError'
  }
}

let activeSync: Promise<void> | null = null

function debug(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  if (import.meta.env.DEV) console.debug('[sync]', ...args)
}

async function resolveDatabaseFile(
  localEntries: Awaited<ReturnType<typeof getAllEntries>>
): Promise<DriveFile> {
  const metadata = await getSyncMetadata()
  debug('local metadata', metadata)

  if (metadata?.driveFileId) {
    try {
      return await getGratitudeDatabaseFile(metadata.driveFileId)
    } catch (error) {
      if (!(error instanceof DriveServiceError) || error.code !== 'NOT_FOUND') {
        throw error
      }
    }
  }

  debug('searching Drive database')
  const existing = await findGratitudeDatabaseFile()
  if (existing) {
    debug('Drive database found', existing.id)
    await updateSyncMetadata({
      driveFileId: existing.id,
      driveModifiedTime: existing.modifiedTime ?? null,
    })
    return existing
  }

  // Only create a remote database after the appDataFolder lookup has completed.
  // Seed it with local data so a fresh Drive account never receives an empty file.
  return createGratitudeDatabaseFile(entriesToDriveDatabase(localEntries))
}

async function performSync(): Promise<void> {
  if (!navigator.onLine) throw new SyncOfflineError()

  const localEntries = await getAllEntries()
  debug('local entries', localEntries.length)
  const file = await resolveDatabaseFile(localEntries)

  // Parsing happens before IndexedDB is touched. A failed download or malformed
  // response therefore cannot be interpreted as an empty remote database.
  const remoteDatabase = parseDriveDatabase(
    await downloadGratitudeDatabase(file.id)
  )
  const remoteEntries = driveDatabaseToEntries(remoteDatabase)
  debug('remote entries', remoteEntries.length)

  // Reads and writes in one transaction so a completed local save is never lost.
  debug('writing merged entries to IndexedDB')
  const mergedEntries = await mergeAndUpsertEntries(remoteEntries)
  debug('merged entries', mergedEntries.length)
  const mergedDatabase = entriesToDriveDatabase(mergedEntries)

  let driveFile = file
  if (
    normalizeDriveDatabase(mergedDatabase) !==
    normalizeDriveDatabase(remoteDatabase)
  ) {
    driveFile = await uploadGratitudeDatabase(file.id, mergedDatabase)
  }

  const lastSyncedAt = new Date().toISOString()
  await updateSyncMetadata({
    lastSyncedAt,
    driveFileId: driveFile.id,
    driveModifiedTime: driveFile.modifiedTime ?? file.modifiedTime ?? null,
  })
  debug('sync complete')
  window.dispatchEvent(new Event('gratefully:sync-complete'))
}

export function syncWithGoogleDrive(): Promise<void> {
  debug('requested')
  if (activeSync) {
    debug('reusing active sync')
    return activeSync
  }

  activeSync = performSync().finally(() => {
    activeSync = null
  })

  return activeSync
}
