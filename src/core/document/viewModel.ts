/* The finished page, as data.

   Templates are Mustache: they can print a value and they can ask whether a
   section has anything in it, but they cannot add up, format or decide. So
   everything is decided here — every figure already formatted, every
   optional block already reduced to a boolean — and a template is left to do
   the one thing it is for, which is deciding where things sit on the paper.

   This is also the seam that keeps the design separate from the arithmetic.
   A user can rewrite a template's HTML in the code panel and no calculation
   moves; change how tax is worked out and every template follows.

   The short form is decided here too, for the same reason. A template asking
   {{#hasTerms}} is asking whether there are terms to print — so in the short
   form the answer is simply no, and the block does not appear. Every layout
   gets the behaviour without a line of template code, including one written
   by hand in the code panel, and there is one place to read to find out what
   the two forms differ by. */

import type { InvoiceDoc } from '@model/invoice'
import type { Party } from '@model/party'
import type { Totals } from '@core/totals/calcTotals'
import { calcTotals, trimRate } from '@core/totals/calcTotals'
import {
  formatDate, formatFigure, formatMoney, formatQuantity, formatRate, formatUnitPrice,
} from '@core/money/format'
import { docStatus } from '@core/status/status'
import { epcPayload, epcRequest } from '@core/payment/epc'
import { formatIban } from '@core/payment/iban'
import { qrSvgDataUri } from '@core/payment/qrImage'
import { mailtoHref } from '@core/mail/mailto'
import { documentLabels } from '@core/i18n'
import type { DocumentLabels } from '@core/i18n'

export interface PartyView {
  name: string
  contactName: string
  hasContactName: boolean
  email: string
  hasEmail: boolean
  /* The same address as something to click. A PDF keeps its links, so an
     invoice read on a screen can be replied to from the invoice — and on
     paper an anchor is just the words, which is what it was anyway. */
  emailHref: string
  phone: string
  hasPhone: boolean
  website: string
  hasWebsite: boolean
  addressLines: Array<{ text: string }>
  hasAddress: boolean
  taxIds: Array<{ label: string; value: string }>
  hasTaxIds: boolean
  notes: string
  hasNotes: boolean
}

export interface LineView {
  n: number
  description: string
  details: string
  detailsHtml: string
  hasDetails: boolean
  quantity: string
  unit: string
  hasUnit: boolean
  unitPrice: string
  discount: string
  hasDiscount: boolean
  rate: string
  amount: string
  /** Every other row, for templates that tint alternate rows. */
  odd: boolean
}

export interface TotalRowView {
  label: string
  value: string
  /** Set on the row a template should lead with. */
  strong?: boolean
}

export interface DocumentView {
  labels: DocumentLabels
  title: string
  hasTitle: boolean
  heading: string
  /* The greeting on a letter-shaped invoice, with the name already in it.
     Built here because where the name falls in the line is a property of the
     language, and a template cannot rearrange words. */
  salutation: string
  meta: Record<string, string | boolean>
  seller: PartyView
  buyer: PartyView
  logo: { src: string; has: boolean }
  currency: { code: string; symbol: string }
  columns: { unit: boolean; discount: boolean; tax: boolean; numbers: boolean }
  lines: LineView[]
  totals: {
    subtotal: string
    discount: string
    discountLabel: string
    hasDiscount: boolean
    shipping: string
    shippingLabel: string
    hasShipping: boolean
    /* `label` carries the rate with it — "VAT 20%" — because that is how a
       totals line has to read. `name` is the bare name, for a template that
       gives the rate a column of its own. */
    taxRows: Array<{ label: string; name: string; rate: string; base: string; amount: string }>
    hasTax: boolean
    taxTotal: string
    rounding: string
    hasRounding: boolean
    /** What the invoice came to, whether or not any of it has been paid. */
    total: string
    /* What is left to pay, which is what a template's grand total prints.
       With nothing paid it is the total, so a sheet that has never seen a
       payment reads exactly as it always did. */
    amountDue: string
    paid: string
    overpaid: string
    hasPayments: boolean
    hasOverpayment: boolean
    /** Every quantity added up, for a layout billing by the hour. */
    quantityTotal: string
    /** How many lines those units came from, as a finished phrase. */
    lineCountNote: string
    /** The rows above the grand total, ready to loop over. */
    rows: TotalRowView[]
  }
  payment: {
    instructions: string
    instructionsHtml: string
    hasInstructions: boolean
    rows: Array<{ label: string; value: string }>
    hasRows: boolean
    link: string
    hasLink: boolean
    has: boolean
    /* The account, as against the sentence about it. The instructions are
       prose addressed to the customer — "payable within 30 days" — and go
       wherever the template puts its writing; everything under this flag is
       the account itself, which goes in the foot beside the code. A template
       asks this before it draws that footer, because an invoice can easily
       carry one of the two and not the other. */
    hasAccount: boolean
    /* The scannable version of everything above. `has` is false far more
       often than not — no IBAN, a mistyped one, or the code switched off —
       so a template asks before it makes room for it. */
    qr: {
      has: boolean
      /** An SVG data URI, ready for the src of an img. */
      src: string
      /** "Scan to pay" — the line that tells a reader what it is for. */
      caption: string
      /** What the code contains, for a reader who cannot see it. */
      alt: string
    }
  }
  notes: string
  notesHtml: string
  hasNotes: boolean
  terms: string
  termsHtml: string
  hasTerms: boolean
  flags: {
    simple: boolean
    full: boolean
    inclusive: boolean
    paid: boolean
    overdue: boolean
    draft: boolean
    showStamp: boolean
  }
}

