import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmSheet } from '@/components/confirm-sheet'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()

  const { auth } = useAuthStore()

  const handleSignOut = () => {
    auth.reset()
    navigate({
      to: '/auth',
      replace: true,
    })
  }

  return (
    <ConfirmSheet
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      description='Are you sure you want to sign out? You will need to sign in again to access your account.'
      cancelText='Cancel'
      confirmText='Sign out'
      destructive
      onConfirm={handleSignOut}
    />
  )
}
