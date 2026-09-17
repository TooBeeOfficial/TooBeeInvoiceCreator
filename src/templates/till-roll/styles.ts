/* Till Roll — the stylesheet.

   Monospaced from top to bottom, which is the whole look: a till prints in
   one width of character, so the figures line up down the right-hand edge
   without a single rule drawn to make them.

   The column is held to 78mm and centred on whatever paper is in the
   printer, so the same receipt prints on A4, on A5 or on a roll. Wider than
   that and it stops reading as a receipt and starts reading as an invoice
   that has lost its columns. */

export const css = `.head,
.kind,
.stub,
.sale,
.sums,
.grand,
.aside,
.pay {
  /* The roll: one narrow measure, centred, whatever the sheet. */
  width: 78mm;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.head { text-align: center; }

.mark {
  display: block;
  width: var(--logo-width);
  height: auto;
  margin: 0 auto 2.5mm;
}

.shop {
  font-family: var(--font-display);
  font-weight: var(--weight-title);
  font-size: calc(var(--size-heading) * var(--type-scale) * 1.15);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.shop-lines {
  margin-top: 1mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}

/* Each part of the address on its own line, as a till prints it. */
.shop-lines span { display: block; }

/* The band that names what this is, and later what the payment block is.
   Its rules are the template's dividers, so the dashed style the theme
   ships with is what actually draws them. */
.kind {
  margin-top: var(--block-gap);
  padding: 1.6mm 0;
  border-top: var(--rule-w) solid var(--line-strong);
  border-bottom: var(--rule-w) solid var(--line-strong);
  font-family: var(--font-display);
  font-size: calc(var(--size-small) * var(--type-scale));
  letter-spacing: 0.24em;
  text-indent: 0.24em;
  text-transform: uppercase;
  text-align: center;
}

/* ----------------------------------------------------------------- stub */

.stub {
  margin-top: var(--cell-pad-y);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.stub-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 3mm;
  padding: 0.5mm 0;
}

.stub-row dt {
  color: var(--ink-soft);
  text-transform: var(--case-label);
  letter-spacing: var(--track-label);
}

.stub-row dd {
  text-align: right;
  overflow-wrap: anywhere;
}

/* ----------------------------------------------------------------- sale */

.sale { margin-top: var(--table-gap); }

.sold { padding: 1.4mm 0; }

.sold-what { line-height: 1.35; }

.sold-note {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.4;
}

/* What it cost, under what it was: the quantity and the rate on the left,
   the money hard against the right edge where it can be added up by eye. */
.sold-figures {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 3mm;
  margin-top: 0.4mm;
}

.sold-each {
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.sold-amount { font-weight: 700; }

/* --------------------------------------------------------------- totals */

.sums {
  margin-top: var(--cell-pad-y);
  padding-top: var(--cell-pad-y);
  border-top: var(--rule-w) solid var(--line-strong);
  font-size: calc(var(--size-small) * var(--type-scale));
}

.sum-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 3mm;
  padding: 0.5mm 0;
}

.sum-row dt { color: var(--ink-soft); }

.grand {
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 3mm;
  margin-top: 1.6mm;
  padding-top: 1.8mm;
  border-top: var(--rule-strong-w) solid var(--ink);
}

.grand-label {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: calc(var(--size-small) * var(--type-scale));
}

.grand-value {
  font-size: calc(var(--size-total) * var(--type-scale));
  font-weight: 700;
  color: var(--accent);
}

/* --------------------------------------------------------------- closing */

.aside {
  margin-top: 1.6mm;
  color: var(--ink-soft);
  font-size: calc(var(--size-small) * var(--type-scale));
  line-height: 1.5;
}

.link { word-break: break-all; }

.foot { margin-top: var(--block-gap); }

.pay { margin-top: var(--block-gap); }

/* A roll is 78mm wide, so the account details never fit beside the code the
   way they do on a full sheet — they drop under it, and the code is left
   alone on its line. Centred there, because everything on this roll that is
   not a figure is centred too. */
.pay .pay-qr {
  margin-left: auto;
  margin-right: auto;
  width: 24mm;
}
`
