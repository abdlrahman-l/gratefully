import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function GreetingHeader() {
  const user = useAuthStore((state) => state.auth.user)
  const name = user?.name ?? 'there'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <header className='flex w-full items-center gap-3 px-4 py-4'>
      <Avatar className='size-12'>
        <AvatarImage src={user?.picture} alt={`${name}'s profile`} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <h1 className='text-xl font-semibold tracking-tight'>
        Assalamualaikum, {name}
      </h1>
    </header>
  )
}
