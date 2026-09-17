/* A number.

   Kept as text while it is being typed, which is the only way to let someone
   clear the field, start with a minus sign, or type "1." on the way to "1.5"
   without the control fighting them. The number is reported as soon as the
   text parses; what is on screen is only replaced by the canonical value when
   focus leaves. */

import type { InputHTMLAttributes } from 'react'
import { useEffect, useState } from 'react'
import styles from './NumberInput.module.css'

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: number
  onValueChange: (value: number) => void
  /** Digits kept when the field is tidied up on blur. */
  decimals?: number
  min?: number
  max?: number
  suffix?: string
  invalid?: boolean
}

export function NumberInput ({
  value,
  onValueChange,
  decimals = 2,
  min,
  max,
  suffix,
  invalid = false,
  className,
  onBlur,
  onFocus,
  ...rest
}: NumberInputProps) {
  const [text, setText] = useState(() => display(value, decimals))
  const [editing, setEditing] = useState(false)

  /* While the field has focus its text belongs to the person typing. An
     update from elsewhere — an undo, a currency change — is taken only when
     they are not in the middle of a number. */
  useEffect(() => {
    if (!editing) setText(display(value, decimals))
  }, [value, decimals, editing])

  const handle = (next: string) => {
    setText(next)
    const parsed = parse(next)
    if (parsed === null) return
    onValueChange(clamp(parsed, min, max))
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <input
        type="text"
        inputMode="decimal"
        className={[styles.input, suffix ? styles.hasSuffix : ''].filter(Boolean).join(' ')}
        value={text}
        aria-invalid={invalid || undefined}
        onChange={(event) => handle(event.target.value)}
        onFocus={(event) => { setEditing(true); onFocus?.(event) }}
        onBlur={(event) => {
          setEditing(false)
          const parsed = parse(text)
          const settled = clamp(parsed ?? 0, min, max)
          setText(display(settled, decimals))
          if (parsed === null || settled !== parsed) onValueChange(settled)
          onBlur?.(event)
        }}
        {...rest}
      />
      {suffix ? <span className={styles.suffix} aria-hidden="true">{suffix}</span> : null}
    </div>
  )
}

/* Trailing zeroes are not invented: a quantity of 3 shows as "3", and a
   price of 12.5 as "12.50" only because a price is money. */
function display (value: number, decimals: number): string {
  if (!Number.isFinite(value)) return ''
  if (decimals === 0) return String(Math.round(value))
  const fixed = value.toFixed(decimals)
  return Number(fixed) === Math.trunc(value) && decimals > 2 ? String(Number(fixed)) : fixed
}

function parse (text: string): number | null {
  const cleaned = text.trim().replace(/\s/g, '').replace(',', '.')
  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

function clamp (value: number, min?: number, max?: number): number {
  let out = value
  if (min !== undefined) out = Math.max(min, out)
  if (max !== undefined) out = Math.min(max, out)
  return out
}
