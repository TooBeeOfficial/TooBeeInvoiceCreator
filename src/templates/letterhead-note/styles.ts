/* Letterhead Note — the stylesheet.

   Set like correspondence: a serif body at a comfortable measure, a centred
   letterhead, and the table reduced to a ruled list with no header band. The
   only thing that behaves like an invoice rather than a letter is the total,
   which is allowed to be a figure.

   The signature rule at the foot is the signature of the layout — a real
   line, left for a real pen, with the sender's name typed under it the way a
   letter has always done it. */

export const css = `.letterhead {
  text-align: center;
  padding-bottom: var(--cell-pad-y);
  border-bottom: var(--rule-w) solid var(--line-strong);
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin: 0 auto 3mm;
}

.sender-name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.35);
  letter-spacing: var(--track-title);
}

.sender-lines {
  margin-top: 1mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.sender-lines span + span::before {
  content: '·';
  margin: 0 1.4mm;
  color: var(--line-strong);
}

/* ----------------------------------------------------- the letter opening */

.addressing {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--block-gap);
  margin-top: var(--head-gap);
}

.addressee { line-height: 1.55; }

.addressee-name { font-weight: 700; }

.dateline {
  flex: none;
  color: var(--ink-soft);
}

.subject {
  margin-top: var(--block-gap);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.1);
}

.salutation { margin-top: 4mm; }

/* The particulars, set as a short run of labelled facts rather than a box —
   a letter does not put its reference number in a table. */
.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 1.4mm var(--block-gap);
  margin-top: 4mm;
  padding: var(--cell-pad-y) 0;
  border-top: var(--rule-w) solid var(--line);
  border-bottom: var(--rule-w) solid var(--line);
}

.fact {
  display: flex;
  gap: 2mm;
  font-size: calc(var(--size-small) * var(--type-scale));
}

.fact dt { color: var(--ink-soft); }
.fact dd { font-weight: 600; font-family: var(--font-num); }

/* --------------------------------------------------------------- the list */

.items { margin-top: var(--block-gap); }

.items th {
  text-align: left;
  font-family: var(--font-body);
  font-weight: 400;
  font-style: italic;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  padding: 0 var(--cell-pad-x) var(--cell-pad-y) 0;
  border-bottom: var(--rule-w) solid var(--line-strong);
}

.items td {
  padding: var(--cell-pad-y) var(--cell-pad-x) var(--cell-pad-y) 0;
  border-bottom: var(--rule-w) solid var(--line);
  vertical-align: top;
}

.items th:last-child,
.items td:last-child { padding-right: 0; }

.num { text-align: right; }

.col-desc { width: 50%; }
.col-n { width: 8mm; color: var(--ink-soft); }
.col-qty { width: 16mm; }
.col-unit { width: 17mm; color: var(--ink-soft); }
.col-price { width: 23mm; }
.col-disc { width: 18mm; }
.col-tax { width: 16mm; color: var(--ink-soft); }
.col-amount { width: 26mm; }

.desc { display: block; }

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  font-style: italic;
  line-height: 1.45;
  margin-top: 0.7mm;
}

/* -------------------------------------------------------------- the total */

.sum {
  position: relative;
  margin-top: var(--block-gap);
  margin-left: auto;
  width: 74mm;
  max-width: 100%;
}

.sum-rows { display: grid; gap: 1.2mm; }

.sum-row {
  display: flex;
  justify-content: space-between;
  gap: 6mm;
  font-size: calc(var(--size-small) * var(--type-scale));
}

.sum-row dt { color: var(--ink-soft); }

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
  font-variant: small-caps;
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-body) * var(--type-scale));
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

/* ------------------------------------------------------ the letter closing */

.body-text {
  margin-top: var(--block-gap);
  line-height: 1.6;
  max-width: 140mm;
  overflow-wrap: break-word;
}

.cap {
  font-family: var(--font-display);
  font-variant: small-caps;
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-body) * var(--type-scale));
  color: var(--ink-soft);
}

.pay-rows {
  display: grid;
  gap: 1mm;
  margin-top: 1.6mm;
  max-width: 110mm;
}

.pay-row { display: flex; gap: 3mm; align-items: baseline; }

.pay-row dt {
  flex: none;
  width: 28mm;
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

/* A real rule with real room above it: this is a letter, and a letter is
   signed. */
.signoff { margin-top: calc(var(--block-gap) * 1.6); }

.closing { margin-bottom: 16mm; }

.signature-rule {
  width: 62mm;
  border-bottom: var(--rule-w) solid var(--ink);
}

.signature-name {
  margin-top: 1.6mm;
  font-weight: 600;
}

.terms-text {
  margin-top: var(--block-gap);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-w) solid var(--line);
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
  overflow-wrap: break-word;
}
`
