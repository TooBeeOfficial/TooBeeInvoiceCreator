/* Compact Simplified — the stylesheet.

   Narrow, dense and set in a single column. The one device carrying the
   layout is the dotted leader: a row of dots running from what was sold to
   what it cost, which is how a printed bill has always joined the two across
   an empty gap. It keeps the eye on the line without a single border. */

export const css = `.till {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 5mm;
  padding-bottom: var(--cell-pad-y);
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin-bottom: 2mm;
}

.house {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.2);
  letter-spacing: var(--track-title);
}

.house-lines {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.45;
}

.house-lines span + span::before {
  content: '·';
  margin: 0 1.2mm;
  color: var(--line-strong);
}

.till-mark { text-align: right; flex: none; }

.doctype {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.22em;
  text-indent: 0.22em;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--accent);
}

.till-number {
  font-family: var(--font-num);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.1);
  font-weight: var(--weight-title);
  margin-top: 0.8mm;
}

.till-date {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  margin-top: 0.4mm;
}

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

/* --------------------------------------------------------------- buyer */

.to {
  display: block;
  margin-top: var(--block-gap);
  line-height: 1.45;
}

.to-name {
  display: block;
  font-weight: 600;
  margin-top: 0.8mm;
}

.to-line {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

/* ---------------------------------------------------------------- tape */

.tape {
  margin-top: var(--table-gap);
  border-top: var(--rule-w) solid var(--line);
}

.tape-line {
  display: flex;
  align-items: baseline;
  gap: 1.5mm;
  padding: var(--cell-pad-y) 0;
  border-bottom: var(--rule-w) solid var(--line);
}

.tape-desc { flex: 0 1 auto; }

.tape-details,
.tape-qty {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.4;
}

.tape-qty { margin-top: 0.4mm; }

/* The dots. A repeating radial gradient rather than a row of typed
   full stops, so the spacing holds at any width and any type size. */
.leader {
  flex: 1 1 auto;
  align-self: flex-end;
  height: calc(var(--size-body) * 0.9);
  min-width: 6mm;
  background-image: radial-gradient(circle, var(--line-strong) 0.25mm, transparent 0.25mm);
  background-size: 1.6mm 1.6mm;
  background-repeat: repeat-x;
  background-position: left calc(100% - 0.9mm);
}

.tape-amount {
  flex: none;
  font-weight: 600;
  font-family: var(--font-num);
  min-width: 22mm;
}

/* ------------------------------------------------------------- totals */

.sum { margin-top: var(--block-gap); }

.sum-row {
  display: flex;
  align-items: baseline;
  gap: 1.5mm;
  padding: 0.7mm 0;
  color: var(--ink-soft);
}

.sum-row .num { min-width: 22mm; text-align: right; color: var(--ink); }

.sum-total {
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4mm;
  margin-top: 2mm;
  padding: 2.2mm 0 0;
  border-top: var(--rule-strong-w) solid var(--ink);
}

.sum-total-label {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.sum-total-value {
  font-family: var(--font-display);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: var(--weight-title);
  color: var(--accent);
}

.sum-note,
.due-line {
  margin-top: 1.4mm;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.due-line { margin-top: var(--cell-pad-y); }

/* ------------------------------------------------------------ payment */

.pay-rows {
  margin-top: 1.2mm;
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.55;
}

/* A narrow sheet and a long account number: the label holds its column and
   the number wraps under itself rather than off the edge. */
.pay-rows span {
  display: flex;
  gap: 2mm;
  overflow-wrap: anywhere;
}

.pay-rows em {
  flex: none;
  width: 22mm;
  font-style: normal;
  color: var(--ink-soft);
}

.pay-link { margin-top: 1mm; color: var(--accent); word-break: break-all; }

.foot-note {
  margin-top: var(--block-gap);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  line-height: 1.5;
}

.foot-terms {
  margin-top: 2mm;
  padding-top: 2mm;
  border-top: var(--rule-w) solid var(--line);
}
`
