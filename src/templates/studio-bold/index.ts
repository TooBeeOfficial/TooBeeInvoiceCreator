/* Studio Bold.

   For studios, photographers and anyone whose invoice is the last piece of
   work a client sees. The number is a headline, the total is a headline, and
   there is not a box on the sheet. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'studio-bold',
  name: 'Studio Bold',
  blurb: 'Editorial. The number and the total set as headlines, no boxes.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "Bahnschrift, 'DIN Next', 'Segoe UI', sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "Bahnschrift, 'Segoe UI', sans-serif",
    accent: '#9A5B23',
    ink: '#141414',
    inkSoft: '#77726C',
    line: '#E2DED8',
    lineStrong: '#8C877F',
    paper: '#FFFFFF',
    sizeTitle: 15,
    sizeHeading: 3.8,
    sizeBody: 3,
    sizeSmall: 2.4,
    sizeTotal: 11,
    weightTitle: 700,
    weightHeading: 600,
    trackTitle: -0.035,
    trackLabel: 0.2,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.7,
    cellPadX: 3,
    cellPadY: 3,
    pageMargin: 18,
    blockGap: 10,
    headGap: 12,
    tableGap: 6,
    lineHeight: 1.5,
    logoWidth: 26,
  },
  html,
  css,
}

export default template
