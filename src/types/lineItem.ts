/* A line on the invoice.

   Description, quantity, unit price and the taxes that apply to it are
   separate fields — never one block of typed text. The line total is not
   stored at all: it is worked out from the other three every time, so a file
   can never disagree with itself about what it adds up to. */

import type { TaxLine } from './tax'

export interface LineDiscount {
  type: 'percent' | 'amount'
  value: number
}

export interface LineItem {
  id: string
  description: string
  /** An optional second line under the description, set smaller on the page. */
  details: string
  quantity: number
  /** "hour", "day", "item", "word" — printed after the quantity when shown. */
  unit: string
  /** Major units, up to four decimals: a rate may be 0.1250 per word. */
  unitPrice: number
  discount: LineDiscount | null
  /** Empty means this line is not taxed. */
  taxes: TaxLine[]
}

export const UNITS: ReadonlyArray<string> = [
  '', 'hour', 'day', 'week', 'month', 'item', 'unit', 'word', 'km', 'mile', 'kg', 'licence',
]

export const emptyLine = (id: string, taxes: TaxLine[] = []): LineItem => ({
  id,
  description: '',
  details: '',
  quantity: 1,
  unit: '',
  unitPrice: 0,
  discount: null,
  taxes,
})
