import { createFileRoute } from '@tanstack/react-router'
import { DashboardPrototype } from '@/features/DashboardPrototype'

export const Route = createFileRoute('/dashboard-preview')({
  component: DashboardPrototype,
})
