/* Bringing rows in from somewhere else.

   Three steps, and the middle one is the point: choose a file, check what the
   app decided each column means, then import. The mapping is proposed rather
   than assumed, and every column is a dropdown you can correct — an importer
   that guesses silently is an importer you have to undo.

   The same dialog serves both destinations, because a price list and a
   timesheet arrive in the same shape and differ only in where they should
   end up: on this invoice, or in your saved items. */

import { useEffect, useMemo, useState } from 'react'
import type { InvoiceDoc } from '@model/invoice'
import type { Table } from '@core/import/readTable'
import type { ImportField, Mapping } from '@core/import/columns'
import { FIELDS, detectMapping } from '@core/import/columns'
import { toLineItems, toSavedItems } from '@core/import/mapRows'
import { pickTable } from '@core/import/importService'
import { useDocStore } from '@store/useDocStore'
import { usePrefsStore } from '@store/usePrefsStore'
import { useUiStore } from '@store/useUiStore'
import { Button } from '@elements/Button/Button'
import { IconButton } from '@elements/IconButton/IconButton'
import { Select } from '@elements/Select/Select'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import { Icon } from '@elements/Icon/Icon'
import { useT } from '@hooks/useT'
import styles from './ImportDialog.module.css'

export interface ImportDialogProps {
  doc: InvoiceDoc
  /** Where the rows should land by default. */
  target: 'invoice' | 'catalogue'
  onClose: () => void
}

const PREVIEW_ROWS = 6

