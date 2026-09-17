/* Timesheet.

   For work billed by the hour, the day or the unit. The quantity column is
   set as a figure worth reading rather than a small number beside a price,
   and the units are totalled at the foot beside the money — because anyone
   billing time gets asked both questions and most layouts answer only one. */

import type { InvoiceTemplate } from '@model/template'
import { html } from './markup'
import { css } from './styles'

const template: InvoiceTemplate = {
  id: 'timesheet',
  name: 'Timesheet',
  blurb: 'Built for hourly work. Units totalled beside the money.',
  detail: 'full',
  page: { orientation: 'portrait' },
  theme: {
    fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
    fontBody: "'Segoe UI', system-ui, sans-serif",
    fontNum: "Bahnschrift, 'Segoe UI', sans-serif",
    accent: '#0B5D3B',
    ink: '#161A18',
    inkSoft: '#69736D',
    line: '#DFE5E1',
    lineStrong: '#A3AEA8',
    zebra: '#F3F7F4',
    sizeTitle: 8.5,
    sizeHeading: 3.5,
    sizeBody: 3,
    sizeSmall: 2.45,
    sizeTotal: 5.2,
    weightTitle: 700,
    trackTitle: -0.01,
    trackLabel: 0.13,
    caseLabel: 'uppercase',
    ruleW: 0.2,
    ruleStrongW: 0.45,
    radius: 1.2,
    cellPadX: 2.4,
    cellPadY: 2.2,
    pageMargin: 16,
    blockGap: 7,
    headGap: 7,
    tableGap: 5,
    lineHeight: 1.45,
    logoWidth: 28,
  },
  html,
  css,
}

export default template
