/* How this invoice charges tax, and what else moves the total.

   Three modes, because three genuinely different situations exist: one rate
   on everything, a different rate per line, or several taxes stacked on the
   same line the way GST and PST are in Canada. Switching between them never
   loses what was typed — every line keeps its own list of taxes underneath,
   and the mode only decides how much of that list is used and shown.

   The discount, the carriage and the rounding sit here too, because they are
   the other three things that change the total without being something you
   sold. */

import type { InvoiceDoc } from '@model/invoice'
import { COMMON_TAXES } from '@model/tax'
import { makeId } from '@core/ids'
import { useDocStore } from '@store/useDocStore'
import { useT } from '@hooks/useT'
import { Field } from '@elements/Field/Field'
import { TextInput } from '@elements/TextInput/TextInput'
import { NumberInput } from '@elements/NumberInput/NumberInput'
import { Select } from '@elements/Select/Select'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import { Checkbox } from '@elements/Checkbox/Checkbox'
import styles from './TaxSettings.module.css'

export interface TaxSettingsProps {
  doc: InvoiceDoc
}


export function TaxSettings ({ doc }: TaxSettingsProps) {
  const t = useT()
  const patchSettings = useDocStore((s) => s.patchSettings)
  const settings = doc.settings
  const tax = settings.defaultTax
  const discount = settings.discount

  const presetValue = COMMON_TAXES.findIndex((preset) => preset.label === tax.label && preset.rate === tax.rate)
  const modeNote = {
    invoice: t.tax.modeInvoice,
    line: t.tax.modeLine,
    multi: t.tax.modeMulti,
  }

  return (
    <div className={styles.form}>
      <Field label={t.tax.applies} hint={modeNote[settings.taxMode]}>
        {() => (
          <SegmentedControl
            value={settings.taxMode}
            label={t.tax.howApplied}
            segments={[
              { value: 'invoice', label: t.tax.modeInvoice },
              { value: 'line', label: t.tax.modeLine },
              { value: 'multi', label: t.tax.modeMulti },
            ]}
            onValueChange={(mode) => patchSettings({
              taxMode: mode,
              /* A per-line invoice needs its rate column, or the rates it now
                 depends on would be invisible. */
              showTaxColumn: mode === 'invoice' ? false : true,
            })}
          />
        )}
      </Field>

      <div className={styles.row}>
        <Field label={t.tax.name} hint={t.tax.nameHint}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              aria-describedby={describedBy}
              value={tax.label}
              onValueChange={(label) => patchSettings({ defaultTax: { ...tax, label } }, 'tax:label')}
              placeholder="VAT"
            />
          )}
        </Field>

        <Field label={t.tax.rate}>
          {({ id }) => (
            <NumberInput
              id={id}
              value={tax.rate}
              onValueChange={(rate) => patchSettings({ defaultTax: { ...tax, rate } }, 'tax:rate')}
              decimals={3}
              min={0}
              max={100}
              suffix="%"
            />
          )}
        </Field>

        <Field label={t.tax.commonRates} hint={t.tax.commonRatesHint}>
          {({ id, describedBy }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              value={presetValue >= 0 ? String(presetValue) : ''}
              options={[
                { value: '', label: '—' },
                ...COMMON_TAXES.map((preset, i) => ({
                  value: String(i),
                  label: preset.rate ? `${preset.label} ${preset.rate}%` : preset.label,
                  note: preset.note,
                })),
              ]}
              onValueChange={(value) => {
                if (!value) return
                const preset = COMMON_TAXES[Number(value)]
                patchSettings({ defaultTax: { id: makeId('tax'), label: preset.label, rate: preset.rate } })
              }}
            />
          )}
        </Field>
      </div>

      <Checkbox
        checked={settings.pricesIncludeTax}
        onCheckedChange={(pricesIncludeTax) => patchSettings({ pricesIncludeTax })}
        label={t.tax.inclusive}
        hint={t.tax.inclusiveHint}
      />

      <div className={styles.divider} />

      <div className={styles.row}>
        <Field label={t.tax.discount}>
          {() => (
            <SegmentedControl
              value={discount.type}
              size="sm"
              label={t.tax.discountType}
              segments={[
                { value: 'none', label: t.tax.discountNone },
                { value: 'percent', label: t.tax.discountPercent },
                { value: 'amount', label: t.tax.discountAmount },
              ]}
              onValueChange={(type) => patchSettings({ discount: { ...discount, type } })}
            />
          )}
        </Field>

        <Field label={t.tax.discountValue}>
          {({ id }) => (
            <NumberInput
              id={id}
              value={discount.value}
              onValueChange={(value) => patchSettings({ discount: { ...discount, value } }, 'discount:value')}
              decimals={2}
              min={0}
              disabled={discount.type === 'none'}
              suffix={discount.type === 'amount' ? doc.currency.symbol : '%'}
            />
          )}
        </Field>

        <Field label={t.tax.discountLabel}>
          {({ id }) => (
            <TextInput
              id={id}
              value={discount.label}
              onValueChange={(label) => patchSettings({ discount: { ...discount, label } }, 'discount:label')}
              disabled={discount.type === 'none'}
              placeholder={t.tax.discount}
            />
          )}
        </Field>
      </div>

      <div className={styles.row}>
        <Field label={t.tax.shippingLabel}>
          {({ id }) => (
            <TextInput
              id={id}
              value={settings.shippingLabel}
              onValueChange={(shippingLabel) => patchSettings({ shippingLabel }, 'shipping:label')}
              placeholder={t.tax.shipping}
            />
          )}
        </Field>

        <Field label={t.tax.shipping}>
          {({ id }) => (
            <NumberInput
              id={id}
              value={settings.shipping}
              onValueChange={(shipping) => patchSettings({ shipping }, 'shipping:value')}
              decimals={doc.currency.decimals}
              min={0}
              suffix={doc.currency.symbol}
            />
          )}
        </Field>

        <div className={styles.stack}>
          <Checkbox
            checked={settings.shippingTaxable}
            onCheckedChange={(shippingTaxable) => patchSettings({ shippingTaxable })}
            label={t.tax.taxShipping}
            disabled={!settings.shipping}
          />
          <Checkbox
            checked={settings.roundTotal}
            onCheckedChange={(roundTotal) => patchSettings({ roundTotal })}
            label={t.tax.roundTotal}
            hint={t.tax.roundTotalHint}
          />
        </div>
      </div>
    </div>
  )
}
