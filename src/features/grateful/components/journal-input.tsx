import { HeartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function JournalInput() {
  return (
    <section className='flex flex-col gap-4'>
      <div className='rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-ambient transition-colors duration-300 focus-within:border-primary/50'>
        <Textarea
          className='min-h-[120px] w-full resize-none border-none bg-transparent p-0 font-body-lg text-lg text-on-surface placeholder-outline shadow-none focus-visible:ring-0'
          placeholder='What is one good thing that happened today?...'
        />
        <div className='mt-4 flex justify-end'>
          <Button className='flex h-auto items-center gap-2 rounded-full bg-primary px-6 py-3 font-label text-sm font-medium text-white shadow-md transition-colors duration-300 hover:bg-surface-tint'>
            Alhamdulillah, Save
            <HeartIcon className='size-4' />
          </Button>
        </div>
      </div>
    </section>
  )
}
