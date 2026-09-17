/* The payment code, in the editor.

   A section of its own rather than one more checkbox at the foot of the bank
   details, because the code is the one thing on the invoice that nobody can
   proof-read. An IBAN printed wrong is caught by the person reading it; a QR
   encoding the wrong account is caught by nobody, and the money goes.

   So this shows the code itself, at a size a phone can actually read off the
   screen, and under it in words exactly what a bank will fill the transfer
   in with. Checking the two against each other is the point of the panel. */

import type { InvoiceDoc } from '@model/invoice'
import type { Totals } from '@core/totals/calcTotals'
import { epcProblem, epcRequest, epcPayload } from '@core/payment/epc'
import { qrSvgDataUri } from '@core/payment/qrImage'
import { formatIban } from '@core/payment/iban'
import { formatMoney } from '@core/money/format'
import { useDocStore } from '@store/useDocStore'
import { useT } from '@hooks/useT'
import { Icon } from '@elements/Icon/Icon'
import styles from './PaymentQr.module.css'

export interface PaymentQrProps {
  doc: InvoiceDoc
  totals: Totals
}

/* The switch, which the editor puts on the section's title row. Exported
   from here rather than written there so the two halves of one control —
   the switch and what it switches — stay in the same file. */
export function PaymentQrToggle ({ doc }: { doc: InvoiceDoc }) {
  const t = useT()
  const patchPayment = useDocStore((s) => s.patchPayment)
  const on = doc.payment.showQr

  return (
    <button
      type="button"
      className={[styles.toggle, on ? styles.on : ''].filter(Boolean).join(' ')}
      aria-pressed={on}
      onClick={() => patchPayment({ showQr: !on }, 'payment:showQr')}
    >
      <Icon name={on ? 'check' : 'close'} size={13} />
      {t.payment.qrToggle}
    </button>
  )
}

export function PaymentQr ({ doc, totals }: PaymentQrProps) {
  const t = useT()

  if (!doc.payment.showQr) {
    return <p className={styles.note}>{t.payment.qrHint}</p>
  }

  const request = epcRequest(doc, totals)
  const problem = epcProblem(request)

  /* Nothing to draw yet, or something that would draw wrongly. Either way
     the invoice prints without a code, and the panel says which it is —
     a missing IBAN is a job to finish, a failed checksum is a typo, and an
     invoice with nothing left to pay is neither. Only the typo is coloured
     as a warning: the other two are states to read, not mistakes to fix. */
  if (problem) {
    const said = problem === 'bad-iban'
      ? t.payment.qrBadIban
      : problem === 'nothing-due'
        ? t.payment.qrNothingDue
        : t.payment.qrNeedsIban
    return (
      <p className={[styles.note, problem === 'bad-iban' ? styles.warn : ''].filter(Boolean).join(' ')}>
        {said}
      </p>
    )
  }

  const src = qrSvgDataUri(epcPayload(request) ?? '')
  if (!src) return <p className={styles.note}>{t.payment.qrNeedsIban}</p>

  const euro = request.currencyCode === 'EUR'
  const rows: Array<{ label: string; value: string }> = [
    { label: t.payment.accountName, value: request.name },
    { label: t.payment.iban, value: formatIban(request.iban) },
    {
      label: t.lines.amount,
      value: euro
        ? formatMoney(request.amount, doc.currency, doc.settings.locale)
        : t.editor.notSet,
    },
    { label: t.payment.reference, value: request.reference },
  ]

  return (
    <div className={styles.body}>
      <img className={styles.code} src={src} alt={t.payment.qr} />

      <div className={styles.what}>
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value || '—'}</dd>
            </div>
          ))}
        </dl>
        {euro ? null : <p className={styles.note}>{t.payment.qrNotEuro}</p>}
      </div>
    </div>
  )
}
