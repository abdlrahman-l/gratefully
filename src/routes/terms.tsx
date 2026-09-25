import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '@/features/legal/legal-page'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms of Service | Gratefully', name: 'description', content: 'Read the terms governing your use of Gratefully.' }] }),
  component: () => <LegalPage document='terms' />,
})
