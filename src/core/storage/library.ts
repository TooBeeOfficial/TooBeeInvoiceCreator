/* The index of invoices the app knows about.

   Invoices are files wherever the user chose to put them, so the list has to
   be told they exist. An entry is added the first time a document is saved or
   opened and refreshed every time it is written again. Nothing here is
   authoritative: an entry is a description of a file, and when the two
   disagree the file is right. */

import type { Library, LibraryEntry } from '@model/library'
import type { InvoiceDoc } from '@model/invoice'
import { emptyLibrary } from '@model/library'
import { calcTotals } from '@core/totals/calcTotals'
import { bridge } from './desktop'

const WEB_KEY = 'invoicer.library.v1'

export async function loadLibrary (): Promise<Library> {
  const api = bridge()
  if (api) {
    try {
      return normalize(await api.readLibrary())
    } catch {
      /* The index is a cache. If it cannot be read the invoices themselves
         are untouched, and an empty list the user can open files into is a
         great deal better than an app that will not start. */
      return emptyLibrary()
    }
  }
  try {
    return normalize(JSON.parse(localStorage.getItem(WEB_KEY) ?? 'null'))
  } catch {
    return emptyLibrary()
  }
}

export async function saveLibrary (library: Library): Promise<void> {
  const api = bridge()
  if (api) {
    await api.writeLibrary(library)
    return
  }
  try {
    localStorage.setItem(WEB_KEY, JSON.stringify(library))
  } catch {
    /* Private mode, or the quota is full. The list is a convenience, not the
       data — the invoice files themselves are untouched either way. */
  }
}

function normalize (raw: unknown): Library {
  if (!raw || typeof raw !== 'object') return emptyLibrary()
  const input = raw as Partial<Library>
  if (!Array.isArray(input.entries)) return emptyLibrary()
  return {
    version: 1,
    entries: input.entries.filter((e) => e && typeof e === 'object' && typeof e.filePath === 'string'),
  }
}

/** What the list should show for a document that has just been written. */
export function entryFromDoc (doc: InvoiceDoc, filePath: string): LibraryEntry {
  const totals = calcTotals(doc)
  return {
    id: doc.id,
    filePath,
    number: doc.meta.number,
    buyerName: doc.buyer.name,
    issueDate: doc.meta.issueDate,
    dueDate: doc.meta.dueDate,
    status: doc.meta.status,
    paidDate: doc.meta.paidDate,
    total: totals.total,
    paid: totals.paid,
    currencyCode: doc.currency.code,
    currencyDecimals: doc.currency.decimals,
    lineCount: doc.lines.filter((l) => l.description.trim()).length,
    updatedAt: new Date().toISOString(),
  }
}

/* Entries are matched on the document id first and the path second.

   Saving the same invoice to a new location should move its entry, not
   create a second one — and a file replaced by a different invoice at the
   same path should take that path over. */
export function upsertEntry (library: Library, entry: LibraryEntry): Library {
  const entries = library.entries.filter((e) => e.id !== entry.id && e.filePath !== entry.filePath)
  return { version: 1, entries: [entry, ...entries] }
}

export function removeEntry (library: Library, id: string): Library {
  return { version: 1, entries: library.entries.filter((e) => e.id !== id) }
}

/* Checks each file is still where the index says.

   Files get moved and deleted outside the app, and a list that quietly drops
   them would be lying about what the user has. They are marked instead, so
   the row can say the file is missing and offer to forget it. */
export async function markMissing (library: Library): Promise<Library> {
  const api = bridge()
  if (!api) return library
  const entries = await Promise.all(
    library.entries.map(async (entry) => {
      const exists = await api.docExists(entry.filePath)
      return exists ? { ...entry, missing: false } : { ...entry, missing: true }
    }),
  )
  return { version: 1, entries }
}
