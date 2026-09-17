/* Assembling the printable document.

   One function, used by the preview, the PDF export and the template rail's
   thumbnails alike. Because all three go through here, what is on screen is
   literally what comes out of the printer — there is no second renderer that
   could drift from the first.

   The layering is deliberate and always the same:

     base       structure, paper size, pagination, theme tokens
     template   the layout's own stylesheet
     custom     whatever the user wrote in the code panel, last and winning
*/

import Mustache from 'mustache'
import type { InvoiceDoc } from '@model/invoice'
import type { InvoiceTemplate } from '@model/template'
import { calcTotals } from '@core/totals/calcTotals'
import { buildViewModel, escapeHtml } from './viewModel'
import { baseCss } from './baseCss'
import type { RenderMode } from './baseCss'
import { pageDimensions } from './paper'

export interface RenderOptions {
  mode?: RenderMode
  /** Skip the user's overrides, to show what the stock template looks like. */
  ignoreCustom?: boolean
}

export interface RenderedDocument {
  html: string
  /** The body alone, for embedding without a second document. */
  body: string
  css: string
  width: number
  height: number
  landscape: boolean
}

export function renderDocument (
  doc: InvoiceDoc,
  template: InvoiceTemplate,
  options: RenderOptions = {},
): RenderedDocument {
  const mode = options.mode ?? 'screen'
  const view = buildViewModel(doc, calcTotals(doc))
  const { w, h, landscape } = pageDimensions(doc.settings.paper, doc.settings.orientation)

  const markup = (!options.ignoreCustom && doc.customHtml) || template.html
  const sheetCss = (!options.ignoreCustom && doc.customCss) || template.css

  let body: string
  try {
    body = Mustache.render(markup, view)
  } catch (error) {
    /* A template the user is halfway through editing should say so on the
       page rather than blank it: losing sight of the invoice is worse than
       seeing a broken tag. */
    body = `<div style="padding:20mm;font:14px system-ui;color:#B3261E">
  <strong>The template could not be drawn.</strong>
  <p style="margin-top:8px">${escapeHtml(error instanceof Error ? error.message : String(error))}</p>
</div>`
  }

  const css = `${baseCss(doc.settings.paper, doc.settings.orientation, doc.theme, mode)}\n\n/* template: ${template.id} */\n${sheetCss}`

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(doc.meta.number || 'Invoice')}</title>
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>`

  return { html, body, css, width: w, height: h, landscape }
}
