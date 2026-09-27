import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/features/landing/landing-page'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Gratefully | A gentle space for daily gratitude' },
      {
        name: 'description',
        content:
          'Gratefully is a private, mobile-first gratitude journal for daily reflection, gentle reminders, and optional Google Drive backups.',
      },
    ],
  }),
  component: LandingPage,
})
