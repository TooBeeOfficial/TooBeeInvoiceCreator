/* XLSX — the invoice as a spreadsheet.

   The other half of the pair, and a different job from the CSV: this is one
   invoice, laid out the way the client reads it, with the arithmetic left
   live. Every amount column is a formula, so if the person you send it to
   changes a quantity the totals move with it — which is what a spreadsheet
   is for, and why exporting flat numbers here would be a waste of the format.

   The figures still come from calcTotals, so the file opens showing exactly
   what the PDF shows. The formulas agree with those numbers; they do not
   replace them. */

import type ExcelJS from 'exceljs'
import type { InvoiceDoc } from '@model/invoice'
import type { Currency } from '@model/money'
import { calcTotals } from '@core/totals/calcTotals'
import { fromMinor } from '@core/money/money'
import { trimRate } from '@core/totals/calcTotals'
import { documentLabels } from '@core/i18n'
import type { DocumentLabels } from '@core/i18n'
import { docStatus } from '@core/status/status'
import { STATUS_LABELS } from '@model/invoice'

/* Excel's own way of writing money, built from the currency rather than
   hardcoded: the symbol goes where that currency puts it and the decimals
   are the currency's own, so yen come out whole. */
function moneyFormat (currency: Currency): string {
  const digits = currency.decimals > 0 ? `.${'0'.repeat(currency.decimals)}` : ''
  const symbol = `"${currency.symbol}"`
  const body = `#,##0${digits}`
  return currency.symbolPosition === 'before'
    ? `${symbol}${currency.spaced ? '\\ ' : ''}${body}`
    : `${body}${currency.spaced ? '\\ ' : ''}${symbol}`
}

const INK = 'FF16191F'
const SOFT = 'FF6B7280'
const RULE = 'FFDCE0E6'

