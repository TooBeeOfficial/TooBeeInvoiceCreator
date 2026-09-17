/* Plain Slip — the stylesheet.

   Space instead of rules. Where another layout would draw a border to say
   that one block has ended and the next begun, this one leaves a gap and
   trusts it, which is why the gaps are large and why there is only one rule
   on the sheet — the one above the total.

   The second device is weight: the name of the business, the description of
   each line and the total are set in the text colour, and everything else is
   set in the soft one. Two greys and one rule carry the whole thing. */

export const css = `.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8mm;
}

.mark {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin-bottom: 3mm;
}

.who { min-width: 0; }

.name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.15);
  letter-spacing: var(--track-title);
}

/* Everything that is not the point: addresses, registration numbers, the
   arithmetic under a line. One colour for all of it, so the eye can skip
   the lot in a single movement. */
.quiet {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.55;
}

.quiet span { display: block; }

.ref {
  flex: none;
  text-align: right;
}

.kind {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.no {
  margin-top: 0.6mm;
  font-family: var(--font-num);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.15);
  font-weight: var(--weight-title);
}

.on { margin-top: 0.6mm; }

.label {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.for { margin-top: var(--block-gap); }

/* ---------------------------------------------------------------- lines */

.lines { margin-top: var(--block-gap); }

.lines td {
  padding: var(--cell-pad-y) 0;
  vertical-align: top;
}

.what-desc { display: block; }

/* The figures that made the amount sit under the description in the soft
   colour, not in columns of their own: on a receipt with three lines on it,
   columns are four headings nobody needed. */
.what .quiet { margin-top: 0.5mm; }

.much {
  width: 28mm;
  text-align: right;
  font-family: var(--font-num);
  white-space: nowrap;
}

/* --------------------------------------------------------------- totals */

/* The one rule on the sheet, and the block it belongs to — which is also
   what the paid stamp is positioned against. */
.close {
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-top: var(--block-gap);
}

.sums {
  width: auto;
  min-width: 62mm;
}

.sums th {
  padding: 0.7mm 4mm 0.7mm 0;
  font-weight: 400;
  text-align: left;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.sums td {
  padding: 0.7mm 0;
  text-align: right;
  font-family: var(--font-num);
  white-space: nowrap;
}

.grand > th,
.grand > td {
  padding-top: 2.2mm;
  border-top: var(--rule-strong-w) solid var(--ink);
}

.grand > th {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  color: var(--ink);
}

.grand > td {
  font-family: var(--font-display);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: var(--weight-title);
  color: var(--accent);
}

.after { margin-top: 2mm; }

/* -------------------------------------------------------------- payment */

.pay-rows {
  margin-top: 1.2mm;
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.6;
}

/* Label and value on one line each, the label holding a column so a long
   account number wraps under itself rather than off the edge. */
.pay-rows span {
  display: flex;
  gap: 3mm;
  overflow-wrap: anywhere;
}

.pay-rows em {
  flex: none;
  width: 26mm;
  font-style: normal;
  color: var(--ink-soft);
}

.link { word-break: break-all; }
`
