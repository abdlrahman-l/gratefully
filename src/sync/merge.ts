import type { GratefullyEntry } from '@/types/gratefully'

function isNewer(
  candidate: GratefullyEntry,
  current: GratefullyEntry
): boolean {
  return candidate.updatedAt > current.updatedAt
}

/** Merges records by ID; an equal timestamp deliberately keeps the local record. */
export function mergeEntries(
  localEntries: GratefullyEntry[],
  remoteEntries: GratefullyEntry[]
): GratefullyEntry[] {
  const merged = new Map<string, GratefullyEntry>()

  for (const entry of [...localEntries, ...remoteEntries]) {
    const current = merged.get(entry.id)
    if (!current || isNewer(entry, current)) merged.set(entry.id, { ...entry })
  }

  return [...merged.values()].sort((first, second) =>
    first.id.localeCompare(second.id)
  )
}
