/* The rail across the top.

   Where you are on the left, what you can do on the right, and in the middle
   the name of the invoice that is open — which is also where the app says
   whether it has been saved. Nothing else lives up here: every rail in every
   app fills up with buttons that belong next to the thing they change, and
   these four are the ones that genuinely belong to the window. */

import { useDocStore } from '@store/useDocStore'
import { useUiStore } from '@store/useUiStore'
import type { PageId } from '@store/useUiStore'
import { newDocument, openDocument, saveDocument, exportDocument } from '@store/documentActions'
import { Button } from '@elements/Button/Button'
import { IconButton } from '@elements/IconButton/IconButton'
import { Icon } from '@elements/Icon/Icon'
import type { IconName } from '@elements/Icon/Icon'
import { Menu } from '@components/Menu/Menu'
import { useT } from '@hooks/useT'
import styles from './TopRail.module.css'

/* Ids and icons are structure; the words are a translation and come from the
   dictionary at render time. */
const PAGES: Array<{ id: PageId; icon: IconName }> = [
  { id: 'invoices', icon: 'file' },
  { id: 'editor', icon: 'sheet' },
  { id: 'items', icon: 'table' },
  { id: 'clients', icon: 'users' },
  { id: 'company', icon: 'bank' },
]

export function TopRail () {
  const page = useUiStore((s) => s.page)
  const go = useUiStore((s) => s.go)
  const toggleInspector = useUiStore((s) => s.toggleInspector)
  const inspectorOpen = useUiStore((s) => s.inspectorOpen)
  const setShortcuts = useUiStore((s) => s.setShortcuts)
  const setSettings = useUiStore((s) => s.setSettings)

  const doc = useDocStore((s) => s.doc)
  const dirty = useDocStore((s) => s.dirty)
  const filePath = useDocStore((s) => s.filePath)
  const undo = useDocStore((s) => s.undo)
  const redo = useDocStore((s) => s.redo)
  const past = useDocStore((s) => s.past.length)
  const future = useDocStore((s) => s.future.length)

  const t = useT()
  const onEditor = page === 'editor'

  return (
    <header className={styles.rail}>
      <nav className={styles.nav} aria-label={t.nav.sections}>
        {PAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={[styles.tab, page === item.id ? styles.tabOn : ''].filter(Boolean).join(' ')}
            aria-current={page === item.id ? 'page' : undefined}
            onClick={() => go(item.id)}
          >
            <Icon name={item.icon} size={15} />
            <span>{t.nav[item.id]}</span>
          </button>
        ))}
      </nav>

      <div className={styles.middle}>
        {onEditor ? (
          <p className={styles.docname} title={filePath ?? 'Not saved yet'}>
            <span className={styles.number}>{doc.meta.number || t.rail.untitled}</span>
            <span className={styles.state}>
              {dirty ? t.rail.unsaved : filePath ? t.rail.saved : t.rail.notSaved}
            </span>
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        {onEditor ? (
          <>
            <IconButton icon="undo" label={t.rail.undo} size="sm" disabled={past === 0} onClick={undo} />
            <IconButton icon="redo" label={t.rail.redo} size="sm" disabled={future === 0} onClick={redo} />
            <span className={styles.divider} aria-hidden="true" />
          </>
        ) : null}

        <Menu
          align="right"
          items={[
            { id: 'new', label: t.file.newInvoice, icon: 'plus', note: 'Ctrl+N', run: () => { void newDocument() } },
            { id: 'open', label: t.file.openInvoice, icon: 'folder', note: 'Ctrl+O', run: () => { void openDocument() } },
            { id: 'saveas', label: t.file.saveAs, icon: 'save', note: 'Ctrl+Shift+S', run: () => { void saveDocument({ saveAs: true }) } },
            { id: 'settings', label: t.file.settings, icon: 'settings', note: t.file.settingsNote, run: () => setSettings(true) },
            { id: 'shortcuts', label: t.file.shortcuts, icon: 'keyboard', note: 'F1', run: () => setShortcuts(true) },
          ]}
          trigger={(props) => (
            <Button size="sm" variant="ghost" icon="file" trailingIcon="chevronDown" {...props}>
              {t.rail.file}
            </Button>
          )}
        />

        <Menu
          align="right"
          items={[
            { id: 'pdf', label: t.exports.pdf, icon: 'printer', note: t.exports.pdfNote, run: () => { void exportDocument('pdf') } },
            { id: 'xlsx', label: t.exports.excel, icon: 'sheet', note: t.exports.excelNote, run: () => { void exportDocument('xlsx') } },
            { id: 'csv', label: t.exports.csv, icon: 'table', note: t.exports.csvNote, run: () => { void exportDocument('csv') } },
          ]}
          trigger={(props) => (
            <Button size="sm" variant="ghost" icon="download" trailingIcon="chevronDown" {...props}>
              {t.rail.export}
            </Button>
          )}
        />

        {onEditor ? (
          <IconButton
            icon="palette"
            label={inspectorOpen ? t.rail.hideDesignPanel : t.rail.designPanel}
            size="sm"
            active={inspectorOpen}
            onClick={() => toggleInspector()}
          />
        ) : null}

        <IconButton
          icon="keyboard"
          label={`${t.file.shortcuts} (F1)`}
          size="sm"
          onClick={() => setShortcuts(true)}
        />

        <IconButton
          icon="settings"
          label={t.rail.settings}
          size="sm"
          onClick={() => setSettings(true)}
        />

        <Button
          size="sm"
          variant="primary"
          icon="save"
          onClick={() => { void saveDocument() }}
        >
          {t.rail.save}
        </Button>
      </div>
    </header>
  )
}
