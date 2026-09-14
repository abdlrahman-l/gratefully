export type GratefullyEntry = {
  id: string
  date: string
  content: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
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
  driveModifiedTime: string | null
  driveFileId: string | null
}
