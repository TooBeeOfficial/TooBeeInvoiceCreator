/* Money that has arrived against this invoice.

   Kept apart from "How to pay", which is where the money should go. This is
   what came back, and it is a list rather than a tick box because part
   payments, deposits and instalments are all ordinary: an invoice is not
   paid or unpaid so much as paid up to a point.

   Recording one is a single click — the button arrives with today's date and
   whatever is still outstanding already filled in — and the rest of the row
   exists for the cases where that is not the whole story. */

import type { InvoiceDoc } from '@model/invoice'
import type { AppStrings } from '@core/i18n'
import type { Totals } from '@core/totals/calcTotals'
import { useDocStore } from '@store/useDocStore'
import { useT } from '@hooks/useT'
import { formatMoney } from '@core/money/format'
import { fromMinor, toMinor } from '@core/money/money'
import { Field } from '@elements/Field/Field'
import { TextInput } from '@elements/TextInput/TextInput'
import { NumberInput } from '@elements/NumberInput/NumberInput'
import { DateInput } from '@elements/DateInput/DateInput'
import { Button } from '@elements/Button/Button'
import { IconButton } from '@elements/IconButton/IconButton'
import styles from './PaymentsReceived.module.css'

export interface PaymentsReceivedProps {
  doc: InvoiceDoc
  totals: Totals
}

export function PaymentsReceived ({ doc, totals }: PaymentsReceivedProps) {
  /* The suggestions are translated with everything else: the ways money turns
     up have their own names in each country. They stay suggestions — somebody
     will always be paid in something not on the list. */
  const t = useT()
  const addPayment = useDocStore((s) => s.addPaymentReceived)
  const patchPayment = useDocStore((s) => s.patchPaymentReceived)
  const removePayment = useDocStore((s) => s.removePaymentReceived)

  const currency = doc.currency
  const payments = doc.paymentsReceived

  return (
    <div className={styles.block}>
      {payments.length > 0 && (
        <ul className={styles.list}>
          {payments.map((payment, index) => (
            <li className={styles.item} key={payment.id}>
              <div className={styles.fields}>
                <Field label={t.received.date} inline>
                  {({ id }) => (
                    <DateInput
                      id={id}
                      aria-label={fieldLabel(t, t.received.date, index)}
                      value={payment.date}
                      onValueChange={(date) => patchPayment(payment.id, { date })}
                    />
                  )}
                </Field>

                <Field label={t.received.amount} inline>
                  {({ id }) => (
                    <NumberInput
                      id={id}
                      aria-label={fieldLabel(t, t.received.amount, index)}
                      value={fromMinor(payment.amount, currency.decimals)}
                      onValueChange={(value) => patchPayment(
                        payment.id,
                        { amount: toMinor(value, currency.decimals) },
                        `received:${payment.id}:amount`,
                      )}
                      decimals={currency.decimals}
                      suffix={currency.symbol}
                    />
                  )}
                </Field>

                <Field label={t.received.method} inline>
                  {({ id }) => (
                    <TextInput
                      id={id}
                      aria-label={fieldLabel(t, t.received.method, index)}
                      value={payment.method}
                      onValueChange={(method) => patchPayment(payment.id, { method }, `received:${payment.id}:method`)}
                      list="payment-methods"
                      placeholder={t.received.methodPlaceholder}
                    />
                  )}
                </Field>

                <Field label={t.received.reference} inline>
                  {({ id }) => (
                    <TextInput
                      id={id}
                      aria-label={fieldLabel(t, t.received.reference, index)}
                      value={payment.reference}
                      onValueChange={(reference) => patchPayment(payment.id, { reference }, `received:${payment.id}:reference`)}
                      placeholder={doc.meta.number}
                    />
                  )}
                </Field>
              </div>

              <IconButton
                icon="trash"
                label={t.received.removePayment.replace('{index}', String(index + 1))}
                tone="danger"
                onClick={() => removePayment(payment.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* The browser's own suggestion list: it offers the usual answers
          without refusing an unusual one. */}
      <datalist id="payment-methods">
        {t.received.methods.map((method) => <option value={method} key={method} />)}
      </datalist>

      <div className={styles.foot}>
        <Button icon="plus" onClick={() => addPayment()}>{t.received.record}</Button>

        <p className={styles.standing}>
          {payments.length === 0
            ? t.received.nothingYet
            : t.received.paidOf
              .replace('{paid}', formatMoney(totals.paid, currency, doc.settings.locale))
              .replace('{total}', formatMoney(totals.total, currency, doc.settings.locale))}
        </p>
      </div>
    </div>
  )
}

/* "Amount, payment 2" for a screen reader, built from the same words the
   visible label uses so the two never drift apart. */
function fieldLabel (t: AppStrings, field: string, index: number): string {
  return t.lines.fieldOnLine.replace('{field}', field).replace('{index}', String(index + 1))
}
