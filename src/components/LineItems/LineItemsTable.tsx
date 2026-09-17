/* What is being charged for.

   The table only shows the columns this invoice actually uses. Units,
   discounts and per-line tax rates are all switched off by default, because
   most invoices need none of them and every extra column is one more thing
   to read past on the ones that do.

   The width each column needs is known, so the table asks for exactly the
   sum of them. That is what makes the scrollbar appear at the point the
   fields would otherwise start being squeezed narrower than the figures
   inside them — a table that crushes its own inputs is worse than one you
   have to scroll. */

import type { CSSProperties } from 'react'
import type { InvoiceDoc } from '@model/invoice'
import type { SavedItem } from '@model/savedItem'
import type { Totals } from '@core/totals/calcTotals'
import { makeId } from '@core/ids'
import { useDocStore } from '@store/useDocStore'
import { usePrefsStore } from '@store/usePrefsStore'
import { useUiStore } from '@store/useUiStore'
import { useT } from '@hooks/useT'
import { Button } from '@elements/Button/Button'
import { Money } from '@elements/Money/Money'
import { Menu } from '@components/Menu/Menu'
import { LineItemRow } from './LineItemRow'
import styles from './LineItemsTable.module.css'

export interface LineItemsTableProps {
  doc: InvoiceDoc
  totals: Totals
  /** Opens the import dialog, which the editor owns. */
  onImport: () => void
}

/* The pixels each column needs, mirrored by LineItemRow.module.css. The
   description gets whatever is left, down to its own minimum. */
const WIDTHS = {
  description: 210,
  numbers: 24,
  qty: 68,
  unit: 92,
  price: 96,
  discount: 92,
  tax: 84,
  amount: 96,
  /* keep, delete, and the menu holding the rest */
  menu: 88,
  /* the 4px of padding either side of every cell */
  gutters: 8,
  /* the extra padding the two outer cells carry, now that a row is a box
     with a border rather than a band between two rules */
  edges: 8,
}

