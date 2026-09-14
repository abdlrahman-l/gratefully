import { format, parseISO } from 'date-fns'
import { SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/date-picker'

type JourneyFiltersProps = {
  query: string
  filterDate: string
  onQueryChange: (value: string) => void
  onDateChange: (value: string) => void
}

export function JourneyFilters({
  query,
  filterDate,
  onQueryChange,
  onDateChange,
}: JourneyFiltersProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3'>
      <div className='relative flex-1'>
        <SearchIcon className='pointer-events-none absolute inset-s-3 top-1/2 size-5 -translate-y-1/2 text-outline' />
        <Input
          type='search'
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('journey.searchPlaceholder')}
          aria-label={t('journey.searchLabel')}
          className='h-12 rounded-2xl border-outline-variant/30 bg-surface-container-lowest ps-10 shadow-ambient placeholder:text-outline/70 focus-visible:border-primary focus-visible:ring-primary/20'
        />
      </div>
      <div className='flex gap-2'>
        <DatePicker
          selected={filterDate ? parseISO(filterDate) : undefined}
          placeholder={t('journey.allDates')}
          onSelect={(date) =>
            onDateChange(date ? format(date, 'yyyy-MM-dd') : '')
          }
        />
        {filterDate && (
          <Button
            type='button'
            variant='ghost'
            className='h-12 shrink-0 rounded-2xl px-3 text-outline hover:bg-primary/10 hover:text-primary'
            onClick={() => onDateChange('')}
          >
            {t('common.clear')}
          </Button>
        )}
      </div>
    </div>
  )
}
