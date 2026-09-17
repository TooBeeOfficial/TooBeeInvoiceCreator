/* Saving a look, and putting it back.

   Shown as swatches rather than a list, because a look is recognised by its
   colours long before its name is read — and because the built-in palettes
   beside it work the same way, so the two read as one kind of thing.

   Appears at the top of both the Style and Spacing tabs: what it saves spans
   them, and having to remember which tab the save lived on would be a small
   daily irritation. */

import { useState } from 'react'
import type { InvoiceDoc } from '@model/invoice'
import type { InvoiceTheme } from '@model/theme'
import { DEFAULT_THEME } from '@model/theme'
import { makeId } from '@core/ids'
import { getTemplate } from '@templates/registry'
import { useDocStore } from '@store/useDocStore'
import { usePrefsStore } from '@store/usePrefsStore'
import { useUiStore } from '@store/useUiStore'
import { TextInput } from '@elements/TextInput/TextInput'
import { Button } from '@elements/Button/Button'
import { SwatchCard } from '@elements/SwatchCard/SwatchCard'
import { PanelSection } from '@components/Inspector/panels/PanelSection'
import { useT } from '@hooks/useT'
import styles from './StylePresets.module.css'

export interface StylePresetsProps {
  doc: InvoiceDoc
}

/* Every token, compared — so "applied" is a fact rather than a guess, and
   stops being claimed the moment anything is nudged. */
function sameTheme (a: InvoiceTheme, b: InvoiceTheme): boolean {
  return (Object.keys(DEFAULT_THEME) as Array<keyof InvoiceTheme>).every((key) => a[key] === b[key])
}

export function StylePresets ({ doc }: StylePresetsProps) {
  const t = useT()
  const saved = usePrefsStore((s) => s.prefs.styles)
  const saveStyle = usePrefsStore((s) => s.saveStyle)
  const removeStyle = usePrefsStore((s) => s.removeStyle)
  const patchTheme = useDocStore((s) => s.patchTheme)
  const notify = useUiStore((s) => s.notify)
  const ask = useUiStore((s) => s.ask)

  const applied = saved.find((style) => sameTheme(style.theme, doc.theme))
  const [name, setName] = useState('')

  /* The field starts on whatever is already applied, so saving again after a
     tweak updates it rather than quietly making a copy. */
  const typed = name || applied?.name || ''
  const willUpdate = saved.some((s) => s.name.trim().toLowerCase() === typed.trim().toLowerCase())

  const save = () => {
    const label = typed.trim()
    if (!label) {
      notify(t.inspector.styleName, 'warning')
      return
    }
    saveStyle({
      id: makeId('style'),
      name: label,
      theme: { ...doc.theme },
      bornOn: getTemplate(doc.settings.templateId).name,
      updatedAt: new Date().toISOString(),
    })
    setName('')
    notify(t.catalogue.savedItem.replace('{description}', label), 'success')
  }

  const remove = async (id: string, label: string) => {
    const confirmed = await ask({
      title: t.catalogue.removeTitle.replace('{description}', label),
      body: t.catalogue.removeBody,
      confirmLabel: t.common.remove,
      tone: 'danger',
    })
    if (confirmed) removeStyle(id)
  }

  return (
    <PanelSection title={t.inspector.savedStyles}>
      {saved.length > 0 ? (
        <ul className={styles.grid}>
          {saved.map((style) => (
            <li key={style.id}>
              <SwatchCard
                name={style.name}
                colours={[style.theme.accent, style.theme.bandBg, style.theme.line]}
                selected={applied?.id === style.id}
                onSelect={() => { patchTheme(style.theme); setName('') }}
                onRemove={() => { void remove(style.id, style.name) }}
                removeLabel={t.inspector.removeStyle}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.saveRow}>
        <TextInput
          value={typed}
          onValueChange={setName}
          placeholder={t.inspector.styleName}
          aria-label={t.inspector.styleNameLabel}
        />
        {/* "Save style", not "Save": the rail already has a Save, and two
            buttons reading the same word mean two different things — one
            writes the invoice to disk, this one does not. */}
        <Button icon={willUpdate ? 'refresh' : 'plus'} onClick={save}>
          {willUpdate ? t.inspector.updateStyle : t.inspector.saveStyle}
        </Button>
      </div>
    </PanelSection>
  )
}
