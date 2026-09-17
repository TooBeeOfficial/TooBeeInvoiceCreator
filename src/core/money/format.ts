/* Turning numbers and dates into the strings that appear on the page.

   Formatting happens at the very edge, never in the middle of a calculation.
   Everything upstream is an integer of minor units or an ISO date string, so
   changing how a figure looks can never change what it is. */

import type { Currency, Minor } from '@model/money'
import { fromMinor } from './money'

/** 1234 -> "1,234.00" in the document's locale, without the symbol. */
export function formatFigure (minor: Minor, currency: Currency, locale: string): string {
  const value = fromMinor(minor, currency.decimals)
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(value)
  } catch {
    return value.toFixed(currency.decimals)
  }
}

/** The same figure with its symbol where that currency puts it. */
export function formatMoney (minor: Minor, currency: Currency, locale: string): string {
  const figure = formatFigure(minor, currency, locale)
  const gap = currency.spaced ? ' ' : ''
  return currency.symbolPosition === 'before'
    ? `${currency.symbol}${gap}${figure}`
    : `${figure}${gap}${currency.symbol}`
}

/* A quantity, shown as typed rather than padded out.

   3 prints as "3" and 3.5 as "3.5": an invoice for three hours should not
   read "3.0000 hours" because the field behind it allows four decimals. */
export function formatQuantity (value: number, locale: string): string {
  if (!Number.isFinite(value)) return '0'
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(value)
  } catch {
    return String(value)
  }
}

/** A unit price, which may carry more decimals than the currency does. */
export function formatUnitPrice (value: number, currency: Currency, locale: string): string {
  if (!Number.isFinite(value)) value = 0
  const needed = decimalsUsed(value)
  const digits = Math.max(currency.decimals, Math.min(4, needed))
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
  } catch {
    return value.toFixed(digits)
  }
}

function decimalsUsed (value: number): number {
  const text = String(value)
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

/** 20 -> "20%", 8.875 -> "8.875%". Trailing zeroes are never invented. */
export function formatRate (rate: number, locale: string): string {
  try {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(rate)}%`
  } catch {
    return `${rate}%`
  }
}

/* An ISO date as the document's locale writes it.

   Invoices cross borders, and 03/04/2026 is two different days depending on
   who reads it. The long form — 3 April 2026 — is unambiguous everywhere, so
   that is what prints. */
export function formatDate (iso: string, locale: string): string {
  if (!iso) return ''
  const date = parseIso(iso)
  if (!date) return iso
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  } catch {
    return iso
  }
}

/** The short form, for lists and file names where space is tight. */
export function formatDateShort (iso: string, locale: string): string {
  if (!iso) return ''
  const date = parseIso(iso)
  if (!date) return iso
  try {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
  } catch {
    return iso
  }
}

export function parseIso (iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function toIso (date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const todayIso = (): string => toIso(new Date())

/** ISO date `days` after another, used to propose a due date from terms. */
export function addDays (iso: string, days: number): string {
  const date = parseIso(iso)
  if (!date) return iso
  date.setDate(date.getDate() + days)
  return toIso(date)
}

/** Whole days between two ISO dates, negative when the first is later. */
export function daysBetween (fromIso: string, toIsoDate: string): number {
  const a = parseIso(fromIso)
  const b = parseIso(toIsoDate)
  if (!a || !b) return 0
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}
