/* Studio Bold — the stylesheet.

   One typographic idea carried through: the number at the top and the amount
   at the bottom are set at headline size, and everything between them is
   small, quiet and evenly spaced. There is not a single box or fill on the
   sheet — the only marks are two heavy rules and one hairline per row.

   Because the type does all the work, the sizes here are more assertive than
   the other templates. They are still tokens, so the inspector can pull them
   back for anyone who finds this too loud. */

export const css = `.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--block-gap);
}

.eyebrow {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.4em;
  text-indent: 0.4em;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

/* The headline. Tight tracking and a line height under one, because at this
   size the default leading opens a gap you could drive a bus through. */
.number {
  font-family: var(--font-display);
  font-size: calc(var(--size-title) * var(--type-scale));
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
  line-height: 0.92;
  margin-top: 2mm;
  overflow-wrap: anywhere;
}

.logo {
  flex: none;
  display: block;
  width: var(--logo-width);
  height: auto;
}

.subject {
  margin-top: 3mm;
  font-size: calc(var(--size-heading) * var(--type-scale));
  color: var(--ink-soft);
  max-width: 120mm;
}

/* ------------------------------------------------------------- the parties */

.columns {
  display: flex;
  gap: var(--block-gap);
  margin-top: var(--head-gap);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-strong-w) solid var(--ink);
}

.column {
  flex: 1 1 0;
  min-width: 0;
}

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  margin-bottom: 1.6mm;
}

.cap-second { margin-top: 3mm; }

.strong {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
  margin-bottom: 0.8mm;
}

.line {
  line-height: 1.55;
  font-size: calc(var(--size-body) * var(--type-scale));
  overflow-wrap: break-word;
}

.key {
  display: inline-block;
  min-width: 24mm;
  color: var(--ink-soft);
}

.link { color: var(--accent); word-break: break-all; }

/* --------------------------------------------------------------- the table */

.items { margin-top: var(--block-gap); }

.items th {
  text-align: left;
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  padding: 0 var(--cell-pad-x) var(--cell-pad-y) 0;
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.items td {
  padding: var(--cell-pad-y) var(--cell-pad-x) var(--cell-pad-y) 0;
  border-bottom: var(--rule-w) solid var(--line);
  vertical-align: baseline;
}

.items th:last-child,
.items td:last-child { padding-right: 0; }

.num { text-align: right; }

.col-desc { width: 48%; }
.col-n { width: 9mm; color: var(--ink-soft); }
.col-qty { width: 16mm; }
.col-unit { width: 18mm; color: var(--ink-soft); }
.col-price { width: 24mm; }
.col-disc { width: 19mm; }
.col-tax { width: 17mm; color: var(--ink-soft); }
.col-amount { width: 28mm; }

.desc {
  display: block;
  font-size: calc(var(--size-heading) * var(--type-scale) * 0.92);
}

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
  margin-top: 1mm;
  max-width: 90mm;
}

.col-amount {
  font-family: var(--font-display);
  font-size: calc(var(--size-heading) * var(--type-scale) * 0.95);
  font-weight: var(--weight-heading);
}

/* -------------------------------------------------------------- the total */

.sum {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
}

.sum-rows {
  display: grid;
  gap: 1.4mm;
  min-width: 52mm;
}

.sum-row {
  display: flex;
  justify-content: space-between;
  gap: 8mm;
  font-size: calc(var(--size-small) * var(--type-scale));
}

.sum-row dt { color: var(--ink-soft); }

.grand {
  flex: none;
  text-align: right;
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-strong-w) solid var(--ink);
  min-width: 62mm;
}

.grand-label {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

/* The second headline, and the sheet's last word. */
.grand-value {
  font-family: var(--font-display);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
  line-height: 1;
  margin-top: 1.5mm;
  color: var(--accent);
}

.grand-note {
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  margin-top: 1.5mm;
}

/* ---------------------------------------------------------------- the foot */

.foot {
  display: flex;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-w) solid var(--line);
}

.foot-block {
  flex: 1 1 0;
  min-width: 0;
}

.terms {
  margin-top: var(--block-gap);
}

.terms-text {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
  overflow-wrap: break-word;
}
`
