export interface JournalEntry {
  id: string
  date: string
  items: string[]
  mood: string
}

export interface JournalDatabase {
  last_updated: string
  entries: JournalEntry[]
}

export type CreateJournalEntryInput = JournalEntry
export type UpdateJournalEntryInput = JournalEntry
