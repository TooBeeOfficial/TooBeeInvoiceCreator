/* Looking a translation up.

   Two entry points, because the app has two languages running at once: the
   one you work in and the one the invoice is written in. Neither knows about
   the other, and an English-speaking user billing a client in Warsaw gets an
   English window and a Polish invoice.

   Nothing here throws and nothing returns blank. A locale naming a language
   the app does not have falls back to English, which is a worse invoice than
   a translated one but still a complete one. */

import type { AppStrings, Dictionary, DocumentLabels } from './types'
import { languageOf } from './locales'
import en from './dictionaries/en'
import de from './dictionaries/de'
import fr from './dictionaries/fr'
import es from './dictionaries/es'
import it from './dictionaries/it'
import nl from './dictionaries/nl'
import pl from './dictionaries/pl'
import tr from './dictionaries/tr'
import el from './dictionaries/el'
import pt from './dictionaries/pt'
import sv from './dictionaries/sv'
import ru from './dictionaries/ru'
import ja from './dictionaries/ja'
import zh from './dictionaries/zh'

const DICTIONARIES: Record<string, Dictionary> = {
  en, tr, el, it, es, de, fr, nl, pt, sv, pl, ru, ja, zh,
}

export const FALLBACK: Dictionary = en

export function dictionaryFor (locale: string | null | undefined): Dictionary {
  return DICTIONARIES[languageOf(locale)] ?? FALLBACK
}

/** The words printed on the invoice, in the document's own language. */
export const documentLabels = (locale: string | null | undefined): DocumentLabels =>
  dictionaryFor(locale).document

/** The words in the window, in the language the user chose. */
export const appStrings = (language: string | null | undefined): AppStrings =>
  dictionaryFor(language).app

export type { AppStrings, Dictionary, DocumentLabels } from './types'
export { LOCALES, APP_LANGUAGES, DEFAULT_LOCALE, languageOf, localeOption } from './locales'
export type { LocaleOption } from './locales'
