/* A line of text.

   Reports its value on every keystroke rather than on blur, because the
   preview beside it is meant to follow what is being typed. The store
   coalesces those keystrokes into one undo step. */

import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import styles from './TextInput.module.css'

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onValueChange: (value: string) => void
  /** Sets the figures in the tabular face and aligns them right. */
  figure?: boolean
  invalid?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput (
  { value, onValueChange, figure = false, invalid = false, className, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={[styles.input, figure ? styles.figure : '', className].filter(Boolean).join(' ')}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(event) => onValueChange(event.target.value)}
      {...rest}
    />
  )
})
