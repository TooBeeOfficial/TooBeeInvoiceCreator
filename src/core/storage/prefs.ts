/* Where preferences are kept.

   In the desktop app they sit beside the library in the application's own
   data folder; in a browser tab they fall back to local storage so the dev
   server behaves the same way. Both go through the same defaults on the way
   in, so a file from an older build is never missing a field. */

import type { Preferences } from '@model/prefs'
import { defaultPreferences, withPreferenceDefaults } from '@core/factory/defaults'
import { bridge } from './desktop'

const WEB_KEY = 'invoicer.prefs.v1'

export async function loadPreferences (): Promise<Preferences> {
  const api = bridge()
  if (api) {
    try {
      return withPreferenceDefaults(await api.readPrefs())
    } catch {
      return defaultPreferences()
    }
  }
  try {
    return withPreferenceDefaults(JSON.parse(localStorage.getItem(WEB_KEY) ?? 'null'))
  } catch {
    return defaultPreferences()
  }
}

export async function savePreferences (prefs: Preferences): Promise<void> {
  const api = bridge()
  if (api) {
    await api.writePrefs(prefs)
    return
  }
  try {
    localStorage.setItem(WEB_KEY, JSON.stringify(prefs))
  } catch {
    /* Nothing to do: preferences are a convenience and the session carries on
       with what is in memory. */
  }
}
