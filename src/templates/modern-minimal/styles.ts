/* Modern Minimal — the stylesheet.

   Hairlines and space instead of boxes: the only heavy marks on the sheet are
   the accent rule under the letterhead and the amount due. Every colour and
   every size is a theme token, so the inspector can restyle this layout
   without anyone editing the CSS — and the code panel hands this exact text
   to a user who wants to. */

export const css = `.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--block-gap);
  padding-bottom: var(--block-gap);
  border-bottom: var(--rule-strong-w) solid var(--accent);
}

.logo {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin-bottom: 3mm;
}

.brand-name {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.25);
  letter-spacing: var(--track-title);
  margin-bottom: 1.5mm;
}

/* The address prints as one run with thin separators rather than a stack of
   short lines: a letterhead should not be taller than it needs to be. */
.brand-lines,
.brand-contact,
.brand-ids {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}

.brand-lines span + span::before,
.brand-contact span + span::before,
.brand-ids span + span::before {
  content: '·';
  margin: 0 1.4mm;
  color: var(--line-strong);
}

.brand-contact { margin-top: 0.6mm; }
.brand-ids { margin-top: 0.6mm; }

.mark { text-align: right; flex: none; }

.mark-label {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.mark-number {
  font-family: var(--font-display);
  font-size: calc(var(--size-title) * var(--type-scale) * 0.62);
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
  line-height: 1.05;
  margin-top: 1mm;
}

.mark-title {
  font-size: calc(var(--size-body) * var(--type-scale));
  color: var(--ink-soft);
  margin-top: 1mm;
  max-width: 70mm;
}

/* ------------------------------------------------------- the amount due */

/* The figure the invoice exists to communicate, given the top of the page
   and the largest type on it. Everything under here is the evidence. */
.callout {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--block-gap);
  padding: var(--head-gap) 0 calc(var(--head-gap) * 0.7);
  border-bottom: var(--rule-w) solid var(--line);
}

.cap {
  font-family: var(--font-display);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
}

.callout-total {
  font-family: var(--font-display);
  font-size: calc(var(--size-title) * var(--type-scale));
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
  line-height: 1;
  color: var(--accent);
  margin-top: 1.5mm;
}

.callout-when { text-align: right; }

.callout-date {
  font-family: var(--font-display);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.15);
  font-weight: var(--weight-heading);
  margin-top: 1.5mm;
}

.callout-terms {
  font-size: calc(var(--size-small) * var(--type-scale));
  color: var(--ink-soft);
  margin-top: 0.8mm;
}

/* ----------------------------------------------------------- the parties */

.parties {
  display: flex;
  justify-content: space-between;
  gap: var(--block-gap);
  padding: var(--block-gap) 0;
}

.party { max-width: 85mm; }

.party-name {
  font-family: var(--font-display);
  font-weight: var(--weight-heading);
  font-size: calc(var(--size-heading) * var(--type-scale));
  margin-top: 1.8mm;
}

.party-line { line-height: 1.5; }

.facts {
  display: grid;
  gap: 1.6mm;
  text-align: right;
  align-content: start;
  min-width: 55mm;
}

.fact {
  display: flex;
  justify-content: flex-end;
  gap: 4mm;
}

.fact dt {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
  align-self: center;
}

.fact dd { font-weight: 500; }

/* ------------------------------------------------------------- the table */

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

.col-desc { width: 50%; }
.col-n { width: 8mm; color: var(--ink-soft); }
.col-qty { width: 16mm; }
.col-unit { width: 18mm; color: var(--ink-soft); }
.col-price { width: 24mm; }
.col-disc { width: 20mm; }
.col-tax { width: 18mm; color: var(--ink-soft); }
.col-amount { width: 28mm; font-weight: 600; }

.desc { display: block; }

.details {
  display: block;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.45;
  margin-top: 0.8mm;
}

/* ------------------------------------------------------- totals and close */

.close {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  /* On a small sheet there is not room for payment details beside a totals
     block; they drop underneath rather than being squeezed into a column
     two words wide. */
  flex-wrap: wrap;
  gap: var(--block-gap);
  margin-top: var(--block-gap);
}

/* min-width: 0 is what stops a long bank reference from pushing this column
   wider than the paper and sliding under the totals. A flex item's default
   minimum is the width of its content, which for an unbroken IBAN is more
   than the sheet has. */
.close-left {
  flex: 1 1 74mm;
  min-width: 0;
  max-width: 95mm;
  display: grid;
  gap: var(--block-gap);
  align-content: start;
}

.block-text {
  margin-top: 1.6mm;
  line-height: 1.55;
  overflow-wrap: break-word;
}

.pay {
  margin-top: 1.8mm;
  display: grid;
  gap: 0.9mm;
}

.pay-row {
  display: flex;
  gap: 3mm;
  align-items: baseline;
}

.pay-row dt {
  flex: none;
  width: 24mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

/* An account number has no spaces to break at, so it is told it may break
   anywhere rather than running off the edge of the page. */
.pay-row dd {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--font-num);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.pay-link {
  margin-top: 1.4mm;
  color: var(--accent);
  word-break: break-all;
}

.totals {
  position: relative;
  flex: 0 1 68mm;
  min-width: 62mm;
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
  font-family: var(--font-display);
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: var(--weight-title);
  letter-spacing: var(--track-title);
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
  max-width: 150mm;
}
`
