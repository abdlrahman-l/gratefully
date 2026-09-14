import { AboutSection } from './components/about-section'
import { AccountSection } from './components/account-section'
import { DataSyncSection } from './components/data-sync-section'
import { LanguageSection } from './components/language-section'
import { SettingsHeader } from './components/settings-header'
import { SignOutButton } from './components/sign-out-button'

export function SettingsContainer() {
  return (
    <main className='flex flex-col gap-7 px-4 pt-2 pb-28'>
      <SettingsHeader />
      <AccountSection />
      <LanguageSection />
      <DataSyncSection />
      <AboutSection />
      <SignOutButton />
    </main>
  )
}
