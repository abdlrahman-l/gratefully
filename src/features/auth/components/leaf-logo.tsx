import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface LeafLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function LeafLogo({ className, size = 'md', ...props }: LeafLogoProps) {
  const sizeClasses = {
    sm: 'size-16',
    md: 'size-24',
    lg: 'size-28',
  }

  const iconSizes = {
    sm: 'w-8 h-10',
    md: 'w-11 h-14',
    lg: 'w-13 h-16',
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-[#f4f2ea] shadow-sm shadow-stone-200/50 transition-transform duration-300 hover:scale-105 dark:bg-stone-800/80 dark:shadow-none',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <svg
        viewBox='0 0 56 68'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={cn('text-[#728770] dark:text-[#8ea58c]', iconSizes[size])}
        aria-hidden='true'
      >
        {/* Leaf Outer Body */}
        <path
          d='M28 2C28 2 8 16 8 38C8 51 17 59 28 62C39 59 48 51 48 38C48 16 28 2 28 2Z'
          fill='currentColor'
        />

        {/* Bottom Stem */}
        <path
          d='M28 62V66'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
        />

        {/* Central Vein */}
        <path
          d='M28 10V56'
          stroke='white'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeOpacity='0.9'
        />

        {/* Left Veins */}
        <path
          d='M28 20L18 15'
          stroke='white'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeOpacity='0.85'
        />
        <path
          d='M28 30L16 26'
          stroke='white'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeOpacity='0.85'
        />
        <path
          d='M28 40L17 38'
          stroke='white'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeOpacity='0.85'
        />
        <path
          d='M28 49L21 48'
          stroke='white'
          strokeWidth='1.1'
          strokeLinecap='round'
          strokeOpacity='0.8'
        />

        {/* Right Veins */}
        <path
          d='M28 20L38 15'
          stroke='white'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeOpacity='0.85'
        />
        <path
          d='M28 30L40 26'
          stroke='white'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeOpacity='0.85'
        />
        <path
          d='M28 40L39 38'
          stroke='white'
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeOpacity='0.85'
        />
        <path
          d='M28 49L35 48'
          stroke='white'
          strokeWidth='1.1'
          strokeLinecap='round'
          strokeOpacity='0.8'
        />
      </svg>
    </div>
  )
}