export function buildViewModel (doc: InvoiceDoc, totals: Totals = calcTotals(doc)): DocumentView {
  const locale = doc.settings.locale || 'en-GB'
  const currency = doc.currency
  const money = (minor: number) => formatMoney(minor, currency, locale)
  const figure = (minor: number) => formatFigure(minor, currency, locale)
  const simple = doc.settings.detail === 'simple'
  const status = docStatus(doc)
  /* The invoice is written in its own language, which is not necessarily the
     one the app is running in: an English-speaking user billing a client in
     Warsaw gets an English window and a Polish invoice. */
  const labels = documentLabels(locale)

  const meta: Record<string, string | boolean> = {
    number: doc.meta.number,
    issueDate: formatDate(doc.meta.issueDate, locale),
    dueDate: formatDate(doc.meta.dueDate, locale),
    hasDueDate: !!doc.meta.dueDate,
    supplyDate: formatDate(doc.meta.supplyDate, locale),
    /* The three below are the paperwork of a business transaction. A receipt
       over a counter has none of it, so the short form does not print it. */
    hasSupplyDate: !simple && !!doc.meta.supplyDate,
    terms: doc.meta.terms,
    hasTerms: !!doc.meta.terms.trim(),
    purchaseOrder: doc.meta.purchaseOrder,
    hasPurchaseOrder: !simple && !!doc.meta.purchaseOrder.trim(),
    reference: doc.meta.reference,
    hasReference: !simple && !!doc.meta.reference.trim(),
    paidDate: formatDate(doc.meta.paidDate, locale),
    hasPaidDate: !!doc.meta.paidDate,
  }

  const totalRows: TotalRowView[] = [
    { label: labels.subtotal, value: money(totals.subtotal) },
  ]
  if (totals.documentDiscount) {
    totalRows.push({ label: totals.documentDiscountLabel, value: `−${money(totals.documentDiscount)}` })
  }
  if (totals.shipping) {
    totalRows.push({ label: doc.settings.shippingLabel || labels.shipping, value: money(totals.shipping) })
  }
  for (const row of totals.taxRows) {
    totalRows.push({ label: taxRowLabel(row.label, row.rate, locale, labels), value: money(row.amount) })
  }
  if (totals.roundingAdjustment) {
    totalRows.push({ label: labels.rounding, value: money(totals.roundingAdjustment) })
  }

  /* Once anything has been paid, the total the invoice came to becomes a row
     of its own and the figure at the foot becomes what is still owed — which
     is what "amount due" has said all along. An invoice with no payments
     against it prints exactly the rows it printed before. */
  const hasPayments = doc.paymentsReceived.length > 0
  if (hasPayments) {
    totalRows.push({ label: labels.total, value: money(totals.total) })
    totalRows.push({ label: labels.paidToDate, value: `−${money(totals.paid)}` })
    if (totals.overpaid) {
      totalRows.push({ label: labels.overpaid, value: money(totals.overpaid) })
    }
  }

  return {
    labels,
    title: doc.title,
    hasTitle: !!doc.title.trim(),
    heading: simple ? labels.simpleInvoice : labels.invoice,
    /* Not escaped here: the template prints it with {{ }}, which escapes. */
    salutation: labels.salutation.replace('{name}', doc.buyer.contactName.trim()),
    meta,
    /* The supplier is never cut back: a simplified invoice still has to
       carry who issued it, their address and their registration number.
       The customer's details are what the short form drops — a counter sale
       has a name at most, and often not even that. */
    seller: partyView(doc.seller),
    buyer: partyView(doc.buyer, simple),
    logo: { src: doc.branding.logoDataUrl, has: !!doc.branding.logoDataUrl },
    currency: { code: currency.code, symbol: currency.symbol },
    columns: {
      unit: doc.settings.showUnit,
      discount: doc.settings.showDiscountColumn && doc.lines.some((l) => !!l.discount?.value),
      tax: doc.settings.showTaxColumn && doc.settings.taxMode !== 'invoice',
      numbers: doc.settings.showLineNumbers,
    },
    lines: totals.lines.map((line, i) => {
      const source = doc.lines[i]
      const lineDiscount = source.discount
      return {
        n: line.index,
        description: source.description,
        details: source.details,
        detailsHtml: multiline(source.details),
        hasDetails: !!source.details.trim(),
        quantity: formatQuantity(Number(source.quantity) || 0, locale),
        unit: source.unit,
        hasUnit: !!source.unit,
        unitPrice: formatUnitPrice(Number(source.unitPrice) || 0, currency, locale),
        discount: lineDiscount
          ? lineDiscount.type === 'percent'
            ? formatRate(lineDiscount.value, locale)
            : money(line.discount)
          : '',
        hasDiscount: !!lineDiscount?.value,
        rate: line.rateLabel,
        amount: figure(line.amount),
        odd: i % 2 === 1,
      }
    }),
    totals: {
      subtotal: money(totals.subtotal),
      discount: money(totals.documentDiscount),
      discountLabel: totals.documentDiscountLabel,
      hasDiscount: totals.documentDiscount !== 0,
      shipping: money(totals.shipping),
      shippingLabel: doc.settings.shippingLabel || labels.shipping,
      hasShipping: totals.shipping !== 0,
      taxRows: totals.taxRows.map((row) => ({
        label: taxRowLabel(row.label, row.rate, locale, labels),
        name: row.label.trim() || labels.tax,
        rate: formatRate(row.rate, locale),
        base: money(row.base),
        amount: money(row.amount),
      })),
      hasTax: totals.taxRows.length > 0,
      taxTotal: money(totals.taxTotal),
      rounding: money(totals.roundingAdjustment),
      hasRounding: totals.roundingAdjustment !== 0,
      total: money(totals.total),
      amountDue: money(totals.amountDue),
      paid: money(totals.paid),
      overpaid: money(totals.overpaid),
      hasPayments,
      hasOverpayment: totals.overpaid !== 0,
      quantityTotal: formatQuantity(totals.quantityTotal, locale),
      lineCountNote: labels.acrossLines.replace('{count}', String(totals.lines.length)),
      rows: totalRows,
    },
    payment: paymentView(doc, labels, totals),
    notes: doc.notes,
    notesHtml: multiline(doc.notes),
    hasNotes: !!doc.notes.trim(),
    terms: doc.terms,
    termsHtml: multiline(doc.terms),
    /* The largest block on most invoices and the one nobody expects on a
       receipt. Kept in the document, just not printed. */
    hasTerms: !simple && !!doc.terms.trim(),
    flags: {
      simple,
      full: !simple,
      inclusive: doc.settings.pricesIncludeTax,
      paid: status === 'paid',
      overdue: status === 'overdue',
      draft: status === 'draft',
      showStamp: status === 'paid' && doc.theme.showPaidStamp,
    },
  }
}

