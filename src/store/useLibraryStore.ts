/* The list of invoices.

   Holds the index and the one operation the list can perform on a file it is
   not currently editing: changing its status. Marking an invoice paid from
   the list rewrites the file where it sits, then updates the index — in that
   order, so the index is never claiming something the file does not say. */

import { create } from 'zustand'
import type { Library, LibraryEntry } from '@model/library'
import type { InvoiceDoc, InvoiceStatus } from '@model/invoice'
import { emptyLibrary } from '@model/library'
import { loadLibrary, saveLibrary, upsertEntry, removeEntry, entryFromDoc, markMissing } from '@core/storage/library'
import { parseDoc, serializeDoc } from '@core/storage/docFile'
import { bridge } from '@core/storage/desktop'
import { calcTotals } from '@core/totals/calcTotals'
import { reconcile } from '@core/status/status'
import { todayIso } from '@core/money/format'
import { usePrefsStore } from './usePrefsStore'

interface LibraryState {
  library: Library
  ready: boolean
  busy: boolean

  load: () => Promise<void>
  /** Re-checks that every indexed file is still where it was. */
  refresh: () => Promise<void>
  record: (doc: InvoiceDoc, filePath: string) => Promise<void>
  forget: (id: string) => Promise<void>
  setStatus: (entry: LibraryEntry, status: InvoiceStatus) => Promise<{ ok: boolean; error?: string }>
  /** Reads a document back off disk without opening it in the editor. */
  readDoc: (entry: LibraryEntry) => Promise<InvoiceDoc | null>
}

export const useLibraryStore = create<LibraryState>((set, get) => {
  const commit = async (library: Library) => {
    set({ library })
    await saveLibrary(library)
  }

  return {
    library: emptyLibrary(),
    ready: false,
    busy: false,

    load: async () => {
      const library = await loadLibrary()
      set({ library, ready: true })
      const checked = await markMissing(library)
      set({ library: checked })
    },

    refresh: async () => {
      set({ busy: true })
      const checked = await markMissing(get().library)
      set({ library: checked, busy: false })
    },

    record: async (doc, filePath) => {
      await commit(upsertEntry(get().library, entryFromDoc(doc, filePath)))
    },

    forget: async (id) => {
      await commit(removeEntry(get().library, id))
    },

    readDoc: async (entry) => {
      const api = bridge()
      if (!api) return null
      const result = await api.openDoc({ filePath: entry.filePath })
      if (!result.ok || !result.data) return null
      try {
        return parseDoc(result.data, usePrefsStore.getState().prefs)
      } catch {
        return null
      }
    },

    setStatus: async (entry, status) => {
      const api = bridge()
      if (!api) return { ok: false, error: 'Status can only be changed in the desktop app.' }

      const opened = await api.openDoc({ filePath: entry.filePath })
      if (!opened.ok || !opened.data) {
        return { ok: false, error: opened.missing ? 'That file is no longer where it was saved.' : (opened.error ?? 'The file could not be read.') }
      }

      let doc: InvoiceDoc
      try {
        doc = parseDoc(opened.data, usePrefsStore.getState().prefs)
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'The file could not be read.' }
      }

      /* Marking it paid dates it today, unless payments have been recorded
         against it — then they say when it was paid. Taking it back clears
         the date rather than leaving a paid date on an unpaid invoice. */
      const marked = { ...doc.meta, status, paidDate: status === 'paid' ? doc.meta.paidDate : '' }
      const settled = reconcile(marked, doc.paymentsReceived, calcTotals(doc).total)
      const updated: InvoiceDoc = {
        ...doc,
        meta: {
          ...marked,
          ...settled,
          paidDate: status === 'paid' ? (settled.paidDate || todayIso()) : settled.paidDate,
        },
      }

      const written = await api.writeDocPath({ filePath: entry.filePath, data: serializeDoc(updated) })
      if (!written.ok) return { ok: false, error: written.error ?? 'The file could not be written.' }

      await commit(upsertEntry(get().library, entryFromDoc(updated, entry.filePath)))
      return { ok: true }
    },
  }
})
