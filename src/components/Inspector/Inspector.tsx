/* The design side of the app.

   Four tabs, in the order someone actually works: pick a layout, set the
   colours and type, adjust the spacing, and — if none of that was enough —
   rewrite the template by hand.

   Nothing in here can change what the invoice says. It changes only how the
   invoice looks, which is why it is a panel of its own rather than more
   fields in the form. */

import type { InvoiceDoc } from '@model/invoice'
import type { AppStrings } from '@core/i18n'
import { useUiStore } from '@store/useUiStore'
import type { InspectorTab } from '@store/useUiStore'
import { useT } from '@hooks/useT'
import { Icon } from '@elements/Icon/Icon'
import type { IconName } from '@elements/Icon/Icon'
import { IconButton } from '@elements/IconButton/IconButton'
import { Suspense, lazy } from 'react'
import { TemplatePanel } from './panels/TemplatePanel'
import { StylePanel } from './panels/StylePanel'
import { LayoutPanel } from './panels/LayoutPanel'
import styles from './Inspector.module.css'

/* The code editor is a large dependency for a tab most people never open, so
   it arrives when it is asked for rather than at startup. */
const CodePanel = lazy(() => import('./panels/CodePanel').then((m) => ({ default: m.CodePanel })))

export interface InspectorProps {
  doc: InvoiceDoc
  /** Set by the splitter beside it; the stylesheet only holds the minimum. */
  width: number
}

const tabsFor = (t: AppStrings): Array<{ id: InspectorTab; label: string; icon: IconName }> => [
  { id: 'template', label: t.inspector.tabTemplate, icon: 'layout' },
  { id: 'style', label: t.inspector.tabStyle, icon: 'palette' },
  { id: 'layout', label: t.inspector.tabSpacing, icon: 'sheet' },
  { id: 'code', label: t.inspector.tabCode, icon: 'code' },
]

export function Inspector ({ doc, width }: InspectorProps) {
  const t = useT()
  const tab = useUiStore((s) => s.inspectorTab)
  const setTab = useUiStore((s) => s.setInspectorTab)
  const toggle = useUiStore((s) => s.toggleInspector)
  const TABS = tabsFor(t)

  return (
    <aside className={styles.inspector} aria-label={t.inspector.title} style={{ width }}>
      <div className={styles.head}>
        <div className={styles.tabs} role="tablist" aria-label={t.inspector.tabs}>
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`inspector-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`inspector-panel-${item.id}`}
              className={[styles.tab, tab === item.id ? styles.tabOn : ''].filter(Boolean).join(' ')}
              onClick={() => setTab(item.id)}
            >
              <Icon name={item.icon} size={14} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <IconButton
          icon="chevronRight"
          label={t.inspector.hide}
          size="sm"
          onClick={() => toggle(false)}
        />
      </div>

      <div
        className={styles.body}
        role="tabpanel"
        id={`inspector-panel-${tab}`}
        aria-labelledby={`inspector-tab-${tab}`}
      >
        {tab === 'template' ? <TemplatePanel doc={doc} /> : null}
        {tab === 'style' ? <StylePanel doc={doc} /> : null}
        {tab === 'layout' ? <LayoutPanel doc={doc} /> : null}
        {tab === 'code' ? (
          <Suspense fallback={<p className={styles.loading}>{t.inspector.opening}</p>}>
            <CodePanel doc={doc} />
          </Suspense>
        ) : null}
      </div>
    </aside>
  )
}
