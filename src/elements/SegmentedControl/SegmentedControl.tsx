/* A short set of exclusive choices, all visible at once.

   Used where the options are few and worth comparing — full against simple,
   percent against amount, three tax modes. Longer lists belong in a Select,
   where they can be scrolled and searched rather than wrapped.

   Built as radios so that the arrow keys move between the options the way
   they do everywhere else in the operating system. */

import { useId } from 'react'
import styles from './SegmentedControl.module.css'

export interface Segment<T extends string> {
  value: T
  label: string
  /** Said on hover and to a screen reader: what choosing this one means. */
  description?: string
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string> {
  value: T
  segments: ReadonlyArray<Segment<T>>
  onValueChange: (value: T) => void
  /** Names the group for assistive tech when no Field label sits above it. */
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function SegmentedControl<T extends string> ({
  value,
  segments,
  onValueChange,
  label,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  const name = useId()

  return (
    <div
      className={[styles.group, styles[size], className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={label}
    >
      {segments.map((segment) => {
        const id = `${name}-${segment.value}`
        const selected = segment.value === value
        return (
          <div className={styles.segment} key={segment.value}>
            <input
              id={id}
              type="radio"
              name={name}
              className={styles.input}
              checked={selected}
              disabled={segment.disabled}
              onChange={() => onValueChange(segment.value)}
            />
            <label className={styles.label} htmlFor={id} title={segment.description}>
              {segment.label}
            </label>
          </div>
        )
      })}
    </div>
  )
}
