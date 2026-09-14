import * as React from 'react'
import { cn } from '@/lib/utils'

type CarouselApi = {
  scrollTo: (index: number) => void
}

type CarouselProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  setApi?: (api: CarouselApi) => void
  activeIndex?: number
  onSelect?: (index: number) => void
}

const CarouselContext = React.createContext<CarouselApi | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a Carousel')
  }

  return context
}

function Carousel({
  className,
  setApi,
  children,
  activeIndex = 0,
  onSelect,
  ...props
}: CarouselProps) {
  const api = React.useMemo<CarouselApi>(
    () => ({
      scrollTo: (index) => {
        onSelect?.(index)
      },
    }),
    [onSelect]
  )

  React.useEffect(() => {
    setApi?.(api)
  }, [api, setApi])

  return (
    <CarouselContext.Provider value={api}>
      <div
        aria-roledescription='carousel'
        className={cn('relative', className)}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { selectedIndex: activeIndex } as never)
            : child
        )}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  className,
  children,
  selectedIndex = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { selectedIndex?: number }) {
  return (
    <div className='overflow-hidden' {...props}>
      <div
        className={cn(
          'flex transition-transform duration-500 ease-out',
          className
        )}
        style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
      >
        {React.Children.map(children, (child) => (
          <div
            aria-roledescription='slide'
            className='min-w-0 shrink-0 grow-0 basis-full'
            role='group'
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-full', className)} {...props} />
}

export { Carousel, CarouselContent, CarouselItem, useCarousel }
