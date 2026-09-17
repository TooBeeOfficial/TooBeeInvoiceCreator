/* Classic Statement.

   For anyone billing a business that still files paper: accountants,
   contractors, suppliers on account. Serif, ruled and boxed, with a
   remittance advice along the foot so the payer knows what to quote. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'classic-statement',
  name: 'Classic Statement',
  blurb: 'Serif letterhead, ruled table, remittance slip at the foot.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "Cambria, Georgia, 'Times New Roman', serif",
    fontBody: "Cambria, Georgia, 'Times New Roman', serif",
    fontNum: "Cambria, Georgia, 'Times New Roman', serif",
    accent: '#7A1F2B',
    ink: '#1C1418',
    inkSoft: '#77676B',
    line: '#E0D9DA',
    lineStrong: '#9C8B8E',
    bandBg: '#2C1C20',
    bandInk: '#FBF7F5',
    zebra: '#FAF6F5',
    sizeTitle: 8,
    sizeHeading: 3.6,
    sizeBody: 3.05,
    sizeSmall: 2.5,
    sizeTotal: 4.8,
    weightTitle: 700,
    trackTitle: 0.01,
    trackLabel: 0.16,
    caseTitle: 'none',
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.5,
    cellPadX: 2.4,
    cellPadY: 2,
    pageMargin: 16,
    blockGap: 7,
    headGap: 7,
    tableGap: 6,
    lineHeight: 1.4,
    showZebra: true,
  },
  html,
  css,
}

export default template
