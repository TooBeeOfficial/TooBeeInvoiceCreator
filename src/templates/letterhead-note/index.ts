/* Letterhead Note.

   The invoice as a letter — for consultants, solicitors and anyone billing
   someone they have been talking to for weeks, where a ruled grid is the
   wrong register. Signed at the foot over a real rule. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'letterhead-note',
  name: 'Letterhead Note',
  blurb: 'Written as a letter: dated, addressed, and signed at the foot.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "Constantia, Georgia, 'Times New Roman', serif",
    fontBody: "Constantia, Georgia, 'Times New Roman', serif",
    fontNum: "Constantia, Georgia, 'Times New Roman', serif",
    accent: '#1F3B63',
    ink: '#1A1A1A',
    inkSoft: '#6E6A66',
    line: '#E0DCD6',
    lineStrong: '#A7A099',
    sizeTitle: 7,
    sizeHeading: 3.6,
    sizeBody: 3.15,
    sizeSmall: 2.6,
    sizeTotal: 5,
    weightTitle: 700,
    weightHeading: 600,
    trackTitle: 0,
    trackLabel: 0.06,
    caseLabel: 'none',
    ruleW: 0.2,
    ruleStrongW: 0.4,
    cellPadX: 2.6,
    cellPadY: 2.2,
    pageMargin: 22,
    blockGap: 7,
    headGap: 10,
    tableGap: 5,
    lineHeight: 1.55,
    logoWidth: 26,
  },
  html,
  css,
}

export default template
