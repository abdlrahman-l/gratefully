import type { DriveDatabase } from '@/sync/mapper'

export function normalizeDriveDatabase(database: DriveDatabase): string {
  const entries = Object.fromEntries(
    Object.keys(database.entries)
      .sort()
      .map((date) => [
        date,
        [...(database.entries[date] ?? [])].sort((first, second) =>
          first.id.localeCompare(second.id)
        ),
      ])
  )

  return JSON.stringify({ entries })
}
