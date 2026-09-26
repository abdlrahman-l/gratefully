import type { GratefullyEntry } from '@/types/gratefully'
import { isIsoDateString, isJournalDate, isRecord } from '@/utils/driveHelpers'

/** Legacy single-file format retained only for one-time Drive migration. */
export type DriveGratitudeEntry = Omit<
  GratefullyEntry,
  'accountId' | 'date' | 'syncStatus' | 'pendingMonths' | 'previousDate'
>
export type DriveDatabase = {
  metadata: { version: number; updatedAt: string }
  entries: Record<string, DriveGratitudeEntry[]>
}

export type MonthlyDriveEntry = Omit<
  GratefullyEntry,
  'accountId' | 'syncStatus' | 'pendingMonths' | 'previousDate'
>
export type MonthlyDriveFile = {
  version: 1
  month: string
  updatedAt: string
  entries: MonthlyDriveEntry[]
}

export type RemoteSyncMetadata = {
  version: 1
  updatedAt: string
  months: Record<string, { updatedAt: string }>
}

export function getMonthlyFileName(month: string): string {
  return `gratitude_entries_${month}.json`
}

export function getMonthKey(date: string): string {
  return date.slice(0, 7)
}

function parseDriveEntry(value: unknown, date: string): DriveGratitudeEntry {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    typeof value.content !== 'string' ||
    !isIsoDateString(value.createdAt) ||
    !isIsoDateString(value.updatedAt) ||
    (value.deletedAt !== null && !isIsoDateString(value.deletedAt))
  ) {
    throw new Error(`Drive database contains an invalid entry for ${date}.`)
  }
  return {
    id: value.id,
    content: value.content,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    deletedAt: value.deletedAt,
  }
}

export function parseDriveDatabase(value: unknown): DriveDatabase {
  if (
    !isRecord(value) ||
    !isRecord(value.metadata) ||
    typeof value.metadata.version !== 'number' ||
    !Number.isInteger(value.metadata.version) ||
    !isIsoDateString(value.metadata.updatedAt) ||
    !isRecord(value.entries)
  ) {
    throw new Error('The Drive database has an invalid structure.')
  }
  const entries: Record<string, DriveGratitudeEntry[]> = {}
  const ids = new Set<string>()
  for (const [date, values] of Object.entries(value.entries)) {
    if (!isJournalDate(date) || !Array.isArray(values))
      throw new Error('The Drive database contains an invalid date group.')
    entries[date] = values.map((entry) => {
      const parsed = parseDriveEntry(entry, date)
      if (ids.has(parsed.id))
        throw new Error('The Drive database contains duplicate entry IDs.')
      ids.add(parsed.id)
      return parsed
    })
  }
  return {
    metadata: {
      version: value.metadata.version,
      updatedAt: value.metadata.updatedAt,
    },
    entries,
  }
}

export function driveDatabaseToEntries(
  database: DriveDatabase,
  accountId: string
): GratefullyEntry[] {
  return Object.keys(database.entries)
    .sort()
    .flatMap((date) =>
      (database.entries[date] ?? []).map((entry) => ({
        accountId,
        ...entry,
        date,
        syncStatus: 'synced' as const,
        pendingMonths: [],
        previousDate: null,
      }))
    )
}

export function entriesToDriveDatabase(
  entries: GratefullyEntry[],
  updatedAt = new Date().toISOString()
): DriveDatabase {
  const grouped: Record<string, DriveGratitudeEntry[]> = {}
  for (const entry of entries) {
    const {
      accountId: _accountId,
      date,
      syncStatus: _syncStatus,
      pendingMonths: _pendingMonths,
      previousDate: _previousDate,
      ...remote
    } = entry
    ;(grouped[date] ??= []).push(remote)
  }
  return { metadata: { version: 1, updatedAt }, entries: grouped }
}

export function parseMonthlyDriveFile(
  value: unknown,
  month: string
): MonthlyDriveFile {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    value.month !== month ||
    !isIsoDateString(value.updatedAt) ||
    !Array.isArray(value.entries)
  ) {
    throw new Error(
      `The ${getMonthlyFileName(month)} file has an invalid structure.`
    )
  }
  const ids = new Set<string>()
  const entries = value.entries.map((entry): MonthlyDriveEntry => {
    if (
      !isRecord(entry) ||
      !isJournalDate(entry.date) ||
      getMonthKey(entry.date) !== month
    ) {
      throw new Error(
        `The ${getMonthlyFileName(month)} file contains an entry in the wrong month.`
      )
    }
    const parsed = parseDriveEntry(entry, entry.date)
    if (ids.has(parsed.id))
      throw new Error(
        `The ${getMonthlyFileName(month)} file contains duplicate entry IDs.`
      )
    ids.add(parsed.id)
    return { ...parsed, date: entry.date }
  })
  return { version: 1, month, updatedAt: value.updatedAt, entries }
}

export function monthlyFileToEntries(
  file: MonthlyDriveFile,
  accountId: string
): GratefullyEntry[] {
  return file.entries.map((entry) => ({
    accountId,
    ...entry,
    syncStatus: 'synced',
    pendingMonths: [],
    previousDate: null,
  }))
}

export function entriesToMonthlyDriveFile(
  month: string,
  entries: GratefullyEntry[],
  updatedAt = new Date().toISOString()
): MonthlyDriveFile {
  const filtered = entries.filter((entry) => getMonthKey(entry.date) === month)
  return {
    version: 1,
    month,
    updatedAt,
    entries: filtered
      .map(
        ({
          accountId: _accountId,
          syncStatus: _syncStatus,
          pendingMonths: _pendingMonths,
          previousDate: _previousDate,
          ...entry
        }) => entry
      )
      .sort((first, second) => first.id.localeCompare(second.id)),
  }
}

export function parseRemoteSyncMetadata(value: unknown): RemoteSyncMetadata {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isIsoDateString(value.updatedAt) ||
    !isRecord(value.months)
  ) {
    throw new Error('The metadata.json file has an invalid structure.')
  }
  const months: RemoteSyncMetadata['months'] = {}
  for (const [month, metadata] of Object.entries(value.months)) {
    if (
      !/^\d{4}-\d{2}$/.test(month) ||
      !isRecord(metadata) ||
      !isIsoDateString(metadata.updatedAt)
    ) {
      throw new Error('metadata.json contains invalid month metadata.')
    }
    months[month] = { updatedAt: metadata.updatedAt }
  }
  return { version: 1, updatedAt: value.updatedAt, months }
}
