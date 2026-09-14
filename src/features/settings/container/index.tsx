import { useState } from 'react'
import {
  changeLanguage,
  getCurrentLanguage,
  isSupportedLanguage,
  type SupportedLanguage,
} from '@/i18n'
import {
  CheckIcon,
  ChevronRightIcon,
  CloudIcon,
  Globe2Icon,
  InfoIcon,
  LogOutIcon,
  MonitorIcon,
  PaletteIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type Language = SupportedLanguage
type Appearance = 'system' | 'light' | 'dark'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className='font-label text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
      {children}
    </h2>
  )
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  label: string
  value: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      className='flex w-full items-center gap-3 px-4 py-4 text-start transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none'
      onClick={onClick}
    >
      <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
        <Icon className='size-5' aria-hidden />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block font-label text-sm font-semibold text-foreground'>
          {label}
        </span>
        <span className='mt-0.5 block font-body-md text-sm text-muted-foreground'>
          {value}
        </span>
      </span>
      <ChevronRightIcon
        className='size-5 shrink-0 text-muted-foreground'
        aria-hidden
      />
    </button>
  )
}

function SelectorOption({
  checked,
  children,
  value,
}: {
  checked: boolean
  children: React.ReactNode
  value: string
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition-colors',
        checked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-foreground hover:bg-muted/60'
      )}
    >
      <RadioGroupItem value={value} />
      <span className='flex-1 font-label text-sm font-semibold'>
        {children}
      </span>
      {checked && <CheckIcon className='size-5' aria-hidden />}
    </label>
  )
}

