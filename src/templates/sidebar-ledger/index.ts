/* Sidebar Ledger.

   For anyone whose invoices carry a lot of standing detail — bank details,
   registration numbers, a licence line — and who does not want it competing
   with the work. It goes down a coloured band on the left and stays there. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'sidebar-ledger',
  name: 'Sidebar Ledger',
  blurb: 'Your details in a coloured band; the work gets the main column.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "Bahnschrift, 'Segoe UI', sans-serif",
    accent: '#123227',
    accentInk: '#F2F8F4',
    ink: '#151A17',
    inkSoft: '#6A7670',
    line: '#DBE4DE',
    lineStrong: '#9BAAA1',
    zebra: '#F4F8F5',
    sizeTitle: 9,
    sizeHeading: 3.6,
    sizeBody: 3,
    sizeSmall: 2.45,
    sizeTotal: 5,
    trackTitle: -0.015,
    trackLabel: 0.13,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.45,
    radius: 1.5,
    cellPadX: 3,
    cellPadY: 2.4,
    pageMargin: 14,
    blockGap: 7,
    headGap: 7,
    tableGap: 4,
    lineHeight: 1.45,
    logoWidth: 30,
  },
  html,
  css,
}

export default template
