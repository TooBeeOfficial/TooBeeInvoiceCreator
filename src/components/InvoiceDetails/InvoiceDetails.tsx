/* The facts that identify the invoice.

   Number, dates, terms, currency, and what state it is in. Terms and the due
   date are deliberately tied together — choosing Net 30 moves the date, and
   choosing a date by hand leaves the terms alone — because they are two ways
   of saying the same thing and keeping them independent produces invoices
   that contradict themselves. */

import type { InvoiceDoc } from '@model/invoice'
import type { AppStrings } from '@core/i18n'
import { CURRENCIES } from '@model/money'
import { LOCALES } from '@core/i18n'
import { SETTABLE_STATUSES } from '@core/status/status'
import { STATUS_LABELS } from '@model/invoice'
import { addDays, daysBetween } from '@core/money/format'
import { useDocStore } from '@store/useDocStore'
import { useT } from '@hooks/useT'
import { Field } from '@elements/Field/Field'
import { TextInput } from '@elements/TextInput/TextInput'
import { DateInput } from '@elements/DateInput/DateInput'
import { Select } from '@elements/Select/Select'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import styles from './InvoiceDetails.module.css'

export interface InvoiceDetailsProps {
  doc: InvoiceDoc
  errors?: Partial<Record<'number' | 'issueDate' | 'dueDate', string>>
}

/* "Net 30" is a phrase, not a number with a word stuck on the front, so the
   dictionary carries the whole pattern and the days drop into it. */
const termOptions = (t: AppStrings) => [
  { value: '0', label: t.details.termsOnReceipt },
  ...[7, 14, 30, 45, 60, 90].map((days) => ({
    value: String(days),
    label: t.details.termsDays.replace('{days}', String(days)),
  })),
  { value: 'custom', label: t.details.termsCustom },
]

export function InvoiceDetails ({ doc, errors }: InvoiceDetailsProps) {
  const patchMeta = useDocStore((s) => s.patchMeta)
  const setTermsDays = useDocStore((s) => s.setTermsDays)
  const setStatus = useDocStore((s) => s.setStatus)
  const setCurrency = useDocStore((s) => s.setCurrency)
  const patchSettings = useDocStore((s) => s.patchSettings)
  const t = useT()
  const setField = useDocStore((s) => s.setField)

  const meta = doc.meta
  const TERM_OPTIONS = termOptions(t)
  /* The terms select shows what the dates actually say, even after the due
     date has been dragged somewhere the presets do not cover. */
  const impliedDays = meta.dueDate && meta.issueDate ? daysBetween(meta.issueDate, meta.dueDate) : null
  const termValue = TERM_OPTIONS.some((o) => o.value === String(impliedDays)) && meta.termsDays !== null
    ? String(impliedDays)
    : 'custom'

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <Field label={t.details.number} required error={errors?.number}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={meta.number}
              onValueChange={(value) => patchMeta({ number: value }, 'meta:number')}
              figure
              className={styles.number}
            />
          )}
        </Field>

        <Field label={t.details.currency}>
          {({ id }) => (
            <Select
              id={id}
              value={doc.currency.code}
              options={CURRENCIES.map((c) => ({ value: c.code, label: c.code, note: c.symbol }))}
              onValueChange={setCurrency}
            />
          )}
        </Field>

        <Field label={t.details.status}>
          {({ id }) => (
            <Select
              id={id}
              value={meta.status}
              options={SETTABLE_STATUSES.map((s) => ({ value: s, label: t.status[s] ?? STATUS_LABELS[s] }))}
              onValueChange={(value) => setStatus(value)}
            />
          )}
        </Field>
      </div>

      <div className={styles.row}>
        <Field label={t.details.issueDate} required error={errors?.issueDate}>
          {({ id, describedBy, invalid }) => (
            <DateInput
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={meta.issueDate}
              onValueChange={(value) => patchMeta({
                issueDate: value,
                /* Moving the issue date carries the due date with it, as long
                   as the due date is still the one the terms produced. */
                dueDate: meta.termsDays !== null && value ? addDays(value, meta.termsDays) : meta.dueDate,
              })}
            />
          )}
        </Field>

        <Field label={t.details.terms}>
          {({ id }) => (
            <Select
              id={id}
              value={termValue}
              options={TERM_OPTIONS}
              onValueChange={(value) => setTermsDays(value === 'custom' ? null : Number(value))}
            />
          )}
        </Field>

        <Field label={t.details.dueDate} error={errors?.dueDate}>
          {({ id, describedBy, invalid }) => (
            <DateInput
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={meta.dueDate}
              onValueChange={(value) => patchMeta({ dueDate: value, termsDays: null })}
            />
          )}
        </Field>
      </div>

      {termValue === 'custom' ? (
        <Field label={t.details.ownTerms} hint={t.details.ownTermsHint}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              value={meta.terms}
              onValueChange={(value) => patchMeta({ terms: value }, 'meta:terms')}
              placeholder={t.details.ownTermsPlaceholder}
            />
          )}
        </Field>
      ) : null}

      <div className={styles.row}>
        <Field label={t.details.purchaseOrder}>
          {({ id }) => (
            <TextInput
              id={id}
              value={meta.purchaseOrder}
              onValueChange={(value) => patchMeta({ purchaseOrder: value }, 'meta:po')}
              placeholder={t.common.optional}
            />
          )}
        </Field>

        <Field label={t.details.reference}>
          {({ id }) => (
            <TextInput
              id={id}
              value={meta.reference}
              onValueChange={(value) => patchMeta({ reference: value }, 'meta:reference')}
              placeholder={t.common.optional}
            />
          )}
        </Field>

        <Field label={t.document.language} hint={t.document.languageHint}>
          {({ id, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              value={doc.settings.locale}
              options={LOCALES.map((l) => ({ value: l.code, label: l.endonym }))}
              onValueChange={(locale) => patchSettings({ locale })}
            />
          )}
        </Field>

        <Field label={t.details.supplyDate} hint={t.details.supplyDateHint}>
          {({ id, describedBy }) => (
            <DateInput
              id={id}
              aria-describedby={describedBy}
              value={meta.supplyDate}
              onValueChange={(value) => patchMeta({ supplyDate: value })}
            />
          )}
        </Field>
      </div>

      <div className={styles.row}>
        <Field label={t.details.title} hint={t.details.titleHint} className={styles.wide}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              value={doc.title}
              onValueChange={(value) => setField('title', value)}
              placeholder={t.details.titlePlaceholder}
            />
          )}
        </Field>

        <Field
          label={t.details.detail}
          hint={doc.settings.detail === 'simple' ? t.details.simpleHint : t.details.fullHint}
        >
          {() => (
            <SegmentedControl
              value={doc.settings.detail}
              label={t.details.detailLabel}
              segments={[
                { value: 'full', label: t.details.full },
                { value: 'simple', label: t.details.simple },
              ]}
              onValueChange={(detail) => patchSettings({ detail })}
              className={styles.detail}
            />
          )}
        </Field>
      </div>
    </div>
  )
}
