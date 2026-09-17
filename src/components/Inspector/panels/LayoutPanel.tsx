/* Spacing and rules.

   A printed page lives or dies on these. They are kept apart from colour and
   type on purpose: changing a palette should never move anything, and moving
   a margin should never change a colour.

   Every measurement is in millimetres of real paper, which is why they are
   not scaled down on smaller sheets the way type is — a 0.2mm rule is a
   0.2mm rule whether it is printed on A4 or A5. */

import type { InvoiceDoc } from '@model/invoice'
import type { DividerStyle, InvoiceTheme } from '@model/theme'
import { DIVIDERS } from '@model/theme'
import { useDocStore } from '@store/useDocStore'
import { Field } from '@elements/Field/Field'
import { RangeInput } from '@elements/RangeInput/RangeInput'
import { Checkbox } from '@elements/Checkbox/Checkbox'
import { Select } from '@elements/Select/Select'
import { PanelSection } from './PanelSection'
import { StylePresets } from '@components/StylePresets/StylePresets'
import { useT } from '@hooks/useT'
import type { AppStrings } from '@core/i18n'
import styles from './LayoutPanel.module.css'

export interface LayoutPanelProps {
  doc: InvoiceDoc
}

type Measure = { key: keyof InvoiceTheme; label: string; min: number; max: number; step: number; note?: string }

const spacingFor = (t: AppStrings): Measure[] => [
  { key: 'pageMargin', label: t.inspector.pageMargin, min: 6, max: 30, step: 0.5 },
  { key: 'headGap', label: t.inspector.underLetterhead, min: 0, max: 24, step: 0.5 },
  { key: 'blockGap', label: t.inspector.betweenBlocks, min: 0, max: 24, step: 0.5 },
  { key: 'tableGap', label: t.inspector.aboveTable, min: 0, max: 20, step: 0.5 },
]

const cellsFor = (t: AppStrings): Measure[] => [
  { key: 'cellPadX', label: t.inspector.cellPadX, min: 0, max: 8, step: 0.2 },
  { key: 'cellPadY', label: t.inspector.cellPadY, min: 0, max: 8, step: 0.2 },
]

const rulesFor = (t: AppStrings): Measure[] => [
  { key: 'ruleW', label: t.inspector.hairline, min: 0, max: 1.2, step: 0.05 },
  { key: 'ruleStrongW', label: t.inspector.strongRule, min: 0, max: 2, step: 0.05 },
  { key: 'radius', label: t.inspector.cornerRadius, min: 0, max: 6, step: 0.2 },
]

export function LayoutPanel ({ doc }: LayoutPanelProps) {
  const t = useT()
  const patchTheme = useDocStore((s) => s.patchTheme)
  const theme = doc.theme

  const SPACING = spacingFor(t)
  const CELLS = cellsFor(t)
  const RULES = rulesFor(t)
  /* The divider ids and the dictionary keys are the same word, so the list
     stays in step with the type without a second table to maintain. */
  const dividerOptions = DIVIDERS.map((divider) => ({ value: divider.id, label: t.dividers[divider.id] }))

  const measure = ({ key, label, min, max, step, note }: Measure) => (
    <Field label={label} inline hint={note} key={key}>
      {({ id }) => (
        <RangeInput
          id={id}
          value={Number(theme[key])}
          onValueChange={(value) => patchTheme({ [key]: value } as Partial<InvoiceTheme>, `theme:${key}`)}
          min={min}
          max={max}
          step={step}
          unit="mm"
        />
      )}
    </Field>
  )

  return (
    <div className={styles.panel}>
      <StylePresets doc={doc} />

      <PanelSection title={t.inspector.spacing}>
        {SPACING.map(measure)}
      </PanelSection>

      <PanelSection title={t.inspector.table}>
        {CELLS.map(measure)}
        <Checkbox
          checked={theme.showZebra}
          onCheckedChange={(showZebra) => patchTheme({ showZebra })}
          label={t.inspector.zebraRows}
        />
      </PanelSection>

      <PanelSection title={t.inspector.rules}>
        <Field label={t.inspector.divider} inline>
          {({ id }) => (
            <Select
              id={id}
              value={theme.dividerStyle}
              options={dividerOptions}
              onValueChange={(dividerStyle) => patchTheme({ dividerStyle: dividerStyle as DividerStyle })}
            />
          )}
        </Field>
        {RULES.map(measure)}
      </PanelSection>

      <PanelSection title={t.inspector.marks}>
        <Checkbox
          checked={theme.showPaidStamp}
          onCheckedChange={(showPaidStamp) => patchTheme({ showPaidStamp })}
          label={t.inspector.stampPaid}
        />
      </PanelSection>
    </div>
  )
}
