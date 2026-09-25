import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { RootComponent } from '@/components/root-component'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: ({ location }) => {
    const { status } = useAuthStore.getState().auth

    // Initialization is completed by RootComponent, which then invalidates the
    // router so protected routes are evaluated with a settled auth status.
    if (
      !['/auth', '/privacy', '/terms'].includes(location.pathname) &&
      status !== 'initializing' &&
      status !== 'authenticated'
    ) {
      throw redirect({ to: '/auth' })
    }
  },
  head: () => ({
    scripts: [
      {
        src: 'https://accounts.google.com/gsi/client',
        async: true,
        defer: true,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
