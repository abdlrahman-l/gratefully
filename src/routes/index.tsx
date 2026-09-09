import { createFileRoute } from '@tanstack/react-router'
import { DashboardContainer } from '@/features/Dashboard/container'

export const Route = createFileRoute('/')({
  component: DashboardContainer,
})
