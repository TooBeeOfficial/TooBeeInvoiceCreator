/* Choosing a layout, and the paper it sits on.

   A list rather than thumbnails, because the sheet beside the panel is
   already a full-size preview and a postage-stamp version of the same thing
   would tell you less than the one line under the chooser does.

   Colour used to live here as well. It belongs with the rest of the look, in
   the Style tab, beside the saved styles it gets kept in. */

import type { InvoiceDoc, PaperSize } from '@model/invoice'
import { PAPER_LABELS } from '@core/document/paper'
import { allTemplates } from '@templates/registry'
import { useDocStore } from '@store/useDocStore'
import { Field } from '@elements/Field/Field'
import { Select } from '@elements/Select/Select'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
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
  const templates = allTemplates()
  const current = doc.settings.templateId
  const chosen = templates.find((template) => template.id === current) ?? templates[0]
  const builtIn = templates.filter((template) => !template.custom)
  const custom = templates.filter((template) => template.custom)

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
            {chosen.name}
            <span className={styles.chosenTag}>{chosen.detail === 'simple' ? t.details.simple : t.details.full}</span>
          </span>
          <span className={styles.chosenBlurb}>{chosen.blurb}</span>
        </p>
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