export function SettingsContainer() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const language = getCurrentLanguage()
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false)
  const [appearanceSheetOpen, setAppearanceSheetOpen] = useState(false)
  const setSelectedLanguage = async (nextLanguage: Language) => {
    await changeLanguage(nextLanguage)
    setLanguageSheetOpen(false)
  }

  const setSelectedAppearance = (nextAppearance: Appearance) => {
    setTheme(nextAppearance)
    setAppearanceSheetOpen(false)
  }

  return (
    <main className='flex flex-col gap-7 px-4 pt-2 pb-28'>
      <header>
        <h1 className='font-h1 text-2xl font-bold tracking-tight text-foreground'>
          {t('settings.title')}
        </h1>
        <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
          {t('settings.subtitle')}
        </p>
      </header>

      <section className='space-y-3' aria-label={t('settings.account')}>
        <SectionTitle>{t('settings.account')}</SectionTitle>
        <div className='rounded-2xl border border-outline-variant/20 bg-card p-4 shadow-ambient'>
          <div className='flex items-center gap-3'>
            <Avatar className='size-12 border border-primary/10'>
              <AvatarFallback className='bg-primary/10 font-label text-sm font-semibold text-primary'>
                AR
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0'>
              <p className='truncate font-label text-sm font-semibold text-foreground'>
                Abdul Rahman
              </p>
              <p className='mt-0.5 truncate font-body-md text-sm text-muted-foreground'>
                abdul@example.com
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='space-y-3' aria-label={t('settings.language')}>
        <SectionTitle>{t('settings.preferences')}</SectionTitle>
        <div className='overflow-hidden rounded-2xl border border-outline-variant/20 bg-card shadow-ambient'>
          <SettingsRow
            icon={Globe2Icon}
            label={t('settings.language')}
            value={
              language === 'id'
                ? t('settings.indonesian')
                : t('settings.english')
            }
            onClick={() => setLanguageSheetOpen(true)}
          />
          <div className='ml-16 border-t border-outline-variant/20' />
          <SettingsRow
            icon={PaletteIcon}
            label={t('settings.appearance')}
            value={t(`settings.${theme}`)}
            onClick={() => setAppearanceSheetOpen(true)}
          />
        </div>
      </section>

      <section className='space-y-3' aria-label={t('settings.dataSync')}>
        <SectionTitle>{t('settings.dataSync')}</SectionTitle>
        <div className='rounded-2xl border border-outline-variant/20 bg-card p-4 shadow-ambient'>
          <div className='flex items-start gap-3'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <CloudIcon className='size-5' aria-hidden />
            </span>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <p className='font-label text-sm font-semibold text-foreground'>
                  Google Drive
                </p>
                <span className='flex items-center gap-1 text-xs font-medium text-primary'>
                  <span
                    className='size-2 rounded-full bg-primary'
                    aria-hidden
                  />
                  {t('settings.connected')}
                </span>
              </div>
              <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
                {t('settings.storageDescription')}
              </p>
              <p className='mt-3 font-label text-xs font-medium text-muted-foreground'>
                {t('settings.lastSynced')}
              </p>
            </div>
          </div>
        </div>
        <div className='rounded-2xl border border-primary/10 bg-primary/5 p-4'>
          <div className='flex gap-3'>
            <ShieldCheckIcon
              className='mt-0.5 size-5 shrink-0 text-primary'
              aria-hidden
            />
            <div>
              <h3 className='font-label text-sm font-semibold text-foreground'>
                {t('settings.ownershipTitle')}
              </h3>
              <p className='mt-1.5 font-body-md text-sm leading-6 text-muted-foreground'>
                {t('settings.ownershipBody')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='space-y-3' aria-label={t('settings.about')}>
        <SectionTitle>{t('settings.about')}</SectionTitle>
        <div className='overflow-hidden rounded-2xl border border-outline-variant/20 bg-card shadow-ambient'>
          <div className='flex items-center gap-3 px-4 py-4'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <InfoIcon className='size-5' aria-hidden />
            </span>
            <span className='flex-1 font-label text-sm font-semibold text-foreground'>
              {t('settings.aboutGratitude')}
            </span>
          </div>
          <div className='ml-16 border-t border-outline-variant/20' />
          <div className='flex items-center justify-between px-4 py-4'>
            <span className='font-label text-sm font-semibold text-foreground'>
              {t('settings.version')}
            </span>
            <span className='font-body-md text-sm text-muted-foreground'>
              1.0.0
            </span>
          </div>
        </div>
      </section>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant='outline'
            className='h-12 w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive'
          >
            <LogOutIcon aria-hidden />
            {t('settings.signOut')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.signOutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.signOutDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className='bg-destructive text-white hover:bg-destructive/90'>
              {t('settings.signOut')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={languageSheetOpen} onOpenChange={setLanguageSheetOpen}>
        <SheetContent side='bottom' className='rounded-t-3xl px-4 pb-8'>
          <SheetHeader className='px-0 pt-2'>
            <SheetTitle className='font-h2 text-lg'>
              {t('settings.chooseLanguage')}
            </SheetTitle>
          </SheetHeader>
          <RadioGroup
            value={language}
            onValueChange={(value) => {
              if (isSupportedLanguage(value)) void setSelectedLanguage(value)
            }}
            aria-label={t('settings.chooseLanguage')}
          >
            <SelectorOption checked={language === 'id'} value='id'>
              Bahasa Indonesia
            </SelectorOption>
            <SelectorOption checked={language === 'en'} value='en'>
              English
            </SelectorOption>
          </RadioGroup>
        </SheetContent>
      </Sheet>

      <Sheet open={appearanceSheetOpen} onOpenChange={setAppearanceSheetOpen}>
        <SheetContent side='bottom' className='rounded-t-3xl px-4 pb-8'>
          <SheetHeader className='px-0 pt-2'>
            <SheetTitle className='font-h2 text-lg'>
              {t('settings.chooseAppearance')}
            </SheetTitle>
          </SheetHeader>
          <RadioGroup
            value={theme}
            onValueChange={(value) =>
              setSelectedAppearance(value as Appearance)
            }
            aria-label={t('settings.chooseAppearance')}
          >
            <SelectorOption checked={theme === 'system'} value='system'>
              <span className='flex items-center gap-2'>
                <MonitorIcon className='size-4' aria-hidden />
                {t('settings.system')}
              </span>
            </SelectorOption>
            <SelectorOption checked={theme === 'light'} value='light'>
              {t('settings.light')}
            </SelectorOption>
            <SelectorOption checked={theme === 'dark'} value='dark'>
              {t('settings.dark')}
            </SelectorOption>
          </RadioGroup>
        </SheetContent>
      </Sheet>
    </main>
  )
}
