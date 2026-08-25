import { createFileRoute } from '@tanstack/react-router'
import { GratefulContainer } from '@/features/grateful/container'

export const Route = createFileRoute('/grateful')({
  component: GratefulContainer,
})
