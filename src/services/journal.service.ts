import {
  getOrCreateDatabase,
  readDatabase,
  writeDatabase,
} from '@/services/drive.service'
import type {
  CreateJournalEntryInput,
  JournalEntry,
  UpdateJournalEntryInput,
} from '@/types/journal'

function cloneEntry(entry: JournalEntry): JournalEntry {
  return { ...entry, items: [...entry.items] }
}

function assertValidEntry(entry: JournalEntry): void {
  if (!entry.id.trim()) throw new Error('Journal entry ID is required.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date))
    throw new Error('Journal entry date must use YYYY-MM-DD.')
  if (!entry.mood.trim()) throw new Error('Journal entry mood is required.')
  if (!entry.items.every((item) => item.trim().length > 0)) {
    throw new Error('Journal entry items must be non-empty strings.')
  }
}

async function loadDatabase() {
  const fileId = await getOrCreateDatabase()
  return { fileId, database: await readDatabase(fileId) }
}

export async function getEntries(): Promise<JournalEntry[]> {
  const { database } = await loadDatabase()
  return database.entries.map(cloneEntry)
}

export async function getEntry(id: string): Promise<JournalEntry | null> {
  const { database } = await loadDatabase()
  const entry = database.entries.find((candidate) => candidate.id === id)
  return entry ? cloneEntry(entry) : null
}

export async function createEntry(
  entry: CreateJournalEntryInput
): Promise<JournalEntry> {
  assertValidEntry(entry)
  const { fileId, database } = await loadDatabase()
  if (database.entries.some((candidate) => candidate.id === entry.id)) {
    throw new Error(`A journal entry with ID "${entry.id}" already exists.`)
  }

  const created = cloneEntry(entry)
  database.entries.push(created)
  await writeDatabase(database, fileId)
  return cloneEntry(created)
}

export async function updateEntry(
  entry: UpdateJournalEntryInput
): Promise<JournalEntry> {
  assertValidEntry(entry)
  const { fileId, database } = await loadDatabase()
  const index = database.entries.findIndex(
    (candidate) => candidate.id === entry.id
  )
  if (index === -1)
    throw new Error(`Journal entry "${entry.id}" was not found.`)

  const updated = cloneEntry(entry)
  database.entries[index] = updated
  await writeDatabase(database, fileId)
  return cloneEntry(updated)
}

export async function deleteEntry(id: string): Promise<void> {
  const { fileId, database } = await loadDatabase()
  const index = database.entries.findIndex((entry) => entry.id === id)
  if (index === -1) throw new Error(`Journal entry "${id}" was not found.`)

  database.entries.splice(index, 1)
  await writeDatabase(database, fileId)
}
