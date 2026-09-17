/* Timesheet — the stylesheet.

   Two figures share the foot of the sheet: how many units were billed, and
   what that came to. Giving the count the same weight as the money is the
   whole point of the layout, so it gets a panel of its own rather than a
   line in the totals.

   The quantity column is set in the figure face at body size and aligned
   right, so a column of hours reads as a column of hours. */

export const css = `.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--block-gap);
  padding-bottom: var(--cell-pad-y);
  border-bottom: var(--rule-strong-w) solid var(--accent);
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin-bottom: 2.5mm;
}

.from-name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.2);
  letter-spacing: var(--track-title);
}

.from-lines {
  margin-top: 0.8mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}

.from-lines span + span::before {
  content: '·';
  margin: 0 1.3mm;
  color: var(--line-strong);
}

.mark { flex: none; text-align: right; }

.doctype {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.docnumber {
  font-family: var(--font-num);
  font-size: calc(var(--size-title) * var(--type-scale) * 0.55);
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
  line-height: 1.1;
  margin-top: 1mm;
}

/* --------------------------------------------------------- the facts strip */

.strip {
  display: flex;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
  padding: var(--cell-pad-y) 0;
  border-bottom: var(--rule-w) solid var(--line);
}

.strip-cell {
  flex: 1 1 0;
  min-width: 0;
}

.strip-due { text-align: right; flex: 0 1 44mm; }

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.cap-second { margin-top: 2.4mm; }

.strong {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
  margin-top: 1mm;
}

.line { line-height: 1.5; font-size: calc(var(--size-small) * var(--type-scale)); color: var(--ink-soft); }

.subject {
  margin-top: var(--block-gap);
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
}

/* --------------------------------------------------------------- the table */

.items { margin-top: var(--table-gap); }

.items th {
  text-align: left;
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  padding: 0 var(--cell-pad-x) var(--cell-pad-y);
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.items td {
  padding: var(--cell-pad-y) var(--cell-pad-x);
  border-bottom: var(--rule-w) solid var(--line);
  vertical-align: top;
}

.items tr.is-odd td { background: var(--zebra); }

.items th:first-child,
.items td:first-child { padding-left: 0; }

.items th:last-child,
.items td:last-child { padding-right: 0; }

.num { text-align: right; }

.col-desc { width: 46%; }
.col-n { width: 8mm; color: var(--ink-soft); }
.col-unit { width: 18mm; color: var(--ink-soft); }
.col-price { width: 23mm; }
.col-disc { width: 18mm; }
.col-tax { width: 16mm; color: var(--ink-soft); }
.col-amount { width: 26mm; font-weight: 600; }

/* The quantity is the reason this layout exists, so it is not the smallest
   thing in the row. */
.col-qty {
  width: 20mm;
  font-family: var(--font-num);
  font-size: calc(var(--size-body) * var(--type-scale) * 1.1);
  font-weight: 600;
  color: var(--accent);
}

.desc { display: block; }

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.45;
  margin-top: 0.7mm;
}

/* ----------------------------------------------------- the two conclusions */

.close {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
}

.tally {
  flex: 0 1 54mm;
  min-width: 42mm;
  padding: var(--cell-pad-y) var(--cell-pad-x);
  border: var(--rule-w) solid var(--line-strong);
  border-left: var(--rule-strong-w) solid var(--accent);
  border-radius: var(--radius);
  background: var(--zebra);
}

.tally-value {
  font-family: var(--font-num);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: 700;
  line-height: 1.05;
  margin-top: 1.4mm;
  color: var(--ink);
}

.tally-note {
  margin-top: 0.8mm;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.totals {
  flex: 0 1 70mm;
  min-width: 60mm;
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
}

.grand-label {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.grand-value {
  font-family: var(--font-num);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: 700;
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

.pay-link { margin-top: 1.2mm; color: var(--accent); word-break: break-all; }

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
