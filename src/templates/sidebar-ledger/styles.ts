/* Sidebar Ledger — the stylesheet.

   The band is a solid block of the accent colour, and everything set on it is
   reversed out. It stops at the page margin rather than running to the edge
   of the sheet: an office printer cannot print to the edge, and a band that
   is meant to bleed and doesn't looks like a mistake rather than a choice. */

export const css = `.layout {
  display: flex;
  align-items: stretch;
  gap: var(--block-gap);
}

/* --------------------------------------------------------------- the band */

.rail {
  flex: none;
  width: 54mm;
  padding: var(--cell-pad-y) var(--cell-pad-x);
  padding-top: 5mm;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: var(--radius);
  /* Tightened, because reversed-out type looks looser than it is. */
  line-height: 1.45;
}

.logo {
  display: block;
  width: min(var(--logo-width), 40mm);
  height: auto;
  margin-bottom: 4mm;
}

.rail-name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.2);
  letter-spacing: var(--track-title);
  margin-bottom: 4mm;
}

.rail-block {
  padding-top: 3mm;
  margin-top: 3mm;
  border-top: var(--rule-w) solid currentColor;
  /* The rules are the band's own colour lightened, not a second colour. */
  border-top-color: color-mix(in srgb, var(--accent-ink) 35%, transparent);
}

.rail-line {
  font-size: calc(var(--size-small) * var(--type-scale));
  overflow-wrap: anywhere;
  margin-bottom: 1mm;
}

.rail-key {
  display: block;
  opacity: 0.72;
  font-size: calc(var(--size-small) * var(--type-scale) * 0.92);
}

.rail-cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  opacity: 0.78;
  margin-bottom: 2mm;
}

.rail-pay { padding-bottom: 1mm; }

/* -------------------------------------------------------- the main column */

.main {
  flex: 1 1 auto;
  min-width: 0;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--block-gap);
  padding-bottom: var(--cell-pad-y);
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.doctype {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.26em;
  text-indent: 0.26em;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.docnumber {
  font-family: var(--font-display);
  font-size: calc(var(--size-title) * var(--type-scale) * 0.58);
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
  line-height: 1.1;
  margin-top: 1mm;
}

.doctitle {
  font-size: calc(var(--size-body) * var(--type-scale));
  color: var(--ink-soft);
  margin-top: 1mm;
  max-width: 70mm;
}

.dates {
  display: grid;
  gap: 1.4mm;
  text-align: right;
  align-content: start;
  flex: none;
}

.date {
  display: flex;
  justify-content: flex-end;
  gap: 4mm;
}

.date dt {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  align-self: center;
}

.date dd { font-weight: 500; }

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.billed { padding: var(--block-gap) 0; }

.billed-name {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.05);
  margin-top: 1.6mm;
}

.billed-line { line-height: 1.5; }

/* ------------------------------------------------------------- the table */

.items { margin-top: var(--table-gap); }

.items th {
  text-align: left;
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--accent);
  padding: 0 var(--cell-pad-x) var(--cell-pad-y);
  border-bottom: var(--rule-strong-w) solid var(--accent);
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
.col-qty { width: 15mm; }
.col-unit { width: 16mm; color: var(--ink-soft); }
.col-price { width: 22mm; }
.col-disc { width: 18mm; }
.col-tax { width: 16mm; color: var(--ink-soft); }
.col-amount { width: 25mm; font-weight: 600; }

.desc { display: block; }

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.45;
  margin-top: 0.7mm;
}

/* ------------------------------------------------------------- the totals */

.totals {
  position: relative;
  margin-top: var(--block-gap);
  margin-left: auto;
  width: 72mm;
  max-width: 100%;
}

.total-rows { display: grid; gap: 1.4mm; }

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
  padding: var(--cell-pad-y) var(--cell-pad-x);
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: var(--radius);
}

.grand-label {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  opacity: 0.82;
}

.grand-value {
  font-family: var(--font-display);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
}

.grand-note {
  text-align: right;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  margin-top: 1mm;
}

/* -------------------------------------------------------- notes and terms */

.note,
.terms {
  margin-top: var(--block-gap);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-w) solid var(--line);
}

.note-text {
  margin-top: 1.4mm;
  line-height: 1.55;
  overflow-wrap: break-word;
}

.terms-text {
  margin-top: 1.4mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
  overflow-wrap: break-word;
}
`
