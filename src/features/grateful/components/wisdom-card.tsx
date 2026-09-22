import { useEffect, useState } from 'react'
import { LeafIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'

const wisdomSlides = [
  {
    id: 'ibrahim',
    backgroundImage: '/images/carousel/QS. Ibrahim 14-7.webp',
  },
  {
    id: 'baqarahRemember',
    backgroundImage: '/images/carousel/Al-Baqarah 2-152.webp',
  },
  {
    id: 'luqman',
    backgroundImage: '/images/carousel/Luqman 31-12.webp',
  },
  {
    id: 'nahlGifts',
    backgroundImage: '/images/carousel/An-Nahl 16-78.webp',
  },
  {
    id: 'nahlProvision',
    backgroundImage: '/images/carousel/An-Nahl 16-114.webp',
  },
  {
    id: 'saba',
    backgroundImage: "/images/carousel/Saba' 34-13.webp",
  },
  {
    id: 'zumar',
    backgroundImage: '/images/carousel/Az-Zumar 39-66.webp',
  },
  {
    id: 'mulk',
    backgroundImage: '/images/carousel/Al-Mulk 67-23.webp',
  },
  {
    id: 'baqarahProvision',
    backgroundImage: '/images/carousel/Al-Baqarah 2-152.webp',
  },
  {
    id: 'naml',
    backgroundImage: '/images/carousel/An-Naml 27-19.webp',
  },
] as const

function WisdomDots({ activeIndex }: { activeIndex: number }) {
  const { t } = useTranslation()
  const { api } = useCarousel()

  return (
    <div
      className='flex items-center justify-center gap-2'
      aria-label={t('grateful.wisdomCard.label')}
    >
      {wisdomSlides.map(({ id }, index) => {
        const ayat = t(`grateful.wisdomCard.slides.${id}.ayat`)

        return (
          <Button
            key={id}
            variant='ghost'
            size='icon'
            aria-label={t('grateful.wisdomCard.showVerse', { verse: ayat })}
            aria-current={activeIndex === index ? 'true' : undefined}
            className={`h-1.5 min-w-0 rounded-full p-0 transition-all duration-300 ease-out hover:bg-primary/50 ${
              activeIndex === index ? 'w-5 bg-primary' : 'w-1.5 bg-primary/25'
            }`}
            onClick={() => api?.scrollTo(index)}
            type='button'
          >
            <span aria-hidden='true' className='sr-only' />
          </Button>
        )
      })}
    </div>
  )
}

export function WisdomCard() {
  const { t } = useTranslation()
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!api) return

    const onSelect = () => setActiveIndex(api.selectedScrollSnap())

    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || isPaused) return

    const timer = window.setInterval(() => api.scrollNext(), 5000)

    return () => window.clearInterval(timer)
  }, [api, isPaused])

  return (
    <section className='mx-auto flex w-full max-w-md min-w-0 flex-col'>
      <Carousel
        aria-label={t('grateful.wisdomCard.label')}
        className='w-full min-w-0'
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
        <CarouselContent className='items-stretch'>
          {wisdomSlides.map(({ id, backgroundImage }, index) => {
            const copy = t(`grateful.wisdomCard.slides.${id}.copy`)
            const isLongVerse = copy.length > 85

            return (
              <CarouselItem className='min-w-0' key={id}>
                <article className='relative aspect-4/3 w-full min-w-0 overflow-hidden rounded-[20px] border border-outline-variant/25 bg-surface shadow-ambient'>
                  <img
                    alt=''
                    aria-hidden='true'
                    className='absolute inset-0 h-full w-full max-w-none object-cover'
                    decoding='async'
                    loading={index === 0 ? 'eager' : 'lazy'}
                    src={backgroundImage}
                  />
                  <div
                    aria-hidden='true'
                    className='absolute inset-y-0 left-0 w-[76%]'
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(250, 248, 241, 0.96) 0%, rgba(250, 248, 241, 0.86) 35%, rgba(250, 248, 241, 0.48) 70%, rgba(250, 248, 241, 0) 100%)',
                    }}
                  />
                  <div className='absolute inset-y-0 left-0 z-10 flex w-[55%] items-center'>
                    <div className='w-full min-w-0 -translate-y-[2%] py-4 pr-2 pl-5'>
                      <p className='mb-3 font-label text-xs font-medium tracking-wide text-primary/75'>
                        {t(`grateful.wisdomCard.slides.${id}.ayat`)}
                      </p>
                      <blockquote
                        className={`w-full max-w-85 font-quote leading-[1.4] text-on-surface-variant italic md:leading-[1.42] ${
                          isLongVerse ? 'text-[18px]' : 'text-[20px]'
                        }`}
                      >
                        <span className='mr-1 text-[24px] leading-none text-primary/50'>
                          “
                        </span>
                        {copy}
                        <span className='ml-1 text-[24px] leading-none text-primary/50'>
                          ”
                        </span>
                      </blockquote>
                      <div className='mt-3 flex min-w-0 items-center gap-1.5 text-primary/80'>
                        <LeafIcon
                          aria-hidden='true'
                          className='size-3.5 shrink-0'
                        />
                        <span className='truncate font-label text-[0.68rem] font-medium'>
                          {t(`grateful.wisdomCard.slides.${id}.theme`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <div className='mt-3'>
          <WisdomDots activeIndex={activeIndex} />
        </div>
      </Carousel>
    </section>
  )
}
