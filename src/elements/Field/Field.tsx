/* A labelled control.

   Every input in the app is wrapped in one of these, because every input
   needs a visible label — a placeholder disappears the moment someone types
   and takes the only description of the field with it.

   The label, the hint and the error are all tied to the control by id, so a
   screen reader reads "Invoice number, required, already used by another
   invoice" rather than just "edit text". */

import type { ReactNode } from 'react'
import { useId } from 'react'
import { useT } from '@hooks/useT'
import styles from './Field.module.css'

export interface FieldProps {
  label: string
  /** Rendered with the control's id, so the caller wires up its own input. */
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
  /** Said under the field before anything goes wrong. */
  hint?: string
  /** Said under the field when something has. Replaces the hint. */
  error?: string
  /** Marks the field as needed, in words as well as with a mark. */
  required?: boolean
  /** Lays the label beside the control instead of above it. */
  inline?: boolean
  /** A control on the right of the label row: a unit, a switch, a link. */
  adornment?: ReactNode
  className?: string
}

export function Field ({
  label,
  children,
  hint,
  error,
  required = false,
  inline = false,
  adornment,
  className,
}: FieldProps) {
  const t = useT()
  const base = useId()
  const id = `${base}-control`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={[styles.field, inline ? styles.inline : '', className].filter(Boolean).join(' ')}>
      <div className={styles.top}>
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? <span className={styles.required} aria-hidden="true"> *</span> : null}
          {required ? <span className="sr-only"> {t.common.required}</span> : null}
        </label>
        {adornment ? <div className={styles.adornment}>{adornment}</div> : null}
      </div>

      <div className={styles.control}>
        {children({ id, describedBy, invalid: !!error })}
      </div>

      {error ? (
        <p className={styles.error} id={errorId}>{error}</p>
      ) : hint ? (
        <p className={styles.hint} id={hintId}>{hint}</p>
      ) : null}
    </div>
  )
}
