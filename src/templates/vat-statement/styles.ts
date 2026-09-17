/* VAT Statement — the stylesheet.

   Sober and evenly ruled, because this one is read by accountants and tax
   offices rather than admired. The two things it does differently are both
   about being checkable: the registration numbers sit on their own labelled
   lines, and the tax analysis sits beside the totals as a small table of its
   own rather than being folded into them. */

export const css = `.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--block-gap);
  padding-bottom: var(--cell-pad-y);
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin-bottom: 3mm;
}

.from-name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.2);
  letter-spacing: var(--track-title);
  margin-bottom: 1mm;
}

.from-line {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}

.mark { flex: none; text-align: right; }

.doctype {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.24em;
  text-indent: 0.24em;
  font-size: calc(var(--size-heading) * var(--type-scale));
  font-weight: var(--weight-title);
  color: var(--accent);
  margin-bottom: 2.4mm;
}

.particulars {
  width: auto;
  min-width: 66mm;
  margin-left: auto;
}

.particulars th,
.particulars td {
  padding: 1.1mm 0 1.1mm var(--cell-pad-x);
  border-bottom: var(--rule-w) solid var(--line);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.particulars th {
  text-align: left;
  font-weight: 400;
  color: var(--ink-soft);
  padding-left: 0;
  padding-right: 5mm;
  white-space: nowrap;
}

.particulars td { text-align: right; font-weight: 600; }

/* ------------------------------------------------------------- the parties */

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.parties {
  display: flex;
  gap: var(--block-gap);
  padding: var(--block-gap) 0;
}

.party {
  flex: 1 1 0;
  min-width: 0;
  padding: var(--cell-pad-y) var(--cell-pad-x);
  border: var(--rule-w) solid var(--line-strong);
  border-radius: var(--radius);
}

.party-name {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
  margin: 1.4mm 0 0.8mm;
}

.party-line { line-height: 1.5; }

/* The registration number gets a line of its own with its label above it —
   the format differs by country and running the two together makes a number
   that has to be checked harder to read. */
.party-id {
  margin-top: 1.4mm;
  font-family: var(--font-num);
  font-size: calc(var(--size-small) * var(--type-scale));
  overflow-wrap: anywhere;
}

.party-id span {
  display: block;
  font-family: var(--font-body);
  color: var(--ink-soft);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
}

.doctitle {
  margin-bottom: 2mm;
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
}

/* --------------------------------------------------------------- the table */

.items {
  margin-top: var(--table-gap);
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.items thead th {
  text-align: left;
  background: var(--band-bg);
  color: var(--band-ink);
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  padding: var(--cell-pad-y) var(--cell-pad-x);
}

.items td {
  padding: var(--cell-pad-y) var(--cell-pad-x);
  border-bottom: var(--rule-w) solid var(--line);
  vertical-align: top;
}

.items tr.is-odd td { background: var(--zebra); }

.num { text-align: right; }

.col-desc { width: 44%; }
.col-n { width: 9mm; color: var(--ink-soft); }
.col-qty { width: 16mm; }
.col-unit { width: 17mm; color: var(--ink-soft); }
.col-price { width: 24mm; }
.col-disc { width: 19mm; }
.col-tax { width: 17mm; color: var(--ink-soft); }
.col-amount { width: 26mm; font-weight: 600; }

.desc { display: block; }

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.45;
  margin-top: 0.7mm;
}

/* --------------------------------------------------- analysis and totals */

.close {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
}

.analysis {
  flex: 1 1 74mm;
  min-width: 0;
  max-width: 96mm;
}

.vat {
  margin-top: 1.8mm;
  width: 100%;
  border: var(--rule-w) solid var(--line-strong);
}

.vat th,
.vat td {
  padding: 1.3mm var(--cell-pad-x);
  border-bottom: var(--rule-w) solid var(--line);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.vat thead th {
  background: var(--zebra);
  color: var(--ink-soft);
  font-weight: 600;
  text-align: left;
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
}

.vat tbody tr:last-child td { border-bottom: 0; }

.vat td { font-family: var(--font-num); }

.totals {
  position: relative;
  flex: 0 1 70mm;
  min-width: 62mm;
}

.total-rows { display: grid; gap: 1.3mm; }

.total-row {
  display: flex;
  justify-content: space-between;
  gap: 6mm;
}

.total-row dt { color: var(--ink-soft); }

.grand {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 6mm;
  margin-top: var(--cell-pad-y);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-strong-w) solid var(--ink);
  border-bottom: var(--rule-strong-w) double var(--ink);
  padding-bottom: var(--cell-pad-y);
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
  color: var(--accent);
}

.grand-note {
  text-align: right;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  margin-top: 1mm;
}

/* ------------------------------------------------------------- the foot */

.pay-rows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1mm var(--block-gap);
  margin-top: 1.6mm;
}

.pay-row { display: flex; gap: 3mm; align-items: baseline; }

.pay-row dt {
  flex: none;
  width: 26mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.pay-row dd {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--font-num);
  overflow-wrap: anywhere;
}

.pay-link { margin-top: 1.4mm; color: var(--accent); word-break: break-all; }

.foot-note {
  margin-top: var(--block-gap);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  line-height: 1.5;
  overflow-wrap: break-word;
}

.foot-terms {
  margin-top: 2mm;
  padding-top: 2mm;
  border-top: var(--rule-w) solid var(--line);
}
`
