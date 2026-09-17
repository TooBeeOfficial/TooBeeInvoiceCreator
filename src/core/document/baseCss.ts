/* The stylesheet underneath every template.

   Structural only: how big the sheet is, how it breaks across pages, how the
   theme tokens reach the page. Nothing here decides how an invoice looks —
   that is the template's stylesheet, which is layered on top and can
   override any of it. The user's own CSS goes last, so it always wins.

   An invoice is not a fixed-size page like a calendar month: it is a
   document that flows and may run to a second sheet. So the content is one
   continuous column and Chromium paginates it, with the table header
   repeating and rows kept whole. In the preview the same column is drawn at
   paper width with a hairline where each page will break, which means what
   you see really is where the paper ends. */

import type { DividerStyle, InvoiceTheme } from '@model/theme'
import { TOKEN_MAP } from '@model/theme'
import { pageDimensions, typeScale } from './paper'
import type { Orientation, PaperSize } from '@model/invoice'

export type RenderMode = 'print' | 'screen'

/** Theme tokens as the custom properties a template's CSS reads. */
export function themeToCss (theme: InvoiceTheme): string {
  const out: string[] = []
  for (const [key, [prop, unit]] of Object.entries(TOKEN_MAP)) {
    const value = (theme as unknown as Record<string, unknown>)[key]
    if (value === undefined || value === null || value === '') continue
    out.push(`  ${prop}: ${typeof value === 'number' ? `${value}${unit}` : value};`)
  }
  return `:root {\n${out.join('\n')}\n}`
}

/* What a section divider is made of.

   A divider is a stripe drawn along the length of a rule, so one gradient
   describes all of them. A template's divider is already a border on an
   element it owns, so the gradient is painted into that border and no
   template's markup has to change for the paint itself.

   The plain divider is no gradient at all: the template's own rule stands.
   The double rule is the one style that cannot be a gradient — see below. */
function dividerGradient (style: DividerStyle): string {
  switch (style) {
    case 'accent':
      return 'linear-gradient(var(--accent), var(--accent))'

    /* A short bar of accent at the left, then the ordinary hairline — a
       masthead rule with a house colour tucked into the corner. */
    case 'tab':
      return 'linear-gradient(to right, var(--accent) 0 26mm, var(--line-strong) 26mm)'

    case 'fade':
      return 'linear-gradient(to right, var(--accent), color-mix(in srgb, var(--accent) 12%, transparent))'

    case 'dashes':
      return 'repeating-linear-gradient(to right, var(--ink) 0 3mm, transparent 3mm 5.5mm)'

    case 'dots':
      return 'repeating-linear-gradient(to right, var(--ink) 0 0.7mm, transparent 0.7mm 2.4mm)'

    /* The house colour at each end of the rule, holding the section between
       them; the span in between stays a hairline. */
    case 'bookend':
      return 'linear-gradient(to right, var(--accent) 0 18mm, var(--line-strong) 18mm calc(100% - 18mm), var(--accent) calc(100% - 18mm))'

    /* Weighted to the middle of the sheet and gone by both margins — the rule
       reads as a break rather than as a box edge. */
    case 'centre':
      return 'linear-gradient(to right, transparent, var(--accent) 50%, transparent)'

    /* Half the rule in the house colour, half in ink: the sheet's two halves
       are told apart before a word of it is read. */
    case 'duotone':
      return 'linear-gradient(to right, var(--accent) 0 50%, var(--ink) 50%)'

    /* Long bars of accent with a short gap — a dash heavy enough to carry a
       colour, where an ordinary dash only carries a line. */
    case 'blocks':
      return 'repeating-linear-gradient(to right, var(--accent) 0 9mm, transparent 9mm 12mm)'

    /* Fine hatching. Close to solid at arm's length, visibly ruled up close —
       the trick a banknote or a share certificate uses. */
    case 'pinstripe':
      return 'repeating-linear-gradient(to right, var(--ink) 0 0.3mm, transparent 0.3mm 0.75mm)'

    /* Dash, gap, dot, gap — the rule a ledger or a plan drawing uses where a
       plain dash would be read as an edge. */
    case 'dashdot':
      return 'repeating-linear-gradient(to right, var(--ink) 0 3.5mm, transparent 3.5mm 5.2mm, var(--ink) 5.2mm 5.9mm, transparent 5.9mm 7.6mm)'

    case 'double':
    case 'plain':
    default:
      return 'none'
  }
}

