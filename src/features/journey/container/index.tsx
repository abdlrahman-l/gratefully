import { useMemo, useState } from 'react'
import { getCurrentLanguage } from '@/i18n'
import {
  MoreVerticalIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatJournalDate } from '@/lib/date-locale'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

export type GratitudeEntry = {
  id: string
  date: string
  content: string
}

const INITIAL_ENTRIES: GratitudeEntry[] = [
  {
    id: '2026-09-14',
    date: '2026-09-14',
    content:
      'Alhamdulillah hari ini bisa makan bersama keluarga dan menikmati waktu bersama.',
  },
  {
    id: '2026-09-13',
    date: '2026-09-13',
    content:
      'Bersyukur pekerjaan hari ini berjalan dengan lancar dan semuanya selesai tepat waktu.',
  },
  {
    id: '2026-09-12',
    date: '2026-09-12',
    content:
      'Alhamdulillah masih diberikan kesehatan dan kesempatan menjalani hari dengan baik.',
  },
  {
    id: '2026-08-31',
    date: '2026-08-31',
    content: 'Bersyukur bisa menghabiskan waktu bersama keluarga.',
  },
  {
    id: '2026-08-29',
    date: '2026-08-29',
    content: 'Bersyukur atas pagi yang tenang dan secangkir teh hangat.',
  },
]

function formatMonth(
  date: string,
  language: ReturnType<typeof getCurrentLanguage>
) {
  return formatJournalDate(date, language, { month: 'long', year: 'numeric' })
}

function formatShortDate(
  date: string,
  language: ReturnType<typeof getCurrentLanguage>
) {
  return formatJournalDate(date, language, { day: 'numeric', month: 'short' })
}

