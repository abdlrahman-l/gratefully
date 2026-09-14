import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      id='gratefully-logo'
      viewBox='0 0 56 68'
      xmlns='http://www.w3.org/2000/svg'
      height='28'
      width='24'
      fill='none'
      stroke='currentColor'
      strokeWidth='0'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('size-6', className)}
      {...props}
    >
      <title>Gratefully</title>
      <path d='M28 2C28 2 8 16 8 38C8 51 17 59 28 62C39 59 48 51 48 38C48 16 28 2 28 2Z' fill='currentColor' />
      <path d='M28 62V66' stroke='currentColor' strokeWidth='2' />
      <path d='M28 10V56M28 20L18 15M28 30L16 26M28 40L17 38M28 49L21 48M28 20L38 15M28 30L40 26M28 40L39 38M28 49L35 48' stroke='white' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}
