import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '@/features/legal/legal-page'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy Policy | Gratefully', name: 'description', content: 'Learn how Gratefully handles your journal data, local storage, Google account access, backups, and privacy.' }] }),
  component: () => <LegalPage document='privacy' />,
})
