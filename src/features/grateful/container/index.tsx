import { GreetingHeader } from '@/features/grateful/components/greeting-header'
import { HistoryFeed } from '@/features/grateful/components/history-feed'
import { JournalInput } from '@/features/grateful/components/journal-input'
import { WisdomCard } from '@/features/grateful/components/wisdom-card'

export const GratefulContainer = () => {
  return (
    <div className='container flex flex-col gap-12'>
      <GreetingHeader />
      <WisdomCard />
      <JournalInput />
      <HistoryFeed />
    </div>
  )
}
