import { useRef } from 'react'
import { HistoryFeed } from '@/features/grateful/components/history-feed'
import { JournalInput } from '@/features/grateful/components/journal-input'
import { WisdomCard } from '@/features/grateful/components/wisdom-card'
import { useGratefulEntries } from '@/features/grateful/hooks/use-grateful-entries'

export const GratefulContainer = () => {
  const {
    entries,
    editingEntry,
    formVersion,
    isLoading,
    isSaving,
    saveEntry,
    deleteEntry,
    setEditingEntry,
  } = useGratefulEntries()
  const journalInputRef = useRef<HTMLDivElement>(null)

  const handleEdit = (entry: (typeof entries)[number]) => {
    setEditingEntry(entry)
    requestAnimationFrame(() => {
      journalInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  return (
    <div className='container flex flex-col gap-8'>
      <WisdomCard />
      <div ref={journalInputRef}>
        <JournalInput
          key={`${editingEntry?.id ?? 'new'}-${formVersion}`}
          editingEntry={editingEntry}
          isSaving={isSaving}
          onCancelEdit={() => setEditingEntry(undefined)}
          onSave={saveEntry}
        />
      </div>
      <HistoryFeed
        entries={entries}
        isLoading={isLoading}
        onDelete={deleteEntry}
        onEdit={handleEdit}
      />
    </div>
  )
}
