/* A switch with a label beside it.

   The whole row is the target, not just the 14px box: a setting is easier to
   hit and easier to read when its words are part of the control. */

import { useId } from 'react'
import { Icon } from '@elements/Icon/Icon'
import styles from './Checkbox.module.css'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  /** One line under the label saying what turning this on actually does. */
  hint?: string
  disabled?: boolean
  className?: string
}

export function Checkbox ({ checked, onCheckedChange, label, hint, disabled = false, className }: CheckboxProps) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div className={[styles.row, disabled ? styles.disabled : '', className].filter(Boolean).join(' ')}>
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <label className={styles.label} htmlFor={id}>
        <span className={styles.box} aria-hidden="true">
          {checked ? <Icon name="check" size={12} /> : null}
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{label}</span>
          {hint ? <span className={styles.hint} id={hintId}>{hint}</span> : null}
        </span>
      </label>
    </div>
  )
}
