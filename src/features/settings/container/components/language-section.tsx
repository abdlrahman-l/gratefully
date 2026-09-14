import { useState } from 'react'
import {
  changeLanguage,
  getCurrentLanguage,
  isSupportedLanguage,
  type SupportedLanguage,
} from '@/i18n'
import { Globe2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RadioGroup } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  SectionTitle,
  SelectorOption,
  SettingsRow,
} from './settings-primitives'

type Language = SupportedLanguage

export function LanguageSection() {
  const { t } = useTranslation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const language = getCurrentLanguage()

  const selectLanguage = async (nextLanguage: Language) => {
    await changeLanguage(nextLanguage)
    setSheetOpen(false)
  }

  return (
    <section className='space-y-3' aria-label={t('settings.language')}>
      <SectionTitle>{t('settings.preferences')}</SectionTitle>
      <div className='overflow-hidden rounded-2xl border border-outline-variant/20 bg-card shadow-ambient'>
        <SettingsRow
          icon={Globe2Icon}
          label={t('settings.language')}
          value={
            language === 'id' ? t('settings.indonesian') : t('settings.english')
          }
          onClick={() => setSheetOpen(true)}
        />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side='bottom' className='rounded-t-3xl px-4 pb-8'>
          <SheetHeader className='px-0 pt-2'>
            <SheetTitle className='font-h2 text-lg'>
              {t('settings.chooseLanguage')}
            </SheetTitle>
          </SheetHeader>
          <RadioGroup
            value={language}
            onValueChange={(value) => {
              if (isSupportedLanguage(value)) void selectLanguage(value)
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
    </section>
  )
}
