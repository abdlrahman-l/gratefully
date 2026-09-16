import type { ComponentType, ReactNode } from 'react'
import { CheckIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RadioGroupItem } from '@/components/ui/radio-group'

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className='font-label text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
      {children}
    </h2>
  )
}

export function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  label: string
  value: string
  onClick: () => void
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      className='h-auto w-full justify-start rounded-none px-4 py-4 text-start whitespace-normal hover:bg-muted/60 focus-visible:bg-muted/60'
      onClick={onClick}
    >
      <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
        <Icon className='size-5' aria-hidden />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block font-label text-sm font-semibold text-foreground'>
          {label}
        </span>
        <span className='mt-0.5 block font-body-md text-sm text-muted-foreground'>
          {value}
        </span>
      </span>
      <ChevronRightIcon
        className='size-5 shrink-0 text-muted-foreground'
        aria-hidden
      />
    </Button>
  )
}

export function SelectorOption({
  checked,
  children,
  value,
}: {
  checked: boolean
  children: ReactNode
  value: string
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition-colors',
        checked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-foreground hover:bg-muted/60'
      )}
    >
      <RadioGroupItem value={value} />
      <span className='flex-1 font-label text-sm font-semibold'>
        {children}
      </span>
      {checked && <CheckIcon className='size-5' aria-hidden />}
    </label>
  )
}
