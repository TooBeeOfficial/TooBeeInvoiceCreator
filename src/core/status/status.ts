/* Status.

   Four states are stored — draft, sent, paid, void — and a fifth is worked
   out: an invoice is overdue when it has been sent, is not paid, and its due
   date is behind us. Overdue is never written to a file, because it would
   start lying the moment the clock moved on without the app running.

   How much of an invoice has been paid is a separate axis and is worked out
   in calcTotals, not here: an invoice can be part paid and overdue at the
   same time, and a single list of states cannot say both. What this file
   does own is keeping the stored status honest about the payments — see
   reconcile below. */

import type { EffectiveStatus, InvoiceDoc, InvoiceMeta, InvoiceStatus, PaymentRecord } from '@model/invoice'
import type { LibraryEntry } from '@model/library'
import type { AppStrings } from '@core/i18n'
import { daysBetween, todayIso } from '@core/money/format'
import { sum } from '@core/money/money'

export function effectiveStatusOf (
  meta: Pick<InvoiceMeta, 'status' | 'dueDate'>,
  today: string = todayIso(),
): EffectiveStatus {
  if (meta.status !== 'sent') return meta.status
  if (!meta.dueDate) return 'sent'
  return daysBetween(meta.dueDate, today) > 0 ? 'overdue' : 'sent'
}

export const docStatus = (doc: InvoiceDoc, today?: string): EffectiveStatus =>
  effectiveStatusOf(doc.meta, today)

export const entryStatus = (entry: LibraryEntry, today?: string): EffectiveStatus =>
  effectiveStatusOf({ status: entry.status, dueDate: entry.dueDate }, today)

/** How late, in days. Zero or less when it is not late. */
export function daysOverdue (dueDate: string, today: string = todayIso()): number {
  if (!dueDate) return 0
  return Math.max(0, daysBetween(dueDate, today))
}

/** How long until it is due. Negative once the date has passed. */
export function daysUntilDue (dueDate: string, today: string = todayIso()): number {
  if (!dueDate) return 0
  return daysBetween(today, dueDate)
}

/** The words duePhrase picks from, in whichever language the app is set to. */
export type DuePhrases = AppStrings['due']

/* A plain sentence for the list: "Due in 6 days", "9 days overdue".

   Written for someone scanning a column, which is why it answers the
   question they are actually asking rather than restating the date they can
   already see next to it. */
export function duePhrase (
  entry: Pick<LibraryEntry, 'status' | 'dueDate' | 'paidDate'>,
  /* The words are handed in rather than looked up here, because this is a
     sentence in the app's language and core knows nothing about which one
     that is. Only the arithmetic belongs in this file. */
  words: DuePhrases,
  today: string = todayIso(),
): string {
  const status = effectiveStatusOf({ status: entry.status, dueDate: entry.dueDate }, today)
  if (status === 'paid') return words.paid
  if (status === 'void') return words.void
  if (status === 'draft') return words.notSent
  if (!entry.dueDate) return words.noDueDate
  const days = daysUntilDue(entry.dueDate, today)
  if (days === 0) return words.today
  if (days > 0) return days === 1 ? words.tomorrow : words.inDays.replace('{days}', String(days))
  const late = -days
  return late === 1 ? words.oneDayOverdue : words.daysOverdue.replace('{days}', String(late))
}

/* Keeping the stored status honest about the payments recorded against it.

   The rule in one line: the money decides whether an invoice is paid, and
   nothing else about it. Called wherever the payments change, and by both
   places that set a status by hand, so that rule lives here once instead of
   being written out again at every call site.

   Two details worth stating, because both are easy to get wrong:

   The paid date is the date of the payment that settled it — not today.
   Recording a transfer that landed last Tuesday has to stamp last Tuesday, or
   the invoice claims to have been paid on the day someone got round to
   typing it in.

   On the way back down, only 'paid' is undone. Deleting a payment from a
   draft must not promote it to sent, and nothing at all rescues a void
   invoice: money arriving against one is a question for a human, which the
   checks raise as a warning rather than answering here. */
export function reconcile (
  meta: Pick<InvoiceMeta, 'status' | 'paidDate'>,
  payments: ReadonlyArray<PaymentRecord>,
  total: number,
): { status: InvoiceStatus; paidDate: string } {
  const { status, paidDate } = meta
  if (status === 'void' || status === 'draft') return { status, paidDate }

  const settled = total > 0 && sum(payments.map((p) => p.amount)) >= total

  if (settled) return { status: 'paid', paidDate: paidDate || settledOn(payments, total) }
  if (status === 'paid' && payments.length > 0) return { status: 'sent', paidDate: '' }
  return { status, paidDate }
}

/* The date the running total first covered the invoice, reading the payments
   in the order they were received rather than the order they were typed. */
function settledOn (payments: ReadonlyArray<PaymentRecord>, total: number): string {
  const inOrder = [...payments].sort((a, b) => a.date.localeCompare(b.date))
  let running = 0
  for (const payment of inOrder) {
    running += payment.amount
    if (running >= total) return payment.date || todayIso()
  }
  return todayIso()
}

export const STATUS_ORDER: ReadonlyArray<EffectiveStatus> = ['overdue', 'sent', 'draft', 'paid', 'void']

/** Which statuses a user can set by hand. Overdue is not one of them. */
export const SETTABLE_STATUSES: ReadonlyArray<InvoiceStatus> = ['draft', 'sent', 'paid', 'void']
