/* Turning mapped rows into things the app understands.

   Two destinations, from the same rows and the same mapping: lines on the
   invoice in front of you, or entries in the item catalogue. They differ
   only in what a quantity means — an invoice line has one, a catalogue entry
   does not, because how many you sell is a fact about a sale and not about
   the thing.

   Rows that produce nothing usable are counted and reported rather than
   dropped in silence: an import that says "48 lines" when the file had 50 is
   telling you something you need to know. */

import type { LineItem } from '@model/lineItem'
import type { SavedItem } from '@model/savedItem'
import type { TaxLine } from '@model/tax'
import { makeId } from '@core/ids'
import { parseNumber, parseDuration } from './readTable'
import type { Mapping } from './columns'

export interface MapOptions {
  /** Used for any row that carries no rate of its own. */
  defaultTax: TaxLine
  /** 'invoice' mode means lines carry no tax of their own at all. */
  perLineTax: boolean
}

export interface MapResult<T> {
  items: T[]
  /** Rows that had nothing in the description column. */
  skipped: number
  /** Things worth saying once, not once per row. */
  notes: string[]
}

const cell = (row: string[], index: number | undefined): string =>
  index === undefined ? '' : (row[index] ?? '').trim()

/* A tax rate, however it was written.

   Spreadsheets hold percentages as either 20 or 0.2 depending on whether the
   cell was formatted as a percentage. Anything at or below 1 is read as a
   fraction — which makes a genuine 0.5% rate ambiguous, so the "%" sign wins
   when it is there. */
function readRate (raw: string): number | null {
  if (!raw) return null
  const explicit = raw.includes('%')
  const value = parseNumber(raw)
  if (value === null) return null
  if (explicit) return value
  return value > 0 && value <= 1 ? value * 100 : value
}

export function toLineItems (rows: string[][], mapping: Mapping, options: MapOptions): MapResult<LineItem> {
  const items: LineItem[] = []
  const notes: string[] = []
  let skipped = 0
  let derivedPrices = 0

  for (const row of rows) {
    const description = cell(row, mapping.description)
    if (!description) { skipped += 1; continue }

    /* A duration reader rather than a plain number: a time tracker writes
       01:30:00 where the invoice wants 1.5 hours. */
    const quantity = parseDuration(cell(row, mapping.quantity)) ?? 1
    const priceCell = parseNumber(cell(row, mapping.unitPrice))
    const totalCell = parseNumber(cell(row, mapping.amount))

    /* With a line total but no unit price, the price is the total divided by
       the quantity — which is what the column meant. */
    let unitPrice = priceCell ?? 0
    if (priceCell === null && totalCell !== null && quantity) {
      unitPrice = Math.round((totalCell / quantity) * 10000) / 10000
      derivedPrices += 1
    } else if (priceCell === null && totalCell !== null) {
      unitPrice = totalCell
    }

    const rate = readRate(cell(row, mapping.taxRate))
    const taxes: TaxLine[] = !options.perLineTax
      ? []
      : rate !== null
        ? [{ id: makeId('tax'), label: options.defaultTax.label || 'Tax', rate }]
        : [{ ...options.defaultTax, id: makeId('tax') }]

    items.push({
      id: makeId('line'),
      description,
      details: cell(row, mapping.details),
      quantity,
      unit: cell(row, mapping.unit),
      unitPrice,
      discount: null,
      taxes,
    })
  }

  if (derivedPrices > 0) {
    notes.push(`${derivedPrices} ${derivedPrices === 1 ? 'row had' : 'rows had'} a line total but no unit price, so the price was worked out from the quantity.`)
  }

  return { items, skipped, notes }
}

export function toSavedItems (rows: string[][], mapping: Mapping): MapResult<SavedItem> {
  const items: SavedItem[] = []
  let skipped = 0
  const now = new Date().toISOString()

  for (const row of rows) {
    const description = cell(row, mapping.description)
    if (!description) { skipped += 1; continue }

    const priceCell = parseNumber(cell(row, mapping.unitPrice))
    const totalCell = parseNumber(cell(row, mapping.amount))
    const quantity = parseDuration(cell(row, mapping.quantity))

    /* The catalogue wants the price of one. A price list usually says so
       outright; a past invoice says it only as a total over a quantity. */
    let unitPrice = priceCell ?? 0
    if (priceCell === null && totalCell !== null) {
      unitPrice = quantity && quantity !== 0
        ? Math.round((totalCell / quantity) * 10000) / 10000
        : totalCell
    }

    items.push({
      id: makeId('item'),
      description,
      details: cell(row, mapping.details),
      unit: cell(row, mapping.unit),
      unitPrice,
      taxRate: readRate(cell(row, mapping.taxRate)),
      taxLabel: '',
      category: cell(row, mapping.category),
      useCount: 0,
      updatedAt: now,
    })
  }

  return { items, skipped, notes: [] }
}