/* The same stripe, for a rule that lives on table cells.

   A cell paints its own background, so a stripe that is drawn once across the
   width of the rule — the brand tab, the fading rule — would start again in
   every cell. Those two fall back to a plain bar of accent; the repeating
   patterns tile, so they carry across unchanged. */
function dividerCellGradient (style: DividerStyle): string {
  switch (style) {
    case 'tab':
    case 'fade':
    case 'bookend':
    case 'centre':
    case 'duotone':
    case 'accent':
      return 'linear-gradient(var(--accent), var(--accent))'
    default:
      return dividerGradient(style)
  }
}

export function baseCss (paper: PaperSize, orientation: Orientation, theme: InvoiceTheme, mode: RenderMode): string {
  const { w, h } = pageDimensions(paper, orientation)
  const margin = theme.pageMargin
  const contentHeight = Math.max(20, h - margin * 2)

  const page = mode === 'print'
    ? `@page { size: ${w}mm ${h}mm; margin: ${margin}mm; }`
    : `@page { size: ${w}mm ${h}mm; margin: ${margin}mm; }`

  const sheet = mode === 'print'
    ? `body { width: auto; margin: 0; padding: 0; }`
    : `body {
  width: ${w}mm;
  min-height: ${h}mm;
  margin: 0;
  padding: ${margin}mm;
  /* Where the paper runs out. Drawn behind the text on purpose: it marks the
     break without moving anything, so the preview and the PDF hold the same
     words in the same places. */
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(${contentHeight}mm - 0.2mm),
    var(--page-break-line) calc(${contentHeight}mm - 0.2mm),
    var(--page-break-line) ${contentHeight}mm
  );
  background-position: 0 ${margin}mm;
  background-repeat: repeat-y;
}`

  return `${page}
:root {
  /* Type is drawn for A4; on a smaller sheet every size takes a larger share
     of the paper, so type alone is scaled. Margins, rule weights and cell
     padding are physical measurements of the printed page and are not. */
  --type-scale: ${typeScale(w, h)};
  --page-w: ${w}mm;
  --page-h: ${h}mm;
  --content-h: ${contentHeight}mm;
  --page-break-line: ${mode === 'screen' ? 'rgba(120, 130, 145, 0.35)' : 'transparent'};
  --divider-paint: ${dividerCellGradient(theme.dividerStyle)};
  /* The 1 is the slice: stretch the stripe along the edge instead of cutting
     it into corners. */
  --divider-image: ${dividerGradient(theme.dividerStyle)}${theme.dividerStyle === 'plain' || theme.dividerStyle === 'double' ? '' : ' 1'};
  --divider-weight: max(var(--rule-strong-w), 0.4mm);
}

*, *::before, *::after { box-sizing: border-box; }

html { margin: 0; padding: 0; background: var(--paper); }

${sheet}

body {
  font-family: var(--font-body);
  font-size: calc(var(--size-body) * var(--type-scale));
  line-height: var(--line-height);
  color: var(--ink);
  background-color: var(--paper);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  text-rendering: geometricPrecision;
  font-variant-numeric: tabular-nums lining-nums;
}

h1, h2, h3, p, ul, ol, table, figure { margin: 0; }
ul, ol { padding: 0; list-style: none; }
img { max-width: 100%; }
a { color: inherit; text-decoration: none; }

table { border-collapse: collapse; width: 100%; }

/* Figures line up in a column of money only if every digit is the same
   width; the rest of the page can stay proportional. */
.num, td.num, th.num { font-family: var(--font-num); font-variant-numeric: tabular-nums lining-nums; }

/* Pagination. A table header repeats on the second sheet, a row is never
   split down the middle, and the totals never arrive on a page of their own
   without at least some of what they total. */
thead { display: table-header-group; }
tfoot { display: table-footer-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
.avoid-break { break-inside: avoid; page-break-inside: avoid; }
.page-break { break-before: page; page-break-before: always; }

/* The payment code.

   Lives here rather than in each template because it is not a design
   decision: a QR code is read by a phone camera held over a sheet of paper,
   and everything below follows from that. Millimetres, not ems — 24mm is
   about the smallest a SEPA code prints at and still scans first time, and
   type that scales down on a smaller sheet must not take the code with it.
   White ground and no frame — the quiet zone is inside the picture, and a
   border drawn tight against it is one more edge for a reader to mistake for
   a module. A template that wants it elsewhere moves it; a template that
   wants it smaller is wrong.

   Never split across two sheets, for the obvious reason. */
.pay-qr {
  display: inline-block;
  /* Its own air below the bank details it belongs to. Small enough to
     disappear inside a block that already spaces its children. */
  margin-top: 2mm;
  break-inside: avoid;
  page-break-inside: avoid;
}

/* The foot of the sheet: the account, and the code that encodes it.

   These two belong together and nowhere else — the code is the account,
   written for a phone instead of for a person, and a reader checking one
   against the other should not have to turn the sheet over. They sit below
   the last of the writing, behind a rule, because an account number is
   reference matter rather than something anybody reads through.

   What does not come down here is the payment instruction. "Payable within
   thirty days" is a sentence addressed to the customer, and it belongs with
   the rest of what the invoice says to them, not filed under the sort code.

   Wrapping rather than a fixed pair of columns: a sidebar 45mm wide and a
   till roll 78mm wide have no room to put anything beside anything, so
   below about 90mm the account drops under the code. */
.sheet-foot {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 5mm;
  margin-top: var(--block-gap);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-w) solid var(--line);
  break-inside: avoid;
  page-break-inside: avoid;
}

.sheet-foot > .pay-qr { margin-top: 0; }

.pay-details {
  flex: 1 1 62mm;
  min-width: 0;
}

.pay-qr img {
  display: block;
  width: 24mm;
  height: 24mm;
  background: #fff;
}

.pay-qr figcaption {
  width: 24mm;
  margin-top: 1mm;
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.3;
  letter-spacing: var(--track-label);
  text-transform: var(--case-label);
  color: var(--ink-soft);
  text-align: center;
}

/* Section dividers.

   Templates mark the rules that separate one part of the sheet from another
   with the brand-rule class, and say which edge the rule sits on with
   rule-under or rule-over. The chosen style is painted into the border that
   element already carries, so a template that marks nothing keeps its plain
   rules and a divider set to plain paints nothing at all. */
.brand-rule {
  border-image: var(--divider-image);
}

/* A table drawn with collapsed borders throws border images away, so a rule
   that lives on cells is painted as a stripe across the top or bottom of each
   one instead. It lands in the same place and reads the same on paper. */
${theme.dividerStyle === 'plain' || theme.dividerStyle === 'double' ? '' : `
.brand-rule.rule-over > th,
.brand-rule.rule-over > td,
.brand-rule.rule-under > th,
.brand-rule.rule-under > td {
  background-image: var(--divider-paint);
  background-repeat: repeat-x;
  background-size: 100% var(--divider-weight);
  /* Over the border itself, not below it, so the cell's own rule does not
     show through the gaps in a dashed or dotted stripe. */
  background-origin: border-box;
}

.brand-rule.rule-over > th,
.brand-rule.rule-over > td {
  background-position: left top;
  border-top-color: transparent;
}

.brand-rule.rule-under > th,
.brand-rule.rule-under > td {
  background-position: left bottom;
  border-bottom-color: transparent;
}
`}

${theme.dividerStyle === 'double' ? `
/* The double rule is the one style a border image cannot draw: an image is
   sliced across the edge, so it can carry a pattern along the rule but never
   through it. It is drawn as a real double border instead, which is why the
   edge has to be named — and it is given the room it needs, since a browser
   renders a double border under about 3px as a single line. Two classes,
   because a template's own rule is written with one and is read after this
   sheet — a tie on specificity would go to the template. */
.brand-rule.rule-under,
.brand-rule.rule-under > th,
.brand-rule.rule-under > td {
  border-bottom-style: double;
  border-bottom-width: max(var(--rule-strong-w), 1.1mm);
}

.brand-rule.rule-over,
.brand-rule.rule-over > th,
.brand-rule.rule-over > td {
  border-top-style: double;
  border-top-width: max(var(--rule-strong-w), 1.1mm);
}
` : ''}

/* The stamp a paid invoice carries. Set in the accent, turned off its axis,
   and never in the way of a figure: it sits behind the totals block. */
.paid-stamp {
  position: absolute;
  right: 0;
  top: 0;
  transform: rotate(-11deg);
  border: calc(var(--rule-strong-w) * 2) solid var(--accent);
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.6);
  padding: 1.5mm 4mm;
  border-radius: var(--radius);
  opacity: 0.75;
  pointer-events: none;
}

${themeToCss(theme)}
`
}
