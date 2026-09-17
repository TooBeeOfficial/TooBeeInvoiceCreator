/* What the invoice comes to.

   The single place any money figure in this app is worked out. The preview,
   the PDF, the spreadsheet, the CSV and the list all call this and print what
   it returns; none of them adds anything up on its own. If the totals block
   and the line items ever disagreed, there would have to be two of these —
   so there is one.

   The order of operations is the one an auditor expects:

     line amount   quantity x unit price, less any discount on that line
     subtotal      the net of every line
     discount      a document-wide reduction, spread across the lines
     shipping      added after the discount, taxed on its own terms
     tax           charged on what is left, grouped by rate
     rounding      an optional adjustment to a whole unit of currency
     total         what the invoice came to
     paid          what has arrived against it
     amount due    the difference, which is what is actually owed
*/

import type { InvoiceDoc } from '@model/invoice'
import type { LineItem } from '@model/lineItem'
import type { TaxLine, TaxSummaryRow } from '@model/tax'
import type { Minor } from '@model/money'
import { toMinor, taxOnNet, taxInGross, percentOf, roundToUnit, roundHalfUp, sum } from '@core/money/money'
import { allocate } from './allocate'

/* How far through being paid an invoice is. Kept apart from InvoiceStatus,
   which is what the user asserted about it; this is what the money says. */
export type Settlement = 'unpaid' | 'part' | 'settled' | 'over'

export interface LineTaxAmount {
  key: string
  label: string
  rate: number
  amount: Minor
  exempt: boolean
}

export interface LineTotals {
  id: string
  /** 1-based position, so a template never has to count. */
  index: number
  /** quantity x unit price, before any discount. */
  base: Minor
  /** What the line discount took off. */
  discount: Minor
  /** Base less the line discount, in whatever basis prices are entered in. */
  amount: Minor
  /** The line excluding tax, after its share of the document discount. */
  net: Minor
  tax: Minor
  /** net + tax. */
  gross: Minor
  taxes: LineTaxAmount[]
  /** Rates on this line, joined for the table's tax column: "20%". */
  rateLabel: string
}

export interface Totals {
  lines: LineTotals[]
  /** Net of every line before the document discount. */
  subtotal: Minor
  documentDiscount: Minor
  /** Label the discount prints with, e.g. "Discount 10%". */
  documentDiscountLabel: string
  shipping: Minor
  shippingTax: Minor
  /** What tax was charged on: subtotal - discount + taxable shipping. */
  taxableBase: Minor
  taxRows: TaxSummaryRow[]
  taxTotal: Minor
  roundingAdjustment: Minor
  /** What the invoice came to. Paying some of it does not change this. */
  total: Minor
  /** What has arrived, refunds included as the negatives they are. */
  paid: Minor
  /** What is still owed, never below nothing. */
  amountDue: Minor
  /** Anything paid over the total, which is a credit rather than a debt. */
  overpaid: Minor
  settlement: Settlement
  /** True when no line carries a rate above zero. */
  taxFree: boolean
  /** Sum of the quantity column, for the spreadsheet's footer. */
  quantityTotal: number
}

/* Which taxes actually apply to a line, given the document's mode.

   The line always stores its own list. In 'invoice' mode the document's rate
   overrides it for the calculation, and nothing typed on the line is lost —
   switching the mode back brings it straight home. */
export function taxesForLine (doc: InvoiceDoc, line: LineItem): TaxLine[] {
  const mode = doc.settings.taxMode
  if (mode === 'invoice') return doc.settings.defaultTax ? [doc.settings.defaultTax] : []
  if (mode === 'line') return line.taxes.slice(0, 1)
  return line.taxes
}

interface Split {
  net: Minor
  tax: Minor
  taxes: LineTaxAmount[]
}

