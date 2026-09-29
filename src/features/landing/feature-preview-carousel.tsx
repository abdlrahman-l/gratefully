import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

const featurePreviews = [
  '/images/feature/gratefully.site_home(iPhone 16 Pro Max).webp',
  '/images/feature/gratefully.site_grateful(iPhone 16 Pro Max).webp',
  '/images/feature/gratefully.site_journey(iPhone 16 Pro Max).webp',
  '/images/feature/gratefully.site_settings(iPhone 16 Pro Max).webp',
] as const

export function FeaturePreviewCarousel() {
  const { t } = useTranslation()
  const [api, setApi] = useState<CarouselApi>()
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (
      !api ||
      isPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return

    const timer = window.setInterval(() => api.scrollNext(), 4500)

    return () => window.clearInterval(timer)
  }, [api, isPaused])

  return (
    <div className='relative mx-auto w-fit'>
      <span
        aria-hidden='true'
        className='absolute top-[17%] -left-1 z-0 h-12 w-1 rounded-l-full bg-[#2c2c2e]'
      />
      <span
        aria-hidden='true'
        className='absolute top-[25%] -right-1 z-0 h-18 w-1 rounded-r-full bg-[#2c2c2e]'
      />
      <span
        aria-hidden='true'
        className='absolute top-[37%] -right-1 z-0 h-11 w-1 rounded-r-full bg-[#2c2c2e]'
      />
      <div className='relative z-10 w-67.5 rounded-[2.7rem] border-[7px] border-[#1c1c1e] bg-[#1c1c1e] p-[3px] shadow-[0_22px_42px_-18px_rgba(0,0,0,0.45)]'>
        <Carousel
          aria-label={t('landing.previewAria')}
          className='overflow-hidden rounded-[2.2rem] bg-surface-container-lowest'
          opts={{ loop: true }}
          setApi={setApi}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setIsPaused(false)
          }}
          onFocus={() => setIsPaused(true)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <CarouselContent className='ml-0'>
            {featurePreviews.map((src, index) => (
              <CarouselItem className='pl-0' key={src}>
                <img
                  alt=''
                  aria-hidden='true'
                  className='aspect-220/478 w-full object-cover'
                  decoding='async'
                  loading={index === 0 ? 'eager' : 'lazy'}
                  src={src}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/*<span
            aria-hidden='true'
            className='pointer-events-none absolute top-2.5 left-1/2 h-7 w-25 -translate-x-1/2 rounded-full bg-[#1c1c1e]'
          />*/}
        </Carousel>
      </div>
    </div>
  )
}
