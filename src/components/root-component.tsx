import { Outlet, useLocation } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useSync } from '@/hooks/use-sync'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GreetingHeader } from '@/features/grateful/components/greeting-header'
import BottomNavbar from '@/features/layouts/bottom-navbar'

export function RootComponent() {
  const { pathname } = useLocation()
  useSync()

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-md flex-col'>
      {pathname !== '/auth' && <GreetingHeader />}
      <NavigationProgress />
      <Outlet />
      <BottomNavbar />
      <Toaster duration={5000} />
      {import.meta.env.MODE === 'development' && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </main>
  )
}
