import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='container px-4 pt-8 text-center'>
      <h1 className='mb-2 text-4xl font-bold'>You are home.</h1>

      <p className='text-muted-foreground'>Welcome to your sanctuary.</p>

      {/* Spacer to push content up */}
      <div className='h-40' />
    </div>
  )
}
