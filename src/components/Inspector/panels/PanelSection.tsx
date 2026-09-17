/* A group of controls inside the inspector.

   The inspector is a long column of small decisions, and without grouping it
   reads as one undifferentiated list. Each section names what its controls
   have in common and can be closed once it has been set. */

import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { Icon } from '@elements/Icon/Icon'
import styles from './PanelSection.module.css'

export interface PanelSectionProps {
  title: string
  /** One line saying what these controls are for, when it is not obvious. */
  note?: string
  defaultOpen?: boolean
  /** A control belonging to the section, on its title row. */
  action?: ReactNode
  children: ReactNode
}

export function PanelSection ({ title, note, defaultOpen = true, action, children }: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={13} className={styles.chevron} />
          <span className={styles.title}>{title}</span>
        </button>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>

      <div className={styles.body} id={id} hidden={!open}>
        {note ? <p className={styles.note}>{note}</p> : null}
        {children}
      </div>
    </section>
  )
}
