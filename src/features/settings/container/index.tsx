import { useState } from 'react'
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
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'
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

type Language = 'id' | 'en'
type Appearance = 'system' | 'light' | 'dark'

const translations = {
  id: {
    about: 'Tentang',
    aboutGratitude: 'Tentang Gratitude',
    account: 'Akun',
    appearance: 'Tampilan',
    cancel: 'Batal',
    chooseAppearance: 'Pilih Tampilan',
    chooseLanguage: 'Pilih Bahasa',
    connected: 'Terhubung',
    dataOwnershipBody:
      'Kami tidak menyimpan catatan syukurmu di database aplikasi. Data disimpan di Google Drive milikmu.',
    dataOwnershipTitle: 'Datamu tetap milikmu',
    dataSync: 'Data & Sinkronisasi',
    language: 'Bahasa',
    lastSynced: 'Sinkronisasi terakhir: Baru saja',
    settings: 'Pengaturan',
    settingsSubtitle: 'Atur preferensi dan akunmu.',
    signOut: 'Keluar',
    signOutDescription:
      'Kamu perlu masuk kembali untuk mengakses catatan syukurmu.',
    signOutTitle: 'Keluar dari akun?',
    storageDescription:
      'Catatan syukurmu disimpan secara pribadi di Google Drive milikmu.',
    version: 'Versi',
    appearanceOptions: {
      system: 'Sistem',
      light: 'Terang',
      dark: 'Gelap',
    },
  },
  en: {
    about: 'About',
    aboutGratitude: 'About Gratitude',
    account: 'Account',
    appearance: 'Appearance',
    cancel: 'Cancel',
    chooseAppearance: 'Choose Appearance',
    chooseLanguage: 'Choose Language',
    connected: 'Connected',
    dataOwnershipBody:
      'We do not store your gratitude entries in an application database. Your data is stored in your Google Drive.',
    dataOwnershipTitle: 'Your data stays yours',
    dataSync: 'Data & Sync',
    language: 'Language',
    lastSynced: 'Last synced: Just now',
    settings: 'Settings',
    settingsSubtitle: 'Manage your preferences and account.',
    signOut: 'Sign Out',
    signOutDescription:
      'You will need to sign in again to access your gratitude entries.',
    signOutTitle: 'Sign out of your account?',
    storageDescription:
      'Your gratitude entries are privately stored in your Google Drive.',
    version: 'Version',
    appearanceOptions: {
      system: 'System',
      light: 'Light',
      dark: 'Dark',
    },
  },
} as const

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
      <ChevronRightIcon className='size-5 shrink-0 text-muted-foreground' aria-hidden />
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
      <span className='flex-1 font-label text-sm font-semibold'>{children}</span>
      {checked && <CheckIcon className='size-5' aria-hidden />}
    </label>
  )
}

export function SettingsContainer() {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState<Language>('id')
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false)
  const [appearanceSheetOpen, setAppearanceSheetOpen] = useState(false)
  const copy = translations[language]

  const setSelectedLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
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
          {copy.settings}
        </h1>
        <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
          {copy.settingsSubtitle}
        </p>
      </header>

      <section className='space-y-3' aria-label={copy.account}>
        <SectionTitle>{copy.account}</SectionTitle>
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

      <section className='space-y-3' aria-label={copy.language}>
        <SectionTitle>{language === 'id' ? 'Preferensi' : 'Preferences'}</SectionTitle>
        <div className='overflow-hidden rounded-2xl border border-outline-variant/20 bg-card shadow-ambient'>
          <SettingsRow
            icon={Globe2Icon}
            label={copy.language}
            value={language === 'id' ? 'Bahasa Indonesia' : 'English'}
            onClick={() => setLanguageSheetOpen(true)}
          />
          <div className='ml-16 border-t border-outline-variant/20' />
          <SettingsRow
            icon={PaletteIcon}
            label={copy.appearance}
            value={copy.appearanceOptions[theme]}
            onClick={() => setAppearanceSheetOpen(true)}
          />
        </div>
      </section>

      <section className='space-y-3' aria-label={copy.dataSync}>
        <SectionTitle>{copy.dataSync}</SectionTitle>
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
                  <span className='size-2 rounded-full bg-primary' aria-hidden />
                  {copy.connected}
                </span>
              </div>
              <p className='mt-2 font-body-md text-sm leading-6 text-muted-foreground'>
                {copy.storageDescription}
              </p>
              <p className='mt-3 font-label text-xs font-medium text-muted-foreground'>
                {copy.lastSynced}
              </p>
            </div>
          </div>
        </div>
        <div className='rounded-2xl border border-primary/10 bg-primary/5 p-4'>
          <div className='flex gap-3'>
            <ShieldCheckIcon className='mt-0.5 size-5 shrink-0 text-primary' aria-hidden />
            <div>
              <h3 className='font-label text-sm font-semibold text-foreground'>
                {copy.dataOwnershipTitle}
              </h3>
              <p className='mt-1.5 font-body-md text-sm leading-6 text-muted-foreground'>
                {copy.dataOwnershipBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='space-y-3' aria-label={copy.about}>
        <SectionTitle>{copy.about}</SectionTitle>
        <div className='overflow-hidden rounded-2xl border border-outline-variant/20 bg-card shadow-ambient'>
          <div className='flex items-center gap-3 px-4 py-4'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <InfoIcon className='size-5' aria-hidden />
            </span>
            <span className='flex-1 font-label text-sm font-semibold text-foreground'>
              {copy.aboutGratitude}
            </span>
          </div>
          <div className='ml-16 border-t border-outline-variant/20' />
          <div className='flex items-center justify-between px-4 py-4'>
            <span className='font-label text-sm font-semibold text-foreground'>
              {copy.version}
            </span>
            <span className='font-body-md text-sm text-muted-foreground'>1.0.0</span>
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
            {copy.signOut}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.signOutTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.signOutDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
            <AlertDialogAction className='bg-destructive text-white hover:bg-destructive/90'>
              {copy.signOut}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={languageSheetOpen} onOpenChange={setLanguageSheetOpen}>
        <SheetContent side='bottom' className='rounded-t-3xl px-4 pb-8'>
          <SheetHeader className='px-0 pt-2'>
            <SheetTitle className='font-h2 text-lg'>{copy.chooseLanguage}</SheetTitle>
          </SheetHeader>
          <RadioGroup
            value={language}
            onValueChange={(value) => setSelectedLanguage(value as Language)}
            aria-label={copy.chooseLanguage}
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
              {copy.chooseAppearance}
            </SheetTitle>
          </SheetHeader>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setSelectedAppearance(value as Appearance)}
            aria-label={copy.chooseAppearance}
          >
            <SelectorOption checked={theme === 'system'} value='system'>
              <span className='flex items-center gap-2'>
                <MonitorIcon className='size-4' aria-hidden />
                {copy.appearanceOptions.system}
              </span>
            </SelectorOption>
            <SelectorOption checked={theme === 'light'} value='light'>
              {copy.appearanceOptions.light}
            </SelectorOption>
            <SelectorOption checked={theme === 'dark'} value='dark'>
              {copy.appearanceOptions.dark}
            </SelectorOption>
          </RadioGroup>
        </SheetContent>
      </Sheet>
    </main>
  )
}
