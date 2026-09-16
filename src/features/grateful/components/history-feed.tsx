import { useState } from 'react'
import { getCurrentLanguage } from '@/i18n'
import type { GratefullyEntry } from '@/types/gratefully'
import { CalendarIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatJournalDate } from '@/lib/date-locale'
import { Button } from '@/components/ui/button'
import { ConfirmSheet } from '@/components/confirm-sheet'

interface HistoryFeedProps {
  entries: GratefullyEntry[]

  isLoading: boolean
  onDelete: (id: string) => Promise<void>
  onEdit: (entry: GratefullyEntry) => void
}

export function HistoryFeed({
  entries,

  isLoading,
  onDelete,
  onEdit,
}: HistoryFeedProps) {
  const { t } = useTranslation()
  const language = getCurrentLanguage()
  const [entryToRemove, setEntryToRemove] = useState<GratefullyEntry | null>(
    null
  )
  const [isRemoving, setIsRemoving] = useState(false)

  const confirmRemove = async () => {
    if (!entryToRemove || isRemoving) return

    setIsRemoving(true)
    try {
      await onDelete(entryToRemove.id)
      setEntryToRemove(null)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <section className='flex flex-col gap-4 pb-20 sm:gap-4 sm:pb-24'>
      <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3'>
        <h2 className='font-h2 text-base leading-tight font-semibold text-on-surface sm:text-xl'>
          {t('grateful.recentMoments')}
        </h2>
      </div>
      <div className='flex flex-col gap-2.5 sm:gap-4'>
        {isLoading ? (
          <p className='rounded-xl bg-surface-container-lowest p-3.5 font-body-md text-sm text-outline shadow-ambient sm:rounded-2xl sm:p-5 sm:text-base'>
            {t('common.loading')}
          </p>
        ) : entries.length === 0 ? (
          <p className='rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-lowest p-4 font-body-md text-sm text-outline shadow-ambient sm:rounded-2xl sm:p-6 sm:text-base'>
            {t('grateful.noEntries')}
          </p>
        ) : (
          entries.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className='group flex flex-col gap-2.5 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-3.5 shadow-ambient transition-shadow duration-300 hover:shadow-md sm:gap-2 sm:rounded-2xl sm:p-5'
            >
              <div className='flex items-start justify-between gap-2 sm:items-center sm:gap-3'>
                <p className='flex min-w-0 flex-1 items-center gap-1 pt-0.5 font-label text-[11px] leading-4 font-medium text-outline sm:pt-0 sm:text-sm'>
                  <CalendarIcon className='size-3.5 shrink-0' />
                  {formatJournalDate(entry.date, language, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <div className='flex shrink-0 gap-0 sm:gap-1'>
                  <Button
                    aria-label={t('grateful.editAria', {
                      date: formatJournalDate(entry.date, language, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }),
                    })}
                    className='size-9 sm:size-9'
                    size='icon'
                    type='button'
                    variant='ghost'
                    onClick={() => onEdit(entry)}
                  >
                    <PencilIcon className='size-4' />
                  </Button>
                  <Button
                    aria-label={t('grateful.deleteAria', {
                      date: formatJournalDate(entry.date, language, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }),
                    })}
                    className='size-9 text-destructive/80 hover:bg-destructive/10 hover:text-destructive sm:size-9'
                    size='icon'
                    type='button'
                    variant='ghost'
                    onClick={() => setEntryToRemove(entry)}
                  >
                    <Trash2Icon className='size-4' />
                  </Button>
                </div>
              </div>
              <p className='font-body-md text-sm leading-6 wrap-break-word text-on-surface sm:text-base sm:leading-normal'>
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>

      <ConfirmSheet
        open={entryToRemove !== null}
        onOpenChange={(open) => !open && setEntryToRemove(null)}
        title={t('grateful.removeTitle')}
        description={t('grateful.removeDescription')}
        cancelText={t('common.cancel')}
        confirmText={
          isRemoving ? t('grateful.removing') : t('grateful.removeConfirm')
        }
        destructive
        isLoading={isRemoving}
        onConfirm={() => void confirmRemove()}
      />
    </section>
  )
}