function formatLongDate(
  date: string,
  language: ReturnType<typeof getCurrentLanguage>
) {
  return formatJournalDate(date, language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function JourneyEmptyState({ searchActive }: { searchActive: boolean }) {
  const { t } = useTranslation()

  return (
    <div className='rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-12 text-center shadow-ambient'>
      <h2 className='font-h2 text-lg font-semibold text-on-surface'>
        {searchActive ? t('journey.noResults') : t('journey.noJourney')}
      </h2>
      <p className='mt-2 font-body-md text-sm text-outline'>
        {searchActive
          ? t('journey.noResultsDescription')
          : t('journey.noJourneyDescription')}
      </p>
    </div>
  )
}

interface JourneyEntryProps {
  entry: GratitudeEntry
  onOpen: (entry: GratitudeEntry) => void
  onEdit: (entry: GratitudeEntry) => void
  onDelete: (entry: GratitudeEntry) => void
}

function JourneyEntry({ entry, onOpen, onEdit, onDelete }: JourneyEntryProps) {
  const { t } = useTranslation()
  const language = getCurrentLanguage()

  return (
    <div className='flex items-start gap-3 border-b border-outline-variant/20 py-4 first:pt-0 last:border-b-0 last:pb-0'>
      <button
        type='button'
        className='min-w-0 flex-1 rounded-xl text-start outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
        onClick={() => onOpen(entry)}
      >
        <p className='font-label text-sm font-medium text-outline'>
          {formatShortDate(entry.date, language)}
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
            aria-label={t('journey.entryActions', {
              date: formatShortDate(entry.date, language),
            })}
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

export function JourneyContainer() {
  const { t } = useTranslation()
  const language = getCurrentLanguage()
  const [entries, setEntries] = useState(INITIAL_ENTRIES)
  const [query, setQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<GratitudeEntry | null>(
    null
  )
  const [editingEntry, setEditingEntry] = useState<GratitudeEntry | null>(null)
  const [deleteEntry, setDeleteEntry] = useState<GratitudeEntry | null>(null)
  const [editContent, setEditContent] = useState('')

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return entries

    return entries.filter((entry) =>
      entry.content.toLowerCase().includes(normalizedQuery)
    )
  }, [entries, query])

  const groupedEntries = useMemo(() => {
    return filteredEntries.reduce<Record<string, GratitudeEntry[]>>(
      (groups, entry) => {
        const month = formatMonth(entry.date, language)
        groups[month] = [...(groups[month] ?? []), entry]
        return groups
      },
      {}
    )
  }, [filteredEntries, language])

  const openEdit = (entry: GratitudeEntry) => {
    setSelectedEntry(null)
    setEditingEntry(entry)
    setEditContent(entry.content)
  }

  const saveEdit = () => {
    const content = editContent.trim()
    if (!editingEntry || !content) return

    setEntries((currentEntries) =>
      currentEntries.map((entry) =>
        entry.id === editingEntry.id ? { ...entry, content } : entry
      )
    )
    setEditingEntry(null)
  }

  const confirmDelete = () => {
    if (!deleteEntry) return
    setEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== deleteEntry.id)
    )
    setSelectedEntry(null)
    setDeleteEntry(null)
  }

  return (
    <div className='flex flex-col gap-6 px-4 pt-2 pb-28'>
      <header>
        <h1 className='font-h1 text-2xl font-bold tracking-tight text-on-surface'>
          {t('journey.title')}
        </h1>
        <p className='mt-2 font-body-md text-sm leading-6 text-outline'>
          {t('journey.subtitle')}
        </p>
      </header>

      <div className='relative'>
        <SearchIcon className='pointer-events-none absolute inset-s-3 top-1/2 size-5 -translate-y-1/2 text-outline' />
        <Input
          type='search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('journey.searchPlaceholder')}
          aria-label={t('journey.searchLabel')}
          className='h-12 rounded-2xl border-outline-variant/30 bg-surface-container-lowest ps-10 shadow-ambient placeholder:text-outline/70 focus-visible:border-primary focus-visible:ring-primary/20'
        />
      </div>

      {filteredEntries.length === 0 ? (
        <JourneyEmptyState searchActive={query.trim().length > 0} />
      ) : (
        <div className='flex flex-col gap-7'>
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <section key={month} aria-labelledby={`month-${month}`}>
              <h2
                id={`month-${month}`}
                className='mb-3 font-h2 text-base font-semibold text-primary'
              >
                {month}
              </h2>
              <div className='rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-ambient'>
                {monthEntries.map((entry) => (
                  <JourneyEntry
                    key={entry.id}
                    entry={entry}
                    onOpen={setSelectedEntry}
                    onEdit={openEdit}
                    onDelete={setDeleteEntry}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Sheet
        open={selectedEntry !== null}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      >
        <SheetContent
          side='bottom'
          className='mx-auto max-w-md rounded-t-3xl border-outline-variant/20 px-4 pb-8'
        >
          {selectedEntry && (
            <>
              <SheetHeader className='px-0 pt-2 text-start'>
                <SheetTitle className='font-h2 text-xl text-on-surface'>
                  {formatLongDate(selectedEntry.date, language)}
                </SheetTitle>
                <SheetDescription className='sr-only'>
                  {t('journey.detail')}
                </SheetDescription>
              </SheetHeader>
              <p className='font-body-md text-base leading-7 text-on-surface'>
                {selectedEntry.content}
              </p>
              <SheetFooter className='flex-row p-0 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1 rounded-xl'
                  onClick={() => openEdit(selectedEntry)}
                >
                  <PencilIcon />
                  Edit
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1 rounded-xl text-destructive hover:text-destructive'
                  onClick={() => {
                    setSelectedEntry(null)
                    setDeleteEntry(selectedEntry)
                  }}
                >
                  <Trash2Icon />
                  Delete
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={editingEntry !== null}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <SheetContent
          side='bottom'
          className='mx-auto max-w-md rounded-t-3xl border-outline-variant/20 px-4 pb-8'
        >
          <SheetHeader className='px-0 pt-2 text-start'>
            <SheetTitle className='font-h2 text-xl text-on-surface'>
              {t('journey.editTitle')}
            </SheetTitle>
            <SheetDescription>{t('journey.editDescription')}</SheetDescription>
          </SheetHeader>
          <Textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            aria-label={t('journey.contentLabel')}
            className='min-h-32 rounded-2xl border-outline-variant/30 bg-surface-container-lowest leading-6 focus-visible:border-primary focus-visible:ring-primary/20'
          />
          <SheetFooter className='flex-row p-0 pt-2'>
            <Button
              type='button'
              variant='outline'
              className='flex-1 rounded-xl'
              onClick={() => setEditingEntry(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='button'
              className={cn(
                'flex-1 rounded-xl',
                !editContent.trim() && 'opacity-50'
              )}
              disabled={!editContent.trim()}
              onClick={saveEdit}
            >
              {t('common.save')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={deleteEntry !== null}
        onOpenChange={(open) => !open && setDeleteEntry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('journey.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('journey.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteEntry(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={confirmDelete}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
