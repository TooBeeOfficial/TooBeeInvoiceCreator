/* Starting up.

   Preferences first, because everything else is built from them: a new
   invoice inherits its currency, its numbering and your address from there.
   Then the library index, the templates the user has saved, and finally the
   document that was open when the app last closed.

   Every step is allowed to fail quietly and carry on. A missing library or a
   template folder that cannot be read should not stop someone writing an
   invoice. */

import { useEffect, useState } from 'react'
import type { InvoiceTemplate } from '@model/template'
import { bridge } from '@core/storage/desktop'
import { parseDoc } from '@core/storage/docFile'
import { setUserTemplates } from '@templates/registry'
import { usePrefsStore } from '@store/usePrefsStore'
import { useLibraryStore } from '@store/useLibraryStore'
import { useDocStore } from '@store/useDocStore'
import { useUiStore } from '@store/useUiStore'

export function useBootstrap (): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const prefs = await usePrefsStore.getState().load()
      if (cancelled) return

      useUiStore.getState().adoptPanels(prefs.panels)

      await useLibraryStore.getState().load()
      if (cancelled) return

      const api = bridge()
      if (api) {
        try {
          const saved = await api.listTemplates()
          setUserTemplates((saved as InvoiceTemplate[]).filter((t) => t && t.id && t.html))
        } catch {
          /* The templates folder is unreadable; the built-in ones are enough. */
        }
      }

      /* A new document is created either way, so the editor always has
         something to show; the saved one replaces it if it can be read. */
      useDocStore.getState().start(prefs)

      if (prefs.restoreSession && prefs.lastFilePath && api) {
        const result = await api.openDoc({ filePath: prefs.lastFilePath })
        if (!cancelled && result.ok && result.data) {
          try {
            useDocStore.getState().adopt(parseDoc(result.data, prefs), result.filePath ?? null)
          } catch {
            useUiStore.getState().notify('The last invoice could not be reopened.', 'warning')
          }
        }
      }

      if (!cancelled) setReady(true)
    }

    /* Whatever happens, the window has to become usable. A failure here used
       to leave the app on "Opening…" for ever with nothing said — the worst
       possible outcome, because there is nothing to do about it and nothing
       to report. */
    void run().catch((error) => {
      if (cancelled) return
      setReady(true)
      useUiStore.getState().notify(
        error instanceof Error ? `Some settings could not be read: ${error.message}` : 'Some settings could not be read.',
        'warning',
      )
    })
    return () => { cancelled = true }
  }, [])

  return ready
}
