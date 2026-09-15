export type SyncStatus = 'synced' | 'pending'

export type GratefullyEntry = {
  id: string
  date: string
  content: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  /** Local-only state; it is never persisted in a Drive monthly file. */
  syncStatus: SyncStatus
  /** Months still needing a write. This also makes date moves sync-safe. */
  pendingMonths?: string[]
  /** Original date retained only until a cross-month move has been backed up. */
  previousDate?: string | null
}

export type CreateGratefullyEntryInput = Pick<GratefullyEntry, 'date' | 'content'>

export type UpdateGratefullyEntryInput = Partial<
  Pick<GratefullyEntry, 'date' | 'content'>
>

export type SyncMetadata = {
  key: 'sync'
  schemaVersion: number
  lastSyncedAt: string | null
  lastLocalChangeAt: string | null
  /** Remote metadata timestamps last observed per month. */
  remoteMonths: Record<string, string>
}