export function ImportDialog ({ doc, target, onClose }: ImportDialogProps) {
  const t = useT()
  const [table, setTable] = useState<Table | null>(null)
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState<Mapping>({})
  const [destination, setDestination] = useState<'invoice' | 'catalogue'>(target)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addLines = useDocStore((s) => s.addLines)
  const addItems = usePrefsStore((s) => s.addItems)
  const notify = useUiStore((s) => s.notify)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const choose = async () => {
    setBusy(true)
    setError(null)
    const outcome = await pickTable()
    setBusy(false)
    if (outcome.canceled) return
    if (outcome.error || !outcome.picked) {
      setError(outcome.error ?? 'That file could not be read.')
      return
    }
    setTable(outcome.picked.table)
    setFileName(outcome.picked.name)
    setMapping(detectMapping(outcome.picked.table.headers))
  }

  /* What is actually going to be imported, worked out live so the count under
     the button is the real one rather than the number of rows in the file. */
  const preview = useMemo(() => {
    if (!table) return null
    return destination === 'invoice'
      ? toLineItems(table.rows, mapping, {
          defaultTax: doc.settings.defaultTax,
          perLineTax: doc.settings.taxMode !== 'invoice',
        })
      : toSavedItems(table.rows, mapping)
  }, [table, mapping, destination, doc.settings.defaultTax, doc.settings.taxMode])

  const columnOptions = () => [
    { value: '', label: 'Not imported' },
    ...(table?.headers ?? []).map((header, index) => ({
      value: String(index),
      label: header,
      /* Shows what is actually in the column, which settles most mapping
         questions faster than the header does. */
      note: sample(table, index),
    })),
  ]

  const setField = (field: ImportField, value: string) => {
    setMapping((current) => {
      const next = { ...current }
      if (value === '') delete next[field]
      else next[field] = Number(value)
      return next
    })
  }

  const run = () => {
    if (!preview || preview.items.length === 0) return

    if (destination === 'invoice') {
      addLines(preview.items as never)
    } else {
      addItems(preview.items as never)
    }
    notify(t.importer.rows.replace('{count}', String(preview.items.length)), 'success')

    for (const note of preview.notes) notify(note, 'info')
    if (preview.skipped > 0) {
      notify(preview.skipped === 1
        ? t.importer.skippedOne
        : t.importer.skipped.replace('{count}', String(preview.skipped)), 'warning')
    }
    onClose()
  }

  return (
    <div className={styles.scrim} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="import-title">
        <header className={styles.head}>
          <div>
            <h2 className={styles.title} id="import-title">
              {target === 'invoice' ? t.importer.titleInvoice : t.importer.titleItems}
            </h2>
          </div>
          <IconButton icon="close" label={t.common.close} size="sm" onClick={onClose} />
        </header>

        <div className={styles.body}>
          {!table ? (
            <div className={styles.picker}>
              <span className={styles.pickerMark} aria-hidden="true">
                <Icon name="sheet" size={22} />
              </span>
              <p className={styles.pickerTitle}>{t.importer.choose}</p>
              <p className={styles.pickerBody}>{t.importer.chooseNote}</p>
              <Button variant="primary" icon="folder" onClick={() => { void choose() }} disabled={busy}>
                {t.importer.choose}
              </Button>
              {error ? <p className={styles.error}>{error}</p> : null}
            </div>
          ) : (
            <>
              <div className={styles.fileRow}>
                <span className={styles.fileName}>
                  <Icon name="file" size={14} />
                  {fileName}
                </span>
                <span className={styles.fileMeta}>
                  {t.importer.rows.replace('{count}', String(table.rows.length))}
                </span>
                <Button size="sm" variant="ghost" icon="refresh" onClick={() => { void choose() }}>
                  {t.importer.choose}
                </Button>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.importer.destination}</h3>
                <SegmentedControl
                  value={destination}
                  label={t.importer.destination}
                  segments={[
                    { value: 'invoice', label: 'Onto this invoice', description: 'Added as line items below what is already there' },
                    { value: 'catalogue', label: 'Into my saved items', description: 'Kept for reuse on any invoice' },
                  ]}
                  onValueChange={setDestination}
                />
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.importer.columns}</h3>
                <div className={styles.mapGrid}>
                  {FIELDS.filter((field) => destination === 'catalogue' || field.id !== 'category').map((field) => (
                    <div className={styles.mapRow} key={field.id}>
                      <div className={styles.mapLabel}>
                        <span className={styles.mapName}>
                          {field.label}
                          {field.id === 'description' ? <span className={styles.required}> *</span> : null}
                        </span>
                        <span className={styles.mapNote}>{field.note}</span>
                      </div>
                      <Select
                        value={mapping[field.id] === undefined ? '' : String(mapping[field.id])}
                        options={columnOptions()}
                        onValueChange={(value) => setField(field.id, value)}
                        aria-label={`Column for ${field.label}`}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.importer.previewTitle}</h3>
                <div className={styles.previewScroller}>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>{t.lines.description}</th>
                        <th className={styles.right}>{t.lines.quantity}</th>
                        <th>{t.lines.unit}</th>
                        <th className={styles.right}>{t.lines.unitPrice}</th>
                        {destination === 'invoice' ? <th className={styles.right}>{t.lines.tax}</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {(preview?.items ?? []).slice(0, PREVIEW_ROWS).map((item, index) => (
                        <tr key={index}>
                          <td>{item.description || <span className={styles.blank}>—</span>}</td>
                          <td className={styles.right}>{'quantity' in item ? item.quantity : '—'}</td>
                          <td>{item.unit || '—'}</td>
                          <td className={styles.right}>{item.unitPrice}</td>
                          {destination === 'invoice' ? (
                            <td className={styles.right}>
                              {'taxes' in item && item.taxes.length ? `${item.taxes[0].rate}%` : '—'}
                            </td>
                          ) : null}
                        </tr>
                      ))}
                      {(preview?.items.length ?? 0) === 0 ? (
                        <tr>
                          <td colSpan={5} className={styles.blank}>{t.importer.nothingUsable}</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>

        {table ? (
          <footer className={styles.foot}>
            <p className={styles.count}>
              {preview && preview.items.length > 0
                ? t.importer.rows.replace('{count}', String(preview.items.length))
                : t.importer.nothingUsable}
            </p>
            <div className={styles.footActions}>
              <Button onClick={onClose}>{t.common.cancel}</Button>
              <Button
                variant="primary"
                icon="download"
                disabled={!preview || preview.items.length === 0}
                onClick={run}
              >
                {destination === 'invoice' ? t.catalogue.addToInvoice : t.lines.saveToItems}
              </Button>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  )
}

/* A couple of values from a column, so the dropdown says what is in it and
   not just what it was called. */
function sample (table: Table | null, index: number): string | undefined {
  if (!table) return undefined
  const values = table.rows
    .map((row) => (row[index] ?? '').trim())
    .filter(Boolean)
    .slice(0, 2)
  return values.length ? values.join(', ').slice(0, 42) : undefined
}
