/* What is still missing.

   Errors mean the document is not an invoice yet; warnings mean it will
   print and total correctly but something is missing that a tax office or an
   accountant would expect. Neither stops anyone — the list says what it
   found and leaves the decision to the person who knows their own situation.

   Written as instructions, in the order they should be dealt with, so the
   list can be worked down rather than read. */

import type { Issue, ValidationResult } from '@core/validation/validateInvoice'
import { Icon } from '@elements/Icon/Icon'
import { useT } from '@hooks/useT'
import styles from './IssueList.module.css'

export interface IssueListProps {
  result: ValidationResult
  className?: string
}

export function IssueList ({ result, className }: IssueListProps) {
  const t = useT()
  const { errors, warnings } = result
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className={[styles.clean, className].filter(Boolean).join(' ')}>
        <Icon name="check" size={14} />
        <span>{t.checks.allClear}</span>
      </div>
    )
  }

  return (
    <div className={[styles.list, className].filter(Boolean).join(' ')}>
      {[...errors, ...warnings].map((issue: Issue) => (
        <p className={[styles.issue, styles[issue.severity]].join(' ')} key={issue.id}>
          <Icon name={issue.severity === 'error' ? 'alert' : 'info'} size={14} className={styles.icon} />
          <span>{issue.message}</span>
        </p>
      ))}
    </div>
  )
}
