/* What state an invoice is in.

   Five states, five colours, and the word always printed alongside — colour
   alone would leave the difference between paid and overdue invisible to
   anyone who cannot tell green from red, which is the one distinction in
   this app that must never be missed. */

import type { EffectiveStatus } from '@model/invoice'
import { STATUS_LABELS } from '@model/invoice'
import { useT } from '@hooks/useT'
import styles from './StatusPill.module.css'

export interface StatusPillProps {
  status: EffectiveStatus
  size?: 'sm' | 'md'
  /** Adds a note after the word: "Overdue · 9 days". */
  note?: string
  className?: string
}

export function StatusPill ({ status, size = 'md', note, className }: StatusPillProps) {
  /* The word comes from the app's language, not the document's: this is the
     window's own furniture, not something printed on an invoice. */
  const t = useT()
  return (
    <span className={[styles.pill, styles[status], styles[size], className].filter(Boolean).join(' ')}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.word}>{t.status[status] ?? STATUS_LABELS[status]}</span>
      {note ? <span className={styles.note}>{note}</span> : null}
    </span>
  )
}
