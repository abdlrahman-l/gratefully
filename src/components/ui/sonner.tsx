import { Toaster as Sonner, ToasterProps } from 'sonner'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'

export function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      {...props}
      position='top-center'
      offset='calc(env(safe-area-inset-top) + 1rem)'
      mobileOffset='calc(env(safe-area-inset-top) + 1rem)'
      className={cn('toaster group [&_div[data-content]]:w-full', className)}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            'group/toast gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3.5 font-body-md text-on-surface shadow-lg',
          title: 'text-sm font-semibold leading-5 text-on-surface',
          description:
            'text-sm leading-5 text-on-surface-variant group-data-[type=error]/toast:text-on-surface-variant',
          icon: 'text-primary group-data-[type=error]/toast:text-destructive',
          actionButton:
            'rounded-full bg-primary px-3 font-label text-xs font-semibold text-primary-foreground',
          cancelButton:
            'rounded-full bg-primary/10 px-3 font-label text-xs font-semibold text-primary',
          closeButton:
            'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low',
          ...toastOptions?.classNames,
        },
      }}
      style={
        {
          '--normal-bg': 'var(--color-surface-container-lowest)',
          '--normal-text': 'var(--color-on-surface)',
          '--normal-border': 'var(--color-outline-variant)',
          '--success-bg': 'var(--color-surface-container-lowest)',
          '--success-text': 'var(--color-on-surface)',
          '--success-border': 'var(--color-outline-variant)',
          '--error-bg': 'var(--color-surface-container-lowest)',
          '--error-text': 'var(--color-on-surface)',
          '--error-border': 'var(--color-outline-variant)',
          ...props.style,
        } as React.CSSProperties
      }
    />
  )
}
