/* The keys, listed.

   Opened with F1 and closed with anything. Grouped by what they are for
   rather than alphabetically, because someone opening this is looking for a
   task, not a key. */

import { useEffect } from 'react'
import type { AppStrings } from '@core/i18n'
import { useUiStore } from '@store/useUiStore'
import { useT } from '@hooks/useT'
import { IconButton } from '@elements/IconButton/IconButton'
import styles from './ShortcutsDialog.module.css'

/* The key names stay as they are printed on the keyboard — Ctrl is Ctrl in
   every language this app speaks — and only what each one does is
   translated. */
const groupsFor = (t: AppStrings): Array<{ title: string; rows: Array<[string, string]> }> => [
  {
    title: t.shortcuts.document,
    rows: [
      ['Ctrl + 1', t.shortcuts.goInvoices],
      ['Ctrl + 2', t.shortcuts.goEditor],
      ['Ctrl + 3', t.shortcuts.goItems],
      ['Ctrl + 4', t.shortcuts.goClients],
      ['Ctrl + 5', t.shortcuts.goCompany],
      ['Ctrl + F', t.shortcuts.search],
      ['Ctrl + ,', t.shortcuts.settings],
    ],
  },
  {
    title: t.shortcuts.file,
    rows: [
      ['Ctrl + N', t.shortcuts.newInvoice],
      ['Ctrl + O', t.shortcuts.open],
      ['Ctrl + S', t.shortcuts.save],
      ['Ctrl + Shift + S', t.shortcuts.saveAs],
      ['Ctrl + E', t.shortcuts.exportPdf],
      ['Ctrl + Shift + E', t.shortcuts.exportExcel],
    ],
  },
  {
    title: t.shortcuts.edit,
    rows: [
      ['Ctrl + Enter', t.shortcuts.addLine],
      ['Ctrl + Z', t.shortcuts.undo],
      ['Ctrl + Shift + Z', t.shortcuts.redo],
    ],
  },
  {
    title: t.shortcuts.view,
    rows: [
      ['Ctrl + =', t.shortcuts.zoomIn],
      ['Ctrl + −', t.shortcuts.zoomOut],
      ['Ctrl + 0', t.shortcuts.zoomFit],
      ['Ctrl + B', t.shortcuts.designPanel],
      ['F1', t.shortcuts.shortcuts],
    ],
  },
]

export function ShortcutsDialog () {
  const t = useT()
  const GROUPS = groupsFor(t)
  const open = useUiStore((s) => s.shortcutsOpen)
  const setOpen = useUiStore((s) => s.setShortcuts)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className={styles.scrim} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <header className={styles.head}>
          <h2 className={styles.title} id="shortcuts-title">{t.shortcuts.title}</h2>
          <IconButton icon="close" label={t.common.close} size="sm" onClick={() => setOpen(false)} />
        </header>

        <div className={styles.groups}>
          {GROUPS.map((group) => (
            <section className={styles.group} key={group.title}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <dl className={styles.rows}>
                {group.rows.map(([keys, what]) => (
                  <div className={styles.row} key={keys + what}>
                    <dt className={styles.keys}>{keys}</dt>
                    <dd className={styles.what}>{what}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <p className={styles.note}>{t.shortcuts.note}</p>
      </div>
    </div>
  )
}
