import { createFileRoute } from '@tanstack/react-router'
import { AuthContainer } from '@/features/auth'

export const Route = createFileRoute('/auth')({
  component: AuthContainer,
})
