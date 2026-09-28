import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmSheet } from '@/components/confirm-sheet'

type GratefullyEntryDeleteSheetProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  loadingText?: ReactNode
}

export function GratefullyEntryDeleteSheet({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  loadingText,
}: GratefullyEntryDeleteSheetProps) {
  const { t } = useTranslation()

  return (
    <ConfirmSheet
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      title={t('common.deleteEntryTitle')}
      description={t('common.deleteEntryDescription')}
      cancelText={t('common.cancel')}
      confirmText={isLoading && loadingText ? loadingText : t('common.delete')}
      illustrationSrc='/images/delete.webp'
      destructive
      isLoading={isLoading}
      onConfirm={onConfirm}
    />
  )
}
