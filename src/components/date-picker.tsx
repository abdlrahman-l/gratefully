import { endOfDay, startOfDay } from 'date-fns'
import { getCurrentLanguage } from '@/i18n'
import { Calendar as CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({
  selected,
  onSelect,
  placeholder,
}: DatePickerProps) {
  const { t } = useTranslation()
  const language = getCurrentLanguage()
  const datePlaceholder = placeholder ?? t('common.selectDate')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          data-empty={!selected}
          className='h-11 w-full min-w-56 justify-start rounded-xl border-outline-variant/40 bg-surface-container-lowest px-3.5 text-start font-label text-sm font-medium shadow-none transition-colors hover:border-primary/50 hover:bg-surface-container-low focus-visible:border-primary focus-visible:ring-primary/20 data-[empty=true]:text-outline sm:w-60'
        >
          <span className='flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <CalendarIcon className='size-4' />
          </span>
          <span className='truncate'>
            {selected
              ? new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }).format(selected)
              : datePlaceholder}
          </span>
          <ChevronDownIcon
            className='ms-auto size-4 text-outline/70'
            aria-hidden='true'
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-auto rounded-2xl border-outline-variant/30 bg-surface-container-lowest p-0 shadow-xl'
      >
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={onSelect}
          className='rounded-2xl bg-transparent p-4'
          disabled={(date: Date) =>
            date > endOfDay(new Date()) ||
            date < startOfDay(new Date(1900, 0, 1))
          }
        />
      </PopoverContent>
    </Popover>
  )
}
