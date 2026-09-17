/* The draggable divider between two panes.

   Dragging is the obvious way to use it, but not the only one: it takes
   focus, the arrow keys move it, Home puts it back where it started, and
   double-clicking does the same. A divider that can only be dragged is one
   that cannot be used without a mouse.

   Reports continuously while dragging so the panes follow the pointer, and
   once more on release — which is when the new width is worth writing to
   disk. Saving on every pixel would write a hundred files per drag. */

import { useRef } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import styles from './Splitter.module.css'

export interface SplitterProps {
  /** Which side of the divider the pane being sized is on. */
  side: 'left' | 'right'
  /** Current width of that pane, in pixels. */
  value: number
  min: number
  max: number
  /** The width it goes back to on Home or a double-click. */
  reset: number
  onChange: (next: number) => void
  /** Called once the drag ends, for anything worth persisting. */
  onCommit: (next: number) => void
  /** Names the divider: "Resize the form". */
  label: string
}

const STEP = 16
const BIG_STEP = 64

export function Splitter ({ side, value, min, max, reset, onChange, onCommit, label }: SplitterProps) {
  const drag = useRef<{ startX: number; startValue: number } | null>(null)

  const clamp = (next: number) => Math.round(Math.min(max, Math.max(min, next)))

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { startX: event.clientX, startValue: value }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const travelled = event.clientX - drag.current.startX
    /* A divider on the right of its pane grows the pane as the pointer moves
       right; one on the left of its pane does the opposite. */
    const delta = side === 'left' ? travelled : -travelled
    onChange(clamp(drag.current.startValue + delta))
  }

  const end = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    onCommit(value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? BIG_STEP : STEP
    const towards = side === 'left' ? 1 : -1
    let next: number | null = null

    if (event.key === 'ArrowLeft') next = value - step * towards
    else if (event.key === 'ArrowRight') next = value + step * towards
    else if (event.key === 'Home') next = reset
    else if (event.key === 'End') next = side === 'left' ? max : min

    if (next === null) return
    event.preventDefault()
    const settled = clamp(next)
    onChange(settled)
    onCommit(settled)
  }

  const doubleClick = () => {
    onChange(reset)
    onCommit(reset)
  }

  return (
    <div
      className={styles.splitter}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={onKeyDown}
      onDoubleClick={doubleClick}
      title={`${label}. Drag, use the arrow keys, or double-click to reset.`}
    >
      <span className={styles.grip} aria-hidden="true" />
    </div>
  )
}
