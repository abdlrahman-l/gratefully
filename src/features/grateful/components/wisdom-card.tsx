import { useEffect, useState } from 'react'
import { LeafIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'

const wisdomSlides = [
  'ibrahim',
  'baqarahRemember',
  'luqman',
  'nahlGifts',
  'nahlProvision',
  'saba',
  'zumar',
  'mulk',
  'baqarahProvision',
  'naml',
] as const

function WisdomDots({ activeIndex }: { activeIndex: number }) {
  const { t } = useTranslation()
  const { scrollTo } = useCarousel()

  return (
    <div
      className='flex justify-center gap-1.5'
      aria-label={t('grateful.wisdomCard.label')}
    >
      {wisdomSlides.map((slide, index) => {
        const ayat = t(`grateful.wisdomCard.slides.${slide}.ayat`)

        return (
          <Button
            key={slide}
            variant='ghost'
            size='icon'
            aria-label={t('grateful.wisdomCard.showVerse', { verse: ayat })}
            aria-current={activeIndex === index ? 'true' : undefined}
            className={`h-1.5 rounded-full p-0 transition-all hover:bg-primary/60 ${
              activeIndex === index ? 'w-5 bg-primary' : 'w-1.5 bg-primary/30'
            }`}
            onClick={() => scrollTo(index)}
            type='button'
          />
        )
      })}
    </div>
  )
}

export function WisdomCard() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % wisdomSlides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [isPaused])

  return (
    <section className='flex min-w-0 flex-col gap-4'>
      <Carousel
        aria-label={t('grateful.wisdomCard.label')}
        className='min-w-0 rounded-[24px] bg-primary-container/10 p-4 shadow-ambient sm:p-6'
        onSelect={setActiveIndex}
        activeIndex={activeIndex}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setIsPaused(false)
        }}
        onFocus={() => setIsPaused(true)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CarouselContent>
          {wisdomSlides.map((slide) => (
            <CarouselItem key={slide}>
              <div className='flex min-h-[190px] flex-col justify-between gap-4'>
                <p className='font-quote text-xl leading-relaxed text-on-surface-variant italic'>
                  <span className='mr-1 text-primary opacity-50'>"</span>
                  {t(`grateful.wisdomCard.slides.${slide}.copy`)}
                  <span className='ml-1 text-primary opacity-50'>"</span>
                </p>
                <div className='mt-2 flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between'>
                  <p className='min-w-0 font-label text-sm font-medium text-outline'>
                    - {t(`grateful.wisdomCard.slides.${slide}.ayat`)}
                  </p>
                  <div className='flex max-w-full items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-3 py-1.5 shadow-sm sm:shrink-0'>
                    <LeafIcon className='size-4 shrink-0 text-primary' />
                    <span className='font-label text-sm font-medium text-primary'>
                      {t(`grateful.wisdomCard.slides.${slide}.theme`)}
                    </span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className='mt-5'>
          <WisdomDots activeIndex={activeIndex} />
        </div>
      </Carousel>
    </section>
  )
}
