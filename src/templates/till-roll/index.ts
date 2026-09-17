/* Till Roll.

   A receipt that looks like a receipt: one narrow monospaced column, the
   shop's name centred over it, dashed rules between the parts. For a sale
   handed over a counter, a deposit taken on the spot, or anything else where
   what is wanted is proof of payment rather than a request for one.

   Drawn at 78mm — a till roll's measure — and centred on whatever paper the
   printer holds, so the same slip comes out right on A5, on A4 and on an
   actual roll. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'till-roll',
  name: 'Till Roll',
  blurb: 'A narrow monospaced slip, centred on the page. Prints like a till receipt.',
  detail: 'simple',
  page: { orientation: 'portrait' },
  theme: {
    /* One typeface doing all three jobs. A till has one width of character
       and that is what makes the figures line up down the right-hand edge
       without a rule drawn anywhere near them. */
    fontDisplay: "Consolas, 'Cascadia Mono', 'Courier New', monospace",
    fontBody: "Consolas, 'Cascadia Mono', 'Courier New', monospace",
    fontNum: "Consolas, 'Cascadia Mono', 'Courier New', monospace",
    ink: '#14161A',
    inkSoft: '#6B7280',
    accent: '#14161A',
    line: '#D8DCE2',
    lineStrong: '#14161A',
    dividerStyle: 'dashes',
    sizeTitle: 6,
    sizeHeading: 3.4,
    sizeBody: 2.9,
    sizeSmall: 2.45,
    sizeTotal: 4.6,
    weightTitle: 700,
    trackTitle: 0,
    trackLabel: 0.1,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.4,
    cellPadX: 0,
    cellPadY: 2,
    pageMargin: 12,
    blockGap: 6,
    headGap: 6,
    tableGap: 4,
    lineHeight: 1.4,
    logoWidth: 22,
  },
  html,
  css,
}

export default template