/* Typed text that runs to several lines — notes, terms, payment
   instructions — reaching the page with its line breaks intact.

   Escaped here rather than by Mustache, because the template has to print it
   unescaped for the <br> to survive. Anything a user types is therefore
   neutralised at this one point, and a template cannot undo that. */
export function escapeHtml (text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function multiline (text: string): string {
  if (!text) return ''
  return escapeHtml(text).replace(/\r?\n/g, '<br>')
}

/** "VAT 20%" — the label and its rate, which is how it has to print. */
function taxRowLabel (label: string, rate: number, locale: string, labels: DocumentLabels): string {
  const name = label.trim() || labels.tax
  return rate ? `${name} ${trimRate(rate)}%` : `${name} ${formatRate(0, locale)}`
}

/* Countries that write the post code after the town.

   "Bristol BS1 6QH", not "BS1 6QH Bristol" — while Germany and most of
   continental Europe do the opposite. Getting this backwards does not stop
   the post arriving, but it marks the invoice out as machine-made to anyone
   who reads addresses for a living. */
const POSTCODE_LAST = new Set(['GB', 'IE', 'US', 'CA', 'AU', 'NZ', 'IN', 'ZA', 'JP', 'CN', 'SG', 'HK', 'MY', 'TH'])

function townLine (postalCode: string, city: string, countryCode: string): string {
  const code = postalCode.trim()
  const town = city.trim()
  if (!code) return town
  if (!town) return code
  return POSTCODE_LAST.has(countryCode.trim().toUpperCase())
    ? `${town} ${code}`
    : `${code} ${town}`
}

/* `brief` keeps the name and drops everything under it. Nothing is deleted
   from the document — this is the view, and switching back to the full form
   brings it all straight back. */
function partyView (party: Party, brief = false): PartyView {
  const a = party.address
  const lines = brief
    ? []
    : [a.line1, a.line2, townLine(a.postalCode, a.city, a.countryCode), a.region, countryName(a.countryCode)]
      .map((s) => (s || '').trim())
      .filter(Boolean)

  const taxIds = brief
    ? []
    : party.taxIds
      .filter((t) => t.value.trim())
      .map((t) => ({ label: t.label.trim() || 'Tax ID', value: t.value.trim() }))

  return {
    name: party.name,
    contactName: party.contactName,
    hasContactName: !brief && !!party.contactName.trim(),
    email: party.email,
    hasEmail: !brief && !!party.email.trim(),
    emailHref: mailtoHref(party.email),
    phone: party.phone,
    hasPhone: !brief && !!party.phone.trim(),
    website: party.website,
    hasWebsite: !brief && !!party.website.trim(),
    addressLines: lines.map((text) => ({ text })),
    hasAddress: lines.length > 0,
    taxIds,
    hasTaxIds: taxIds.length > 0,
    notes: party.notes,
    hasNotes: !!party.notes.trim(),
  }
}

/* The country as a reader sees it, from the code the file stores.

   Kept structured on disk and turned into words only here, at the edge, so
   the document keeps the "GB" that an electronic format will want while the
   paper says United Kingdom. */
function countryName (code: string): string {
  const upper = (code || '').trim().toUpperCase()
  if (!upper) return ''
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' })
    return names.of(upper) ?? upper
  } catch {
    return upper
  }
}

