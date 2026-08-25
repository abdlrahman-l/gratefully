import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function JournalInput() {
  return (
    <section className="flex flex-col gap-4">
      <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-ambient border border-outline-variant/20 focus-within:border-primary/50 transition-colors duration-300">
        <Textarea
          className="w-full bg-transparent border-none p-0 focus-visible:ring-0 font-body-lg text-lg text-on-surface placeholder-outline resize-none min-h-[120px] shadow-none"
          placeholder="What is one good thing that happened today?..."
        />
        <div className="flex justify-end mt-4">
          <Button className="h-auto bg-primary text-white font-label text-sm font-medium rounded-full px-6 py-3 shadow-md hover:bg-surface-tint transition-colors duration-300 flex items-center gap-2">
            Alhamdulillah, Save
            <HeartIcon className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
