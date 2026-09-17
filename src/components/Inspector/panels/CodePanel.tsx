/* The template, as code.

   The last stop when the controls above do not reach far enough. The markup
   is Mustache rendered against the view model, and the stylesheet is ordinary
   CSS written against the theme tokens — so a template edited here still
   answers to the palette and the spacing controls.

   Editing takes a copy: the built-in template is never modified, and
   reverting puts the original back untouched. Nothing typed here can run —
   the preview frame has scripting switched off, and so does the worker that
   renders the PDF. */

import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { html as htmlLang } from '@codemirror/lang-html'
import { css as cssLang } from '@codemirror/lang-css'
import type { InvoiceDoc } from '@model/invoice'
import { getTemplate } from '@templates/registry'
import { useDocStore } from '@store/useDocStore'
import { useUiStore } from '@store/useUiStore'
import { usePrefsStore } from '@store/usePrefsStore'
import { Button } from '@elements/Button/Button'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import { useT } from '@hooks/useT'
import { useState } from 'react'
import styles from './CodePanel.module.css'

export interface CodePanelProps {
  doc: InvoiceDoc
}

export function CodePanel ({ doc }: CodePanelProps) {
  const t = useT()
  const [tab, setTab] = useState<'html' | 'css'>('css')
  const setCustomHtml = useDocStore((s) => s.setCustomHtml)
  const setCustomCss = useDocStore((s) => s.setCustomCss)
  const ask = useUiStore((s) => s.ask)
  const appTheme = usePrefsStore((s) => s.prefs.appTheme)

  const template = useMemo(() => getTemplate(doc.settings.templateId), [doc.settings.templateId])
  const edited = tab === 'html' ? doc.customHtml !== null : doc.customCss !== null
  const value = tab === 'html'
    ? doc.customHtml ?? template.html
    : doc.customCss ?? template.css

  const dark = appTheme === 'dark'
    || (appTheme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  const revert = async () => {
    const confirmed = await ask({
      title: t.inspector.revert,
      body: t.toasts.discardBody,
      confirmLabel: t.toasts.discardConfirm,
      tone: 'danger',
    })
    if (!confirmed) return
    if (tab === 'html') setCustomHtml(null)
    else setCustomCss(null)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <SegmentedControl
          value={tab}
          size="sm"
          label={t.inspector.whatToEdit}
          segments={[
            { value: 'css', label: t.inspector.css },
            { value: 'html', label: t.inspector.html },
          ]}
          onValueChange={setTab}
        />
        <Button size="sm" variant="ghost" icon="refresh" disabled={!edited} onClick={revert}>
          {t.inspector.revert}
        </Button>
      </div>

      <p className={styles.note}>{t.inspector.codeNote}</p>

      <div className={styles.editor}>
        <CodeMirror
          value={value}
          height="100%"
          theme={dark ? 'dark' : 'light'}
          extensions={tab === 'html' ? [htmlLang()] : [cssLang()]}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            autocompletion: true,
            bracketMatching: true,
          }}
          onChange={(next) => (tab === 'html' ? setCustomHtml(next) : setCustomCss(next))}
        />
      </div>
    </div>
  )
}
