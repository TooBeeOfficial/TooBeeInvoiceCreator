/* Continental.

   The DIN 5008 business letter, which is what an invoice looks like across
   most of continental Europe: return address and recipient positioned for
   the window of a DIN long envelope, particulars in a block to their right,
   and fold marks down the left edge for the two folds and the punch.

   Choose it when the invoice is going in an envelope rather than an inbox. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'continental',
  name: 'Continental',
  blurb: 'DIN letter: envelope window, info block, fold marks.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "'Segoe UI', system-ui, sans-serif",
    accent: '#1B1F26',
    ink: '#1B1F26',
    inkSoft: '#6E7681',
    line: '#DFE2E7',
    lineStrong: '#9AA2AD',
    sizeTitle: 7,
    sizeHeading: 3.4,
    sizeBody: 3,
    sizeSmall: 2.45,
    sizeTotal: 4.4,
    weightTitle: 600,
    weightHeading: 600,
    trackTitle: 0,
    trackLabel: 0.1,
    caseLabel: 'uppercase',
    ruleW: 0.18,
    ruleStrongW: 0.4,
    radius: 0,
    cellPadX: 2.2,
    cellPadY: 2,
    /* 20mm down each side is the DIN letter's own margin, and the fold marks
       and address window are measured back off it. */
    pageMargin: 20,
    blockGap: 6,
    headGap: 6,
    tableGap: 5,
    lineHeight: 1.45,
    logoWidth: 26,
  },
  html,
  css,
}

export default template
