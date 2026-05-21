import React from 'react'
import { Link } from '@tanstack/react-router'
import { Home, Heart, BookOpen, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
    label: string
    to: string
    icon: React.ComponentType<{ className?: string; fill?: string }>
}

const navItems: NavItem[] = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Grateful', to: '/grateful', icon: Heart },
    { label: 'Journey', to: '/journey', icon: BookOpen },
    { label: 'Settings', to: '/settings', icon: Settings },
]

const BottomNavbar = () => {
    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-outline-variant/20 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-4 py-3 rounded-t-2xl">
            {navItems.map((item) => {
                const Icon = item.icon
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="group flex flex-col items-center gap-1"
                    >
                        {({ isActive }) => (
                            <>
                                <div
                                    className={`flex items-center justify-center rounded-full px-5 py-1.5 transition-all duration-300 ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                                        }`}
                                >
                                    <Icon
                                        className={cn("size-6 transition-all duration-300", isActive ? 'text-primary' : 'text-muted-foreground')}
                                    />
                                </div>
                                <span
                                    className={`text-xs ${isActive
                                        ? 'font-semibold text-primary'
                                        : 'font-medium text-muted-foreground group-hover:text-foreground'
                                        }`}
                                >
                                    {item.label}
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


