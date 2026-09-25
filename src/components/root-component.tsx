import { useEffect } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { initializeAuth } from '@/services/google-token.service'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useAuthStore } from '@/stores/auth-store'
import { useSync } from '@/hooks/use-sync'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GreetingHeader } from '@/features/grateful/components/greeting-header'
import BottomNavbar from '@/features/layouts/bottom-navbar'

export function RootComponent() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const router = useRouter()
  const authStatus = useAuthStore((state) => state.auth.status)
  const isPublicRoute = ['/auth', '/privacy', '/terms'].includes(pathname)
  const showAppNavigation =
    authStatus === 'authenticated' && !isPublicRoute
  useSync()

  useEffect(() => {
    void initializeAuth().then(() => router.invalidate())
  }, [router])

  useEffect(() => {
    if (
      authStatus !== 'initializing' &&
      authStatus !== 'authenticated' &&
      !isPublicRoute
    ) {
      void navigate({ to: '/auth', replace: true })
    }
  }, [authStatus, isPublicRoute, navigate])

  if (
    authStatus === 'initializing' ||
    (!isPublicRoute && authStatus !== 'authenticated')
  ) {
    return (
      <main className='mx-auto flex min-h-screen w-full max-w-md items-center justify-center'>
        <div
          className='size-8 animate-spin rounded-full border-2 border-muted border-t-primary'
          role='status'
          aria-label='Loading'
        />
      </main>
    )
  }

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-md flex-col'>
      {showAppNavigation && <GreetingHeader />}
      <NavigationProgress />
      <Outlet />
      {showAppNavigation && <BottomNavbar />}
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
