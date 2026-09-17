/* The logo.

   Chosen with the system file dialog and kept inside the document as a data
   URL, not as a path — an invoice file you email to your accountant has to
   carry its own artwork, and a link to a folder on your machine would print
   as a broken image on theirs.

   Its printed width is set here too, in millimetres, because that is the
   only measurement of a logo that means anything on paper. */

import type { InvoiceDoc } from '@model/invoice'
import { bridge } from '@core/storage/desktop'
import { useDocStore } from '@store/useDocStore'
import { useUiStore } from '@store/useUiStore'
import { useT } from '@hooks/useT'
import { Button } from '@elements/Button/Button'
import { Field } from '@elements/Field/Field'
import { RangeInput } from '@elements/RangeInput/RangeInput'
import styles from './LogoField.module.css'

export interface LogoFieldProps {
  doc: InvoiceDoc
}

export function LogoField ({ doc }: LogoFieldProps) {
  const t = useT()
  const patchBranding = useDocStore((s) => s.patchBranding)
  const patchTheme = useDocStore((s) => s.patchTheme)
  const notify = useUiStore((s) => s.notify)
  const logo = doc.branding.logoDataUrl

  const choose = async () => {
    const api = bridge()
    if (!api) {
      notify(t.logo.needsDesktop, 'warning')
      return
    }
    const result = await api.pickImage()
    if (result.canceled) return
    if (!result.ok || !result.dataUrl) {
      notify(result.error ?? t.toasts.couldNotRead, 'danger')
      return
    }
    patchBranding({ logoDataUrl: result.dataUrl, logoName: result.name ?? '' })
  }

  return (
    <div className={styles.logo}>
      <div className={styles.preview}>
        {logo
          ? <img className={styles.image} src={logo} alt={doc.branding.logoName || t.logo.choose} />
          : <span className={styles.placeholder}>{t.logo.none}</span>}
      </div>

      <div className={styles.controls}>
        <div className={styles.buttons}>
          <Button size="sm" icon="image" onClick={choose}>
            {logo ? t.logo.replace : t.logo.choose}
          </Button>
          {logo ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => patchBranding({ logoDataUrl: '', logoName: '' })}
            >
              {t.logo.remove}
            </Button>
          ) : null}
        </div>

        {logo ? (
          <Field label={t.logo.width} inline>
            {({ id }) => (
              <RangeInput
                id={id}
                value={doc.theme.logoWidth}
                onValueChange={(logoWidth) => patchTheme({ logoWidth }, 'theme:logoWidth')}
                min={10}
                max={70}
                step={1}
                unit="mm"
              />
            )}
          </Field>
        ) : (
          <p className={styles.hint}>{t.logo.formats}</p>
        )}
      </div>
    </div>
  )
}
