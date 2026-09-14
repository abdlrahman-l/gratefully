import { getCurrentLanguage } from '@/i18n'
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatJournalDate } from '@/lib/date-locale'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { GratefullyEntry } from '../types'

function formatShortDate(date: string) {
  return formatJournalDate(date, getCurrentLanguage(), {
    day: 'numeric',
    month: 'short',
  })
}

type JourneyEntryProps = {
  entry: GratefullyEntry
  onOpen: (entry: GratefullyEntry) => void
  onEdit: (entry: GratefullyEntry) => void
  onDelete: (entry: GratefullyEntry) => void
}

export function JourneyEntry({
  entry,
  onOpen,
  onEdit,
  onDelete,
}: JourneyEntryProps) {
  const { t } = useTranslation()
  const shortDate = formatShortDate(entry.date)

  return (
    <div className='flex items-start gap-3 border-b border-outline-variant/20 py-4 first:pt-0 last:border-b-0 last:pb-0'>
      <button
        type='button'
        className='min-w-0 flex-1 rounded-xl text-start outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
        onClick={() => onOpen(entry)}
      >
        <p className='font-label text-sm font-medium text-outline'>
          {shortDate}
        </p>
        <p className='mt-1.5 line-clamp-3 font-body-md text-sm leading-6 text-on-surface'>
          {entry.content}
        </p>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='mt-1 shrink-0 rounded-full text-outline hover:text-primary'
            aria-label={t('journey.entryActions', { date: shortDate })}
          >
            <MoreVerticalIcon className='size-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-36'>
          <DropdownMenuItem onSelect={() => onEdit(entry)}>
            <PencilIcon />
            {t('common.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant='destructive'
            onSelect={() => onDelete(entry)}
          >
            <Trash2Icon />
            {t('common.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
