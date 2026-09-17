/* One line of the invoice, as an editable row.

   Each figure is its own field — quantity, unit price, rate — and the amount
   is never one of them: it is worked out and shown, because a line total
   somebody can type over is a line total that can disagree with the sum
   above it.

   The two commands people actually reach for — keep this line as a catalogue
   item, throw this line away — are buttons on the row itself. Everything
   else stays in the menu beside them: duplicating a line and shuffling the
   order are not done often enough to be worth a column each, but hiding a
   delete behind a menu means hunting for it every single time. */

import type { LineItem } from '@model/lineItem'
import type { Currency } from '@model/money'
import type { TaxMode } from '@model/tax'
import type { LineTotals } from '@core/totals/calcTotals'
import type { AppStrings } from '@core/i18n'
import { UNITS } from '@model/lineItem'
import { useT } from '@hooks/useT'
import { TextInput } from '@elements/TextInput/TextInput'
import { NumberInput } from '@elements/NumberInput/NumberInput'
import { Select } from '@elements/Select/Select'
import { Money } from '@elements/Money/Money'
import { Menu } from '@components/Menu/Menu'
import { IconButton } from '@elements/IconButton/IconButton'
import styles from './LineItemRow.module.css'

/* "Quantity, line 3" — what a screen reader reads out on a grid of fields
   that all look alike without it. */
const on = (t: AppStrings, field: string, index: number): string =>
  t.lines.fieldOnLine.replace('{field}', field).replace('{index}', String(index + 1))

export interface LineItemRowProps {
  line: LineItem
  totals: LineTotals
  currency: Currency
  locale: string
  taxMode: TaxMode
  index: number
  count: number
  columns: { unit: boolean; discount: boolean; tax: boolean; numbers: boolean }
  onPatch: (patch: Partial<LineItem>, key?: string) => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: (direction: -1 | 1) => void
  onTaxRate: (rate: number) => void
  onSaveToCatalogue: () => void
}

export function LineItemRow ({
  line,
  totals,
  currency,
  locale,
  taxMode,
  index,
  count,
  columns,
  onPatch,
  onRemove,
  onDuplicate,
  onMove,
  onTaxRate,
  onSaveToCatalogue,
}: LineItemRowProps) {
  const t = useT()
  const rate = line.taxes[0]?.rate ?? 0
  const discount = line.discount
  const named = line.description.trim()

  return (
    <tr className={styles.row}>
      {columns.numbers ? <td className={styles.cellNumber}>{index + 1}</td> : null}

      <td className={styles.cellDescription}>
        <TextInput
          value={line.description}
          onValueChange={(value) => onPatch({ description: value }, `line:${line.id}:description`)}
          placeholder={t.lines.descriptionPlaceholder}
          aria-label={on(t, t.lines.description, index)}
        />
        <TextInput
          className={styles.details}
          value={line.details}
          onValueChange={(value) => onPatch({ details: value }, `line:${line.id}:details`)}
          placeholder={t.lines.notePlaceholder}
          aria-label={on(t, t.lines.addNote, index)}
        />
      </td>

      <td className={styles.cellQty} data-label={t.lines.quantity}>
        <NumberInput
          value={line.quantity}
          onValueChange={(value) => onPatch({ quantity: value }, `line:${line.id}:quantity`)}
          decimals={2}
          aria-label={on(t, t.lines.quantity, index)}
        />
      </td>

      {columns.unit ? (
        <td className={styles.cellUnit} data-label={t.lines.unit}>
          <Select
            value={line.unit}
            options={UNITS.map((unit) => ({ value: unit, label: unit || '—' }))}
            onValueChange={(value) => onPatch({ unit: value })}
            aria-label={on(t, t.lines.unit, index)}
          />
        </td>
      ) : null}

      <td className={styles.cellPrice} data-label={t.lines.unitPrice}>
        <NumberInput
          value={line.unitPrice}
          onValueChange={(value) => onPatch({ unitPrice: value }, `line:${line.id}:price`)}
          decimals={currency.decimals}
          aria-label={on(t, t.lines.unitPrice, index)}
        />
      </td>

      {columns.discount ? (
        <td className={styles.cellDiscount} data-label={t.lines.discount}>
          <NumberInput
            value={discount?.value ?? 0}
            onValueChange={(value) => onPatch({
              discount: value ? { type: discount?.type ?? 'percent', value } : null,
            }, `line:${line.id}:discount`)}
            decimals={2}
            min={0}
            suffix={discount?.type === 'amount' ? currency.symbol : '%'}
            aria-label={on(t, t.lines.discount, index)}
          />
        </td>
      ) : null}

      {columns.tax && taxMode !== 'invoice' ? (
        <td className={styles.cellTax} data-label={t.lines.tax}>
          <NumberInput
            value={rate}
            onValueChange={onTaxRate}
            decimals={3}
            min={0}
            max={100}
            suffix="%"
            aria-label={on(t, t.lines.tax, index)}
          />
        </td>
      ) : null}

      <td className={styles.cellAmount} data-label={t.lines.amount}>
        <Money value={totals.amount} currency={currency} locale={locale} dimZero />
      </td>

      <td className={styles.cellMenu}>
        <div className={styles.actions}>
          <IconButton
            icon="save"
            label={t.lines.saveToItems}
            size="sm"
            disabled={!named}
            className={styles.rowButton}
            onClick={onSaveToCatalogue}
          />

          <IconButton
            icon="trash"
            label={t.common.remove}
            size="sm"
            tone="danger"
            className={styles.rowButton}
            onClick={onRemove}
          />

          <Menu
            align="right"
            items={[
              { id: 'duplicate', label: t.common.duplicate, icon: 'copy', run: onDuplicate },
              { id: 'up', label: t.lines.moveUp, icon: 'arrowUp', disabled: index === 0, run: () => onMove(-1) },
              { id: 'down', label: t.lines.moveDown, icon: 'arrowDown', disabled: index === count - 1, run: () => onMove(1) },
            ]}
            trigger={(props) => (
              <IconButton
                icon="more"
                label={t.lines.rowMenu.replace('{index}', String(index + 1))}
                size="sm"
                className={styles.rowButton}
                {...props}
              />
            )}
          />
        </div>
      </td>
    </tr>
  )
}
