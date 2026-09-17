/* What the invoice list adds up to.

   Four figures, and the first of them answers the question small businesses
   open this kind of app to ask: what is owed to me, and how much of it is
   late. Everything else on the page is detail underneath that.

   Amounts are grouped by currency rather than added together. Converting
   between them would need a rate the app does not have and must not invent,
   so an invoice in euros and one in pounds are shown as what they are: two
   figures, not one wrong one. */

import type { LibraryEntry } from '@model/library'
import type { EffectiveStatus } from '@model/invoice'
import type { AppStrings } from '@core/i18n'
import { currencyByCode } from '@model/money'
import { useT } from '@hooks/useT'
import { entryStatus } from '@core/status/status'
import { formatMoney } from '@core/money/format'
import styles from './SummaryStrip.module.css'

export interface SummaryStripProps {
  entries: LibraryEntry[]
  /** Clicking a tile filters the list to that state. */
  onFilter: (status: EffectiveStatus | 'all') => void
  active: EffectiveStatus | 'all'
}

interface Tile {
  id: EffectiveStatus | 'all'
  label: (t: AppStrings) => string
  /** What the number underneath means, in a few words. */
  note: (t: AppStrings) => string
  match: (status: EffectiveStatus) => boolean
  /* What each matching invoice contributes. Outstanding and Overdue are
     asking how much is still owed, so a part paid invoice counts only for
     what is left of it; Paid and Drafts are asking about the invoices
     themselves and count their totals. */
  amount: (entry: LibraryEntry) => number
  tone?: string
}

/** What is left on an invoice, for an index old enough not to know. */
const outstanding = (entry: LibraryEntry): number =>
  Math.max(0, entry.total - (entry.paid ?? 0))

const whole = (entry: LibraryEntry): number => entry.total

const TILES: Tile[] = [
  {
    id: 'sent',
    label: (t) => t.invoices.outstanding,
    note: (t) => t.invoices.outstandingNote,
    match: (status) => status === 'sent' || status === 'overdue',
    amount: outstanding,
  },
  {
    id: 'overdue',
    label: (t) => t.invoices.overdue,
    note: (t) => t.invoices.overdueNote,
    match: (status) => status === 'overdue',
    amount: outstanding,
    tone: 'overdue',
  },
  {
    id: 'paid',
    label: (t) => t.invoices.paid,
    note: (t) => t.invoices.paidNote,
    match: (status) => status === 'paid',
    amount: whole,
    tone: 'paid',
  },
  {
    id: 'draft',
    label: (t) => t.invoices.drafts,
    note: (t) => t.invoices.draftsNote,
    match: (status) => status === 'draft',
    amount: whole,
  },
]

export function SummaryStrip ({ entries, onFilter, active }: SummaryStripProps) {
  const t = useT()
  return (
    <div className={styles.strip}>
      {TILES.map((tile) => {
        const matching = entries.filter((entry) => tile.match(entryStatus(entry)))
        const byCurrency = new Map<string, number>()
        for (const entry of matching) {
          byCurrency.set(entry.currencyCode, (byCurrency.get(entry.currencyCode) ?? 0) + tile.amount(entry))
        }
        const amounts = [...byCurrency.entries()].sort((a, b) => b[1] - a[1])
        const selected = active === tile.id

        return (
          <button
            key={tile.id}
            type="button"
            className={[
              styles.tile,
              tile.tone ? styles[tile.tone] : '',
              selected ? styles.on : '',
            ].filter(Boolean).join(' ')}
            aria-pressed={selected}
            onClick={() => onFilter(selected ? 'all' : tile.id)}
          >
            <span className={styles.label}>{tile.label(t)}</span>

            <span className={styles.figures}>
              {amounts.length === 0 ? (
                <span className={styles.none}>—</span>
              ) : (
                amounts.slice(0, 2).map(([code, total]) => (
                  <span className={styles.figure} key={code}>
                    {formatMoney(total, currencyByCode(code), 'en-GB')}
                  </span>
                ))
              )}
              {amounts.length > 2 ? (
                <span className={styles.more}>
                  {t.invoices.moreCurrencies.replace('{count}', String(amounts.length - 2))}
                </span>
              ) : null}
            </span>

            {/* The count is a bare figure rather than a sentence: the tile's
                own label already says what is being counted, and a phrase
                here would have to be built differently in every language. */}
            <span className={styles.note}>
              {matching.length} · {tile.note(t)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