export function LineItemsTable ({ doc, totals, onImport }: LineItemsTableProps) {
  const t = useT()
  const patchLine = useDocStore((s) => s.patchLine)
  const setLineTaxes = useDocStore((s) => s.setLineTaxes)
  const addLine = useDocStore((s) => s.addLine)
  const removeLine = useDocStore((s) => s.removeLine)
  const duplicateLine = useDocStore((s) => s.duplicateLine)
  const moveLine = useDocStore((s) => s.moveLine)
  const patchSettings = useDocStore((s) => s.patchSettings)
  const addLineFromItem = useDocStore((s) => s.addLineFromItem)

  const savedItems = usePrefsStore((s) => s.prefs.items)
  const saveItem = usePrefsStore((s) => s.saveItem)
  const useItem = usePrefsStore((s) => s.useItem)
  const notify = useUiStore((s) => s.notify)

  const settings = doc.settings
  const columns = {
    unit: settings.showUnit,
    discount: settings.showDiscountColumn,
    tax: settings.showTaxColumn && settings.taxMode !== 'invoice',
    numbers: settings.showLineNumbers,
  }

  const minWidth =
    WIDTHS.description + WIDTHS.qty + WIDTHS.price + WIDTHS.amount + WIDTHS.menu
    + (columns.numbers ? WIDTHS.numbers : 0)
    + (columns.unit ? WIDTHS.unit : 0)
    + (columns.discount ? WIDTHS.discount : 0)
    + (columns.tax ? WIDTHS.tax : 0)
    + WIDTHS.gutters * (5 + Number(columns.numbers) + Number(columns.unit) + Number(columns.discount) + Number(columns.tax))
    + WIDTHS.edges

  const toggles: Array<{ key: keyof typeof columns; label: string; setting: keyof typeof settings; disabled?: string }> = [
    { key: 'numbers', label: '#', setting: 'showLineNumbers' },
    { key: 'unit', label: t.lines.unit, setting: 'showUnit' },
    { key: 'discount', label: t.lines.discount, setting: 'showDiscountColumn' },
    {
      key: 'tax',
      label: t.lines.tax,
      setting: 'showTaxColumn',
      disabled: settings.taxMode === 'invoice' ? t.tax.modeInvoice : undefined,
    },
  ]

  /* Most-used first, then alphabetical: the list should put the thing you
     bill every month at the top without anyone having to arrange it. */
  const catalogue = [...savedItems]
    .sort((a, b) => b.useCount - a.useCount || a.description.localeCompare(b.description))
    .slice(0, 12)

  const insert = (item: SavedItem) => {
    addLineFromItem(item)
    useItem(item.id)
  }

  /* Saving a line that is already in the catalogue updates that entry rather
     than adding a second one under the same name — the button is a click
     away on every row, and two of everything is what you get otherwise. */
  const keep = (lineId: string) => {
    const line = doc.lines.find((l) => l.id === lineId)
    if (!line || !line.description.trim()) return
    const same = line.description.trim().toLowerCase()
    const existing = savedItems.find((i) => i.description.trim().toLowerCase() === same)
    saveItem({
      ...existing,
      id: existing?.id ?? makeId('item'),
      description: line.description,
      details: line.details,
      unit: line.unit,
      unitPrice: line.unitPrice,
      taxRate: settings.taxMode === 'invoice' ? null : (line.taxes[0]?.rate ?? null),
      taxLabel: line.taxes[0]?.label ?? '',
      /* Whatever the catalogue already knew about this item that the invoice
         line does not: which group it is filed under, and how often it has
         been reached for. Neither is on the line to overwrite them with. */
      category: existing?.category ?? '',
      useCount: existing?.useCount ?? 0,
      updatedAt: new Date().toISOString(),
    })
    notify(t.lines.savedToItems.replace('{description}', line.description), 'success')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.columns}>
        <span className={styles.columnsLabel}>{t.lines.columns}</span>
        {toggles.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            className={[styles.toggle, columns[toggle.key] ? styles.on : ''].filter(Boolean).join(' ')}
            aria-pressed={columns[toggle.key]}
            disabled={!!toggle.disabled}
            title={toggle.disabled}
            onClick={() => patchSettings({ [toggle.setting]: !settings[toggle.setting] } as never)}
          >
            {toggle.label}
          </button>
        ))}
      </div>

      <div className={styles.scroller}>
        <table className={styles.table} style={{ '--items-min-width': `${minWidth}px` } as CSSProperties}>
          <thead>
            <tr>
              {columns.numbers ? <th className={styles.thNumber}>#</th> : null}
              <th className={styles.thDescription}>{t.lines.description}</th>
              <th className={styles.thQty}>{t.lines.quantity}</th>
              {columns.unit ? <th className={styles.thUnit}>{t.lines.unit}</th> : null}
              <th className={styles.thPrice}>{t.lines.unitPrice}</th>
              {columns.discount ? <th className={styles.thDiscount}>{t.lines.discount}</th> : null}
              {columns.tax ? <th className={styles.thTax}>{t.lines.tax}</th> : null}
              <th className={styles.thAmount}>{t.lines.amount}</th>
              <th className={styles.thMenu}><span className="sr-only">{t.lines.rowActions}</span></th>
            </tr>
          </thead>

          <tbody>
            {doc.lines.map((line, index) => (
              <LineItemRow
                key={line.id}
                line={line}
                totals={totals.lines[index]}
                currency={doc.currency}
                locale={settings.locale}
                taxMode={settings.taxMode}
                index={index}
                count={doc.lines.length}
                columns={columns}
                onPatch={(patch, key) => patchLine(line.id, patch, key)}
                onRemove={() => removeLine(line.id)}
                onDuplicate={() => duplicateLine(line.id)}
                onMove={(direction) => moveLine(line.id, direction)}
                onSaveToCatalogue={() => keep(line.id)}
                onTaxRate={(rate) => setLineTaxes(line.id, [{
                  id: line.taxes[0]?.id ?? makeId('tax'),
                  label: line.taxes[0]?.label || settings.defaultTax.label || 'Tax',
                  rate,
                }])}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.foot}>
        <div className={styles.footActions}>
          <Button icon="plus" onClick={() => addLine()}>{t.lines.addLine}</Button>

          <Menu
            align="left"
            items={catalogue.length === 0
              ? [{
                  id: 'none',
                  label: t.catalogue.emptyTitle,
                  disabled: true,
                  run: () => {},
                }]
              : catalogue.map((item) => ({
                  id: item.id,
                  label: item.description,
                  note: [item.unitPrice ? `${doc.currency.symbol}${item.unitPrice}` : '', item.unit].filter(Boolean).join(' · ') || undefined,
                  run: () => insert(item),
                }))}
            trigger={(props) => (
              <Button icon="table" trailingIcon="chevronDown" {...props}>
                {t.lines.fromItems}
              </Button>
            )}
          />

          <Button icon="download" onClick={onImport}>{t.lines.import}</Button>
        </div>

        <p className={styles.runningTotal}>
          <span className={styles.runningLabel}>
            {(doc.lines.length === 1 ? t.invoices.lineOne : t.invoices.lineMany)
              .replace('{count}', String(doc.lines.length))}
          </span>
          <Money value={totals.subtotal} currency={doc.currency} locale={settings.locale} />
        </p>
      </div>
    </div>
  )
}
