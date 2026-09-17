/* Colour and type.

   Each control writes one theme token, and the token reaches the page as a
   CSS custom property — which is why changing the accent here restyles a
   template the user has rewritten by hand in the code panel, and why none of
   these controls needs to know anything about the layout they are changing.

   The faces offered are the ones already on the machine. A desktop app that
   fetched a typeface would print differently on a computer that has never
   been online, and an invoice has to print the same everywhere. */

import type { InvoiceDoc } from '@model/invoice'
import type { InvoiceTheme } from '@model/theme'
import { FACES, PALETTES } from '@model/theme'
import { useDocStore } from '@store/useDocStore'
import { Field } from '@elements/Field/Field'
import { Select } from '@elements/Select/Select'
import { ColorInput } from '@elements/ColorInput/ColorInput'
import { RangeInput } from '@elements/RangeInput/RangeInput'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import { Button } from '@elements/Button/Button'
import { SwatchCard } from '@elements/SwatchCard/SwatchCard'
import { PanelSection } from './PanelSection'
import { StylePresets } from '@components/StylePresets/StylePresets'
import { useT } from '@hooks/useT'
import type { AppStrings } from '@core/i18n'
import styles from './StylePanel.module.css'

export interface StylePanelProps {
  doc: InvoiceDoc
}

const coloursFor = (t: AppStrings): Array<{ key: keyof InvoiceTheme; label: string }> => [
  { key: 'accent', label: t.inspector.accent },
  { key: 'ink', label: t.inspector.ink },
  { key: 'inkSoft', label: t.inspector.inkSoft },
  { key: 'paper', label: t.inspector.paperColour },
  { key: 'line', label: t.inspector.line },
  { key: 'lineStrong', label: t.inspector.lineStrong },
  { key: 'bandBg', label: t.inspector.bandBg },
  { key: 'bandInk', label: t.inspector.bandInk },
  { key: 'zebra', label: t.inspector.zebra },
]

const sizesFor = (t: AppStrings): Array<{ key: keyof InvoiceTheme; label: string; min: number; max: number; step: number }> => [
  { key: 'sizeTitle', label: t.inspector.sizeHeadline, min: 4, max: 16, step: 0.2 },
  { key: 'sizeTotal', label: t.inspector.totalSize, min: 3, max: 10, step: 0.1 },
  { key: 'sizeHeading', label: t.inspector.headingSize, min: 2.4, max: 6, step: 0.1 },
  { key: 'sizeBody', label: t.inspector.baseSize, min: 2.2, max: 4.5, step: 0.05 },
  { key: 'sizeSmall', label: t.inspector.sizeSmall, min: 1.8, max: 3.6, step: 0.05 },
]

