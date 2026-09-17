/* My company.

   Who you are, how your invoice numbers are built, and what a new invoice
   starts as. All of it belongs to your business rather than to any one
   document: changing a default here never reaches back into an invoice
   already written, because what you charged in March should not move when
   you change your mind in June.

   How the app itself behaves — its appearance, its language — is not here.
   That is a setting of the program, not a fact about your business, and it
   lives in the Settings dialog on the rail.

   Everything saves as it is typed. There is no Save button, because nobody
   thinks of their own address as a document. */

import type { PaperSize } from '@model/invoice'
import type { TaxMode } from '@model/tax'
import { CURRENCIES } from '@model/money'
import { PAPER_LABELS } from '@core/document/paper'
import { formatNumber } from '@core/numbering/numbering'
import { allTemplates } from '@templates/registry'
import { usePrefsStore } from '@store/usePrefsStore'
import { Panel } from '@elements/Panel/Panel'
import { Field } from '@elements/Field/Field'
import { TextInput } from '@elements/TextInput/TextInput'
import { NumberInput } from '@elements/NumberInput/NumberInput'
import { Select } from '@elements/Select/Select'
import { Textarea } from '@elements/Textarea/Textarea'
import { Checkbox } from '@elements/Checkbox/Checkbox'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import { PartyForm } from '@components/PartyForm/PartyForm'
import { useT } from '@hooks/useT'
import styles from './CompanyPage.module.css'

