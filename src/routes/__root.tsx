import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, redirect } from '@tanstack/react-router'
import { RootComponent } from '@/components/root-component'
import { useAuthStore } from '@/stores/auth-store'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: ({ location }) => {
    const { accessToken } = useAuthStore.getState().auth

    if (location.pathname !== '/auth' && !accessToken) {
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
