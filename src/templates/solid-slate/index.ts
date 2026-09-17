/* Solid Slate.

   The full paperwork in one column, with the items printed white out of a
   solid black panel and the rows inside it separated by a light rule.

   The same completeness as Boxed Ledger and the opposite treatment of the
   same idea: where that one draws a box, this one fills it. Nothing else on
   the sheet has a border or a fill, so the panel carries the page on its
   own. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'solid-slate',
  name: 'Solid Slate',
  blurb: 'Everything, in one column, with the items reversed out of a black panel.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "'Segoe UI', system-ui, sans-serif",
    ink: '#111418',
    inkSoft: '#6E7681',
    accent: '#111418',
    line: '#D5D9DF',
    lineStrong: '#B4BAC4',
    /* The panel. Changing these two in the inspector re-colours the slab and
       everything printed on it, rules included — they are mixed from the
       band ink rather than named. */
    bandBg: '#111418',
    bandInk: '#FFFFFF',
    dividerStyle: 'plain',
    sizeTitle: 9,
    sizeHeading: 3.6,
    sizeBody: 3.05,
    sizeSmall: 2.5,
    sizeTotal: 5.4,
    weightTitle: 600,
    weightHeading: 600,
    trackTitle: -0.012,
    trackLabel: 0.13,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.45,
    cellPadX: 3,
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
