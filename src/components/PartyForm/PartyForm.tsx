/* Who someone is: name, address, how to reach them, what they are registered
   as.

   The same form serves your own business, the client on an invoice, and an
   entry in the client book, because they are the same kind of thing and
   should be typed the same way in all three places.

   The registration number is one labelled pair, not a "VAT number" field.
   What goes on the label depends entirely on where the business is — VAT
   Number in the UK, EIN in the US, ABN in Australia — and a form that
   assumes one of them is wrong everywhere else. */

import type { Party, TaxIdentifier } from '@model/party'
import type { AppStrings } from '@core/i18n'
import { countries } from '@core/geo/countries'
import { isEmailAddress, sendMailTo } from '@core/mail/mailto'
import { useT } from '@hooks/useT'
import { Field } from '@elements/Field/Field'
import { TextInput } from '@elements/TextInput/TextInput'
import { Select } from '@elements/Select/Select'
import { Button } from '@elements/Button/Button'
import { IconButton } from '@elements/IconButton/IconButton'
import styles from './PartyForm.module.css'

export interface PartyFormProps {
  party: Party
  /** Which set of words to use: your own details read differently. */
  side: 'seller' | 'buyer'
  onPatch: (patch: Partial<Party>, key?: string) => void
  onAddress: (patch: Partial<Party['address']>, key?: string) => void
  onTaxIds: (taxIds: TaxIdentifier[]) => void
  errors?: Partial<Record<'name', string>>
  className?: string
}

const ID_SUGGESTIONS = ['VAT Number', 'Tax ID', 'EIN', 'ABN', 'GST Number', 'Company Number', 'Registration']

/* "Label, 2" for a screen reader on a repeated row. */
function fieldLabel (t: AppStrings, field: string, index: number): string {
  return t.lines.fieldOnLine.replace('{field}', field).replace('{index}', String(index + 1))
}

export function PartyForm ({ party, side, onPatch, onAddress, onTaxIds, errors, className }: PartyFormProps) {
  const t = useT()
  const isSeller = side === 'seller'
  const countryOptions = [
    { value: '', label: t.editor.notSet },
    ...countries().map((c) => ({ value: c.code, label: c.name })),
  ]

  const setTaxId = (index: number, patch: Partial<TaxIdentifier>) => {
    onTaxIds(party.taxIds.map((id, i) => (i === index ? { ...id, ...patch } : id)))
  }

  return (
    <div className={[styles.form, className].filter(Boolean).join(' ')}>
      <div className={styles.row}>
        <Field
          label={t.party.name}
          required
          error={errors?.name}
        >
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={party.name}
              onValueChange={(value) => onPatch({ name: value }, `${side}:name`)}
              placeholder={t.party.namePlaceholder}
            />
          )}
        </Field>

        <Field label={t.party.contact} hint={t.party.contactHint}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              value={party.contactName}
              onValueChange={(value) => onPatch({ contactName: value }, `${side}:contact`)}
              placeholder={t.common.optional}
            />
          )}
        </Field>
      </div>

      <div className={styles.row}>
        <Field label={t.party.email}>
          {({ id }) => (
            /* The address and the button that uses it. The button appears
               greyed until the address is one, so a half-typed line cannot
               launch a mail client on nothing. */
            <div className={styles.withAction}>
              <TextInput
                id={id}
                type="email"
                value={party.email}
                onValueChange={(value) => onPatch({ email: value }, `${side}:email`)}
                placeholder={t.party.emailPlaceholder}
              />
              <IconButton
                icon="mail"
                label={t.party.sendEmail}
                disabled={!isEmailAddress(party.email)}
                onClick={() => sendMailTo(party.email)}
              />
            </div>
          )}
        </Field>

        <Field label={t.party.phone}>
          {({ id }) => (
            <TextInput
              id={id}
              type="tel"
              value={party.phone}
              onValueChange={(value) => onPatch({ phone: value }, `${side}:phone`)}
            />
          )}
        </Field>
      </div>

      {isSeller ? (
        <Field label={t.party.website}>
          {({ id }) => (
            <TextInput
              id={id}
              value={party.website}
              onValueChange={(value) => onPatch({ website: value }, `${side}:website`)}
              placeholder={t.party.websitePlaceholder}
            />
          )}
        </Field>
      ) : null}

      <div className={styles.address}>
        <Field label={t.party.street} className={styles.wide}>
          {({ id }) => (
            <TextInput
              id={id}
              value={party.address.line1}
              onValueChange={(value) => onAddress({ line1: value }, `${side}:line1`)}
              placeholder={t.party.streetPlaceholder}
            />
          )}
        </Field>

        <Field label={t.party.street2} className={styles.wide}>
          {({ id }) => (
            <TextInput
              id={id}
              value={party.address.line2}
              onValueChange={(value) => onAddress({ line2: value }, `${side}:line2`)}
              placeholder={t.common.optional}
            />
          )}
        </Field>

        <Field label={t.party.town}>
          {({ id }) => (
            <TextInput
              id={id}
              value={party.address.city}
              onValueChange={(value) => onAddress({ city: value }, `${side}:city`)}
            />
          )}
        </Field>

        <Field label={t.party.postCode}>
          {({ id }) => (
            <TextInput
              id={id}
              value={party.address.postalCode}
              onValueChange={(value) => onAddress({ postalCode: value }, `${side}:postal`)}
            />
          )}
        </Field>

        <Field label={t.party.region}>
          {({ id }) => (
            <TextInput
              id={id}
              value={party.address.region}
              onValueChange={(value) => onAddress({ region: value }, `${side}:region`)}
            />
          )}
        </Field>

        <Field label={t.party.country}>
          {({ id }) => (
            <Select
              id={id}
              value={party.address.countryCode}
              options={countryOptions}
              onValueChange={(value) => onAddress({ countryCode: value })}
            />
          )}
        </Field>
      </div>

      <div className={styles.ids}>
        <div className={styles.idsHead}>
          <span className={styles.idsLabel}>{t.party.registrations}</span>
          <Button
            size="sm"
            variant="ghost"
            icon="plus"
            onClick={() => onTaxIds([...party.taxIds, { label: ID_SUGGESTIONS[0], value: '' }])}
          >
            {t.party.addRegistration}
          </Button>
        </div>

        {party.taxIds.length === 0 ? null : (
          <ul className={styles.idList}>
            {party.taxIds.map((taxId, index) => (
              <li className={styles.idRow} key={index}>
                <TextInput
                  className={styles.idLabel}
                  value={taxId.label}
                  onValueChange={(value) => setTaxId(index, { label: value })}
                  list="tax-id-labels"
                  aria-label={fieldLabel(t, t.party.registrationLabel, index)}
                  placeholder={t.party.registrationLabel}
                />
                <TextInput
                  value={taxId.value}
                  onValueChange={(value) => setTaxId(index, { value })}
                  aria-label={fieldLabel(t, t.party.registrationNumber, index)}
                  placeholder={t.party.registrationNumber}
                />
                <IconButton
                  icon="trash"
                  label={t.party.removeRegistration}
                  size="sm"
                  tone="danger"
                  onClick={() => onTaxIds(party.taxIds.filter((_, i) => i !== index))}
                />
              </li>
            ))}
          </ul>
        )}

        <datalist id="tax-id-labels">
          {ID_SUGGESTIONS.map((label) => <option key={label} value={label} />)}
        </datalist>
      </div>
    </div>
  )
}
