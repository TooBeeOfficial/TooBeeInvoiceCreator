/* Solid Slate — the stylesheet.

   The items are printed white out of a solid black panel, and the rows
   inside it are separated by a light rule mixed from the panel's own ink —
   so the separation holds whatever colour the panel is changed to in the
   inspector, and a user who makes the slab dark green gets rules that still
   belong to it.

   Everything outside the panel is left alone: no rules, no fills, one
   hairline above the total. The page is a plain sheet with one heavy object
   dropped into the middle of it, and the object is the part that says what
   the invoice is for. */

export const css = `.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin-bottom: 3mm;
}

.head-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8mm;
}

.house {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.25);
  letter-spacing: var(--track-title);
}

.mark {
  flex: none;
  text-align: right;
}

.doctype {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.docnumber {
  font-family: var(--font-num);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.15);
  font-weight: var(--weight-title);
}

/* The letterhead's small print, run together on as few lines as it takes. */
.house-lines {
  margin-top: 1.4mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.55;
}

.house-lines span + span::before {
  content: '·';
  margin: 0 1.6mm;
  color: var(--line-strong);
}

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

/* -------------------------------------------------------------- customer */

.to { margin-top: var(--head-gap); }

.to-name {
  margin-top: 1.2mm;
  font-weight: 600;
  font-size: calc(var(--size-body) * var(--type-scale) * 1.05);
}

.to-line { line-height: 1.5; }

.doctitle {
  margin-top: var(--block-gap);
  font-family: var(--font-display);
  font-size: calc(var(--size-heading) * var(--type-scale));
  font-weight: var(--weight-heading);
}

/* Every date and reference on one line of small print. Seven facts that are
   each three words long do not need seven rows of a table. */
.strip {
  margin-top: var(--block-gap);
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.7;
}

.strip span + span::before {
  content: '·';
  margin: 0 2mm;
  color: var(--line-strong);
}

.strip em {
  font-style: normal;
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
}

/* ---------------------------------------------------------- the slab */

.items {
  margin-top: var(--table-gap);
  background: var(--band-bg);
  color: var(--band-ink);
}

.items thead th {
  padding: calc(var(--cell-pad-y) * 1.1) var(--cell-pad-x) var(--cell-pad-y);
  font-family: var(--font-display);
  font-weight: 600;
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  text-align: left;
  white-space: nowrap;
  /* Mixed from the panel's own ink rather than named outright, so the rules
     follow the panel wherever its colour is taken. */
  border-bottom: var(--rule-w) solid color-mix(in srgb, var(--band-ink) 45%, transparent);
}

.items thead th.num { text-align: right; }

.items tbody td {
  padding: var(--cell-pad-y) var(--cell-pad-x);
  vertical-align: top;
}

/* The line separation. */
.items tbody tr + tr > td {
  border-top: var(--rule-w) solid color-mix(in srgb, var(--band-ink) 26%, transparent);
}

.items tbody td.num { text-align: right; }

.items tbody tr:first-child > td { padding-top: calc(var(--cell-pad-y) * 1.2); }
.items tbody tr:last-child > td { padding-bottom: calc(var(--cell-pad-y) * 1.2); }

.desc { display: block; }

.details {
  display: block;
  margin-top: 0.6mm;
  color: color-mix(in srgb, var(--band-ink) 68%, transparent);
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

/* -------------------------------------------------------------- totals */

.sums {
  position: relative;
  margin-top: var(--block-gap);
  margin-left: auto;
  width: 78mm;
  max-width: 100%;
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

.right { text-align: right; }

/* ------------------------------------------------------------ analysis */

.analysis {
  width: auto;
  min-width: 78mm;
  margin-top: var(--block-gap);
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

/* ------------------------------------------------------------- closing */

.block { margin-top: var(--block-gap); }

.aside {
  margin-top: 1.2mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.55;
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
  width: 30mm;
  color: var(--ink-soft);
}
`
