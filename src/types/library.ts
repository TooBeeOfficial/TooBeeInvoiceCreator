/* The library index.

   Invoices live in files the user chose the location of. This index is the
   app's memory of where those files are and what was last read from them, so
   the list can be drawn without opening a dozen documents. It is a cache: if
   an entry and a file ever disagree, the file wins, and an entry whose file
   has gone is shown as missing rather than quietly dropped. */

import type { InvoiceStatus } from './invoice'

export interface LibraryEntry {
  /** The document id, stable across renames of the file. */
  id: string
  filePath: string
  number: string
  buyerName: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  paidDate: string
  /** Grand total in minor units, with the code it was totalled in. */
  total: number
  /* How much of that has been paid.

     Optional on purpose, and it means what its absence says: an index
     written before payments existed does not know. Reading that as zero
     would have every invoice already settled claim nothing had been paid
     against it, which is worse than saying nothing at all. */
  paid?: number
  currencyCode: string
  currencyDecimals: number
  lineCount: number
  /** ISO timestamp of the last time the app wrote this file. */
  updatedAt: string
  /** Set when the file could not be found where the index says it is. */
  missing?: boolean
}

export interface Library {
  version: 1
  entries: LibraryEntry[]
}

export const emptyLibrary = (): Library => ({ version: 1, entries: [] })
