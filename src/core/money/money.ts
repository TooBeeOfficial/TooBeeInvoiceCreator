/* Arithmetic on money.

   Everything works in integer minor units and rounds half away from zero,
   the rule tax authorities and bank statements use. Round once, at the point
   an amount becomes real — a line total, a tax figure — and never again, so
   the parts always add up to the whole that is printed beneath them. */

import type { Minor } from '@model/money'

/** Half away from zero: 2.5 -> 3, -2.5 -> -3. Math.round would give -2. */
export function roundHalfUp (n: number): number {
  return n < 0 ? -Math.round(-n) : Math.round(n)
}

export const factor = (decimals: number): number => Math.pow(10, decimals)

/** A typed major amount (12.34) as minor units (1234). */
export function toMinor (major: number, decimals: number): Minor {
  if (!Number.isFinite(major)) return 0
  return roundHalfUp(major * factor(decimals))
}

/** Minor units back to a major number, for display and for spreadsheets. */
export function fromMinor (minor: Minor, decimals: number): number {
  return minor / factor(decimals)
}

/** `rate` percent of an amount that does not yet include it. */
export function taxOnNet (net: Minor, rate: number): Minor {
  if (!rate) return 0
  return roundHalfUp((net * rate) / 100)
}

/* `rate` percent already inside an amount.

   A £120 price at 20% contains £20 of tax, not £24 — the tax is the gross
   times 20/120. Getting this backwards is the classic tax-inclusive bug, so
   it lives in one function that both the totals and the tests go through. */
export function taxInGross (gross: Minor, rate: number): Minor {
  if (!rate) return 0
  return roundHalfUp((gross * rate) / (100 + rate))
}

/** A percentage of an amount, for discounts. */
export function percentOf (amount: Minor, percent: number): Minor {
  if (!percent) return 0
  return roundHalfUp((amount * percent) / 100)
}

export const sum = (values: Minor[]): Minor => values.reduce((a, b) => a + b, 0)

/* Rounds a total to whole units of currency, returning the adjustment.

   Some countries no longer mint small coins and invoices are settled to the
   nearest five or ten. The adjustment is returned rather than folded in
   silently, because it has to print as its own line for the invoice to
   still add up in front of an auditor. */
export function roundToUnit (total: Minor, decimals: number): { total: Minor; adjustment: Minor } {
  const unit = factor(decimals)
  if (unit === 1) return { total, adjustment: 0 }
  const rounded = roundHalfUp(total / unit) * unit
  return { total: rounded, adjustment: rounded - total }
}
