/* Light or dark, as the window rather than as the page.

   Writes the chosen theme onto the root element, where the tokens in
   tokens.css pick it up. "System" means following the operating system and
   keeping up with it — someone whose machine turns dark at sunset should not
   have to come back and tell the app. */

import { useEffect } from 'react'
import type { AppTheme } from '@model/prefs'

export function useAppTheme (theme: AppTheme): void {
  useEffect(() => {
    const root = document.documentElement

    const apply = (dark: boolean) => {
      root.dataset.theme = dark ? 'dark' : 'light'
    }

    if (theme !== 'system') {
      apply(theme === 'dark')
      return
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    apply(query.matches)
    const listener = (event: MediaQueryListEvent) => apply(event.matches)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [theme])
}
