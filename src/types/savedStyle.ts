/* A look, kept on its own.

   A saved style is the whole theme — colour, typefaces, sizes, letterforms,
   spacing, rules and marks — under a name you can put back on any invoice.
   It is deliberately everything the Style and Spacing tabs between them can
   change, because those two are one decision in practice: the margins a
   layout wants depend on the type it is set in, and saving half of that is
   saving something that does not look like anything on its own.

   What a style is *not* is a layout. It carries no template, no paper size
   and nothing that was typed, so applying one to an invoice changes how it
   looks and not a word of what it says. */

import type { InvoiceTheme } from './theme'

export interface SavedStyle {
  id: string
  name: string
  theme: InvoiceTheme
  /** Which template it was built on, shown as a hint rather than applied. */
  bornOn: string
  updatedAt: string
}
