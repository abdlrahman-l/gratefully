import React from 'react'
import { Link } from '@tanstack/react-router'
import { Home, Heart, BookOpen, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface NavItem {
  translationKey: 'home' | 'grateful' | 'journey' | 'settings'
  to: string
  icon: React.ComponentType<{ className?: string; fill?: string }>
}

const navItems: NavItem[] = [
  { translationKey: 'home', to: '/', icon: Home },
  { translationKey: 'grateful', to: '/grateful', icon: Heart },
  { translationKey: 'journey', to: '/journey', icon: BookOpen },
  { translationKey: 'settings', to: '/settings', icon: Settings },
]

const BottomNavbar = () => {
  const { t } = useTranslation()


  return (
    <nav className='fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-center justify-around rounded-t-2xl border-t border-outline-variant/20 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]'>
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            className='group flex flex-col items-center gap-1'
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center rounded-full px-5 py-1.5 transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={cn(
                      'size-6 transition-all duration-300',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <span
                  className={`text-xs ${
                    isActive
                      ? 'font-semibold text-primary'
                      : 'font-medium text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {t(`navigation.${item.translationKey}`)}
                </span>
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNavbar
