/* VAT Statement.

   For a taxable supply, especially one crossing a border. It is the only
   template that prints a tax analysis — the net charged at each rate and the
   tax that came to — which is what a compliant VAT invoice in the EU and the
   UK is expected to show, and what an auditor looks for first.

   Both registration numbers get their own labelled line, because a VAT
   number that has to be checked against a register should not be buried in
   an address block. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'vat-statement',
  name: 'VAT Statement',
  blurb: 'Tax analysed by rate, registration numbers given their own lines.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "Consolas, 'Segoe UI', monospace",
    accent: '#17457A',
    ink: '#16191F',
    inkSoft: '#69707A',
    line: '#DEE2E8',
    lineStrong: '#A8AFB9',
    bandBg: '#22303F',
    bandInk: '#FFFFFF',
    zebra: '#F4F6F9',
    sizeTitle: 7.5,
    sizeHeading: 3.5,
    sizeBody: 2.95,
    sizeSmall: 2.4,
    sizeTotal: 4.6,
    weightTitle: 700,
    trackTitle: -0.005,
    trackLabel: 0.12,
    caseLabel: 'uppercase',
    ruleW: 0.18,
    ruleStrongW: 0.4,
    radius: 0.8,
    cellPadX: 2.2,
    cellPadY: 1.9,
    pageMargin: 15,
    blockGap: 6,
    headGap: 6,
    tableGap: 4,
    lineHeight: 1.4,
    logoWidth: 28,
  },
  html,
  css,
}

export default template
