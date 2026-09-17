/* A named look, shown as the colours it is made of.

   A strip of bands and a word. Used for both the built-in palettes and the
   styles the user has saved, so the two read as the same kind of thing —
   which they are, from where you are sitting: something to click that
   changes how the invoice looks. */

import styles from './SwatchCard.module.css'

export interface SwatchCardProps {
  name: string
  /** The look as a strip of bands, in the order they carry it. */
  colours: string[]
  selected: boolean
  onSelect: () => void
  /** Given only where the card can be deleted; shows a control on hover. */
  onRemove?: () => void
  removeLabel?: string
}

export function SwatchCard ({ name, colours, selected, onSelect, onRemove, removeLabel }: SwatchCardProps) {
  return (
    <div className={[styles.card, selected ? styles.selected : ''].filter(Boolean).join(' ')}>
      <button type="button" className={styles.main} aria-pressed={selected} onClick={onSelect}>
        <span className={styles.swatches} aria-hidden="true">
          {colours.map((colour, i) => <span key={i} style={{ background: colour }} />)}
        </span>
        <span className={styles.name}>{name}</span>
      </button>

      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={removeLabel ?? `Remove ${name}`}
          title={removeLabel ?? `Remove ${name}`}
          onClick={onRemove}
        >
          ×
        </button>
      ) : null}
    </div>
  )
}
