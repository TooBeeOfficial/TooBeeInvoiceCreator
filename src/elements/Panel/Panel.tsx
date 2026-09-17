/* A titled block of form.

   The unit the editor and the inspector are both built from: a heading, an
   optional line saying what the block is for, and somewhere on the right for
   the one control that belongs to the whole block. Collapsible where a
   section is genuinely optional, so a short invoice does not scroll past
   payment details nobody filled in. */

import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { Icon } from '@elements/Icon/Icon'
import styles from './Panel.module.css'

export interface PanelProps {
  title: string
  /** One line under the title. Says what the block does, not what it is. */
  description?: string
  /** A control belonging to the whole block, on the title row. */
  action?: ReactNode
  /** Makes the header a button that opens and closes the body. */
  collapsible?: boolean
  defaultOpen?: boolean
  /** Shown beside the title when closed: "3 lines", "Not set". */
  summary?: string
  children: ReactNode
  className?: string
}

export function Panel ({
  title,
  description,
  action,
  collapsible = false,
  defaultOpen = true,
  summary,
  children,
  className,
}: PanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()
  const shown = collapsible ? open : true

  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')}>
      <header className={styles.header}>
        {collapsible ? (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} className={styles.chevron} />
            <span className={styles.title}>{title}</span>
            {!open && summary ? <span className={styles.summary}>{summary}</span> : null}
          </button>
        ) : (
          <div className={styles.heading}>
            <h2 className={styles.title}>{title}</h2>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
        )}

        {action ? <div className={styles.action}>{action}</div> : null}
      </header>

      {collapsible && description && open ? <p className={styles.description}>{description}</p> : null}

      <div className={styles.body} id={bodyId} hidden={!shown}>
        {children}
      </div>
    </section>
  )
}
