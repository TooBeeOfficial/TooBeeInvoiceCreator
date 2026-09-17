/* A date.

   The native picker, which means the calendar is the one the operating
   system draws and the field is typed in the user's own date order. The value
   is always ISO on the way in and out — every date in this app is ISO until
   the moment it is printed. */

import type { InputHTMLAttributes } from 'react'
import styles from './DateInput.module.css'

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  /** yyyy-mm-dd, or empty for no date. */
  value: string
  onValueChange: (value: string) => void
  invalid?: boolean
}

export function DateInput ({ value, onValueChange, invalid = false, className, ...rest }: DateInputProps) {
  return (
    <input
      type="date"
      className={[styles.input, className].filter(Boolean).join(' ')}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(event) => onValueChange(event.target.value)}
      {...rest}
    />
  )
}
