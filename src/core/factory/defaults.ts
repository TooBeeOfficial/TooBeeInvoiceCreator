/* What the app is before anyone has told it anything.

   A first run should still produce a usable invoice, so the defaults are a
   working setup rather than a set of blanks: pounds, A4, net 30, one tax rate
   the user will almost certainly change. Nothing here pretends to know the
   user's country — the tax rate starts at zero and is theirs to set. */

import type { Defaults, PanelWidths, Preferences } from '@model/prefs'
import { emptyParty } from '@model/party'
import { DEFAULT_NUMBERING } from '@core/numbering/numbering'
import { languageOf } from '@core/i18n'

export const DEFAULT_DEFAULTS: Defaults = {
  currencyCode: 'GBP',
  paper: 'A4',
  templateId: 'modern-minimal',
  taxMode: 'invoice',
  taxLabel: 'VAT',
  taxRate: 0,
  pricesIncludeTax: false,
  termsDays: 30,
  terms: 'Net 30',
  notes: '',
  paymentInstructions: '',
  locale: 'en-GB',
}

/* Starting widths, and the bounds a drag is held inside. The preview keeps
   at least PREVIEW_MIN whatever the other two are set to, because a sheet of
   paper narrower than that tells you nothing. */
export const PANEL_LIMITS = {
  formMin: 420,
  formMax: 980,
  formDefault: 620,
  inspectorMin: 260,
  inspectorMax: 560,
  inspectorDefault: 330,
  previewMin: 260,
} as const

export const DEFAULT_PANELS: PanelWidths = {
  form: PANEL_LIMITS.formDefault,
  inspector: PANEL_LIMITS.inspectorDefault,
}

export function defaultPreferences (): Preferences {
  return {
    version: 1,
    appTheme: 'system',
    language: 'en',
    restoreSession: true,
    lastFilePath: null,
    seller: emptyParty('seller'),
    clients: [],
    items: [],
    styles: [],
    numbering: { ...DEFAULT_NUMBERING },
    defaults: { ...DEFAULT_DEFAULTS },
    panels: { ...DEFAULT_PANELS },
  }
}

/* Merging a preferences file that was written by an older build.

   Read field by field rather than spread wholesale, so a file missing a key
   added since gets the current default instead of `undefined` reaching a
   control that expected a string. */
export function withPreferenceDefaults (raw: unknown): Preferences {
  const base = defaultPreferences()
  if (!raw || typeof raw !== 'object') return base
  const input = raw as Partial<Preferences>
  return {
    version: 1,
    appTheme: input.appTheme ?? base.appTheme,
    language: languageOf(input.language ?? base.language),
    restoreSession: input.restoreSession ?? base.restoreSession,
    lastFilePath: input.lastFilePath ?? null,
    seller: input.seller ? { ...base.seller, ...input.seller } : base.seller,
    clients: Array.isArray(input.clients) ? input.clients : [],
    items: Array.isArray(input.items) ? input.items : [],
    styles: Array.isArray(input.styles) ? input.styles : [],
    numbering: { ...base.numbering, ...(input.numbering ?? {}) },
    defaults: { ...base.defaults, ...(input.defaults ?? {}) },
    panels: { ...base.panels, ...(input.panels ?? {}) },
  }
}