export async function buildWorkbook (doc: InvoiceDoc): Promise<ArrayBuffer> {
  /* Loaded only when someone actually exports a spreadsheet. The library is
     the largest thing this app depends on by some distance, and most sessions
     never touch it — making the window wait for it at startup would be a
     second of nothing for a feature that might not be used. */
  const { default: Excel } = await import('exceljs')

  const totals = calcTotals(doc)
  /* The spreadsheet is the invoice, so it is headed in the invoice's own
     language just as the printed sheet is. */
  const labels = documentLabels(doc.settings.locale)
  const currency = doc.currency
  const format = moneyFormat(currency)
  const major = (minor: number) => fromMinor(minor, currency.decimals)

  const wb = new Excel.Workbook()
  wb.creator = doc.seller.name || 'TooBee Invoice Creator'
  wb.created = new Date()

  const ws = wb.addWorksheet(sheetName(doc.meta.number), {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ showGridLines: false }],
  })

  ws.columns = [
    { key: 'desc', width: 46 },
    { key: 'qty', width: 10 },
    { key: 'price', width: 14 },
    { key: 'tax', width: 10 },
    { key: 'amount', width: 16 },
  ]

  let row = 1

  const put = (
    address: string,
    value: ExcelJS.CellValue,
    style: Partial<ExcelJS.Style> = {},
  ): ExcelJS.Cell => {
    const cell = ws.getCell(address)
    cell.value = value
    Object.assign(cell, style)
    return cell
  }

  const title = (text: string) => ({
    font: { bold: true, size: 15, color: { argb: INK } },
    alignment: { vertical: 'middle' as const },
    value: text,
  })

  /* -------------------------------------------------------- letterhead */

  put(`A${row}`, doc.seller.name, title(doc.seller.name))
  put(`E${row}`, labels.invoice.toUpperCase(), {
    font: { bold: true, size: 12, color: { argb: SOFT } },
    alignment: { horizontal: 'right' },
  })
  row += 1

  for (const line of addressLines(doc.seller)) {
    put(`A${row}`, line, { font: { size: 9, color: { argb: SOFT } } })
    row += 1
  }
  for (const id of doc.seller.taxIds.filter((t) => t.value.trim())) {
    put(`A${row}`, `${id.label}: ${id.value}`, { font: { size: 9, color: { argb: SOFT } } })
    row += 1
  }

  row += 1

  /* ------------------------------------------------------ bill to / meta */

  const blockTop = row
  put(`A${row}`, labels.billTo.toUpperCase(), { font: { bold: true, size: 9, color: { argb: SOFT } } })
  put(`D${row}`, labels.number, { font: { size: 9, color: { argb: SOFT } } })
  put(`E${row}`, doc.meta.number, { font: { bold: true }, alignment: { horizontal: 'right' } })
  row += 1

  const buyerLines = [doc.buyer.name, doc.buyer.contactName, ...addressLines(doc.buyer), doc.buyer.email]
    .filter((s) => s && s.trim())
  const metaPairs: Array<[string, string]> = [
    [labels.issued, doc.meta.issueDate],
    ...(doc.meta.dueDate ? [[labels.due, doc.meta.dueDate] as [string, string]] : []),
    ...(doc.meta.terms.trim() ? [[labels.terms, doc.meta.terms] as [string, string]] : []),
    ...(doc.meta.purchaseOrder.trim() ? [[labels.purchaseOrder, doc.meta.purchaseOrder] as [string, string]] : []),
    ['Status', STATUS_LABELS[docStatus(doc)]],
  ]

  const blockRows = Math.max(buyerLines.length, metaPairs.length)
  for (let i = 0; i < blockRows; i += 1) {
    if (buyerLines[i] !== undefined) {
      put(`A${row}`, buyerLines[i], i === 0 ? { font: { bold: true } } : {})
    }
    const pair = metaPairs[i]
    if (pair) {
      put(`D${row}`, pair[0], { font: { size: 9, color: { argb: SOFT } } })
      put(`E${row}`, pair[1], { alignment: { horizontal: 'right' } })
    }
    row += 1
  }
  void blockTop

  row += 1

  /* ------------------------------------------------------------- table */

  const headerRow = row
  const headers = [labels.description, labels.quantity, labels.unitPrice, labels.tax, labels.amount]
  headers.forEach((text, i) => {
    const cell = ws.getRow(headerRow).getCell(i + 1)
    cell.value = text
    cell.font = { bold: true, size: 9, color: { argb: INK } }
    cell.alignment = { horizontal: i === 0 ? 'left' : 'right' }
    cell.border = { bottom: { style: 'medium', color: { argb: INK } } }
  })
  row += 1

  const firstLine = row
  totals.lines.forEach((line, i) => {
    const source = doc.lines[i]
    const r = ws.getRow(row)

    r.getCell(1).value = source.details.trim()
      ? `${source.description}\n${source.details}`
      : source.description
    r.getCell(1).alignment = { wrapText: true, vertical: 'top' }

    r.getCell(2).value = Number(source.quantity) || 0
    r.getCell(2).alignment = { horizontal: 'right', vertical: 'top' }

    r.getCell(3).value = Number(source.unitPrice) || 0
    r.getCell(3).numFmt = format
    r.getCell(3).alignment = { horizontal: 'right', vertical: 'top' }

    r.getCell(4).value = line.taxes.length ? line.taxes.map((t) => `${trimRate(t.rate)}%`).join(' + ') : '—'
    r.getCell(4).alignment = { horizontal: 'right', vertical: 'top' }
    r.getCell(4).font = { color: { argb: SOFT } }

    /* Quantity times price, live. A discount on the line is folded into the
       same formula so the arithmetic stays visible rather than arriving as a
       number nobody can check. */
    const discount = source.discount
    const base = `B${row}*C${row}`
    const expression = !discount?.value
      ? base
      : discount.type === 'percent'
        ? `${base}*(1-${discount.value / 100})`
        : `${base}-${discount.value}`
    r.getCell(5).value = { formula: expression, result: major(line.amount) }
    r.getCell(5).numFmt = format
    r.getCell(5).alignment = { horizontal: 'right', vertical: 'top' }

    for (let c = 1; c <= 5; c += 1) {
      r.getCell(c).border = { bottom: { style: 'thin', color: { argb: RULE } } }
    }
    row += 1
  })
  const lastLine = row - 1

  /* ------------------------------------------------------------ totals */

  row += 1
  const totalsTop = row

  const putTotal = (label: string, value: ExcelJS.CellValue, strong = false) => {
    put(`D${row}`, label, {
      font: { size: 10, bold: strong, color: { argb: strong ? INK : SOFT } },
      alignment: { horizontal: 'right' },
    })
    const cell = put(`E${row}`, value, {
      font: { bold: strong, size: strong ? 13 : 11, color: { argb: INK } },
      alignment: { horizontal: 'right' },
    })
    cell.numFmt = format
    row += 1
    return cell
  }

  const subtotalRow = row
  putTotal(
    labels.subtotal,
    lastLine >= firstLine
      ? { formula: `SUM(E${firstLine}:E${lastLine})`, result: major(totals.subtotal) }
      : major(totals.subtotal),
  )

  if (totals.documentDiscount) putTotal(totals.documentDiscountLabel, -major(totals.documentDiscount))
  if (totals.shipping) putTotal(doc.settings.shippingLabel || labels.shipping, major(totals.shipping))

  /* One rate across the invoice can be a formula off the subtotal; several
     rates cannot, without inventing a column of hidden helper cells. Values
     then, from the same calculation the PDF used. */
  const singleRate = totals.taxRows.length === 1 && !totals.documentDiscount && !totals.shipping
  for (const taxRow of totals.taxRows) {
    const label = `${taxRow.label} ${trimRate(taxRow.rate)}%`
    putTotal(
      label,
      singleRate
        ? { formula: `ROUND(E${subtotalRow}*${taxRow.rate / 100},${currency.decimals})`, result: major(taxRow.amount) }
        : major(taxRow.amount),
    )
  }

  if (totals.roundingAdjustment) putTotal(labels.rounding, major(totals.roundingAdjustment))

  /* The invoice total closes the sum. Anything paid against it is subtracted
     below that line rather than inside it, so the formula keeps adding up the
     rows it was written for. */
  const lastAbove = row - 1
  const grand = putTotal(
    /* With nothing paid, this figure is both the total and what is owed, and
       it keeps the name it has always had on this sheet. */
    totals.paid ? labels.total : labels.amountDue,
    { formula: `SUM(E${totalsTop}:E${lastAbove})`, result: major(totals.total) },
    true,
  )
  const rule = { top: { style: 'medium' as const, color: { argb: INK } } }
  grand.border = rule
  ws.getCell(`D${row - 1}`).border = rule

  if (totals.paid) {
    const totalRow = row - 1
    putTotal(labels.paidToDate, -major(totals.paid))
    const due = putTotal(
      labels.amountDue,
      { formula: `E${totalRow}+E${row - 1}`, result: major(totals.amountDue) },
      true,
    )
    /* The heavy rule belongs under the figure someone is actually looking
       for, which once a payment exists is the amount still due. */
    due.border = rule
    ws.getCell(`D${row - 1}`).border = rule
    if (totals.overpaid) putTotal(labels.overpaid, major(totals.overpaid))
  }

  /* ------------------------------------------------- payment and notes */

  row += 1
  const blocks: Array<[string, string]> = []
  if (doc.payment.instructions.trim()) blocks.push([labels.payment, doc.payment.instructions])
  const bank = paymentLines(doc, labels)
  if (bank.length) blocks.push([labels.bank, bank.join('\n')])
  if (doc.payment.link.trim()) blocks.push([labels.payLink, doc.payment.link])
  if (doc.notes.trim()) blocks.push([labels.notes, doc.notes])
  if (doc.terms.trim()) blocks.push([labels.conditions, doc.terms])

  for (const [label, text] of blocks) {
    put(`A${row}`, label.toUpperCase(), { font: { bold: true, size: 9, color: { argb: SOFT } } })
    row += 1
    const cell = put(`A${row}`, text, { alignment: { wrapText: true, vertical: 'top' } })
    ws.mergeCells(`A${row}:E${row}`)
    ws.getRow(row).height = Math.min(90, 14 * (text.split('\n').length + Math.floor(text.length / 90)))
    void cell
    row += 2
  }

  const buffer = await wb.xlsx.writeBuffer()
  return buffer as ArrayBuffer
}

/* Excel refuses a sheet name over 31 characters or carrying : \ / ? * [ ] */
function sheetName (number: string): string {
  const cleaned = (number || 'Invoice').replace(/[:\\/?*[\]]/g, '-').slice(0, 31)
  return cleaned.trim() || 'Invoice'
}

function addressLines (party: InvoiceDoc['seller']): string[] {
  const a = party.address
  return [a.line1, a.line2, [a.postalCode, a.city].filter(Boolean).join(' '), a.region, a.countryCode, party.email, party.phone]
    .map((s) => (s || '').trim())
    .filter(Boolean)
}

function paymentLines (doc: InvoiceDoc, labels: DocumentLabels): string[] {
  const p = doc.payment
  const pairs: Array<[string, string]> = [
    [labels.bank, p.bankName],
    [labels.accountName, p.accountName],
    [labels.iban, p.iban],
    [labels.bic, p.bic],
    [labels.accountNumber, p.accountNumber],
    [labels.sortCode, p.sortCode],
    [labels.routing, p.routingNumber],
    [labels.paymentReference, p.reference || doc.meta.number],
  ]
  return pairs.filter(([, value]) => value.trim()).map(([label, value]) => `${label}: ${value.trim()}`)
}
