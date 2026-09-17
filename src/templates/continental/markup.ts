/* Continental — the markup.

   The shape a business letter takes across most of continental Europe, and
   the one German, Austrian and Swiss accounts departments expect: a small
   return-address line over the recipient's address, both positioned to show
   through the window of a DIN long envelope, and an information block to
   their right carrying the invoice's particulars.

   It prints fold marks down the left edge — two Falzmarken where the sheet
   is folded into thirds and a Lochmarke where it is punched for a ring
   binder. They are drawn at fixed distances from the top of the paper, so
   they stay right wherever the page margin is set.

   The words are still English. What is continental here is the layout, which
   is what makes the difference to whoever opens the envelope. */

export const html = `<div class="sheet">
  <div class="marks" aria-hidden="true">
    <span class="mark mark-fold-a"></span>
    <span class="mark mark-punch"></span>
    <span class="mark mark-fold-b"></span>
  </div>

  <header class="crest">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="crest-name">{{seller.name}}</p>
  </header>

  <section class="band avoid-break">
    <div class="window">
      <p class="return">
        {{seller.name}}{{#seller.hasAddress}} · {{#seller.addressLines}}{{text}} {{/seller.addressLines}}{{/seller.hasAddress}}
      </p>
      <div class="addressee">
        <p class="addressee-name">{{buyer.name}}</p>
        {{#buyer.hasContactName}}<p>{{buyer.contactName}}</p>{{/buyer.hasContactName}}
        {{#buyer.addressLines}}<p>{{text}}</p>{{/buyer.addressLines}}
      </div>
    </div>

    <aside class="info">
      <table class="info-table">
        <tbody>
          <tr><th>{{labels.number}}</th><td class="num">{{meta.number}}</td></tr>
          <tr><th>{{labels.issued}}</th><td class="num">{{meta.issueDate}}</td></tr>
          {{#meta.hasSupplyDate}}<tr><th>{{labels.supplied}}</th><td class="num">{{meta.supplyDate}}</td></tr>{{/meta.hasSupplyDate}}
          {{#meta.hasDueDate}}<tr><th>{{labels.due}}</th><td class="num">{{meta.dueDate}}</td></tr>{{/meta.hasDueDate}}
          {{#meta.hasPurchaseOrder}}<tr><th>{{labels.purchaseOrder}}</th><td class="num">{{meta.purchaseOrder}}</td></tr>{{/meta.hasPurchaseOrder}}
          {{#meta.hasReference}}<tr><th>{{labels.reference}}</th><td class="num">{{meta.reference}}</td></tr>{{/meta.hasReference}}
          {{#seller.taxIds}}<tr><th>{{label}}</th><td class="num">{{value}}</td></tr>{{/seller.taxIds}}
        </tbody>
      </table>
    </aside>
  </section>

  <h1 class="subject">
    {{heading}} {{meta.number}}{{#hasTitle}} — {{title}}{{/hasTitle}}
  </h1>

  {{#buyer.hasTaxIds}}
  <p class="counterparty">{{#buyer.taxIds}}{{label}} {{value}}{{/buyer.taxIds}}</p>
  {{/buyer.hasTaxIds}}

  <table class="items">
    <thead>
      <tr>
        {{#columns.numbers}}<th class="col-n num">#</th>{{/columns.numbers}}
        <th class="col-desc">{{labels.description}}</th>
        <th class="col-qty num">{{labels.quantity}}</th>
        {{#columns.unit}}<th class="col-unit">{{labels.unit}}</th>{{/columns.unit}}
        <th class="col-price num">{{labels.unitPrice}}</th>
        {{#columns.discount}}<th class="col-disc num">{{labels.discount}}</th>{{/columns.discount}}
        {{#columns.tax}}<th class="col-tax num">{{labels.tax}}</th>{{/columns.tax}}
        <th class="col-amount num">{{labels.amount}}</th>
      </tr>
    </thead>
    <tbody>
      {{#lines}}
      <tr>
        {{#columns.numbers}}<td class="col-n num">{{n}}</td>{{/columns.numbers}}
        <td class="col-desc">
          <span class="desc">{{description}}</span>
          {{#hasDetails}}<span class="details">{{{detailsHtml}}}</span>{{/hasDetails}}
        </td>
        <td class="col-qty num">{{quantity}}</td>
        {{#columns.unit}}<td class="col-unit">{{unit}}</td>{{/columns.unit}}
        <td class="col-price num">{{unitPrice}}</td>
        {{#columns.discount}}<td class="col-disc num">{{discount}}</td>{{/columns.discount}}
        {{#columns.tax}}<td class="col-tax num">{{rate}}</td>{{/columns.tax}}
        <td class="col-amount num">{{amount}}</td>
      </tr>
      {{/lines}}
    </tbody>
  </table>

  <section class="totals avoid-break">
    {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
    <dl class="total-rows">
      {{#totals.rows}}
      <div class="total-row"><dt>{{label}}</dt><dd class="num">{{value}}</dd></div>
      {{/totals.rows}}
    </dl>
    <div class="grand brand-rule rule-over">
      <span class="grand-label">{{labels.amountDue}}</span>
      <span class="grand-value num">{{totals.amountDue}}</span>
    </div>
    {{#flags.inclusive}}<p class="grand-note">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
  </section>

  {{#hasNotes}}<p class="body-text">{{{notesHtml}}}</p>{{/hasNotes}}

  {{#payment.hasInstructions}}
  <p class="body-text avoid-break">{{{payment.instructionsHtml}}}</p>
  {{/payment.hasInstructions}}

  {{#hasTerms}}<p class="terms-text">{{{termsHtml}}}</p>{{/hasTerms}}

  {{#payment.hasAccount}}
  <footer class="sheet-foot">
    {{#payment.qr.has}}
    <figure class="pay-qr">
      <img src="{{payment.qr.src}}" alt="{{payment.qr.alt}}">
      <figcaption>{{payment.qr.caption}}</figcaption>
    </figure>
    {{/payment.qr.has}}
    <div class="pay-details">
      <p class="cap">{{labels.payment}}</p>
      {{#payment.hasRows}}
      <dl class="pay-rows">
        {{#payment.rows}}<div class="pay-row"><dt>{{label}}</dt><dd>{{value}}</dd></div>{{/payment.rows}}
      </dl>
      {{/payment.hasRows}}
      {{#payment.hasLink}}<p class="pay-link">{{payment.link}}</p>{{/payment.hasLink}}
    </div>
  </footer>
  {{/payment.hasAccount}}
</div>
`
