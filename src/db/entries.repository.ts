import { openDatabase } from '@/db/db'
import { markLocalChange } from '@/db/metadata.repository'
import { requestToPromise } from '@/db/request'
import { mergeEntries } from '@/sync/merge'
import type {
  CreateGratefullyEntryInput,
  GratefullyEntry,
  UpdateGratefullyEntryInput,
} from '@/types/gratefully'

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

export async function getAllEntries(): Promise<GratefullyEntry[]> {
  const store = await getEntryStore('readonly')
  return requestToPromise(store.getAll())
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
  })
}

function queueEntryUpserts(
  store: IDBObjectStore,
  entries: GratefullyEntry[]
): void {
  for (const entry of entries) {
    store.put(entry)
  }
}

/**
 * Replaces an existing entry or inserts it when absent. Intended for imports
 * and synchronization; user-created entries must use createEntry instead.
 */
export async function upsertEntry(entry: GratefullyEntry): Promise<void> {
  await upsertEntries([entry])
}

/**
 * Persists every supplied entry in one transaction, including tombstones.
 * Entries are written unchanged so sync IDs and resolved timestamps are kept.
 */
export async function upsertEntries(entries: GratefullyEntry[]): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction('entries', 'readwrite')
  const store = transaction.objectStore('entries')

  queueEntryUpserts(store, entries)
  await transactionToPromise(transaction)
}

export async function mergeAndUpsertEntries(
  remoteEntries: GratefullyEntry[]
): Promise<GratefullyEntry[]> {
  const database = await openDatabase()
  const transaction = database.transaction('entries', 'readwrite')
  const store = transaction.objectStore('entries')

  const mergedEntries = await new Promise<GratefullyEntry[]>(
    (resolve, reject) => {
      const localEntriesRequest = store.getAll()

      localEntriesRequest.onsuccess = () => {
        const merged = mergeEntries(localEntriesRequest.result, remoteEntries)
        queueEntryUpserts(store, merged)
        resolve(merged)
      }
      localEntriesRequest.onerror = () => {
        reject(
          localEntriesRequest.error ??
            new Error('Unable to read IndexedDB entries.')
        )
      }
    }
  )

  await transactionToPromise(transaction)
  return mergedEntries
}

export async function getActiveEntries(): Promise<GratefullyEntry[]> {
  const entries = await getAllEntries()
  return entries.filter((entry) => entry.deletedAt === null)
}

export async function getEntriesByDate(
  date: string
): Promise<GratefullyEntry[]> {
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
): Promise<GratefullyEntry | undefined> {
  const store = await getEntryStore('readonly')
  return requestToPromise(store.get(id))
}

export async function createEntry(
  input: CreateGratefullyEntryInput
): Promise<GratefullyEntry> {
  validateDate(input.date)

  const timestamp = new Date().toISOString()
  const entry: GratefullyEntry = {
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
  updates: UpdateGratefullyEntryInput
): Promise<GratefullyEntry | undefined> {
  if (updates.date !== undefined) validateDate(updates.date)

  const store = await getEntryStore('readwrite')
  const existingEntry = await requestToPromise(store.get(id))
  if (!existingEntry) return undefined

  const entry: GratefullyEntry = {
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
): Promise<GratefullyEntry | undefined> {
  const store = await getEntryStore('readwrite')
  const existingEntry = await requestToPromise(store.get(id))
  if (!existingEntry) return undefined

  const timestamp = new Date().toISOString()
  const entry: GratefullyEntry = {
    ...existingEntry,
    updatedAt: timestamp,
    deletedAt: timestamp,
  }

  await requestToPromise(store.put(entry))
  await markLocalChange()

  return entry
}
