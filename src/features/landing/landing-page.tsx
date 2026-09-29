import { Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  BellIcon,
  BookHeartIcon,
  CloudIcon,
  HistoryIcon,
  LockKeyholeIcon,
  QuoteIcon,
  ShieldCheckIcon,
  SproutIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/assets/logo'
import { Button } from '@/components/ui/button'
import { FeaturePreviewCarousel } from '@/features/landing/feature-preview-carousel'
import { SUPPORT_EMAIL } from '@/utils/legal'

const featureIcons = [BookHeartIcon, SproutIcon, HistoryIcon, BellIcon] as const

export function LandingPage() {
  const { t } = useTranslation()

  const features = [
    {
      title: t('landing.features.journal.title'),
      description: t('landing.features.journal.description'),
    },
    {
      title: t('landing.features.habit.title'),
      description: t('landing.features.habit.description'),
    },
    {
      title: t('landing.features.journey.title'),
      description: t('landing.features.journey.description'),
    },
    {
      title: t('landing.features.reminder.title'),
      description: t('landing.features.reminder.description'),
    },
  ]

  return (
    <div className='overflow-hidden bg-surface text-on-surface'>
      <header className='flex items-center justify-between px-5 pt-5'>
        <Link
          to='/'
          className='flex items-center gap-2 text-primary'
          aria-label={t('landing.homeAria')}
        >
          <Logo className='size-7' />
          <span className='font-h1 text-lg font-semibold tracking-tight'>
            Gratefully
          </span>
        </Link>
        <Link
          to='/auth'
          className='rounded-full px-3 py-2 font-label text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        >
          {t('landing.signIn')}
        </Link>
      </header>

      <main>
        <section className='relative px-5 pt-16 pb-14 text-center'>
          <div className='absolute top-9 left-1/2 -z-0 size-56 -translate-x-1/2 rounded-full bg-primary/7 blur-3xl' />
          <div className='relative'>
            <p className='font-label text-xs font-semibold tracking-[0.18em] text-primary uppercase'>
              {t('landing.eyebrow')}
            </p>
            <h1 className='mt-4 font-h1 text-[2.45rem] leading-[1.12] font-semibold tracking-[-0.045em] text-on-surface'>
              {t('landing.heroTitle')}
            </h1>
            <p className='mx-auto mt-5 max-w-sm font-body-lg text-base leading-7 text-on-surface-variant'>
              {t('landing.heroDescription')}
            </p>
            <Button asChild size='lg' className='mt-8 w-full max-w-xs'>
              <Link to='/auth'>
                {t('landing.start')}
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <p className='mt-3 font-label text-xs text-muted-foreground'>
              {t('landing.noPressure')}
            </p>
          </div>
        </section>

        <section className='px-5 pb-16' aria-label={t('landing.previewAria')}>
          <FeaturePreviewCarousel />
        </section>

        <section className='border-y border-outline-variant/20 bg-surface-container-low px-5 py-14'>
          <p className='font-label text-xs font-semibold tracking-[0.16em] text-primary uppercase'>
            {t('landing.featuresEyebrow')}
          </p>
          <h2 className='mt-3 max-w-sm font-h1 text-2xl leading-tight font-semibold tracking-tight'>
            {t('landing.featuresTitle')}
          </h2>
          <div className='mt-8 grid gap-3'>
            {features.map((feature, index) => {
              const Icon = featureIcons[index]

              return (
                <article
                  key={feature.title}
                  className='flex gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm'
                >
                  <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Icon className='size-5' aria-hidden />
                  </span>
                  <div>
                    <h3 className='font-label text-sm font-semibold text-on-surface'>
                      {feature.title}
                    </h3>
                    <p className='mt-1 font-body-md text-sm leading-6 text-on-surface-variant'>
                      {feature.description}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className='px-5 py-16'>
          <div className='rounded-[1.75rem] bg-primary px-6 py-7 text-primary-foreground'>
            <QuoteIcon className='size-6 opacity-75' aria-hidden />
            <p className='mt-4 font-quote text-xl leading-8 italic'>
              {t('landing.reflection.quote')}
            </p>
            <p className='mt-4 font-label text-xs font-semibold tracking-wide opacity-85'>
              {t('landing.reflection.source')}
            </p>
          </div>
        </section>

        <section className='border-y border-outline-variant/20 bg-surface-container-low px-5 py-14'>
          <div className='flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <LockKeyholeIcon className='size-5' aria-hidden />
          </div>
          <h2 className='mt-5 font-h1 text-2xl leading-tight font-semibold tracking-tight'>
            {t('landing.dataTitle')}
          </h2>
          <p className='mt-3 font-body-md text-sm leading-6 text-on-surface-variant'>
            {t('landing.dataDescription')}
          </p>
          <div className='mt-6 space-y-3'>
            <div className='flex gap-3'>
              <ShieldCheckIcon className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden />
              <p className='font-body-md text-sm leading-6 text-on-surface-variant'>
                {t('landing.data.local')}
              </p>
            </div>
            <div className='flex gap-3'>
              <CloudIcon className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden />
              <p className='font-body-md text-sm leading-6 text-on-surface-variant'>
                {t('landing.data.backup')}
              </p>
            </div>
          </div>
        </section>

        <section className='px-5 py-16 text-center'>
          <h2 className='font-h1 text-2xl leading-tight font-semibold tracking-tight'>
            {t('landing.closingTitle')}
          </h2>
          <p className='mx-auto mt-3 max-w-sm font-body-md text-sm leading-6 text-on-surface-variant'>
            {t('landing.closingDescription')}
          </p>
          <Button asChild size='lg' className='mt-7 w-full max-w-xs'>
            <Link to='/auth'>
              {t('landing.start')}
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </section>
      </main>

      <footer className='border-t border-outline-variant/20 px-5 py-8 text-center'>
        <div className='flex flex-wrap justify-center gap-x-5 gap-y-2 font-label text-sm font-medium text-primary'>
          <Link to='/privacy' className='underline-offset-4 hover:underline'>
            {t('legal.privacyLink')}
          </Link>
          <Link to='/terms' className='underline-offset-4 hover:underline'>
            {t('legal.termsLink')}
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className='underline-offset-4 hover:underline'>
            {t('landing.contact')}
          </a>
        </div>
        <p className='mt-5 font-label text-xs text-muted-foreground'>
          {t('landing.googleDisclosure')}
        </p>
        <p className='mt-4 font-label text-xs text-muted-foreground'>
          © {new Date().getFullYear()} Gratefully
        </p>
      </footer>
    </div>
  )
}
