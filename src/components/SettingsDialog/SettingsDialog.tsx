/* Settings for the program itself.

   Deliberately small, and deliberately separate from My company. What your
   business is called and what tax you charge are facts about your work that
   travel with your invoices; whether the app is dark and what language it
   speaks are facts about this installation and travel with nothing.

   The two language settings are the reason this dialog needed to grow. They
   are not the same setting and putting them side by side is the clearest way
   to say so: one changes the words in this window, the other changes the
   words on the page a client receives. A freelancer in Berlin billing a
   client in Paris wants German here and French there.

   Everything takes effect as it is set. There is no Save button because
   there is nothing to lose. */

import { useEffect } from 'react'
import { APP_LANGUAGES, LOCALES } from '@core/i18n'
import { usePrefsStore } from '@store/usePrefsStore'
import { useUiStore } from '@store/useUiStore'
import { useT } from '@hooks/useT'
import { Field } from '@elements/Field/Field'
import { Select } from '@elements/Select/Select'
import { Checkbox } from '@elements/Checkbox/Checkbox'
import { SegmentedControl } from '@elements/SegmentedControl/SegmentedControl'
import { IconButton } from '@elements/IconButton/IconButton'
import { Icon } from '@elements/Icon/Icon'
import styles from './SettingsDialog.module.css'

export function SettingsDialog () {
  const open = useUiStore((s) => s.settingsOpen)
  const setOpen = useUiStore((s) => s.setSettings)

  const prefs = usePrefsStore((s) => s.prefs)
  const setTheme = usePrefsStore((s) => s.setTheme)
  const setLanguage = usePrefsStore((s) => s.setLanguage)
  const setDefaults = usePrefsStore((s) => s.setDefaults)
  const set = usePrefsStore((s) => s.set)
  const t = useT()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  /* An example of the document language doing its work, in that language:
     nothing explains a date format like seeing the date in it. */
  const sample = (() => {
    const code = prefs.defaults.locale
    try {
      const date = new Intl.DateTimeFormat(code, { day: 'numeric', month: 'long', year: 'numeric' })
        .format(new Date(2026, 3, 3))
      const figure = new Intl.NumberFormat(code, { minimumFractionDigits: 2 }).format(1250.5)
      return `${date} · ${figure}`
    } catch {
      return ''
    }
  })()

  return (
    <div className={styles.scrim} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className={styles.head}>
          <div>
            <h2 className={styles.title} id="settings-title">{t.settings.title}</h2>
            <p className={styles.subtitle}>{t.settings.subtitle}</p>
          </div>
          <IconButton icon="close" label={t.settings.close} size="sm" onClick={() => setOpen(false)} />
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t.settings.appearance}</h3>
            <Field label={t.settings.theme} hint={t.settings.themeHint}>
              {() => (
                <SegmentedControl
                  value={prefs.appTheme}
                  label={t.settings.theme}
                  segments={[
                    { value: 'system', label: t.settings.system, description: t.settings.followSystem },
                    { value: 'light', label: t.settings.light, description: t.settings.alwaysLight },
                    { value: 'dark', label: t.settings.dark, description: t.settings.alwaysDark },
                  ]}
                  onValueChange={setTheme}
                />
              )}
            </Field>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t.settings.language}</h3>

            <Field label={t.settings.appLanguage} hint={t.settings.appLanguageHint}>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={prefs.language}
                  options={APP_LANGUAGES.map((l) => ({
                    value: l.language,
                    label: l.endonym,
                    note: l.endonym === l.english ? undefined : l.english,
                  }))}
                  onValueChange={setLanguage}
                />
              )}
            </Field>

            <Field label={t.settings.documentLanguage} hint={t.settings.documentLanguageHint}>
              {({ id, describedBy }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  value={prefs.defaults.locale}
                  options={LOCALES.map((l) => ({ value: l.code, label: l.endonym }))}
                  onValueChange={(locale) => setDefaults({ locale })}
                />
              )}
            </Field>

            {sample ? (
              <p className={styles.sample}>
                <span className={styles.sampleLabel}>{t.settings.numbers}</span>
                <span className={styles.sampleValue}>{sample}</span>
              </p>
            ) : null}

            <p className={styles.note}>
              <Icon name="info" size={14} className={styles.noteIcon} />
              <span>{t.settings.translationNote}</span>
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{t.settings.onStart}</h3>
            <Checkbox
              checked={prefs.restoreSession}
              onCheckedChange={(restoreSession) => set({ restoreSession })}
              label={t.settings.reopenLast}
              hint={t.settings.reopenLastHint}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
