import { openDatabase } from '@/db/db'
import { markLocalChange } from '@/db/metadata.repository'
import { requestToPromise } from '@/db/request'
import { mergeEntries } from '@/sync/merge'
import type {
  CreateGratefullyEntryInput,
  GratefullyEntry,
  UpdateGratefullyEntryInput,
} from '@/types/gratefully'

export function getMonthKey(date: string): string {
  return date.slice(0, 7)
}

function normalizeEntry(entry: Omit<GratefullyEntry, 'syncStatus'> & {
  syncStatus?: GratefullyEntry['syncStatus']
}): GratefullyEntry {
  return {
    ...entry,
    deletedAt: entry.deletedAt ?? null,
    // Pre-monthly records have never been acknowledged by the new protocol.
    syncStatus: entry.syncStatus ?? 'pending',
    pendingMonths: entry.pendingMonths ?? [getMonthKey(entry.date)],
    previousDate: entry.previousDate ?? null,
  }
}

function validateDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Entry date must use the YYYY-MM-DD format.')
  }
  const parsedDate = new Date(`${date}T00:00:00.000Z`)
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new Error('Entry date must be a valid calendar date.')
  }
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
  })
}

async function getEntryStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  const database = await openDatabase()
  return database.transaction('entries', mode).objectStore('entries')
}

export async function getAllEntries(): Promise<GratefullyEntry[]> {
  const store = await getEntryStore('readonly')
  const entries = await requestToPromise(store.getAll())
  return entries.map(normalizeEntry)
}

export async function getEntriesForMonth(month: string): Promise<GratefullyEntry[]> {
  return (await getAllEntries()).filter((entry) => getMonthKey(entry.date) === month)
}

export async function getPendingEntries(): Promise<GratefullyEntry[]> {
  return (await getAllEntries()).filter((entry) => entry.syncStatus === 'pending')
}

export async function getPendingCount(): Promise<number> {
  return (await getPendingEntries()).length
}

export async function upsertEntries(entries: GratefullyEntry[]): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction('entries', 'readwrite')
  const store = transaction.objectStore('entries')
  entries.forEach((entry) => store.put(entry))
  await transactionToPromise(transaction)
}

export async function upsertEntry(entry: GratefullyEntry): Promise<void> {
  await upsertEntries([entry])
}

export async function mergeAndUpsertEntries(remoteEntries: GratefullyEntry[]): Promise<GratefullyEntry[]> {
  const local = await getAllEntries()
  const merged = mergeEntries(local, remoteEntries)
  await upsertEntries(merged)
  return merged
}

export async function getActiveEntries(): Promise<GratefullyEntry[]> {
  return (await getAllEntries()).filter((entry) => entry.deletedAt === null)
}

export async function getEntriesByDate(date: string): Promise<GratefullyEntry[]> {
  validateDate(date)
  const store = await getEntryStore('readonly')
  const entries = await requestToPromise(store.index('date').getAll(IDBKeyRange.only(date)))
  return entries.map(normalizeEntry).filter((entry) => entry.deletedAt === null)
}

export async function getEntryById(id: string): Promise<GratefullyEntry | undefined> {
  const store = await getEntryStore('readonly')
  const entry = await requestToPromise(store.get(id))
  return entry ? normalizeEntry(entry) : undefined
}

export async function createEntry(input: CreateGratefullyEntryInput): Promise<GratefullyEntry> {
  validateDate(input.date)
  const timestamp = new Date().toISOString()
  const entry: GratefullyEntry = {
    id: crypto.randomUUID(), date: input.date, content: input.content,
    createdAt: timestamp, updatedAt: timestamp, deletedAt: null,
    syncStatus: 'pending', pendingMonths: [getMonthKey(input.date)], previousDate: null,
  }
  const store = await getEntryStore('readwrite')
  await requestToPromise(store.add(entry))
  await markLocalChange()
  return entry
}

export async function updateEntry(id: string, updates: UpdateGratefullyEntryInput): Promise<GratefullyEntry | undefined> {
  if (updates.date !== undefined) validateDate(updates.date)
  const store = await getEntryStore('readwrite')
  const stored = await requestToPromise(store.get(id))
  if (!stored) return undefined
  const existing = normalizeEntry(stored)
  const nextDate = updates.date ?? existing.date
  const previousDate = getMonthKey(nextDate) !== getMonthKey(existing.date) ? existing.date : existing.previousDate
  const pendingMonths = [...new Set([
    ...(existing.pendingMonths ?? [getMonthKey(existing.date)]),
    getMonthKey(nextDate),
    ...(previousDate ? [getMonthKey(previousDate)] : []),
  ])]
  const entry: GratefullyEntry = {
    ...existing, ...updates, id: existing.id, createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(), syncStatus: 'pending', pendingMonths, previousDate,
  }
  await requestToPromise(store.put(entry))
  await markLocalChange()
  return entry
}

export async function softDeleteEntry(id: string): Promise<GratefullyEntry | undefined> {
  const store = await getEntryStore('readwrite')
  const stored = await requestToPromise(store.get(id))
  if (!stored) return undefined
  const existing = normalizeEntry(stored)
  const timestamp = new Date().toISOString()
  const entry: GratefullyEntry = {
    ...existing, updatedAt: timestamp, deletedAt: timestamp, syncStatus: 'pending',
    pendingMonths: [...new Set([...(existing.pendingMonths ?? []), getMonthKey(existing.date)])],
  }
  await requestToPromise(store.put(entry))
  await markLocalChange()
  return entry
}

/** Acknowledge only snapshots that have not changed while Drive I/O was in flight. */
export async function markEntriesSynced(snapshots: GratefullyEntry[]): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction('entries', 'readwrite')
  const store = transaction.objectStore('entries')
  for (const snapshot of snapshots) {
    const current = await requestToPromise(store.get(snapshot.id))
    if (current && current.updatedAt === snapshot.updatedAt) {
      store.put({ ...normalizeEntry(current), syncStatus: 'synced', pendingMonths: [], previousDate: null })
    }
  }
  await transactionToPromise(transaction)
}
