/* A choice from a fixed list.

   The native control, on purpose: it opens the way the operating system
   opens lists, it is searchable by typing, and it never traps a keyboard. A
   custom menu would look tidier in a screenshot and be worse to use. */

import type { SelectHTMLAttributes } from 'react'
import { Icon } from '@elements/Icon/Icon'
import styles from './Select.module.css'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  /** Shown after the label in lighter type, for a rate or a size. */
  note?: string
  disabled?: boolean
}

export interface SelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value: T
  options: ReadonlyArray<SelectOption<T>>
  onValueChange: (value: T) => void
  invalid?: boolean
}

export function Select<T extends string = string> ({
  value,
  options,
  onValueChange,
  invalid = false,
  className,
  ...rest
}: SelectProps<T>) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <select
        className={styles.select}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(event) => onValueChange(event.target.value as T)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.note ? `${option.label} · ${option.note}` : option.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={14} className={styles.chevron} />
    </div>
  )
}
