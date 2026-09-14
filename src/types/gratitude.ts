export type GratitudeEntry = {
  id: string
  date: string
  content: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CreateGratitudeEntryInput = Pick<GratitudeEntry, 'date' | 'content'>

export type UpdateGratitudeEntryInput = Partial<
  Pick<GratitudeEntry, 'date' | 'content'>
>

export type SyncMetadata = {
  key: 'sync'
  schemaVersion: number
  lastSyncedAt: string | null
  lastLocalChangeAt: string | null
  driveModifiedTime: string | null
  driveFileId: string | null
}
