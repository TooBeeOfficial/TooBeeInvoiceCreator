/* A measurement, dragged or typed.

   The slider is for finding a value by eye against the live page; the number
   beside it is for setting one exactly, and for reading what the slider
   landed on. Neither is enough on its own, which is why both are here. */

import styles from './RangeInput.module.css'

export interface RangeInputProps {
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step?: number
  /** The unit shown after the figure: "mm", "%", "×". */
  unit?: string
  id?: string
  disabled?: boolean
  className?: string
}

export function RangeInput ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  id,
  disabled = false,
  className,
}: RangeInputProps) {
  const decimals = step < 1 ? String(step).split('.')[1]?.length ?? 1 : 0

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <input
        id={id}
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(Number(event.target.value))}
      />
      <output className={styles.readout} htmlFor={id}>
        {value.toFixed(decimals)}
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </output>
    </div>
  )
}
