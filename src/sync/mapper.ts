import type { GratefullyEntry } from '@/types/gratefully'
import { isIsoDateString, isJournalDate, isRecord } from '@/utils/driveHelpers'

export type DriveGratitudeEntry = Omit<GratefullyEntry, 'date'>

export type DriveDatabase = {
  metadata: {
    version: number
    updatedAt: string
  }
  entries: Record<string, DriveGratitudeEntry[]>
}

function cloneEntry(entry: GratefullyEntry): GratefullyEntry {
  return { ...entry }
}

function assertDriveEntry(value: unknown, date: string): DriveGratitudeEntry {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.length === 0 ||
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
    if (!isJournalDate(date) || !Array.isArray(values)) {
      throw new Error('The Drive database contains an invalid date group.')
    }

    entries[date] = values.map((entry) => {
      const parsed = assertDriveEntry(entry, date)
      if (ids.has(parsed.id)) {
        throw new Error('The Drive database contains duplicate entry IDs.')
      }
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
  database: DriveDatabase
): GratefullyEntry[] {
  return Object.keys(database.entries)
    .sort()
    .flatMap((date) =>
      (database.entries[date] ?? []).map((entry) => ({ ...entry, date }))
    )
}

export function entriesToDriveDatabase(
  entries: GratefullyEntry[],
  updatedAt = new Date().toISOString()
): DriveDatabase {
  const grouped: Record<string, DriveGratitudeEntry[]> = {}

  for (const entry of entries) {
    const { date, ...driveEntry } = cloneEntry(entry)
    ;(grouped[date] ??= []).push(driveEntry)
  }

  for (const date of Object.keys(grouped)) {
    grouped[date].sort((first, second) => first.id.localeCompare(second.id))
  }

  return {
    metadata: { version: 1, updatedAt },
    entries: grouped,
  }
}
