/* The question asked before something cannot be taken back.

   Only three of these exist in the app — discarding unsaved changes,
   forgetting a file, deleting a client — because a confirmation that appears
   for ordinary actions teaches people to click through it.

   The title asks the question, the button says what it will do. Never "Are
   you sure?" over "OK": someone skim-reading has to be able to tell what
   they are agreeing to from the button alone. */

import { useEffect } from 'react'
import { useUiStore } from '@store/useUiStore'
import { useT } from '@hooks/useT'
import { Button } from '@elements/Button/Button'
import styles from './ConfirmDialog.module.css'

export function ConfirmDialog () {
  const t = useT()
  const request = useUiStore((s) => s.confirm)
  const answer = useUiStore((s) => s.answer)

  /* Escape is always the way out. Focus lands on the safe choice below, so
     Enter never destroys anything by reflex. */
  useEffect(() => {
    if (!request) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); answer(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [request, answer])

  if (!request) return null

  return (
    <div className={styles.scrim} onMouseDown={(event) => { if (event.target === event.currentTarget) answer(false) }}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body">
        <h2 className={styles.title} id="confirm-title">{request.title}</h2>
        <p className={styles.body} id="confirm-body">{request.body}</p>
        <div className={styles.actions}>
          <Button autoFocus onClick={() => answer(false)}>{t.common.cancel}</Button>
          <Button
            variant={request.tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => answer(true)}
          >
            {request.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