export function StylePanel ({ doc }: StylePanelProps) {
  const t = useT()
  const patchTheme = useDocStore((s) => s.patchTheme)
  const resetTheme = useDocStore((s) => s.resetTheme)
  const theme = doc.theme
  const faceOptions = FACES.map((face) => ({ value: face.stack, label: face.name }))
  const COLOURS = coloursFor(t)
  const SIZES = sizesFor(t)

  return (
    <div className={styles.panel}>
      <StylePresets doc={doc} />

      <PanelSection title={t.inspector.palette}>
        <ul className={styles.palettes}>
          {PALETTES.map((palette) => (
            <li key={palette.id}>
              <SwatchCard
                name={palette.name}
                /* The paper first, because it is what tells a reversed
                   palette apart from a light one at a glance — without it
                   Midnight and Ledger are two blue stripes. */
                colours={[
                  palette.tokens.paper ?? '',
                  palette.tokens.accent ?? '',
                  palette.tokens.bandBg ?? '',
                  palette.tokens.line ?? '',
                ]}
                selected={theme.accent === palette.tokens.accent && theme.ink === palette.tokens.ink}
                onSelect={() => patchTheme(palette.tokens)}
              />
            </li>
          ))}
        </ul>

        <Button size="sm" variant="ghost" icon="refresh" onClick={resetTheme}>
          {t.inspector.resetTheme}
        </Button>
      </PanelSection>

      <PanelSection title={t.inspector.colour}>
        {COLOURS.map(({ key, label }) => (
          <Field label={label} inline key={key}>
            {({ id }) => (
              <ColorInput
                id={id}
                value={String(theme[key])}
                onValueChange={(value) => patchTheme({ [key]: value } as Partial<InvoiceTheme>, `theme:${key}`)}
              />
            )}
          </Field>
        ))}
      </PanelSection>

      <PanelSection title={t.inspector.typefaces}>
        <Field label={t.inspector.display} inline>
          {({ id }) => (
            <Select
              id={id}
              value={theme.fontDisplay}
              options={faceOptions}
              onValueChange={(fontDisplay) => patchTheme({ fontDisplay })}
            />
          )}
        </Field>
        <Field label={t.inspector.body} inline>
          {({ id }) => (
            <Select
              id={id}
              value={theme.fontBody}
              options={faceOptions}
              onValueChange={(fontBody) => patchTheme({ fontBody })}
            />
          )}
        </Field>
        <Field label={t.inspector.figures} inline>
          {({ id }) => (
            <Select
              id={id}
              value={theme.fontNum}
              options={faceOptions}
              onValueChange={(fontNum) => patchTheme({ fontNum })}
            />
          )}
        </Field>
      </PanelSection>

      <PanelSection title={t.inspector.size2}>
        {SIZES.map(({ key, label, min, max, step }) => (
          <Field label={label} inline key={key}>
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
        ))}

        <Field label={t.inspector.lineHeight} inline>
          {({ id }) => (
            <RangeInput
              id={id}
              value={theme.lineHeight}
              onValueChange={(lineHeight) => patchTheme({ lineHeight }, 'theme:lineHeight')}
              min={1.1}
              max={2}
              step={0.05}
            />
          )}
        </Field>
      </PanelSection>

      <PanelSection title={t.inspector.letterforms}>
        <Field label={t.inspector.titleWeight} inline>
          {({ id }) => (
            <Select
              id={id}
              value={String(theme.weightTitle)}
              options={[400, 500, 600, 700, 800].map((w) => ({ value: String(w), label: String(w) }))}
              onValueChange={(value) => patchTheme({ weightTitle: Number(value) })}
            />
          )}
        </Field>

        <Field label={t.inspector.headingWeight} inline>
          {({ id }) => (
            <Select
              id={id}
              value={String(theme.weightHeading)}
              options={[400, 500, 600, 700].map((w) => ({ value: String(w), label: String(w) }))}
              onValueChange={(value) => patchTheme({ weightHeading: Number(value) })}
            />
          )}
        </Field>

        <Field label={t.inspector.titleTracking} inline>
          {({ id }) => (
            <RangeInput
              id={id}
              value={theme.trackTitle}
              onValueChange={(trackTitle) => patchTheme({ trackTitle }, 'theme:trackTitle')}
              min={-0.06}
              max={0.1}
              step={0.005}
              unit="em"
            />
          )}
        </Field>

        <Field label={t.inspector.labelTracking} inline>
          {({ id }) => (
            <RangeInput
              id={id}
              value={theme.trackLabel}
              onValueChange={(trackLabel) => patchTheme({ trackLabel }, 'theme:trackLabel')}
              min={0}
              max={0.3}
              step={0.01}
              unit="em"
            />
          )}
        </Field>

        <Field label={t.inspector.labels} inline>
          {() => (
            <SegmentedControl
              value={theme.caseLabel}
              size="sm"
              label={t.inspector.labelCase}
              segments={[
                { value: 'none', label: t.inspector.caseNormal },
                { value: 'uppercase', label: t.inspector.caseUpper },
              ]}
              onValueChange={(caseLabel) => patchTheme({ caseLabel })}
            />
          )}
        </Field>
      </PanelSection>
    </div>
  )
}
