import { WisdomCard } from "@/features/grateful/components/wisdom-card";
import { JournalInput } from "@/features/grateful/components/journal-input";
import { HistoryFeed } from "@/features/grateful/components/history-feed";

export const GratefulContainer = () => {

    return (
        <div className="flex flex-col gap-12">
            <WisdomCard />
            <JournalInput />
            <HistoryFeed />
        </div>
    )
}