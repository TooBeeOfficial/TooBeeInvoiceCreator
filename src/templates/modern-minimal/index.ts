/* Modern Minimal.

   For freelancers and studios sending a full invoice that has to look
   considered. Sans throughout, rules instead of boxes, and the amount due
   announced at the top rather than hidden at the bottom of a column of
   arithmetic. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  blurb: 'Amount due up front, hairline rules, plenty of air.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "Bahnschrift, 'DIN Next', 'Segoe UI', sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "Bahnschrift, 'Segoe UI', sans-serif",
    accent: '#17457A',
    sizeTitle: 9,
    sizeHeading: 3.7,
    sizeBody: 3.1,
    sizeSmall: 2.5,
    sizeTotal: 5.4,
    trackTitle: -0.015,
    trackLabel: 0.14,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.45,
    cellPadX: 2.6,
    cellPadY: 2.4,
    pageMargin: 17,
    blockGap: 9,
    headGap: 9,
    tableGap: 4,
    lineHeight: 1.45,
  },
  html,
  css,
}

export default template
