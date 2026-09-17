/* Preferences belong to the app, never to any one invoice.

   Your own business details, your client book, how your numbers are built and
   what a new invoice starts as: these outlive the document you happen to have
   open and do not travel inside an invoice file you send to someone. What
   describes a particular invoice — its paper, its tax mode, its palette —
   lives in the document instead, because it has to still be true when that
   file is opened on another machine a year from now. */

import type { Party } from './party'
import type { SavedItem } from './savedItem'
import type { SavedStyle } from './savedStyle'
import type { TaxMode } from './tax'
import type { PaperSize } from './invoice'

export type AppTheme = 'system' | 'light' | 'dark'

/* How the next invoice number is built.

   Numbers have to be unique and, in most jurisdictions, sequential with no
   gaps. The app proposes the next one and then gets out of the way: the
   number on a document is always editable, because the sequence someone
   already started in a spreadsheet is theirs, not ours. */
export interface NumberingScheme {
  prefix: string
  /** Inserts the issue year, e.g. INV-2026-0007. */
  includeYear: boolean
  /** Digits the counter is padded to: 4 gives 0007. */
  padding: number
  /** The counter for the number that will be proposed next. */
  next: number
  /** Start the counter again at 1 when the year turns. */
  resetYearly: boolean
  /** The year the counter is currently running in. */
  year: number
}

export interface Defaults {
  currencyCode: string
  paper: PaperSize
  templateId: string
  taxMode: TaxMode
  taxLabel: string
  taxRate: number
  pricesIncludeTax: boolean
  /** Days added to the issue date to propose a due date. 0 means on receipt. */
  termsDays: number
  terms: string
  notes: string
  paymentInstructions: string
  locale: string
}

/* How wide the editor's panes are.

   Furniture, not document: opening someone else's invoice must not rearrange
   your window. Kept in preferences so the arrangement survives a restart. */
export interface PanelWidths {
  /** The form column on the left of the editor. */
  form: number
  /** The design panel on the right. */
  inspector: number
}

export interface Preferences {
  version: 1
  appTheme: AppTheme
  /* The language of the window. Not the language of an invoice — each
     document carries its own, under settings.locale, because who you are
     billing decides that and not where you are sitting. */
  language: string
  /** Reopen the invoice that was on screen when the app last closed. */
  restoreSession: boolean
  /** The last document path, for that reopening. */
  lastFilePath: string | null
  seller: Party
  clients: Party[]
  /** The item catalogue: things you sell, kept so they need not be retyped. */
  items: SavedItem[]
  /** Named looks — colour, type and spacing together — for any invoice. */
  styles: SavedStyle[]
  numbering: NumberingScheme
  defaults: Defaults
  panels: PanelWidths
}
