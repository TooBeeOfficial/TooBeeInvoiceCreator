/* How to pay.

   The single most common reason an invoice comes back with a question is
   that it did not say where to send the money. Everything here is optional
   because the right set of fields depends on the country — IBAN and BIC in
   Europe, sort code and account number in the UK, a routing number in the
   US — and an invoice should print only the ones that were filled in. */

import type { InvoiceDoc } from '@model/invoice'
import { useDocStore } from '@store/useDocStore'
import { useT } from '@hooks/useT'
import { Field } from '@elements/Field/Field'
import { TextInput } from '@elements/TextInput/TextInput'
import { Textarea } from '@elements/Textarea/Textarea'
import styles from './PaymentForm.module.css'

export interface PaymentFormProps {
  doc: InvoiceDoc
}

export function PaymentForm ({ doc }: PaymentFormProps) {
  const t = useT()
  const patchPayment = useDocStore((s) => s.patchPayment)
  const payment = doc.payment

  const text = (
    field: keyof typeof payment,
    label: string,
    placeholder?: string,
    hint?: string,
  ) => (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <TextInput
          id={id}
          aria-describedby={describedBy}
          value={payment[field] as string}
          onValueChange={(value) => patchPayment({ [field]: value }, `payment:${field}`)}
          placeholder={placeholder}
        />
      )}
    </Field>
  )

  return (
    <div className={styles.form}>
      <Field label={t.payment.instructions} hint={t.payment.instructionsHint}>
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            value={payment.instructions}
            onValueChange={(value) => patchPayment({ instructions: value }, 'payment:instructions')}
            placeholder={t.payment.instructionsPlaceholder}
            minRows={2}
            maxRows={5}
          />
        )}
      </Field>

      <div className={styles.row}>
        {text('bankName', t.payment.bank)}
        {text('accountName', t.payment.accountName)}
      </div>

      <div className={styles.row}>
        {text('iban', t.payment.iban)}
        {text('bic', t.payment.bic)}
      </div>

      <div className={styles.row}>
        {text('accountNumber', t.payment.accountNumber)}
        {text('sortCode', t.payment.sortCode)}
        {text('routingNumber', t.payment.routingNumber)}
      </div>

      <div className={styles.row}>
        <Field label={t.payment.payOnline} hint={t.payment.payOnlineHint}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              value={payment.link}
              onValueChange={(value) => patchPayment({ link: value }, 'payment:link')}
              placeholder={t.payment.payOnlinePlaceholder}
            />
          )}
        </Field>

        <Field label={t.payment.reference} hint={t.payment.referenceHint.replace('{number}', doc.meta.number)}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              value={payment.reference}
              onValueChange={(value) => patchPayment({ reference: value }, 'payment:reference')}
              placeholder={doc.meta.number}
            />
          )}
        </Field>
      </div>
    </div>
  )
}
