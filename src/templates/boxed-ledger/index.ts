/* Boxed Ledger.

   A complete invoice — both parties, every date, the registration numbers,
   the tax analysis, the payment details, the notes and the conditions — with
   one thing drawn on the page and one only: a black box around what was
   bought, a solid heading bar across the top of it and a hairline under
   every row.

   For anyone who wants the full paperwork without the full furniture. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'boxed-ledger',
  name: 'Boxed Ledger',
  blurb: 'Everything on one plain sheet, with the items in a black ruled box.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "'Segoe UI', system-ui, sans-serif",
    ink: '#111418',
    inkSoft: '#6E7681',
    /* No second colour anywhere. The box is the emphasis, and an accent
       would be competing with it for the same job. */
    accent: '#111418',
    line: '#D5D9DF',
    lineStrong: '#111418',
    bandBg: '#111418',
    bandInk: '#FFFFFF',
    dividerStyle: 'plain',
    sizeTitle: 9,
    sizeHeading: 3.6,
    sizeBody: 3.05,
    sizeSmall: 2.5,
    sizeTotal: 5.4,
    weightTitle: 600,
    trackTitle: -0.012,
    trackLabel: 0.13,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.45,
    cellPadX: 2.6,
    cellPadY: 2.4,
    pageMargin: 17,
    blockGap: 9,
    headGap: 9,
    tableGap: 7,
    lineHeight: 1.45,
    logoWidth: 30,
  },
  html,
  css,
}

export default template
