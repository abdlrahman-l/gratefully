import { EFFECTIVE_DATE, SUPPORT_EMAIL } from '@/utils/legal'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

type LegalDocument = 'privacy' | 'terms'
type Section = { title: string; paragraphs: string[] }

export function LegalPage({ document }: { document: LegalDocument }) {
  const { t } = useTranslation()
  const sections = t(`legal.${document}.sections`, { returnObjects: true, supportEmail: SUPPORT_EMAIL }) as Section[]
  const title = t(`legal.${document}.title`)
  return (
    <main className='mx-auto flex w-full max-w-xl flex-col px-5 pt-5 pb-28'>
      <h1 className='font-display text-3xl font-semibold tracking-tight text-foreground'>{title}</h1>
      <p className='mt-3 text-sm leading-6 text-muted-foreground'>{t(`legal.${document}.intro`)}</p>
      <p className='mt-3 text-xs text-muted-foreground'>{t('legal.effectiveDate', { date: EFFECTIVE_DATE })}</p>
      <div className='mt-8 space-y-7'>
        {sections.map((section, index) => (
          <section key={section.title}>
            <h2 className='font-label text-base font-semibold text-foreground'>{index + 1}. {section.title}</h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className='mt-2 font-body-md text-[15px] leading-7 text-muted-foreground'>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
      <nav aria-label={t('legal.related')} className='mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant/30 pt-5 text-sm text-primary'>
        {document !== 'privacy' && <Link to='/privacy' className='underline underline-offset-4'>{t('legal.privacyLink')}</Link>}
        {document !== 'terms' && <Link to='/terms' className='underline underline-offset-4'>{t('legal.termsLink')}</Link>}
      </nav>
    </main>
  )
}
