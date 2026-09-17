/* What the app says back.

   One message per thing that happened, in the corner, in the same words the
   button used: "Export PDF" produces "Exported PDF." Anything that went
   wrong stays until it is dismissed, and anything that went right leaves on
   its own — nobody needs to click away a confirmation.

   Announced politely to screen readers, so a save is heard without stealing
   focus from whatever is being typed. */

import { useUiStore } from '@store/useUiStore'
import { Icon } from '@elements/Icon/Icon'
import type { IconName } from '@elements/Icon/Icon'
import { IconButton } from '@elements/IconButton/IconButton'
import { useT } from '@hooks/useT'
import styles from './Toaster.module.css'

const TONE_ICON: Record<string, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  danger: 'alert',
}

export function Toaster () {
  const t = useT()
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismiss)

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={[styles.toast, styles[toast.tone]].join(' ')}>
          <Icon name={TONE_ICON[toast.tone] ?? 'info'} size={16} className={styles.icon} />
          <p className={styles.message}>{toast.message}</p>

          {toast.action ? (
            <button
              type="button"
              className={styles.action}
              onClick={() => { toast.action?.run(); dismiss(toast.id) }}
            >
              {toast.action.label}
            </button>
          ) : null}

          <IconButton
            icon="close"
            label={t.common.dismiss}
            size="sm"
            className={styles.close}
            onClick={() => dismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}