function paymentView (doc: InvoiceDoc, labels: DocumentLabels, totals: Totals): DocumentView['payment'] {
  const p = doc.payment
  const rows: Array<{ label: string; value: string }> = []
  const push = (label: string, value: string) => {
    if (value.trim()) rows.push({ label, value: value.trim() })
  }
  push(labels.bank, p.bankName)
  push(labels.accountName, p.accountName)
  push(labels.iban, p.iban)
  push(labels.bic, p.bic)
  push(labels.accountNumber, p.accountNumber)
  push(labels.sortCode, p.sortCode)
  push(labels.routing, p.routingNumber)
  push(labels.paymentReference, p.reference || doc.meta.number)

  const hasInstructions = !!p.instructions.trim()
  const hasLink = !!p.link.trim()
  const qr = paymentCode(doc, labels, totals)
  return {
    instructions: p.instructions,
    instructionsHtml: multiline(p.instructions),
    hasInstructions,
    rows,
    hasRows: rows.length > 0,
    link: p.link,
    hasLink,
    has: hasInstructions || hasLink || rows.length > 0,
    hasAccount: hasLink || rows.length > 0 || qr.has,
    qr,
  }
}

/* The payment code, built only when the invoice has one to build.

   Switched off, or without an IBAN that passes its checksum, this returns a
   block that every template's {{#payment.qr.has}} skips — which is how a
   layout gets the behaviour without knowing any of the rules above. */
function paymentCode (doc: InvoiceDoc, labels: DocumentLabels, totals: Totals): DocumentView['payment']['qr'] {
  const blank = { has: false, src: '', caption: '', alt: '' }
  if (!doc.payment.showQr) return blank

  const request = epcRequest(doc, totals)
  const payload = epcPayload(request)
  if (!payload) return blank

  const src = qrSvgDataUri(payload)
  if (!src) return blank

  return {
    has: true,
    src,
    caption: labels.scanToPay,
    /* Read out instead of the picture: the account the code pays into. A
       string of 300 characters of payload would be no use to anybody. */
    alt: `${labels.scanToPay} — ${labels.iban} ${formatIban(request.iban)}`,
  }
}
