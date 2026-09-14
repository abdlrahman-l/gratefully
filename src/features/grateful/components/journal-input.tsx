import { useState } from 'react'
import type { GratitudeEntry } from '@/types/gratitude'
import { HeartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface JournalInputProps {
  editingEntry?: GratitudeEntry
  isSaving: boolean
  onCancelEdit: () => void
  onSave: (input: { date: string; content: string }) => Promise<void>
}

function getTodayDate(): string {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60_000
  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

export function JournalInput({
  editingEntry,
  isSaving,
  onCancelEdit,
  onSave,
}: JournalInputProps) {
  const [content, setContent] = useState(editingEntry?.content ?? '')
  const [date, setDate] = useState(editingEntry?.date ?? getTodayDate)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedContent = content.trim()
    if (!trimmedContent) return

    await onSave({ date, content: trimmedContent })
  }

  return (
    <section className='flex flex-col gap-4'>
      <form
        className='rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-ambient transition-colors duration-300 focus-within:border-primary/50'
        onSubmit={handleSubmit}
      >
        <label className='mb-3 flex flex-col gap-1.5 font-label text-sm font-medium text-outline'>
          Entry date
          <input
            className='h-9 rounded-md border border-outline-variant/30 bg-transparent px-3 text-on-surface outline-none focus:border-primary'
            type='date'
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <Textarea
          className='min-h-[120px] w-full resize-none border-none bg-transparent p-0 font-body-lg text-lg text-on-surface placeholder-outline shadow-none focus-visible:ring-0'
          placeholder='What is one good thing that happened today?...'
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className='mt-4 flex justify-end gap-2'>
          {editingEntry && (
            <Button type='button' variant='outline' onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
          <Button
            className='flex h-auto items-center gap-2 rounded-full bg-primary px-6 py-3 font-label text-sm font-medium text-white shadow-md transition-colors duration-300 hover:bg-surface-tint'
            disabled={isSaving || !content.trim()}
            type='submit'
          >
            {editingEntry ? 'Update entry' : 'Alhamdulillah, Save'}
            <HeartIcon className='size-4' />
          </Button>
        </div>
      </form>
    </section>
  )
}
