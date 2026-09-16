import { type ButtonHTMLAttributes } from 'react'
import { IconGoogle } from '@/assets/brand-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface GoogleAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export function GoogleAuthButton({
  className,
  isLoading = false,
  disabled,
  children = 'Continue with Google',
  ...props
}: GoogleAuthButtonProps) {
  return (
    <Button
      type='button'
      variant='outline'
      size='lg'
      disabled={disabled || isLoading}
      className={cn(
        'group relative h-14 w-full max-w-sm gap-3 border-stone-200/90 bg-white px-6 text-stone-800 shadow-sm',
        'hover:border-stone-300 hover:bg-stone-50/80 hover:shadow',
        'active:scale-[0.99]',
        'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800/80',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className='size-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700 dark:border-stone-700 dark:border-t-stone-200' />
      ) : (
        <IconGoogle className='size-5 shrink-0 transition-transform duration-200 group-hover:scale-105' />
      )}
      <span className='font-medium tracking-tight'>{children}</span>
    </Button>
  )
}