export function CompanyPage () {
  const t = useT()
  const prefs = usePrefsStore((s) => s.prefs)
  const setSeller = usePrefsStore((s) => s.setSeller)
  const setNumbering = usePrefsStore((s) => s.setNumbering)
  const setDefaults = usePrefsStore((s) => s.setDefaults)

  const numbering = prefs.numbering
  const defaults = prefs.defaults
  const preview = formatNumber(numbering, numbering.next, new Date().getFullYear())

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h1 className={styles.title}>{t.company.title}</h1>
        </header>

        <Panel title={t.company.businessTitle} description={t.company.businessNote}>
          <PartyForm
            party={prefs.seller}
            side="seller"
            onPatch={(patch) => setSeller(patch)}
            onAddress={(patch) => setSeller({ address: { ...prefs.seller.address, ...patch } })}
            onTaxIds={(taxIds) => setSeller({ taxIds })}
          />
        </Panel>

        <Panel
          title={t.company.numbersTitle}
          description={t.company.numbersNote}
        >
          <div className={styles.row}>
            <Field label={t.company.prefix}>
              {({ id }) => (
                <TextInput
                  id={id}
                  value={numbering.prefix}
                  onValueChange={(prefix) => setNumbering({ prefix })}
                  placeholder="INV-"
                />
              )}
            </Field>

            <Field label={t.company.nextNumber}>
              {({ id }) => (
                <NumberInput
                  id={id}
                  value={numbering.next}
                  onValueChange={(next) => setNumbering({ next: Math.max(1, Math.round(next)) })}
                  decimals={0}
                  min={1}
                />
              )}
            </Field>

            <Field label={t.company.digits} hint={t.company.digitsHint}>
              {({ id, describedBy }) => (
                <NumberInput
                  id={id}
                  aria-describedby={describedBy}
                  value={numbering.padding}
                  onValueChange={(padding) => setNumbering({ padding: Math.min(8, Math.max(1, Math.round(padding))) })}
                  decimals={0}
                  min={1}
                  max={8}
                />
              )}
            </Field>
          </div>

          <div className={styles.checks}>
            <Checkbox
              checked={numbering.includeYear}
              onCheckedChange={(includeYear) => setNumbering({ includeYear })}
              label={t.company.includeYear}
            />
            <Checkbox
              checked={numbering.resetYearly}
              onCheckedChange={(resetYearly) => setNumbering({ resetYearly })}
              label={t.company.resetYearly}
              hint={t.company.resetYearlyHint}
            />
          </div>

          <p className={styles.preview}>{t.company.preview.replace('{number}', preview)}</p>
        </Panel>

        <Panel title={t.company.defaultsTitle} description={t.company.defaultsNote}>
          <div className={styles.row}>
            <Field label={t.company.currency}>
              {({ id }) => (
                <Select
                  id={id}
                  value={defaults.currencyCode}
                  options={CURRENCIES.map((c) => ({ value: c.code, label: c.code, note: c.symbol }))}
                  onValueChange={(currencyCode) => setDefaults({ currencyCode })}
                />
              )}
            </Field>

            <Field label={t.company.paper}>
              {({ id }) => (
                <Select
                  id={id}
                  value={defaults.paper}
                  options={(Object.keys(PAPER_LABELS) as PaperSize[]).map((size) => ({ value: size, label: PAPER_LABELS[size] }))}
                  onValueChange={(paper) => setDefaults({ paper })}
                />
              )}
            </Field>

            <Field label={t.company.template}>
              {({ id }) => (
                <Select
                  id={id}
                  value={defaults.templateId}
                  options={allTemplates().map((template) => ({ value: template.id, label: template.name }))}
                  onValueChange={(templateId) => setDefaults({ templateId })}
                />
              )}
            </Field>
          </div>

          <div className={styles.row}>
            <Field label={t.company.taxName}>
              {({ id }) => (
                <TextInput
                  id={id}
                  value={defaults.taxLabel}
                  onValueChange={(taxLabel) => setDefaults({ taxLabel })}
                  placeholder="VAT"
                />
              )}
            </Field>

            <Field label={t.company.taxRate}>
              {({ id }) => (
                <NumberInput
                  id={id}
                  value={defaults.taxRate}
                  onValueChange={(taxRate) => setDefaults({ taxRate })}
                  decimals={3}
                  min={0}
                  max={100}
                  suffix="%"
                />
              )}
            </Field>

            <Field label={t.company.terms} hint={t.company.termsHint}>
              {({ id, describedBy }) => (
                <NumberInput
                  id={id}
                  aria-describedby={describedBy}
                  value={defaults.termsDays}
                  onValueChange={(termsDays) => setDefaults({
                    termsDays: Math.max(0, Math.round(termsDays)),
                    terms: termsDays === 0
                      ? t.details.termsOnReceipt
                      : t.details.termsDays.replace('{days}', String(Math.round(termsDays))),
                  })}
                  decimals={0}
                  min={0}
                />
              )}
            </Field>
          </div>

          <Field label={t.company.taxApplies}>
            {() => (
              <SegmentedControl
                value={defaults.taxMode}
                label={t.company.taxMode}
                segments={[
                  { value: 'invoice' as TaxMode, label: t.tax.modeInvoice },
                  { value: 'line' as TaxMode, label: t.tax.modeLine },
                  { value: 'multi' as TaxMode, label: t.tax.modeMulti },
                ]}
                onValueChange={(taxMode) => setDefaults({ taxMode })}
              />
            )}
          </Field>

          <Checkbox
            checked={defaults.pricesIncludeTax}
            onCheckedChange={(pricesIncludeTax) => setDefaults({ pricesIncludeTax })}
            label={t.company.inclusive}
            hint={t.company.inclusiveHint}
          />

          <Field label={t.company.standingNote} hint={t.company.standingNoteHint}>
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                aria-describedby={describedBy}
                value={defaults.notes}
                onValueChange={(notes) => setDefaults({ notes })}
                placeholder={t.editor.noteToClientPlaceholder}
                minRows={2}
                maxRows={5}
              />
            )}
          </Field>

          <Field label={t.company.standingPayment} hint={t.company.standingPaymentHint}>
            {({ id }) => (
              <Textarea
                id={id}
                value={defaults.paymentInstructions}
                onValueChange={(paymentInstructions) => setDefaults({ paymentInstructions })}
                placeholder={t.payment.instructionsPlaceholder}
                minRows={2}
                maxRows={5}
              />
            )}
          </Field>
        </Panel>

      </div>
    </div>
  )
}
