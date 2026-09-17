/* Classic Statement — the stylesheet.

   Ruled rather than airy. The letterhead is centred between two rules, the
   table carries a solid header band and real borders, and the figures sit in
   a boxed panel. The remittance slip at the foot is set apart by a cut line
   and repeats only what someone needs to pay: who to pay, which invoice, how
   much, by when. */

export const css = `.letterhead {
  text-align: center;
  padding-bottom: var(--cell-pad-y);
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin: 0 auto 3mm;
}

.house {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.5);
  letter-spacing: var(--track-title);
  text-transform: var(--case-title);
}

.house-address,
.house-contact,
.house-ids {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
  margin-top: 0.8mm;
}

.house-address span + span::before,
.house-contact span + span::before,
.house-ids span + span::before {
  content: '·';
  margin: 0 1.4mm;
  color: var(--line-strong);
}

/* The word "Invoice", set as a ruled band across the sheet — the device a
   printed statement has used for a century to say what the paper is. */
.doctype {
  margin-top: var(--head-gap);
  text-align: center;
  font-family: var(--font-display);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.15);
  font-weight: var(--weight-heading);
  text-transform: uppercase;
  letter-spacing: 0.34em;
  /* the trailing space of the tracking, removed so the word stays centred */
  text-indent: 0.34em;
  padding: 1.6mm 0;
  border-top: var(--rule-w) solid var(--line-strong);
  border-bottom: var(--rule-w) solid var(--line-strong);
  color: var(--accent);
}

.doctitle {
  text-align: center;
  margin-top: 2mm;
  color: var(--ink-soft);
  font-style: italic;
}

/* ----------------------------------------------------- who and what for */

.statement {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
}

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.addressee { max-width: 85mm; line-height: 1.5; }

.addressee-name {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
  margin-top: 1.8mm;
}

.particulars {
  width: auto;
  min-width: 62mm;
  border: var(--rule-w) solid var(--line-strong);
}

.particulars th,
.particulars td {
  padding: 1.4mm var(--cell-pad-x);
  border-bottom: var(--rule-w) solid var(--line);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.particulars tr:last-child th,
.particulars tr:last-child td { border-bottom: 0; }

.particulars th {
  text-align: left;
  font-weight: 400;
  color: var(--ink-soft);
  background: var(--zebra);
  white-space: nowrap;
}

.particulars td { font-weight: 600; text-align: right; }

/* ------------------------------------------------------------- the table */

.items {
  margin-top: var(--table-gap);
  border: var(--rule-w) solid var(--line-strong);
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
  border-right: var(--rule-w) solid var(--line);
  vertical-align: top;
}

.items td:last-child { border-right: 0; }
.items tbody tr:last-child td { border-bottom: 0; }
.items tr.is-odd td { background: var(--zebra); }

.num { text-align: right; }

.col-desc { width: 48%; }
.col-n { width: 9mm; color: var(--ink-soft); }
.col-qty { width: 16mm; }
.col-unit { width: 18mm; color: var(--ink-soft); }
.col-price { width: 25mm; }
.col-disc { width: 20mm; }
.col-tax { width: 18mm; color: var(--ink-soft); }
.col-amount { width: 28mm; font-weight: 600; }

.desc { display: block; }

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  font-style: italic;
  line-height: 1.45;
  margin-top: 0.7mm;
}

/* ------------------------------------------------------ totals and close */

.close {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
}

/* min-width: 0 keeps a long bank reference inside this column instead of
   letting it widen the row and overlap the figures beside it. */
.close-left {
  flex: 1 1 72mm;
  min-width: 0;
  max-width: 92mm;
  display: grid;
  gap: var(--block-gap);
  align-content: start;
}

.block-text { margin-top: 1.6mm; line-height: 1.55; overflow-wrap: break-word; }

.pay { margin-top: 1.8mm; width: 100%; table-layout: fixed; }

.pay th,
.pay td {
  padding: 0.9mm 0;
  font-size: calc(var(--size-small) * var(--type-scale));
  border-bottom: var(--rule-w) dotted var(--line-strong);
}

.pay th {
  width: 26mm;
  text-align: left;
  font-weight: 400;
  color: var(--ink-soft);
  padding-right: 4mm;
}

.pay td {
  text-align: right;
  font-family: var(--font-num);
  overflow-wrap: anywhere;
}

.pay-link { margin-top: 1.4mm; color: var(--accent); word-break: break-all; }

.totals { position: relative; flex: 0 1 72mm; min-width: 64mm; }

.total-table { border: var(--rule-w) solid var(--line-strong); }

.total-table th,
.total-table td {
  padding: 1.5mm var(--cell-pad-x);
  border-bottom: var(--rule-w) solid var(--line);
}

.total-table th {
  text-align: left;
  font-weight: 400;
  color: var(--ink-soft);
}

.total-table td { text-align: right; }

.total-table tbody tr:last-child th,
.total-table tbody tr:last-child td { border-bottom: 0; }

.grand th,
.grand td {
  border-top: var(--rule-strong-w) solid var(--ink);
  border-bottom: 0;
  background: var(--zebra);
  padding-top: 2mm;
  padding-bottom: 2mm;
}

.grand th {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink);
}

.grand td {
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

/* --------------------------------------------------------------- terms */

.terms {
  margin-top: var(--block-gap);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-w) solid var(--line);
}

.terms-text {
  margin-top: 1.4mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}

/* --------------------------------------------------------- remittance */

.remittance { margin-top: calc(var(--block-gap) * 1.6); }

/* The cut line. A dashed rule with the instruction sitting on it, the way a
   real remittance advice is printed. */
.tear {
  position: relative;
  text-align: center;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  border-top: var(--rule-w) dashed var(--line-strong);
  padding-top: 2.4mm;
}

.remittance-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--block-gap);
  margin-top: 3mm;
}

.remittance-body > div {
  flex: 1 1 60mm;
  min-width: 0;
}

.remit-strong {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
  margin-top: 1.4mm;
}

.remit-lines {
  margin-top: 1mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.remit-lines span { display: block; }

.remit-facts { flex: 0 1 72mm; width: auto; min-width: 62mm; }

.remit-facts th,
.remit-facts td {
  padding: 1.1mm 0;
  font-size: calc(var(--size-small) * var(--type-scale));
  border-bottom: var(--rule-w) solid var(--line);
}

.remit-facts th {
  text-align: left;
  font-weight: 400;
  color: var(--ink-soft);
  padding-right: 6mm;
}

.remit-facts td { text-align: right; }

.remit-total th,
.remit-total td {
  border-bottom: 0;
  border-top: var(--rule-strong-w) solid var(--ink);
  padding-top: 1.8mm;
  font-weight: 700;
  font-size: calc(var(--size-body) * var(--type-scale));
}

.remit-total td { color: var(--accent); }
`
