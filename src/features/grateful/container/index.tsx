import { HistoryFeed } from '@/features/grateful/components/history-feed'
import { JournalInput } from '@/features/grateful/components/journal-input'
import { WisdomCard } from '@/features/grateful/components/wisdom-card'

export const GratefulContainer = () => {
  return (
    <div className='container flex flex-col gap-12'>
      <WisdomCard />
      <JournalInput />
      <HistoryFeed />
    </div>
  )
}
