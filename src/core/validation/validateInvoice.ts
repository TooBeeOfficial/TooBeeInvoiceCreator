/* What is missing, and what is merely risky.

   Two severities, and the difference matters. An error means the document is
   not an invoice yet — no number, nobody to bill, nothing billed for. A
   warning means it will print and total correctly but something is missing
   that an accountant or a tax office would expect to see.

   Nothing here blocks the user. You can export a document with warnings on
   it, and with errors too; the app says what it found and lets the person who
   knows their own situation decide. A US freelancer has no VAT number and
   should not be nagged into inventing one. */

import type { InvoiceDoc } from '@model/invoice'
import type { LibraryEntry } from '@model/library'
import type { AppStrings } from '@core/i18n'
import { appStrings } from '@core/i18n'
import { isDuplicate } from '@core/numbering/numbering'
import { daysBetween } from '@core/money/format'

/* English, for a caller with no dictionary to hand — a test, or a script. */
const FALLBACK_MESSAGES = appStrings('en').checks

export type IssueSeverity = 'error' | 'warning'

export type IssueSection = 'details' | 'parties' | 'items' | 'payment' | 'tax'

export interface Issue {
  id: string
  severity: IssueSeverity
  section: IssueSection
  /** What to say. Written as an instruction, not as a complaint. */
  message: string
  /** Which line it belongs to, when it belongs to one. */
  lineId?: string
}

export interface ValidationResult {
  issues: Issue[]
  errors: Issue[]
  warnings: Issue[]
  ok: boolean
}

/** The wording, handed in so this file holds the rules and not the language. */
export type CheckMessages = AppStrings['checks']

export function validateInvoice (
  doc: InvoiceDoc,
  entries: LibraryEntry[] = [],
  say: CheckMessages = FALLBACK_MESSAGES,
): ValidationResult {
  const issues: Issue[] = []
  const add = (severity: IssueSeverity, section: IssueSection, id: string, message: string, lineId?: string) =>
    issues.push({ id, severity, section, message, lineId })

  const simple = doc.settings.detail === 'simple'

  /* ----------------------------------------------------------- details */

  if (!doc.meta.number.trim()) add('error', 'details', 'number', say.number)
  else if (isDuplicate(doc.meta.number, doc.id, entries)) {
    add('warning', 'details', 'number-duplicate', say.numberDuplicate)
  }

  if (!doc.meta.issueDate) add('error', 'details', 'issue-date', say.issueDate)

  if (doc.meta.dueDate && doc.meta.issueDate && daysBetween(doc.meta.issueDate, doc.meta.dueDate) < 0) {
    add('error', 'details', 'due-before-issue', say.dueBeforeIssue)
  }

  if (!doc.meta.dueDate && !doc.meta.terms.trim()) {
    add('warning', 'details', 'no-terms', say.noTerms)
  }

  /* ----------------------------------------------------------- parties */

  if (!doc.seller.name.trim()) add('error', 'parties', 'seller-name', say.sellerName)
  if (!doc.buyer.name.trim()) add('error', 'parties', 'buyer-name', say.buyerName)

  if (!simple) {
    if (!hasAddress(doc.seller.address)) {
      add('warning', 'parties', 'seller-address', say.sellerAddress)
    }
    if (!hasAddress(doc.buyer.address)) {
      add('warning', 'parties', 'buyer-address', say.buyerAddress)
    }
    if (!doc.seller.email.trim() && !doc.seller.phone.trim()) {
      add('warning', 'parties', 'seller-contact', say.sellerContact)
    }
  }

  /* ------------------------------------------------------------- items */

  const filled = doc.lines.filter((l) => l.description.trim() || l.unitPrice || l.quantity !== 1)
  if (filled.length === 0) {
    add('error', 'items', 'no-lines', say.noLines)
  }

  for (const line of doc.lines) {
    const described = line.description.trim().length > 0
    const priced = Number(line.unitPrice) !== 0
    if (!described && priced) {
      add('error', 'items', `line-description-${line.id}`, say.lineDescription, line.id)
    }
    if (described && !Number.isFinite(Number(line.quantity))) {
      add('error', 'items', `line-quantity-${line.id}`, say.lineQuantity, line.id)
    }
    if (described && Number(line.quantity) === 0) {
      add('warning', 'items', `line-zero-qty-${line.id}`, say.lineZeroQuantity, line.id)
    }
  }

  /* --------------------------------------------------------------- tax */

  const charging = chargesTax(doc)
  if (charging && doc.seller.taxIds.every((t) => !t.value.trim())) {
    add('warning', 'tax', 'seller-tax-id', say.sellerTaxId)
  }

  if (charging && !simple && doc.buyer.taxIds.every((t) => !t.value.trim()) && isCrossBorder(doc)) {
    add('warning', 'tax', 'buyer-tax-id', say.buyerTaxId)
  }

  /* ----------------------------------------------------------- payment */

  if (!simple && !hasPaymentRoute(doc)) {
    add('warning', 'payment', 'no-payment-route', say.noPaymentRoute)
  }

  /* --------------------------------------------------------- payments in */

  for (const payment of doc.paymentsReceived) {
    if (!payment.amount) {
      add('warning', 'payment', `payment-amount-${payment.id}`, say.paymentAmount)
    }
    if (!payment.date) {
      add('warning', 'payment', `payment-date-${payment.id}`, say.paymentDate)
    } else if (doc.meta.issueDate && daysBetween(payment.date, doc.meta.issueDate) > 0) {
      add('warning', 'payment', `payment-early-${payment.id}`, say.paymentEarly)
    }
  }

  /* Money against a void invoice is a question for a person: it may be a
     refund owed, or it may be that voiding it was the mistake. Either way it
     is not something to answer by quietly changing the status. */
  if (doc.meta.status === 'void' && doc.paymentsReceived.length > 0) {
    add('warning', 'payment', 'paid-but-void', say.paidButVoid)
  }

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  return { issues, errors, warnings, ok: errors.length === 0 }
}

function hasAddress (address: InvoiceDoc['seller']['address']): boolean {
  return !!(address.line1.trim() || address.city.trim() || address.postalCode.trim())
}

function chargesTax (doc: InvoiceDoc): boolean {
  if (doc.settings.taxMode === 'invoice') return (doc.settings.defaultTax?.rate ?? 0) > 0
  return doc.lines.some((l) => l.taxes.some((t) => t.rate > 0))
}

function isCrossBorder (doc: InvoiceDoc): boolean {
  const a = doc.seller.address.countryCode.trim().toUpperCase()
  const b = doc.buyer.address.countryCode.trim().toUpperCase()
  return !!a && !!b && a !== b
}

function hasPaymentRoute (doc: InvoiceDoc): boolean {
  const p = doc.payment
  return !!(p.instructions.trim() || p.iban.trim() || p.accountNumber.trim() || p.link.trim() || p.bankName.trim())
}
