import { useTranslation } from 'react-i18next'
import { StatCard } from '@/features/Dashboard/components/stat-card'

type DashboardSummaryProps = {
  totalEntries: number
  monthlyEntries: number
}

export function DashboardSummary({
  totalEntries,
  monthlyEntries,
}: DashboardSummaryProps) {
  const { t } = useTranslation()

  return (
    <section
      className='grid grid-cols-2 gap-2.5'
      aria-label={t('home.summary')}
    >
      <StatCard label={t('home.prototype.totalEntries')} value={totalEntries} />
      <StatCard label={t('home.thisMonth')} value={monthlyEntries} />
    </section>
  )
}