/* Splits one amount into net and tax.

   With tax-exclusive prices each rate is charged on the net and the results
   are simply added. With tax-inclusive prices the tax already sits inside the
   figure and has to be extracted at the combined rate — a £120 line at 20%
   holds £20 of tax, not £24 — and then shared out between the rates. */
function splitAmount (amount: Minor, taxes: TaxLine[], inclusive: boolean): Split {
  if (taxes.length === 0) return { net: amount, tax: 0, taxes: [] }

  const key = (t: TaxLine) => `${t.label}@${t.rate}`

  if (!inclusive) {
    const parts = taxes.map((t) => ({
      key: key(t),
      label: t.label,
      rate: t.rate,
      amount: taxOnNet(amount, t.rate),
      exempt: !!t.exempt,
    }))
    return { net: amount, tax: parts.reduce((a, p) => a + p.amount, 0), taxes: parts }
  }

  const combined = taxes.reduce((a, t) => a + t.rate, 0)
  const totalTax = taxInGross(amount, combined)
  /* Shared out in proportion to the rates so the parts add to the whole. */
  const shares = allocate(totalTax, taxes.map((t) => t.rate))
  const parts = taxes.map((t, i) => ({
    key: key(t),
    label: t.label,
    rate: t.rate,
    amount: shares[i],
    exempt: !!t.exempt,
  }))
  return { net: amount - totalTax, tax: totalTax, taxes: parts }
}

function lineBase (line: LineItem, decimals: number): Minor {
  return toMinor((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), decimals)
}

function lineDiscount (base: Minor, line: LineItem, decimals: number): Minor {
  if (!line.discount || !line.discount.value) return 0
  if (line.discount.type === 'percent') return percentOf(base, line.discount.value)
  return Math.min(base, toMinor(line.discount.value, decimals))
}

