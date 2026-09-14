import { openDatabase } from '@/db/db'
import { markLocalChange } from '@/db/metadata.repository'
import { requestToPromise } from '@/db/request'
import type {
  CreateGratitudeEntryInput,
  GratitudeEntry,
  UpdateGratitudeEntryInput,
} from '@/types/gratitude'

function validateDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Entry date must use the YYYY-MM-DD format.')
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`)
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new Error('Entry date must be a valid calendar date.')
  }
}

async function getEntryStore(
  mode: IDBTransactionMode
): Promise<IDBObjectStore> {
  const database = await openDatabase()
  return database.transaction('entries', mode).objectStore('entries')
}

export async function getAllEntries(): Promise<GratitudeEntry[]> {
  const store = await getEntryStore('readonly')
  return requestToPromise(store.getAll())
}

export async function getActiveEntries(): Promise<GratitudeEntry[]> {
  const entries = await getAllEntries()
  return entries.filter((entry) => entry.deletedAt === null)
}

export async function getEntriesByDate(
  date: string
): Promise<GratitudeEntry[]> {
  validateDate(date)

  const store = await getEntryStore('readonly')
  const dateIndex = store.index('date')
  const entries = await requestToPromise(
    dateIndex.getAll(IDBKeyRange.only(date))
  )

  return entries.filter((entry) => entry.deletedAt === null)
}

export async function getEntryById(
  id: string
): Promise<GratitudeEntry | undefined> {
  const store = await getEntryStore('readonly')
  return requestToPromise(store.get(id))
}

export async function createEntry(
  input: CreateGratitudeEntryInput
): Promise<GratitudeEntry> {
  validateDate(input.date)

  const timestamp = new Date().toISOString()
  const entry: GratitudeEntry = {
    id: crypto.randomUUID(),
    date: input.date,
    content: input.content,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  }

  const store = await getEntryStore('readwrite')
  await requestToPromise(store.add(entry))
  await markLocalChange()

  return entry
}

export async function updateEntry(
  id: string,
  updates: UpdateGratitudeEntryInput
): Promise<GratitudeEntry | undefined> {
  if (updates.date !== undefined) validateDate(updates.date)

  const store = await getEntryStore('readwrite')
  const existingEntry = await requestToPromise(store.get(id))
  if (!existingEntry) return undefined

  const entry: GratitudeEntry = {
    ...existingEntry,
    ...updates,
    id: existingEntry.id,
    createdAt: existingEntry.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await requestToPromise(store.put(entry))
  await markLocalChange()

  return entry
}

export async function softDeleteEntry(
  id: string
): Promise<GratitudeEntry | undefined> {
  const store = await getEntryStore('readwrite')
  const existingEntry = await requestToPromise(store.get(id))
  if (!existingEntry) return undefined

  const timestamp = new Date().toISOString()
  const entry: GratitudeEntry = {
    ...existingEntry,
    updatedAt: timestamp,
    deletedAt: timestamp,
  }

  await requestToPromise(store.put(entry))
  await markLocalChange()

  return entry
}
