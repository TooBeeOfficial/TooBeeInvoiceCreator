/* An amount of money, on screen.

   Takes minor units and a currency and prints them in the tabular face, so a
   column of these lines up on the decimal point without anyone laying out a
   grid. Never used for anything that is not money — a quantity is a number,
   not an amount. */

import type { Currency, Minor } from '@model/money'
import { formatMoney } from '@core/money/format'
import styles from './Money.module.css'

export interface MoneyProps {
  value: Minor
  currency: Currency
  locale?: string
  /** Larger and heavier, for a total that leads a block. */
  emphasis?: boolean
  /** Greys a zero so an empty row does not shout. */
  dimZero?: boolean
  className?: string
}

export function Money ({
  value,
  currency,
  locale = 'en-GB',
  emphasis = false,
  dimZero = false,
  className,
}: MoneyProps) {
  const classes = [
    styles.money,
    emphasis ? styles.emphasis : '',
    dimZero && value === 0 ? styles.zero : '',
    value < 0 ? styles.negative : '',
    className,
  ].filter(Boolean).join(' ')

  return <span className={classes}>{formatMoney(value, currency, locale)}</span>
}
