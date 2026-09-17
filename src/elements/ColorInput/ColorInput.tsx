/* A colour.

   A swatch that opens the system picker, beside the hex the swatch stands
   for. Both are editable, because choosing a colour by eye and pasting a
   brand's exact hex are two different jobs and the inspector has to do both.

   Typed text is only reported once it is a colour: a half-typed "#1A4" would
   otherwise repaint the invoice on its way to "#1A4F7B". */

import { useEffect, useState } from 'react'
import { useT } from '@hooks/useT'
import styles from './ColorInput.module.css'

export interface ColorInputProps {
  value: string
  onValueChange: (value: string) => void
  id?: string
  disabled?: boolean
  className?: string
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function ColorInput ({ value, onValueChange, id, disabled = false, className }: ColorInputProps) {
  const t = useT()
  const [text, setText] = useState(value)

  useEffect(() => setText(value), [value])

  const commit = (next: string) => {
    setText(next)
    const trimmed = next.trim()
    const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    if (HEX.test(hex)) onValueChange(hex.toUpperCase())
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <span className={styles.swatch} style={{ background: value }}>
        <input
          type="color"
          className={styles.picker}
          value={normalize(value)}
          disabled={disabled}
          aria-label={t.inspector.colour}
          onChange={(event) => onValueChange(event.target.value.toUpperCase())}
        />
      </span>
      <input
        id={id}
        type="text"
        className={styles.hex}
        value={text}
        spellCheck={false}
        disabled={disabled}
        onChange={(event) => commit(event.target.value)}
        onBlur={() => setText(value)}
      />
    </div>
  )
}

/* The native picker only accepts six-digit hex; a short form or a named
   colour would silently reset it to black. */
function normalize (value: string): string {
  const trimmed = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return '#000000'
}