export function calcTotals (doc: InvoiceDoc): Totals {
  const decimals = doc.currency.decimals
  const inclusive = doc.settings.pricesIncludeTax

  /* Pass one: what each line comes to on its own terms. */
  const prepared = doc.lines.map((line, i) => {
    const base = lineBase(line, decimals)
    const discount = lineDiscount(base, line, decimals)
    return { line, index: i + 1, base, discount, amount: base - discount, taxes: taxesForLine(doc, line) }
  })

  /* The subtotal is always net, whichever basis prices were typed in, so the
     block below it reads the same either way and never counts tax twice. */
  const preDiscountNets = prepared.map((p) => splitAmount(p.amount, p.taxes, inclusive).net)
  const subtotal = preDiscountNets.reduce((a, b) => a + b, 0)

  /* Pass two: the document discount, spread across the lines in proportion to
     what each contributes, so that tax is charged on what is really owed. */
  const discountSetting = doc.settings.discount
  let documentDiscount = 0
  if (discountSetting.type === 'percent') documentDiscount = percentOf(subtotal, discountSetting.value)
  else if (discountSetting.type === 'amount') documentDiscount = Math.min(subtotal, toMinor(discountSetting.value, decimals))

  const discountShares = documentDiscount
    ? allocate(documentDiscount, prepared.map((p) => Math.abs(p.amount)))
    : prepared.map(() => 0)

  const scale = subtotal - documentDiscount

  const lines: LineTotals[] = prepared.map((p, i) => {
    const amountAfter = p.amount - (inclusive ? grossShare(discountShares[i], p.taxes) : discountShares[i])
    const split = splitAmount(amountAfter, p.taxes, inclusive)
    return {
      id: p.line.id,
      index: p.index,
      base: p.base,
      discount: p.discount,
      amount: p.amount,
      net: split.net,
      tax: split.tax,
      gross: split.net + split.tax,
      taxes: split.taxes,
      rateLabel: p.taxes.length
        ? p.taxes.map((t) => trimRate(t.rate) + '%').join(' + ')
        : '—',
    }
  })

  /* Carriage is added after the discount and taxed on its own terms: it is a
     service you are reselling, not one of the things being discounted. */
  const shipping = toMinor(Number(doc.settings.shipping) || 0, decimals)
  const shippingTaxes: TaxLine[] = shipping && doc.settings.shippingTaxable && doc.settings.defaultTax
    ? [doc.settings.defaultTax]
    : []
  const shippingSplit = splitAmount(shipping, shippingTaxes, inclusive)

  /* Every tax charged, gathered by label and rate — one printed row each. */
  const rowMap = new Map<string, TaxSummaryRow>()
  const collect = (net: Minor, parts: LineTaxAmount[]) => {
    for (const part of parts) {
      /* With several taxes on one line each is charged on the whole net, so
         every row's base is that net rather than a slice of it. */
      const existing = rowMap.get(part.key)
      if (existing) {
        existing.base += net
        existing.amount += part.amount
      } else {
        rowMap.set(part.key, { key: part.key, label: part.label, rate: part.rate, base: net, amount: part.amount })
      }
    }
  }
  lines.forEach((l) => collect(l.net, l.taxes))
  collect(shippingSplit.net, shippingSplit.taxes)

  const taxRows = [...rowMap.values()].sort((a, b) => b.rate - a.rate || a.label.localeCompare(b.label))
  const taxTotal = taxRows.reduce((a, r) => a + r.amount, 0)

  const netTotal = scale + shippingSplit.net
  const rawTotal = netTotal + taxTotal
  const { total, adjustment } = doc.settings.roundTotal
    ? roundToUnit(rawTotal, decimals)
    : { total: rawTotal, adjustment: 0 }

  /* What arrived, and what is therefore still owed. The total above is what
     the invoice came to and never changes because someone paid some of it. */
  const paid = sum(doc.paymentsReceived.map((record) => record.amount))

  return {
    lines,
    subtotal,
    documentDiscount,
    documentDiscountLabel: discountLabel(discountSetting),
    shipping: shippingSplit.net,
    shippingTax: shippingSplit.tax,
    taxableBase: netTotal,
    taxRows,
    taxTotal,
    roundingAdjustment: adjustment,
    total,
    paid,
    /* Clamped, both of them: an overpaid invoice owes nothing rather than a
       negative amount, and the excess is a credit with a name of its own. */
    amountDue: Math.max(0, total - paid),
    overpaid: Math.max(0, paid - total),
    settlement: settlementOf(total, paid),
    taxFree: taxRows.every((r) => r.amount === 0),
    quantityTotal: doc.lines.reduce((a, l) => a + (Number(l.quantity) || 0), 0),
  }
}

/* Settlement is its own axis, deliberately not a fifth invoice status.

   Whether an invoice has been paid and whether it is late are two different
   questions — one can be forty per cent paid and twenty days overdue — and
   the status a file stores is what the user asserted, not what the payments
   add up to. So this is worked out beside the status and printed beside it,
   never folded into it. */
function settlementOf (total: Minor, paid: Minor): Settlement {
  if (paid <= 0) return 'unpaid'
  if (paid > total) return 'over'
  if (paid >= total) return 'settled'
  return 'part'
}

/* When prices include tax, a discount taken off the net has to be taken off
   the gross by the same proportion, or the line stops matching the price the
   client was quoted. */
function grossShare (netShare: Minor, taxes: TaxLine[]): Minor {
  if (!netShare) return 0
  const combined = taxes.reduce((a, t) => a + t.rate, 0)
  if (!combined) return netShare
  return roundHalfUp((netShare * (100 + combined)) / 100)
}

function discountLabel (discount: InvoiceDoc['settings']['discount']): string {
  const name = discount.label || 'Discount'
  if (discount.type === 'percent' && discount.value) return `${name} ${trimRate(discount.value)}%`
  return name
}

/** 20 -> "20", 8.875 -> "8.875", 20.00 -> "20". */
export function trimRate (rate: number): string {
  return String(Number(rate.toFixed(4)))
}
