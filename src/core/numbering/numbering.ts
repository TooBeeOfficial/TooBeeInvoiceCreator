/* Invoice numbers.

   Most tax authorities want them unique and sequential with no gaps, so the
   app proposes the next one and advances its counter when an invoice is
   first saved — not when it is merely opened, or a draft you abandoned would
   burn a number and leave a hole in the sequence.

   The proposal is only ever a proposal. The field stays editable, because
   someone arriving from a spreadsheet with 214 invoices behind them needs to
   carry on at 215, not start again at one. */

import type { NumberingScheme } from '@model/prefs'
import type { LibraryEntry } from '@model/library'

export const DEFAULT_NUMBERING: NumberingScheme = {
  prefix: 'INV-',
  includeYear: true,
  padding: 4,
  next: 1,
  resetYearly: true,
  year: new Date().getFullYear(),
}

export function formatNumber (scheme: NumberingScheme, counter: number, year: number): string {
  const digits = String(Math.max(1, Math.trunc(counter))).padStart(Math.max(1, scheme.padding), '0')
  return scheme.includeYear ? `${scheme.prefix}${year}-${digits}` : `${scheme.prefix}${digits}`
}

/* The number a new invoice starts with, given the scheme and today's year. */
export function nextNumber (scheme: NumberingScheme, year = new Date().getFullYear()): string {
  const rolled = scheme.resetYearly && year !== scheme.year
  return formatNumber(scheme, rolled ? 1 : scheme.next, year)
}

/* Whether a number is already on another invoice.

   Checked against the library index rather than the disk, so it catches the
   common mistake — two invoices numbered 0007 — without opening every file
   the user has ever saved. It cannot see files the app has never been told
   about, which is why this warns rather than blocks. */
export function isDuplicate (number: string, docId: string, entries: LibraryEntry[]): boolean {
  const target = number.trim().toLowerCase()
  if (!target) return false
  return entries.some((e) => e.id !== docId && e.number.trim().toLowerCase() === target)
}

/* Reads a number back into a counter so the scheme can be caught up.

   If someone types INV-2026-0042 by hand, the next invoice should be 0043,
   not 0002. Anything that does not end in digits is left alone. */
export function counterFrom (number: string): number | null {
  const match = /(\d+)\s*$/.exec(number.trim())
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}
