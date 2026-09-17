/* Plain Slip.

   The quietest thing in the rail. No rules, no bands, no tinted blocks — one
   hairline above the total and nothing else drawn anywhere on the sheet. The
   blocks are held apart by space and told apart by weight: what matters is
   in the text colour, everything else in the soft one.

   For a receipt that has to look like it came from a person rather than from
   a system, and for anyone who finds the dotted leaders of Compact
   Simplified too much furniture. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'plain-slip',
  name: 'Plain Slip',
  blurb: 'Space instead of rules. One hairline over the total and nothing else.',
  detail: 'simple',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "'Segoe UI', system-ui, sans-serif",
    /* The accent is the ink. A receipt this plain has nothing for a second
       colour to do that the total's size is not already doing. */
    ink: '#1A1D23',
    inkSoft: '#767E8B',
    accent: '#1A1D23',
    line: '#E4E7EC',
    lineStrong: '#1A1D23',
    dividerStyle: 'plain',
    sizeTitle: 7,
    sizeHeading: 3.5,
    sizeBody: 3.1,
    sizeSmall: 2.5,
    sizeTotal: 5.6,
    weightTitle: 600,
    trackTitle: -0.01,
    trackLabel: 0.14,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.35,
    cellPadX: 0,
    cellPadY: 2.2,
    /* The spacing is the layout, so it is set generously and deliberately:
       these four numbers are the only thing keeping one block off another. */
    pageMargin: 18,
    blockGap: 10,
    headGap: 10,
    tableGap: 6,
    lineHeight: 1.5,
    logoWidth: 26,
  },
  html,
  css,
}

export default template
