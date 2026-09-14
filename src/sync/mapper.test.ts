import { driveDatabaseToEntries, entriesToDriveDatabase } from '@/sync/mapper'
import { mergeEntries } from '@/sync/merge'
import type { GratefullyEntry } from '@/types/gratefully'
import { describe, expect, it } from 'vitest'

const entry = (overrides: Partial<GratefullyEntry> = {}): GratefullyEntry => ({
  id: 'entry-1',
  date: '2026-09-14',
  content: 'Family',
  createdAt: '2026-09-14T10:00:00.000Z',
  updatedAt: '2026-09-14T10:00:00.000Z',
  deletedAt: null,
  ...overrides,
})

describe('Drive entry mapping', () => {
  it('groups local records by date and restores their date on import', () => {
    const database = entriesToDriveDatabase([
      entry(),
      entry({ id: 'entry-2', date: '2026-09-15' }),
    ])

    expect(database.entries['2026-09-14']?.[0]).not.toHaveProperty('date')
    expect(driveDatabaseToEntries(database)).toEqual([
      entry(),
      entry({ id: 'entry-2', date: '2026-09-15' }),
    ])
  })
})

describe('entry merge', () => {
  it('keeps the newest tombstone for an entry ID', () => {
    const merged = mergeEntries(
      [entry()],
      [
        entry({
          updatedAt: '2026-09-14T10:05:00.000Z',
          deletedAt: '2026-09-14T10:05:00.000Z',
        }),
      ]
    )

    expect(merged).toEqual([
      entry({
        updatedAt: '2026-09-14T10:05:00.000Z',
        deletedAt: '2026-09-14T10:05:00.000Z',
      }),
    ])
  })
})
