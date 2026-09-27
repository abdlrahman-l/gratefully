import { createFileRoute } from '@tanstack/react-router'
import { DashboardPrototype } from '@/features/DashboardPrototype'

export const Route = createFileRoute('/home')({
  component: DashboardPrototype,
})
