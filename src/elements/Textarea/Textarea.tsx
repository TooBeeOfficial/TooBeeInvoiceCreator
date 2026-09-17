/* Several lines of text.

   Grows with what is typed up to a limit and then scrolls, so a two-line note
   does not reserve the space of a ten-line one and a long set of terms does
   not push the rest of the form off the screen. */

import type { TextareaHTMLAttributes } from 'react'
import { useEffect, useRef } from 'react'
import styles from './Textarea.module.css'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value: string
  onValueChange: (value: string) => void
  minRows?: number
  maxRows?: number
  invalid?: boolean
}

export function Textarea ({
  value,
  onValueChange,
  minRows = 2,
  maxRows = 10,
  invalid = false,
  className,
  ...rest
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    /* Measured from zero each time: a box that has already grown reports its
       own height as the content height and would never shrink again. */
    element.style.height = 'auto'
    const line = parseFloat(getComputedStyle(element).lineHeight) || 18
    const padding = 12
    const max = line * maxRows + padding
    element.style.height = `${Math.min(max, element.scrollHeight)}px`
  }, [value, maxRows])

  return (
    <textarea
      ref={ref}
      className={[styles.textarea, className].filter(Boolean).join(' ')}
      rows={minRows}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(event) => onValueChange(event.target.value)}
      {...rest}
    />
  )
}
