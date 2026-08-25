import { LeafIcon, LeafyGreenIcon } from "lucide-react";

export function WisdomCard() {
  return (
    <section className="flex flex-col gap-4">
      <div className="bg-primary-container/10 rounded-[24px] p-6 shadow-ambient flex flex-col gap-4 relative overflow-hidden">
        <p className="font-quote text-xl leading-relaxed text-on-surface-variant italic relative z-10">
          <span className="text-primary opacity-50 mr-1">"</span>If you are grateful, I will surely increase you
          [in favor]...<span className="text-primary opacity-50 ml-1">"</span>
        </p>
        <div className="flex justify-between items-end mt-2 relative z-10">
          <p className="font-label text-sm font-medium text-outline">- QS. Ibrahim: 7</p>
          <div className="flex items-center gap-2 bg-surface rounded-full px-3 py-1.5 shadow-sm border border-outline-variant/30">
            <LeafIcon className="size-4 text-primary" />
            <span className="font-label text-sm font-medium text-primary">5 Day Streak</span>
          </div>
        </div>
      </div>
    </section>
  )
}
