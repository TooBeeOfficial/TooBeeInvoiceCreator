/* What a screen says when there is nothing on it yet.

   An empty screen is an invitation, not an apology: it says what would be
   here, and offers the one action that puts something there. No shrugging
   illustrations, no "Nothing to see". */

import type { ReactNode } from 'react'
import { Icon } from '@elements/Icon/Icon'
import type { IconName } from '@elements/Icon/Icon'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon?: IconName
  /** What would be here, as a statement: "No invoices yet". */
  title: string
  /** One or two lines on what this screen is for. */
  body?: string
  /** The action that fills it. */
  action?: ReactNode
  className?: string
}

export function EmptyState ({ icon = 'file', title, body, action, className }: EmptyStateProps) {
  return (
    <div className={[styles.empty, className].filter(Boolean).join(' ')}>
      <span className={styles.mark} aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {body ? <p className={styles.body}>{body}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
