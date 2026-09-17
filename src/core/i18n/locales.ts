/* The languages the app speaks.

   A locale is a language plus a region — "de-AT" and "de-DE" read the same
   German but write dates and figures differently, and an invoice has to get
   both right. So the code carries the region and drives Intl, while the
   `language` picks the dictionary.

   Names are given in the language itself. Someone looking for their own
   language is looking for the word they call it by, not the English for it. */

export interface LocaleOption {
  /** BCP 47, used for dates, numbers and currency. */
  code: string
  /** Which dictionary this locale reads from. */
  language: string
  /** The language as its own speakers write it. */
  endonym: string
  /** For a list sorted or searched in English. */
  english: string
}

export const LOCALES: ReadonlyArray<LocaleOption> = [
  { code: 'en-GB', language: 'en', endonym: 'English (United Kingdom)', english: 'English (UK)' },
  { code: 'en-US', language: 'en', endonym: 'English (United States)', english: 'English (US)' },
  { code: 'en-IE', language: 'en', endonym: 'English (Ireland)', english: 'English (Ireland)' },
  { code: 'en-AU', language: 'en', endonym: 'English (Australia)', english: 'English (Australia)' },
  { code: 'de-DE', language: 'de', endonym: 'Deutsch (Deutschland)', english: 'German (Germany)' },
  { code: 'de-AT', language: 'de', endonym: 'Deutsch (Österreich)', english: 'German (Austria)' },
  { code: 'de-CH', language: 'de', endonym: 'Deutsch (Schweiz)', english: 'German (Switzerland)' },
  { code: 'fr-FR', language: 'fr', endonym: 'Français (France)', english: 'French (France)' },
  { code: 'fr-BE', language: 'fr', endonym: 'Français (Belgique)', english: 'French (Belgium)' },
  { code: 'es-ES', language: 'es', endonym: 'Español (España)', english: 'Spanish (Spain)' },
  { code: 'it-IT', language: 'it', endonym: 'Italiano (Italia)', english: 'Italian (Italy)' },
  { code: 'nl-NL', language: 'nl', endonym: 'Nederlands (Nederland)', english: 'Dutch (Netherlands)' },
  { code: 'nl-BE', language: 'nl', endonym: 'Nederlands (België)', english: 'Dutch (Belgium)' },
  { code: 'pl-PL', language: 'pl', endonym: 'Polski (Polska)', english: 'Polish (Poland)' },
  { code: 'pt-PT', language: 'pt', endonym: 'Português (Portugal)', english: 'Portuguese (Portugal)' },
  { code: 'pt-BR', language: 'pt', endonym: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
  { code: 'sv-SE', language: 'sv', endonym: 'Svenska (Sverige)', english: 'Swedish (Sweden)' },
  { code: 'tr-TR', language: 'tr', endonym: 'Türkçe (Türkiye)', english: 'Turkish (Türkiye)' },
  { code: 'el-GR', language: 'el', endonym: 'Ελληνικά (Ελλάδα)', english: 'Greek (Greece)' },
  { code: 'ru-RU', language: 'ru', endonym: 'Русский (Россия)', english: 'Russian (Russia)' },
  { code: 'ja-JP', language: 'ja', endonym: '日本語 (日本)', english: 'Japanese (Japan)' },
  { code: 'zh-CN', language: 'zh', endonym: '中文 (中国)', english: 'Chinese (China)' },
  /* No zh-TW here on purpose. The dictionary is Simplified, and offering a
     Traditional locale that then prints 发票 rather than 發票 would promise
     something this app does not have. It belongs back on the list the day
     there is a Traditional dictionary to go with it. */
]

export const DEFAULT_LOCALE = 'en-GB'

/* The languages themselves, for the app's own interface.

   Listed in the order the Calender Maker lists them, so someone who uses both
   finds their language in the same place in each. */
export const APP_LANGUAGES: ReadonlyArray<{ language: string; endonym: string; english: string }> = [
  { language: 'en', endonym: 'English', english: 'English' },
  { language: 'tr', endonym: 'Türkçe', english: 'Turkish' },
  { language: 'el', endonym: 'Ελληνικά', english: 'Greek' },
  { language: 'it', endonym: 'Italiano', english: 'Italian' },
  { language: 'es', endonym: 'Español', english: 'Spanish' },
  { language: 'de', endonym: 'Deutsch', english: 'German' },
  { language: 'fr', endonym: 'Français', english: 'French' },
  { language: 'nl', endonym: 'Nederlands', english: 'Dutch' },
  { language: 'pt', endonym: 'Português', english: 'Portuguese' },
  { language: 'sv', endonym: 'Svenska', english: 'Swedish' },
  { language: 'pl', endonym: 'Polski', english: 'Polish' },
  { language: 'ru', endonym: 'Русский', english: 'Russian' },
  { language: 'ja', endonym: '日本語', english: 'Japanese' },
  { language: 'zh', endonym: '中文', english: 'Chinese' },
]

/* The language part of a locale, whatever it was given.

   Accepts "de", "de-DE", "de_DE" and an empty string, because all four turn
   up: from preferences, from a document written by an older build, and from
   whatever the operating system reports. */
export function languageOf (locale: string | null | undefined): string {
  const code = String(locale ?? '').trim().replace('_', '-')
  if (!code) return 'en'
  const language = code.split('-')[0].toLowerCase()
  return APP_LANGUAGES.some((l) => l.language === language) ? language : 'en'
}

export const localeOption = (code: string): LocaleOption | undefined =>
  LOCALES.find((l) => l.code === code)
