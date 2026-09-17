/* Continental — the stylesheet.

   Two things here are measured from the paper rather than from the content,
   and both have to stay right whatever the page margin is set to. The fold
   marks sit at fixed distances from the top edge of the sheet, and the
   address block sits where a DIN long envelope's window will be. Both are
   written as calc() against --page-margin so that moving the margin moves
   the content without moving the paper.

   DIN 5008 puts the fold marks at 87mm and 192mm from the top and the punch
   mark at 148.5mm. The address field starts at 45mm. */

export const css = `.sheet { position: relative; }

/* ------------------------------------------------------------- the marks */

.marks {
  position: absolute;
  top: 0;
  /* out into the page margin, 5mm in from the paper's left edge */
  left: calc((var(--page-margin) - 5mm) * -1);
  width: 4mm;
  height: 0;
}

.mark {
  position: absolute;
  left: 0;
  width: 4mm;
  border-top: 0.2mm solid var(--line-strong);
}

/* Measured from the top of the paper, so the content's own margin is taken
   back off. */
.mark-fold-a { top: calc(87mm - var(--page-margin)); }
.mark-punch {
  top: calc(148.5mm - var(--page-margin));
  width: 6mm;
  border-top-color: var(--line-strong);
}
.mark-fold-b { top: calc(192mm - var(--page-margin)); }

/* ------------------------------------------------------------ the crest */

.crest {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3mm;
  min-height: 12mm;
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
}

.crest-name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.15);
  letter-spacing: var(--track-title);
}

/* -------------------------------------------------- the window and the info */

.band {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--block-gap);
  /* The address field begins 45mm down the sheet, which is where the window
     of a DIN long envelope falls. */
  margin-top: calc(45mm - var(--page-margin) - 12mm);
}

.window {
  flex: 0 0 85mm;
  max-width: 85mm;
  min-height: 40mm;
}

/* The one-line return address that shows above the recipient in the window,
   set small and underlined exactly as the convention has it. */
.return {
  font-size: calc(var(--size-small) * var(--type-scale) * 0.86);
  color: var(--ink-soft);
  padding-bottom: 0.8mm;
  border-bottom: 0.15mm solid var(--line-strong);
  margin-bottom: 3.5mm;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.addressee { line-height: 1.5; }

.addressee-name { font-weight: 600; }

.info {
  flex: 0 1 72mm;
  min-width: 0;
}

.info-table { width: 100%; }

.info-table th,
.info-table td {
  padding: 0.9mm 0;
  font-size: calc(var(--size-small) * var(--type-scale));
  vertical-align: top;
}

.info-table th {
  text-align: left;
  font-weight: 400;
  color: var(--ink-soft);
  padding-right: 4mm;
  white-space: nowrap;
}

.info-table td {
  text-align: right;
  font-family: var(--font-num);
  overflow-wrap: anywhere;
}

/* ------------------------------------------------------------- the subject */

.subject {
  margin-top: var(--block-gap);
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.1);
  letter-spacing: var(--track-title);
}

.counterparty {
  margin-top: 1.2mm;
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

/* --------------------------------------------------------------- the table */

.items { margin-top: var(--table-gap); }

.items th {
  text-align: left;
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink);
  padding: 0 var(--cell-pad-x) var(--cell-pad-y) 0;
  border-bottom: var(--rule-strong-w) solid var(--ink);
}

.items td {
  padding: var(--cell-pad-y) var(--cell-pad-x) var(--cell-pad-y) 0;
  border-bottom: var(--rule-w) solid var(--line);
  vertical-align: top;
}

.items th:last-child,
.items td:last-child { padding-right: 0; }

.num { text-align: right; }

.col-desc { width: 48%; }
.col-n { width: 8mm; color: var(--ink-soft); }
.col-qty { width: 15mm; }
.col-unit { width: 16mm; color: var(--ink-soft); }
.col-price { width: 23mm; }
.col-disc { width: 18mm; }
.col-tax { width: 16mm; color: var(--ink-soft); }
.col-amount { width: 26mm; font-weight: 600; }

.desc { display: block; }

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.45;
  margin-top: 0.7mm;
}

/* -------------------------------------------------------------- the totals */

.totals {
  position: relative;
  margin-top: var(--block-gap);
  margin-left: auto;
  width: 74mm;
  max-width: 100%;
}

.total-rows { display: grid; gap: 1.2mm; }

.total-row {
  display: flex;
  justify-content: space-between;
  gap: 6mm;
  font-size: calc(var(--size-small) * var(--type-scale));
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
  font-weight: var(--weight-heading);
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

/* ---------------------------------------------------------------- the foot */

.body-text {
  margin-top: var(--block-gap);
  line-height: 1.55;
  max-width: 150mm;
  overflow-wrap: break-word;
}

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

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
