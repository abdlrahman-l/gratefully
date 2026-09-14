import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SectionTitle } from './settings-primitives'

export function AccountSection() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const name = user?.name ?? 'there'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <section className='space-y-3' aria-label={t('settings.account')}>
      <SectionTitle>{t('settings.account')}</SectionTitle>
      <div className='rounded-2xl border border-outline-variant/20 bg-card p-4 shadow-ambient'>
        <div className='flex items-center gap-3'>
          <Avatar className='size-12 border border-primary/10'>
            <AvatarImage
              className='bg-primary/10 font-label text-sm font-semibold text-primary'
              src={user?.picture}
              alt={`${user?.name}'s profile`}
            />
            <AvatarFallback className='bg-primary/10 font-label text-sm font-semibold text-primary'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='truncate font-label text-sm font-semibold text-foreground'>
              {user?.name}
            </p>
            <p className='mt-0.5 truncate font-body-md text-sm text-muted-foreground'>
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
