import { CalendarIcon } from "lucide-react";

export function HistoryFeed() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-h2 text-xl font-semibold text-on-surface mb-2">Recent Moments</h2>
      <div className="flex flex-col gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-outline-variant/10 flex flex-col gap-2 group hover:shadow-md transition-shadow duration-300">
          <p className="font-label text-sm font-medium text-outline flex items-center gap-1.5">
            <CalendarIcon className="size-4" />
            Yesterday
          </p>
          <p className="font-body-md text-base text-on-surface">Finished a difficult project today and felt a sense of peace.</p>
        </div>
        {/* Card 2 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-outline-variant/10 flex flex-col gap-2 group hover:shadow-md transition-shadow duration-300">
          <p className="font-label text-sm font-medium text-outline flex items-center gap-1.5">
            <CalendarIcon className="size-4" />
            May 2
          </p>
          <p className="font-body-md text-base text-on-surface">Had a warm cup of tea while watching the rain.</p>
        </div>
        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-outline-variant/10 flex flex-col gap-2 group hover:shadow-md transition-shadow duration-300">
          <p className="font-label text-sm font-medium text-outline flex items-center gap-1.5">
            <CalendarIcon className="size-4" />
            May 1
          </p>
          <p className="font-body-md text-base text-on-surface">A kind stranger helped me with directions.</p>
        </div>
      </div>
    </section>
  )
}
