/* The running total, always in sight.

   An invoice is a document whose whole point is one number, and that number
   is usually at the bottom of a form long enough to scroll. So it is pinned
   to the foot of the editor instead: subtotal, whatever is being taken off or
   added on, the tax grouped by rate, and the amount due — the same rows in
   the same order as the printed totals block, so the bar reads as a preview
   of it rather than a second opinion.

   Every figure comes from the same calculation the sheet is drawn from. */

import type { InvoiceDoc } from '@model/invoice'
import type { Totals } from '@core/totals/calcTotals'
import { trimRate } from '@core/totals/calcTotals'
import { docStatus } from '@core/status/status'
import { Money } from '@elements/Money/Money'
import { StatusPill } from '@elements/StatusPill/StatusPill'
import { useT } from '@hooks/useT'
import styles from './TotalsLedger.module.css'

export interface TotalsLedgerProps {
  doc: InvoiceDoc
  totals: Totals
}

export function TotalsLedger ({ doc, totals }: TotalsLedgerProps) {
  /* The ledger is the editor's own reckoning, so it is written in the app's
     language even when the invoice beside it prints in another. */
  const t = useT()
  const locale = doc.settings.locale
  const currency = doc.currency

  const rows: Array<{ key: string; label: string; value: number }> = [
    { key: 'subtotal', label: t.ledger.subtotal, value: totals.subtotal },
  ]
  if (totals.documentDiscount) {
    rows.push({ key: 'discount', label: totals.documentDiscountLabel, value: -totals.documentDiscount })
  }
  if (totals.shipping) {
    rows.push({ key: 'shipping', label: doc.settings.shippingLabel || t.ledger.shipping, value: totals.shipping })
  }
  for (const tax of totals.taxRows) {
    rows.push({ key: tax.key, label: `${tax.label} ${trimRate(tax.rate)}%`, value: tax.amount })
  }
  if (totals.roundingAdjustment) {
    rows.push({ key: 'rounding', label: t.ledger.rounding, value: totals.roundingAdjustment })
  }
  /* The same move the printed sheet makes: once anything has been paid, the
     figure at the foot is what is left, and the total joins the rows above. */
  if (totals.paid) {
    rows.push({ key: 'total', label: t.ledger.total, value: totals.total })
    rows.push({ key: 'paid', label: t.ledger.paidToDate, value: -totals.paid })
    if (totals.overpaid) {
      rows.push({ key: 'overpaid', label: t.ledger.overpaid, value: totals.overpaid })
    }
  }

  return (
    <div className={styles.ledger}>
      <dl className={styles.rows}>
        {rows.map((row) => (
          <div className={styles.row} key={row.key}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.value}>
              <Money value={row.value} currency={currency} locale={locale} dimZero />
            </dd>
          </div>
        ))}
      </dl>

      <div className={styles.grand}>
        <StatusPill status={docStatus(doc)} size="sm" className={styles.status} />
        <span className={styles.grandLabel}>{t.ledger.amountDue}</span>
        <Money value={totals.amountDue} currency={currency} locale={locale} className={styles.grandValue} />
      </div>
    </div>
  )
}
