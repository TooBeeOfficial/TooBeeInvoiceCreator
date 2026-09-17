/* A thing you sell, kept so it need not be typed again.

   The item catalogue is to line items what the client book is to the "Bill
   to" block, and it behaves the same way: putting an item on an invoice
   copies it in. Correcting a price in the catalogue next year must not
   silently rewrite an invoice you sent last spring.

   A saved item holds no tax of its own unless it genuinely has one. Most
   work is taxed at whatever rate the invoice is charging; a book or a
   postage stamp is zero-rated wherever it appears, and that belongs to the
   item rather than to the invoice. `taxRate: null` means "whatever this
   invoice charges". */

export interface SavedItem {
  id: string
  description: string
  details: string
  unit: string
  unitPrice: number
  /** null follows the invoice's own rate; a number overrides it. */
  taxRate: number | null
  taxLabel: string
  /** Free grouping — "Design", "Print", "Expenses". Optional. */
  category: string
  /** How often it has been used, so the ones you reach for surface first. */
  useCount: number
  updatedAt: string
}

export const emptySavedItem = (id: string): SavedItem => ({
  id,
  description: '',
  details: '',
  unit: '',
  unitPrice: 0,
  taxRate: null,
  taxLabel: '',
  category: '',
  useCount: 0,
  updatedAt: new Date().toISOString(),
})
