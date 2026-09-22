import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type ConfirmSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description: ReactNode
  cancelText: ReactNode
  confirmText: ReactNode
  onConfirm: () => void
  illustrationSrc?: string
  destructive?: boolean
  isLoading?: boolean
}

export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  cancelText,
  confirmText,
  onConfirm,
  illustrationSrc,
  destructive = false,
  isLoading = false,
}: ConfirmSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isLoading) onOpenChange(nextOpen)
      }}
    >
      <SheetContent
        side='bottom'
        className='mx-auto max-w-md rounded-t-3xl border-outline-variant/20 px-4 pb-8'
      >
        <SheetHeader className='px-0 pt-2 text-start'>
          {illustrationSrc && (
            <img
              src={illustrationSrc}
              alt=''
              className='mx-auto w-40'
              aria-hidden
            />
          )}
          <SheetTitle className='font-h2 text-xl text-on-surface'>
            {title}
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <SheetFooter className='flex-row p-0 pt-2'>
          <Button
            type='button'
            variant='outline'
            className='flex-1 rounded-xl'
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            type='button'
            variant={destructive ? 'destructive' : 'default'}
            className='flex-1 rounded-xl'
            disabled={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
