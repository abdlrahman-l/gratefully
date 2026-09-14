import { createFileRoute } from '@tanstack/react-router'
import { JourneyContainer } from '@/features/journey/container'

export const Route = createFileRoute('/journey')({
  component: JourneyContainer,
})
