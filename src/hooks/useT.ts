/* The app's own words.

   Reads the language from preferences and hands back that dictionary's `app`
   section. Components pull what they need off it — `t.nav.invoices` — rather
   than calling a lookup with a string key, so a phrase that does not exist is
   a build error and a renamed one cannot be missed anywhere.

   This is the interface only. What a template prints is the document's
   language, not this one, and comes from `documentLabels` at the point the
   page is built. */

import { useMemo } from 'react'
import type { AppStrings } from '@core/i18n'
import { appStrings } from '@core/i18n'
import { usePrefsStore } from '@store/usePrefsStore'

export function useT (): AppStrings {
  const language = usePrefsStore((s) => s.prefs.language)
  return useMemo(() => appStrings(language), [language])
}
