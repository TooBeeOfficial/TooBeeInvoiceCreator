/* Boxed Ledger — the stylesheet.

   One ruled object on the sheet: the items. It is a black box with a black
   heading bar across the top and a hairline under every row, and it is the
   only thing on the page with a border of any kind.

   Everything else — the letterhead, the two parties, the dates, the totals,
   the payment details, the conditions — is set plainly and separated by
   space. That restraint is what makes the box work: a page of boxes has no
   emphasis left to give, and this one has all of it. */

export const css = `.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10mm;
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin-bottom: 3mm;
}

.house { min-width: 0; }

.house-name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.2);
  letter-spacing: var(--track-title);
}

.house-lines {
  margin-top: 1mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}

/* Contact details run together on one line with a middot between them,
   because three lines of them at the top of the sheet is three lines the
   reader has to get past to reach the invoice. */
.house-lines span + span::before {
  content: '·';
  margin: 0 1.6mm;
  color: var(--line-strong);
}

.mark {
  flex: none;
  text-align: right;
}

.doctype {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-indent: 0.2em;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.docnumber {
  margin-top: 0.8mm;
  font-family: var(--font-num);
  font-size: calc(var(--size-title) * var(--type-scale) * 0.46);
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
}

.doctitle {
  margin-top: 1mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

/* ------------------------------------------------------ parties & dates */

.facts {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10mm;
  margin-top: var(--head-gap);
}

.party { min-width: 0; }

.party-name {
  margin-top: 1.2mm;
  font-weight: 600;
  font-size: calc(var(--size-body) * var(--type-scale) * 1.05);
}

.party-line { line-height: 1.5; }

.dates {
  flex: none;
  min-width: 56mm;
}

.date {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6mm;
  padding: 0.6mm 0;
  font-size: calc(var(--size-small) * var(--type-scale));
}

.date dt {
  color: var(--ink-soft);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
}

.date dd { text-align: right; }

/* ----------------------------------------------------------- the box */

.items {
  margin-top: var(--table-gap);
  border: var(--rule-strong-w) solid var(--ink);
}

/* The heading bar. Solid ink with the paper colour reversed out of it — the
   only fill on the sheet, and the lid of the box. */
.items thead th {
  padding: calc(var(--cell-pad-y) * 0.9) var(--cell-pad-x);
  background: var(--band-bg);
  color: var(--band-ink);
  font-family: var(--font-display);
  font-weight: 600;
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  text-align: left;
  white-space: nowrap;
}

.items thead th.num { text-align: right; }

.items tbody td {
  padding: var(--cell-pad-y) var(--cell-pad-x);
  vertical-align: top;
}

/* The line separation: one hairline between rows, none above the first —
   the bar above it is already the strongest mark in the box — and none
   under the last, where the box's own edge closes it off. */
.items tbody tr + tr > td {
  border-top: var(--rule-w) solid var(--line);
}

.items tbody td.num { text-align: right; }

.desc { display: block; }

.details {
  display: block;
  margin-top: 0.6mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.45;
}

.col-n { width: 8mm; }
.col-qty { width: 18mm; }
.col-unit { width: 16mm; }
.col-price { width: 24mm; }
.col-disc { width: 20mm; }
.col-tax { width: 18mm; }
.col-amount { width: 28mm; }

/* --------------------------------------------------- analysis & totals */

.close {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10mm;
  margin-top: var(--block-gap);
}

.analysis {
  width: auto;
  min-width: 78mm;
  font-size: calc(var(--size-small) * var(--type-scale));
}

.analysis th {
  padding: 0 var(--cell-pad-x) 1.2mm 0;
  color: var(--ink-soft);
  font-weight: 400;
  text-align: left;
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
}

.analysis th.num,
.analysis td.num { text-align: right; }

.analysis td {
  padding: 0.7mm var(--cell-pad-x) 0.7mm 0;
  font-family: var(--font-num);
}

.analysis td:first-child { font-family: var(--font-body); }

.totals {
  position: relative;
  flex: none;
  min-width: 66mm;
  margin-left: auto;
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6mm;
  padding: 0.7mm 0;
  font-size: calc(var(--size-small) * var(--type-scale));
}

.total-row dt { color: var(--ink-soft); }
.total-row dd { font-family: var(--font-num); }

.grand {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6mm;
  margin-top: 2mm;
  padding-top: 2.4mm;
  border-top: var(--rule-strong-w) solid var(--ink);
}

.grand-label {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.grand-value {
  font-family: var(--font-display);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: var(--weight-title);
}

.grand-note {
  margin-top: 1.2mm;
  text-align: right;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

/* ---------------------------------------------------------------- foot */

.foot {
  display: flex;
  align-items: flex-start;
  gap: 10mm;
  margin-top: var(--block-gap);
}

.foot-block {
  flex: 1 1 0;
  min-width: 0;
}

.foot-text {
  margin-top: 1.2mm;
  line-height: 1.5;
  font-size: calc(var(--size-small) * var(--type-scale));
  overflow-wrap: break-word;
}

.link { word-break: break-all; }

.pay-rows {
  margin-top: 1.2mm;
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.6;
}

.pay-row {
  display: flex;
  gap: 3mm;
  overflow-wrap: anywhere;
}

.pay-row dt {
  flex: none;
  width: 28mm;
  color: var(--ink-soft);
}

.terms {
  margin-top: var(--block-gap);
}

.terms-text {
  margin-top: 1.2mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}
`
