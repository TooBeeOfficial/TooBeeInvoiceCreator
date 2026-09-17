/* A template is a layout and a set of type defaults — nothing more.

   `html` is a Mustache template rendered against the view model built in
   core/document/viewModel.ts. `css` is the template's own stylesheet, written
   against the theme tokens, and is what the code panel hands the user to
   edit. Neither ever contains invoice data. */

import type { InvoiceTheme } from './theme'
import type { DetailLevel, Orientation } from './invoice'

export interface InvoiceTemplate {
  id: string
  name: string
  /** One line in the template rail: what this layout is for. */
  blurb: string
  /** Which of the two shapes it was drawn for; both still render. */
  detail: DetailLevel
  page: { orientation: Orientation }
  /** Theme overrides layered on DEFAULT_THEME when the template is chosen. */
  theme: Partial<InvoiceTheme>
  html: string
  css: string
  /** True for templates the user saved themselves. */
  custom?: boolean
}
