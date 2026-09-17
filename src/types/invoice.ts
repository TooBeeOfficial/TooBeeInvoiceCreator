/* The invoice document.

   This is the whole file format: what gets written to disk, what gets read
   back, and the only thing the preview, the PDF, the spreadsheet and the CSV
   are ever built from. Adding a field here means deciding, once, what it is
   called on disk — so anything printed has to earn a place in this shape. */

import type { Party } from './party'
import type { LineItem } from './lineItem'
import type { TaxLine, TaxMode } from './tax'
import type { Currency } from './money'
import type { InvoiceTheme } from './theme'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void'

/** What the list actually shows: 'overdue' is worked out, never stored. */
export type EffectiveStatus = InvoiceStatus | 'overdue'

export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'A5'
export type Orientation = 'portrait' | 'landscape'

/** How much of the document prints. A full VAT invoice against a receipt. */
export type DetailLevel = 'full' | 'simple'

export interface InvoiceMeta {
  number: string
  /** ISO yyyy-mm-dd throughout. Formatting for the page happens at the edge. */
  issueDate: string
  dueDate: string
  /** Printed as written: "Net 30", "Due on receipt", "50% on signing". */
  terms: string
  /** Days after issue that `dueDate` was derived from, when it was. */
  termsDays: number | null
  purchaseOrder: string
  reference: string
  /** Supply/delivery date, which a full VAT invoice needs when it differs. */
  supplyDate: string
  status: InvoiceStatus
  paidDate: string
}

export interface DocumentDiscount {
  type: 'none' | 'percent' | 'amount'
  value: number
  label: string
}

export interface PaymentDetails {
  /** Free text above the bank block: "Payable within 30 days by transfer." */
  instructions: string
  bankName: string
  accountName: string
  iban: string
  bic: string
  accountNumber: string
  sortCode: string
  routingNumber: string
  /** A pay link, printed as text so it survives being on paper. */
  link: string
  reference: string
  /* Print the SEPA payment code in the footer. On by default and quietly
     ignored unless there is an IBAN that passes its own checksum, so an
     invoice that has nothing to encode simply does not show one. */
  showQr: boolean
}

/* Money that has actually arrived.

   Kept apart from PaymentDetails above, which is how to pay rather than what
   was paid. One record per payment, so a deposit, a part-payment and a
   payment plan are all just several of these.

   The amount is always in the invoice's own currency. A payment that came in
   another one is recorded as what actually cleared, converted: the totals are
   integer minor units of a single currency, and a second currency in here
   would be adding figures that cannot be added. What the rate was is an
   accountant's line of its own, not a property of the payment. */
export interface PaymentRecord {
  id: string
  /** ISO yyyy-mm-dd, like every other date in the file. */
  date: string
  /** Minor units. Negative is a refund — the same arithmetic, the other way. */
  amount: number
  /** "Bank transfer", "Card", "Cash". Written as it will be read. */
  method: string
  /** What the payer quoted, which is how it is matched to a bank line. */
  reference: string
  note: string
}

export interface Branding {
  logoDataUrl: string
  logoName: string
}

export interface InvoiceSettings {
  templateId: string
  paper: PaperSize
  orientation: Orientation
  detail: DetailLevel
  /** Date and number formatting on the page, e.g. "en-GB". */
  locale: string
  taxMode: TaxMode
  /** In 'invoice' mode this governs everything; elsewhere it fills new lines. */
  defaultTax: TaxLine
  /** Unit prices already contain tax — normal retail practice in the EU. */
  pricesIncludeTax: boolean
  discount: DocumentDiscount
  /** Carriage, in major units, taxed at the default rate when taxable. */
  shipping: number
  shippingLabel: string
  shippingTaxable: boolean
  /** Column switches for the printed table. */
  showUnit: boolean
  showDiscountColumn: boolean
  showTaxColumn: boolean
  showLineNumbers: boolean
  /** Print a rounded grand total and show the adjustment as its own line. */
  roundTotal: boolean
}

export interface InvoiceDoc {
  /** Bumped only when the shape changes in a way that needs migrating. */
  version: 1
  id: string
  title: string
  meta: InvoiceMeta
  seller: Party
  buyer: Party
  currency: Currency
  settings: InvoiceSettings
  lines: LineItem[]
  payment: PaymentDetails
  /* Not `payments`: that is one letter from `payment` above, which means
     something else entirely, and not `receipts` either — this app prints
     receipts, so the word is already taken. */
  paymentsReceived: PaymentRecord[]
  /** Free note to the client, printed under the totals. */
  notes: string
  /** Terms and conditions, printed smaller at the foot. */
  terms: string
  branding: Branding
  theme: InvoiceTheme
  /** Set only once the user edits the template by hand in the code panel. */
  customHtml: string | null
  customCss: string | null
}

export const STATUS_LABELS: Record<EffectiveStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
}
