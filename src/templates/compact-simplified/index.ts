/* Compact Simplified.

   The short form of an invoice: supplier, date, what was sold, the rate of
   tax, the total including it. A UK retail sale under £250 needs no more than
   this, and a counter receipt anywhere needs no more either. Drawn for A5 but
   it sets happily on A4 when that is what is in the printer. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'compact-simplified',
  name: 'Compact Simplified',
  blurb: 'Short form with dotted leaders. For receipts and small sales.',
  detail: 'simple',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "Consolas, 'Courier New', monospace",
    accent: '#16191F',
    ink: '#16191F',
    inkSoft: '#6E7681',
    line: '#DFE2E7',
    lineStrong: '#8E97A3',
    sizeTitle: 7,
    sizeHeading: 3.6,
    sizeBody: 3,
    sizeSmall: 2.45,
    sizeTotal: 5,
    weightTitle: 700,
    trackTitle: -0.005,
    trackLabel: 0.14,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.45,
    cellPadX: 2,
    cellPadY: 1.8,
    pageMargin: 12,
    blockGap: 6,
    headGap: 6,
    tableGap: 5,
    lineHeight: 1.4,
    logoWidth: 24,
  },
  html,
  css,
}

export default template
