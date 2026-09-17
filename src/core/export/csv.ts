/* CSV — the data dump.

   Not a picture of an invoice. This is the flat file you feed to QuickBooks
   or Xero, or open in a spreadsheet to answer "what have I billed this year
   and what is still unpaid". So: one row per line item, with the invoice's
   own fields repeated on every row, and every figure written as a plain
   decimal number with a dot — no currency symbols, no thousands separators,
   nothing that stops a pivot table from adding it up.

   Dates go out as ISO, for the same reason: a spreadsheet in another country
   should not have to guess what 03/04/2026 means. */

import type { InvoiceDoc } from '@model/invoice'
import { calcTotals } from '@core/totals/calcTotals'
import { fromMinor } from '@core/money/money'
import { docStatus } from '@core/status/status'

export const CSV_COLUMNS = [
  'invoice_number',
  'status',
  'issue_date',
  'due_date',
  'paid_date',
  'currency',
  'seller_name',
  'seller_tax_id',
  'seller_country',
  'buyer_name',
  'buyer_email',
  'buyer_tax_id',
  'buyer_country',
  'purchase_order',
  'reference',
  'line_number',
  'description',
  'details',
  'quantity',
  'unit',
  'unit_price',
  'line_discount',
  'line_net',
  'tax_label',
  'tax_rate',
  'line_tax',
  'line_gross',
  'invoice_subtotal',
  'invoice_discount',
  'invoice_shipping',
  'invoice_tax_total',
  'invoice_total',
  'invoice_paid',
  'invoice_amount_due',
  'prices_include_tax',
  'template',
] as const

/** A cell, quoted only when it has to be. */
function cell (value: string | number | boolean): string {
  const text = typeof value === 'string' ? value : String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

const firstTaxId = (party: InvoiceDoc['seller']): string =>
  party.taxIds.find((t) => t.value.trim())?.value.trim() ?? ''

/** A decimal string a spreadsheet will read as a number. */
const decimal = (minor: number, decimals: number): string => fromMinor(minor, decimals).toFixed(decimals)

export function invoiceRows (doc: InvoiceDoc): string[][] {
  const totals = calcTotals(doc)
  const d = doc.currency.decimals
  const status = docStatus(doc)

  const shared = [
    doc.meta.number,
    status,
    doc.meta.issueDate,
    doc.meta.dueDate,
    doc.meta.paidDate,
    doc.currency.code,
    doc.seller.name,
    firstTaxId(doc.seller),
    doc.seller.address.countryCode,
    doc.buyer.name,
    doc.buyer.email,
    firstTaxId(doc.buyer),
    doc.buyer.address.countryCode,
    doc.meta.purchaseOrder,
    doc.meta.reference,
  ]

  const tail = [
    decimal(totals.subtotal, d),
    decimal(totals.documentDiscount, d),
    decimal(totals.shipping, d),
    decimal(totals.taxTotal, d),
    decimal(totals.total, d),
    decimal(totals.paid, d),
    decimal(totals.amountDue, d),
    String(doc.settings.pricesIncludeTax),
    doc.settings.templateId,
  ]

  return totals.lines.map((line, i) => {
    const source = doc.lines[i]
    /* Several taxes on one line are joined rather than given a row each: a
       row here is a line item, and splitting it would double its amount the
       moment someone summed the column. */
    const labels = line.taxes.map((t) => t.label).join(' + ')
    const rates = line.taxes.map((t) => t.rate).join(' + ')

    return [
      ...shared,
      String(line.index),
      source.description,
      source.details.replace(/\r?\n/g, ' '),
      String(Number(source.quantity) || 0),
      source.unit,
      String(Number(source.unitPrice) || 0),
      decimal(line.discount, d),
      decimal(line.net, d),
      labels,
      rates,
      decimal(line.tax, d),
      decimal(line.gross, d),
      ...tail,
    ]
  })
}

export function buildCsv (docs: InvoiceDoc[]): string {
  const rows: string[][] = [[...CSV_COLUMNS]]
  for (const doc of docs) rows.push(...invoiceRows(doc))
  /* CRLF, because that is what Excel on Windows expects and this file exists
     to be opened in Excel on Windows. */
  return rows.map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n'
}
