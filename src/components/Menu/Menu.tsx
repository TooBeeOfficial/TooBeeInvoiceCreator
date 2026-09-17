/* A small menu hung off a button.

   Used where several related actions share one place on the rail — the three
   exports, the things you can do to an invoice in the list. Closes on
   Escape, on a click outside, and after anything is chosen, because a menu
   that stays open after you have used it is a menu you have to dismiss.

   The panel is drawn at the end of the document rather than next to its
   button. It has to be: the triggers sit inside tables that scroll
   sideways, and a box that scrolls on one axis clips the other as well — so
   a panel positioned inside one is a panel cut off at the edge of the table
   instead of floating over it. Drawn at the top of the document it is
   clipped by nothing, and it is placed each time from where the button
   actually is on the screen.

   Which means the position has to be kept honest. It is taken again on
   every resize and on every scroll anywhere in the page — capture phase,
   because the scroll that moves the button is usually a pane's, not the
   window's, and those do not bubble. */

import type { ReactNode } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@elements/Icon/Icon'
import type { IconName } from '@elements/Icon/Icon'
import styles from './Menu.module.css'

export interface MenuItem {
  id: string
  label: string
  icon?: IconName
  /** A word under the label saying what it produces. */
  note?: string
  disabled?: boolean
  tone?: 'default' | 'danger'
  run: () => void
}

export interface MenuProps {
  /** The button that opens it. Rendered with the props it needs. */
  trigger: (props: { onClick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'menu' }) => ReactNode
  items: MenuItem[]
  align?: 'left' | 'right'
  className?: string
}

/** Clear of the button, and clear of the window's edge. */
const GAP = 4
const EDGE = 8

interface Spot { top: number; bottom: number; left: number; right: number }

export function Menu ({ trigger, items, align = 'right', className }: MenuProps) {
  const [open, setOpen] = useState(false)
  const [spot, setSpot] = useState<Spot | null>(null)
  const [above, setAbove] = useState(false)
  const holder = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  /* Where the button is, in window coordinates — which is what a fixed box
     is positioned in. */
  const place = () => {
    const box = holder.current?.getBoundingClientRect()
    if (!box) return
    setSpot({ top: box.top, bottom: box.bottom, left: box.left, right: box.right })
  }

  useLayoutEffect(() => {
    if (open) place()
    else { setSpot(null); setAbove(false) }
  }, [open])

  /* Opens downward unless there is more room the other way. Measured rather
     than guessed from where the button sits, so a two-item menu near the
     foot of the window still drops down when it fits. */
  useLayoutEffect(() => {
    if (!open || !spot || !panel.current) return
    const height = panel.current.offsetHeight
    const below = window.innerHeight - spot.bottom - GAP - EDGE
    setAbove(height > below && spot.top - GAP - EDGE > below)
  }, [open, spot, items.length])

  useEffect(() => {
    if (!open) return

    /* The panel is no longer inside the holder, so a click on one of its own
       items would read as a click outside and close the menu before the item
       ever ran. Both boxes count as inside. */
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (holder.current?.contains(target) || panel.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const follow = () => place()

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', follow)
    window.addEventListener('scroll', follow, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', follow)
      window.removeEventListener('scroll', follow, true)
    }
  }, [open])

  const style = spot
    ? {
        ...(above
          ? { bottom: `${Math.max(EDGE, window.innerHeight - spot.top + GAP)}px` }
          : { top: `${spot.bottom + GAP}px` }),
        ...(align === 'right'
          ? { right: `${Math.max(EDGE, window.innerWidth - spot.right)}px` }
          : { left: `${Math.max(EDGE, spot.left)}px` }),
        /* Never taller than the room it has. A menu that runs off the bottom
           of the window is one whose last item cannot be reached. */
        maxHeight: `${(above ? spot.top : window.innerHeight - spot.bottom) - GAP - EDGE}px`,
      }
    : undefined

  return (
    <div className={[styles.holder, className].filter(Boolean).join(' ')} ref={holder}>
      {trigger({
        onClick: () => setOpen((value) => !value),
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      })}

      {open && spot ? createPortal(
        <div className={styles.menu} role="menu" ref={panel} style={style}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={[styles.item, item.tone === 'danger' ? styles.danger : ''].filter(Boolean).join(' ')}
              disabled={item.disabled}
              onClick={() => { setOpen(false); item.run() }}
            >
              {item.icon ? <Icon name={item.icon} size={15} className={styles.icon} /> : <span className={styles.icon} />}
              <span className={styles.text}>
                <span className={styles.label}>{item.label}</span>
                {item.note ? <span className={styles.note}>{item.note}</span> : null}
              </span>
            </button>
          ))}
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
