/* Every invoice the app knows about.

   Sorted newest first by default and sortable by the three columns anyone
   actually sorts by. Each row carries a coloured spine on its left edge in
   the colour of its status, so the state of the whole list is readable
   before a single word is — and the word is there too, in the status
   column, because colour alone is not a label.

   A row whose file has been moved or deleted says so rather than
   disappearing: the app should never quietly lose track of an invoice. */

import type { LibraryEntry } from '@model/library'
import type { EffectiveStatus, InvoiceStatus } from '@model/invoice'
import type { Currency } from '@model/money'
import type { AppStrings } from '@core/i18n'
import { currencyByCode } from '@model/money'
import { useT } from '@hooks/useT'
import { formatDateShort, formatMoney } from '@core/money/format'
import { duePhrase, entryStatus, SETTABLE_STATUSES } from '@core/status/status'
import { STATUS_LABELS } from '@model/invoice'
import { Money } from '@elements/Money/Money'
import { StatusPill } from '@elements/StatusPill/StatusPill'
import { Menu } from '@components/Menu/Menu'
import { Button } from '@elements/Button/Button'
import { Icon } from '@elements/Icon/Icon'
import styles from './InvoiceTable.module.css'

export type SortKey = 'issueDate' | 'dueDate' | 'total' | 'number' | 'buyerName'

export interface InvoiceTableProps {
  entries: LibraryEntry[]
  sort: { key: SortKey; direction: 'asc' | 'desc' }
  onSort: (key: SortKey) => void
  onOpen: (entry: LibraryEntry) => void
  onStatus: (entry: LibraryEntry, status: InvoiceStatus) => void
  onDuplicate: (entry: LibraryEntry) => void
  onReveal: (entry: LibraryEntry) => void
  onForget: (entry: LibraryEntry) => void
}

/* The columns name themselves from the dictionary, so the heading and the
   sort control stay one thing rather than two that have to be kept in step. */
const columnsFor = (t: AppStrings): Array<{ key: SortKey | null; label: string; className: string }> => [
  { key: 'number', label: t.invoices.colInvoice, className: 'colNumber' },
  { key: 'buyerName', label: t.invoices.colClient, className: 'colClient' },
  { key: 'issueDate', label: t.invoices.colIssued, className: 'colDate' },
  { key: 'dueDate', label: t.invoices.colDue, className: 'colDue' },
  { key: null, label: t.invoices.colStatus, className: 'colStatus' },
  { key: 'total', label: t.invoices.colAmount, className: 'colAmount' },
  { key: null, label: '', className: 'colActions' },
]

export function InvoiceTable ({
  entries,
  sort,
  onSort,
  onOpen,
  onStatus,
  onDuplicate,
  onReveal,
  onForget,
}: InvoiceTableProps) {
  const t = useT()
  const columns = columnsFor(t)
  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label || column.className} className={styles[column.className]}>
                {column.key ? (
                  <button
                    type="button"
                    className={styles.sort}
                    onClick={() => onSort(column.key as SortKey)}
                    aria-sort={sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    {column.label}
                    {sort.key === column.key ? (
                      <Icon name={sort.direction === 'asc' ? 'chevronUp' : 'chevronDown'} size={12} />
                    ) : null}
                  </button>
                ) : (
                  <span className={column.label ? undefined : 'sr-only'}>{column.label || t.lines.rowActions}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {entries.map((entry) => {
            const status: EffectiveStatus = entryStatus(entry)
            const currency = { ...currencyByCode(entry.currencyCode), decimals: entry.currencyDecimals }

            return (
              <tr
                key={entry.id}
                className={[styles.row, styles[status], entry.missing ? styles.missing : ''].filter(Boolean).join(' ')}
              >
                <td className={styles.colNumber}>
                  <button type="button" className={styles.open} onClick={() => onOpen(entry)} disabled={entry.missing}>
                    {entry.number || t.invoices.untitled}
                  </button>
                  {entry.missing ? <span className={styles.gone}>{t.invoices.fileGone}</span> : null}
                </td>

                <td className={styles.colClient}>
                  <span className={styles.client}>{entry.buyerName || '—'}</span>
                  <span className={styles.lines}>
                    {(entry.lineCount === 1 ? t.invoices.lineOne : t.invoices.lineMany).replace('{count}', String(entry.lineCount))}
                  </span>
                </td>

                <td className={styles.colDate}>{formatDateShort(entry.issueDate, 'en-GB') || '—'}</td>

                <td className={styles.colDue}>
                  <span>{formatDateShort(entry.dueDate, 'en-GB') || '—'}</span>
                  <span className={styles.phrase}>{duePhrase(entry, t.due)}</span>
                </td>

                <td className={styles.colStatus}>
                  <StatusPill status={status} size="sm" note={paidNote(entry, currency, t)} />
                </td>

                <td className={styles.colAmount}>
                  <Money value={entry.total} currency={currency} locale="en-GB" />
                </td>

                <td className={styles.colActions}>
                  <div className={styles.actions}>
                    {status !== 'paid' && !entry.missing ? (
                      <Button size="sm" variant="ghost" icon="check" onClick={() => onStatus(entry, 'paid')}>
                        {t.invoices.markPaid}
                      </Button>
                    ) : null}

                    <Menu
                      align="right"
                      items={[
                        { id: 'open', label: t.common.open, icon: 'file', disabled: entry.missing, run: () => onOpen(entry) },
                        { id: 'duplicate', label: t.common.duplicate, icon: 'copy', disabled: entry.missing, run: () => onDuplicate(entry) },
                        { id: 'reveal', label: t.invoices.showInFolder, icon: 'folder', disabled: entry.missing, run: () => onReveal(entry) },
                        ...SETTABLE_STATUSES
                          .filter((s) => s !== entry.status)
                          .map((s) => ({
                            id: `status-${s}`,
                            label: t.invoices.markAs.replace('{status}', (t.status[s] ?? STATUS_LABELS[s]).toLowerCase()),
                            icon: 'send' as const,
                            disabled: entry.missing,
                            run: () => onStatus(entry, s),
                          })),
                        { id: 'forget', label: t.invoices.forget, icon: 'trash', tone: 'danger' as const, run: () => onForget(entry) },
                      ]}
                      trigger={(props) => (
                        <Button size="sm" variant="ghost" icon="more" aria-label={t.lines.rowMenu.replace('{index}', entry.number)} {...props} />
                      )}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* "£400 of £1,200" beside the status, for an invoice that is part way paid.

   Nothing at all when the index predates payments: an entry written before
   they existed does not know what was paid, and saying nothing is honest
   where saying "£0" would not be. Nothing either when it is fully paid — the
   status already says that, and repeating it adds noise to every settled
   row in the list. */
function paidNote (entry: LibraryEntry, currency: Currency, t: AppStrings): string | undefined {
  if (entry.paid === undefined || entry.paid <= 0) return undefined
  if (entry.paid >= entry.total) return undefined
  return t.invoices.paidOf
    .replace('{paid}', formatMoney(entry.paid, currency, 'en-GB'))
    .replace('{total}', formatMoney(entry.total, currency, 'en-GB'))
}
