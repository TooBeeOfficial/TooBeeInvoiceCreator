/* Choosing a layout, and the paper it sits on.

   A list rather than thumbnails, because the sheet beside the panel is
   already a full-size preview and a postage-stamp version of the same thing
   would tell you less than the one line under the chooser does.

   Colour used to live here as well. It belongs with the rest of the look, in
   the Style tab, beside the saved styles it gets kept in. */

import { useState } from 'react'
import type { InvoiceDoc, PaperSize } from '@model/invoice'
import type { InvoiceTemplate } from '@model/template'
import { PAPER_LABELS } from '@core/document/paper'
import { allTemplates, getTemplate, setUserTemplates } from '@templates/registry'
import { bridge, isDesktop } from '@core/storage/desktop'
import { makeId } from '@core/ids'
import { useDocStore } from '@store/useDocStore'
import { useUiStore } from '@store/useUiStore'
import { Field } from '@elements/Field/Field'
import { Select } from '@elements/Select/Select'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import { TextInput } from '@elements/TextInput/TextInput'
import { Button } from '@elements/Button/Button'
import { IconButton } from '@elements/IconButton/IconButton'
import { PanelSection } from './PanelSection'
import { useT } from '@hooks/useT'
import styles from './TemplatePanel.module.css'

export interface TemplatePanelProps {
  doc: InvoiceDoc
}

export function TemplatePanel ({ doc }: TemplatePanelProps) {
  const t = useT()
  const setTemplate = useDocStore((s) => s.setTemplate)
  const patchSettings = useDocStore((s) => s.patchSettings)
  const notify = useUiStore((s) => s.notify)
  const ask = useUiStore((s) => s.ask)
  const [name, setName] = useState('')
  const templates = allTemplates()
  const current = doc.settings.templateId
  const chosen = templates.find((template) => template.id === current) ?? templates[0]
  const builtIn = templates.filter((template) => !template.custom)
  const custom = templates.filter((template) => template.custom)

  /* The field starts on whatever custom template is already open, so saving
     again after a tweak updates it rather than quietly making a copy. */
  const typed = name || (chosen.custom ? chosen.name : '')
  const matching = custom.find((tpl) => tpl.name.trim().toLowerCase() === typed.trim().toLowerCase())

  const refreshUserTemplates = async () => {
    const api = bridge()
    if (!api) return
    try {
      const saved = await api.listTemplates()
      setUserTemplates((saved as InvoiceTemplate[]).filter((tpl) => tpl && tpl.id && tpl.html))
    } catch {
      /* The templates folder is unreadable; keep what is already registered. */
    }
  }

  const saveAsTemplate = async () => {
    const label = typed.trim()
    if (!label) {
      notify(t.inspector.templateName, 'warning')
      return
    }
    const api = bridge()
    if (!api) return
    const base = getTemplate(current)
    const id = matching?.id ?? `custom-${makeId('tpl')}`
    const template: InvoiceTemplate = {
      id,
      name: label,
      blurb: base.blurb,
      detail: doc.settings.detail,
      page: { orientation: doc.settings.orientation },
      theme: { ...doc.theme },
      html: doc.customHtml ?? base.html,
      css: doc.customCss ?? base.css,
      custom: true,
    }
    const result = await api.saveTemplate(template)
    if (!result.ok) {
      notify(t.toasts.couldNotSave, 'danger')
      return
    }
    await refreshUserTemplates()
    setTemplate(id)
    setName('')
    notify(t.inspector.templateSaved.replace('{name}', label), 'success')
  }

  const deleteTemplate = async () => {
    if (!chosen.custom) return
    const api = bridge()
    if (!api) return
    const confirmed = await ask({
      title: t.inspector.deleteTemplateTitle.replace('{name}', chosen.name),
      body: t.inspector.deleteTemplateBody,
      confirmLabel: t.common.remove,
      tone: 'danger',
    })
    if (!confirmed) return
    const label = chosen.name
    await api.deleteTemplate(chosen.id)
    await refreshUserTemplates()
    setTemplate(getTemplate(chosen.id).id)
    notify(t.inspector.templateDeleted.replace('{name}', label), 'success')
  }

  return (
    <div className={styles.panel}>
      <PanelSection title={t.inspector.layout}>
        <Field label={t.inspector.template}>
          {({ id }) => (
            <select
              id={id}
              className={styles.chooser}
              value={current}
              onChange={(event) => setTemplate(event.target.value)}
            >
              <optgroup label={t.inspector.builtIn}>
                {builtIn.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}{template.detail === 'simple' ? ` — ${t.details.simple}` : ''}
                  </option>
                ))}
              </optgroup>
              {custom.length > 0 ? (
                <optgroup label={t.inspector.savedByYou}>
                  {custom.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          )}
        </Field>

        {/* The one thing about the selected layout that the sheet beside it
            does not already say: what it is for. */}
        <p className={styles.chosen}>
          <span className={styles.chosenName}>
            <span>{chosen.name}</span>
            <span className={styles.chosenMeta}>
              <span className={styles.chosenTag}>{chosen.detail === 'simple' ? t.details.simple : t.details.full}</span>
              {chosen.custom ? (
                <IconButton
                  icon="trash"
                  label={t.inspector.deleteTemplate}
                  size="sm"
                  tone="danger"
                  onClick={() => { void deleteTemplate() }}
                />
              ) : null}
            </span>
          </span>
          <span className={styles.chosenBlurb}>{chosen.blurb}</span>
        </p>

        {/* Only where there is somewhere to write the file: the browser tab
            used for `npm run dev:web` has no desktop bridge to save through. */}
        {isDesktop() ? (
          <div className={styles.saveRow}>
            <TextInput
              value={typed}
              onValueChange={setName}
              placeholder={t.inspector.templateName}
              aria-label={t.inspector.templateName}
            />
            <Button icon={matching ? 'refresh' : 'plus'} onClick={() => { void saveAsTemplate() }}>
              {t.inspector.saveAsTemplate}
            </Button>
          </div>
        ) : null}
      </PanelSection>

      <PanelSection title={t.inspector.paper}>
        <Field label={t.inspector.size} inline>
          {({ id }) => (
            <Select
              id={id}
              value={doc.settings.paper}
              options={(Object.keys(PAPER_LABELS) as PaperSize[]).map((size) => ({
                value: size,
                label: PAPER_LABELS[size],
              }))}
              onValueChange={(paper) => patchSettings({ paper })}
            />
          )}
        </Field>

        <Field label={t.inspector.orientation} inline>
          {() => (
            <SegmentedControl
              value={doc.settings.orientation}
              size="sm"
              label={t.inspector.orientation}
              segments={[
                { value: 'portrait', label: t.inspector.portrait },
                { value: 'landscape', label: t.inspector.landscape },
              ]}
              onValueChange={(orientation) => patchSettings({ orientation })}
            />
          )}
        </Field>
      </PanelSection>
    </div>
  )
}
