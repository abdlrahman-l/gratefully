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

  return (
    <div className='container flex flex-col gap-8'>
      <WisdomCard />
      <JournalInput
        key={`${editingEntry?.id ?? 'new'}-${formVersion}`}
        editingEntry={editingEntry}
        isSaving={isSaving}
        onCancelEdit={() => setEditingEntry(undefined)}
        onSave={saveEntry}
      />
      <HistoryFeed
        entries={entries}
        isLoading={isLoading}
        onDelete={deleteEntry}
        onEdit={setEditingEntry}
      />
    </div>
  )
}
