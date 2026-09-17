/* Money.

   Every amount the app computes is an integer in the currency's minor unit —
   pence, cents, yen. Nothing is added or compared as a floating-point major
   amount, because 0.1 + 0.2 is not 0.3 and an invoice that is a penny out is
   an invoice someone has to phone you about.

   Unit prices are the one exception: they are entered and stored as decimal
   major amounts, because a rate can legitimately be 0.125 per unit. They are
   turned into minor units at the moment a line total is worked out, and
   rounded there, once. */

export interface Currency {
  /** ISO 4217, e.g. "GBP". */
  code: string
  symbol: string
  /** Minor-unit digits: 2 for GBP, 0 for JPY. */
  decimals: number
  symbolPosition: 'before' | 'after'
  /** A space between symbol and figure, as most of Europe sets it. */
  spaced: boolean
}

/** An amount in minor units. Named so a bare number can't be passed by mistake. */
export type Minor = number

export const CURRENCIES: ReadonlyArray<Currency> = [
  { code: 'GBP', symbol: '£', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'EUR', symbol: '€', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'USD', symbol: '$', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'CAD', symbol: 'CA$', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'AUD', symbol: 'A$', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'CHF', symbol: 'CHF', decimals: 2, symbolPosition: 'after', spaced: true },
  { code: 'SEK', symbol: 'kr', decimals: 2, symbolPosition: 'after', spaced: true },
  { code: 'NOK', symbol: 'kr', decimals: 2, symbolPosition: 'after', spaced: true },
  { code: 'DKK', symbol: 'kr', decimals: 2, symbolPosition: 'after', spaced: true },
  { code: 'PLN', symbol: 'zł', decimals: 2, symbolPosition: 'after', spaced: true },
  { code: 'CZK', symbol: 'Kč', decimals: 2, symbolPosition: 'after', spaced: true },
  { code: 'JPY', symbol: '¥', decimals: 0, symbolPosition: 'before', spaced: false },
  { code: 'INR', symbol: '₹', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'NZD', symbol: 'NZ$', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'ZAR', symbol: 'R', decimals: 2, symbolPosition: 'before', spaced: true },
  { code: 'TRY', symbol: '₺', decimals: 2, symbolPosition: 'before', spaced: false },
  { code: 'AED', symbol: 'AED', decimals: 2, symbolPosition: 'after', spaced: true },
  { code: 'SGD', symbol: 'S$', decimals: 2, symbolPosition: 'before', spaced: false },
]

export const currencyByCode = (code: string): Currency =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
