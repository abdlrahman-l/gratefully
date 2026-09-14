import { createFileRoute } from '@tanstack/react-router'
import { SettingsContainer } from '@/features/settings/container'

export const Route = createFileRoute('/settings')({
  component: SettingsContainer,
})
