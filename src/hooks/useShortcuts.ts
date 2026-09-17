/* The keyboard.

   The same commands the menus offer, on the keys every desktop app uses for
   them. Kept in one place so a shortcut and the button it duplicates can
   never drift apart — both call the same function — and so the list shown by
   F1 can be checked against something real.

   Two rules decide whether a key fires while someone is typing. A chord —
   anything with Ctrl — always fires, because it cannot be typed by accident
   into a field. A bare key never does. The one exception is undo: inside a
   text field the browser's own undo is the right one, since it puts back the
   letters rather than rewinding the whole document. */

import { useEffect } from 'react'
import { useDocStore } from '@store/useDocStore'
import { useUiStore } from '@store/useUiStore'
import type { PageId } from '@store/useUiStore'
import { newDocument, openDocument, saveDocument, exportDocument } from '@store/documentActions'
import { bridge } from '@core/storage/desktop'

/* Ctrl+1 through Ctrl+5, in the order the rail shows them. */
const PAGE_KEYS: PageId[] = ['invoices', 'editor', 'items', 'clients', 'company']

export function useShortcuts (): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const ctrl = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (key === 'f1') {
        event.preventDefault()
        useUiStore.getState().setShortcuts(true)
        return
      }

      if (!ctrl) return

      /* Ctrl+1…5 — straight to a section. */
      const pageIndex = Number(event.key) - 1
      if (!event.shiftKey && pageIndex >= 0 && pageIndex < PAGE_KEYS.length && event.key !== '0') {
        event.preventDefault()
        useUiStore.getState().go(PAGE_KEYS[pageIndex])
        return
      }

      switch (key) {
        /* ---------------------------------------------------------- files */
        case 's':
          event.preventDefault()
          void saveDocument({ saveAs: event.shiftKey })
          break
        case 'n':
          event.preventDefault()
          void newDocument()
          break
        case 'o':
          event.preventDefault()
          void openDocument()
          break

        /* -------------------------------------------------------- exports */
        case 'e':
          event.preventDefault()
          void exportDocument(event.shiftKey ? 'xlsx' : 'pdf')
          break
        case 'p':
          /* What a printing app's Ctrl+P should do: produce the PDF. */
          event.preventDefault()
          void exportDocument('pdf')
          break

        /* -------------------------------------------------------- editing */
        case 'z':
          if (isTyping(event.target)) return
          event.preventDefault()
          if (event.shiftKey) useDocStore.getState().redo()
          else useDocStore.getState().undo()
          break
        case 'y':
          if (isTyping(event.target)) return
          event.preventDefault()
          useDocStore.getState().redo()
          break
        case 'enter':
          /* Type a line, Ctrl+Enter, type the next one. Fires from inside the
             field being typed into, which is the whole point of it. */
          if (useUiStore.getState().page !== 'editor') return
          event.preventDefault()
          addLineAndFocusIt()
          break

        /* --------------------------------------------------------- window */
        case 'b':
          event.preventDefault()
          useUiStore.getState().toggleInspector()
          break
        case ',':
          event.preventDefault()
          useUiStore.getState().setSettings(true)
          break
        case 'f':
          event.preventDefault()
          focusSearch()
          break

        /* ----------------------------------------------------------- zoom

           Only reached in a browser tab. On the desktop the main process
           takes these first, so that Chromium's own page zoom — which would
           scale the whole interface rather than the sheet — never runs. */
        case '0':
          event.preventDefault()
          useUiStore.getState().setZoom(null)
          break
        case '=':
        case '+':
          event.preventDefault()
          useUiStore.getState().stepZoom(0.1)
          break
        case '-':
        case '_':
          event.preventDefault()
          useUiStore.getState().stepZoom(-0.1)
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* The desktop menu and the intercepted keys arrive down the same channel. */
  useEffect(() => {
    const api = bridge()
    if (!api) return
    return api.onMenu((action) => {
      const ui = useUiStore.getState()
      switch (action) {
        case 'new': void newDocument(); break
        case 'open': void openDocument(); break
        case 'save': void saveDocument(); break
        case 'saveAs': void saveDocument({ saveAs: true }); break
        case 'exportPdf': void exportDocument('pdf'); break
        case 'exportXlsx': void exportDocument('xlsx'); break
        case 'exportCsv': void exportDocument('csv'); break
        case 'zoomIn': ui.stepZoom(0.1); break
        case 'zoomOut': ui.stepZoom(-0.1); break
        case 'zoomFit': ui.setZoom(null); break
        case 'shortcuts': ui.setShortcuts(true); break
        case 'settings': ui.setSettings(true); break
        default: break
      }
    })
  }, [])
}

/* Adds a line and puts the cursor in it.

   A shortcut that adds a row you then have to reach for with the mouse has
   only done half the job. */
function addLineAndFocusIt (): void {
  useDocStore.getState().addLine()
  requestAnimationFrame(() => {
    const rows = document.querySelectorAll<HTMLInputElement>('input[aria-label^="Description, line"]')
    rows[rows.length - 1]?.focus()
  })
}

/* Puts the cursor in whatever the current page searches.

   Found by attribute rather than by threading a ref through the store: the
   shortcut does not care which page is showing, only that something on it
   accepts a search, and a page without one simply has nothing to focus. */
function focusSearch (): void {
  const field = document.querySelector<HTMLInputElement>('[data-search]')
  if (!field) return
  field.focus()
  field.select()
}

function isTyping (target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}
