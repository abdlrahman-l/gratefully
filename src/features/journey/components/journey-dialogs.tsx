import { getCurrentLanguage } from '@/i18n'
import { PencilIcon, Trash2Icon } from 'lucide-react'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import type { GratefullyEntry } from '../types'

function formatLongDate(date: string) {
  return formatJournalDate(date, getCurrentLanguage(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type JourneyDialogsProps = {
  selectedEntry: GratefullyEntry | null
  editingEntry: GratefullyEntry | null
  deleteEntry: GratefullyEntry | null
  editContent: string
  onCloseSelected: () => void
  onEdit: (entry: GratefullyEntry) => void
  onRequestDelete: (entry: GratefullyEntry) => void
  onCloseEdit: () => void
  onContentChange: (value: string) => void
  onSave: () => void
  onCloseDelete: () => void
  onConfirmDelete: () => void
}

export function JourneyDialogs({
  selectedEntry,
  editingEntry,
  deleteEntry,
  editContent,
  onCloseSelected,
  onEdit,
  onRequestDelete,
  onCloseEdit,
  onContentChange,
  onSave,
  onCloseDelete,
  onConfirmDelete,
}: JourneyDialogsProps) {
  const { t } = useTranslation()

  return (
    <>
      <Sheet
        open={selectedEntry !== null}
        onOpenChange={(open) => !open && onCloseSelected()}
      >
        <SheetContent
          side='bottom'
          className='mx-auto max-w-md rounded-t-3xl border-outline-variant/20 px-4 pb-8'
        >
          {selectedEntry && (
            <>
              <SheetHeader className='px-0 pt-2 text-start'>
                <SheetTitle className='font-h2 text-xl text-on-surface'>
                  {formatLongDate(selectedEntry.date)}
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
                  onClick={() => onEdit(selectedEntry)}
                >
                  <PencilIcon /> Edit
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1 rounded-xl text-destructive hover:text-destructive'
                  onClick={() => onRequestDelete(selectedEntry)}
                >
                  <Trash2Icon /> Delete
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={editingEntry !== null}
        onOpenChange={(open) => !open && onCloseEdit()}
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
            onChange={(event) => onContentChange(event.target.value)}
            aria-label={t('journey.contentLabel')}
            className='min-h-32 rounded-2xl border-outline-variant/30 bg-surface-container-lowest leading-6 focus-visible:border-primary focus-visible:ring-primary/20'
          />
          <SheetFooter className='flex-row p-0 pt-2'>
            <Button
              type='button'
              variant='outline'
              className='flex-1 rounded-xl'
              onClick={onCloseEdit}
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
              onClick={onSave}
            >
              {t('common.save')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={deleteEntry !== null}
        onOpenChange={(open) => !open && onCloseDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('journey.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('journey.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCloseDelete}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={onConfirmDelete}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
