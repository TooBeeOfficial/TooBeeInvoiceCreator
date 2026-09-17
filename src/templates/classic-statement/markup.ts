/* Classic Statement — the markup.

   The shape a bookkeeper expects: a centred letterhead over a ruled table,
   figures boxed rather than floating, and a remittance advice along the foot
   of the sheet. The slip is not decoration — it is how paper invoices have
   always told the payer what to quote when the money is sent, and it is the
   reason this layout exists next to the minimal one. */

export const html = `<header class="letterhead brand-rule rule-under">
  {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
  <p class="house">{{seller.name}}</p>
  {{#seller.hasAddress}}
  <p class="house-address">{{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}</p>
  {{/seller.hasAddress}}
  <p class="house-contact">
    {{#seller.hasEmail}}<span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span>{{/seller.hasEmail}}
    {{#seller.hasPhone}}<span>{{seller.phone}}</span>{{/seller.hasPhone}}
    {{#seller.hasWebsite}}<span>{{seller.website}}</span>{{/seller.hasWebsite}}
  </p>
  {{#seller.hasTaxIds}}
  <p class="house-ids">{{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}</p>
  {{/seller.hasTaxIds}}
</header>

<p class="doctype">{{heading}}</p>
{{#hasTitle}}<p class="doctitle">{{title}}</p>{{/hasTitle}}

<section class="statement avoid-break">
  <div class="addressee">
    <p class="cap">{{labels.billTo}}</p>
    <p class="addressee-name">{{buyer.name}}</p>
    {{#buyer.hasContactName}}<p>{{buyer.contactName}}</p>{{/buyer.hasContactName}}
    {{#buyer.addressLines}}<p>{{text}}</p>{{/buyer.addressLines}}
    {{#buyer.hasEmail}}<p><a href="{{buyer.emailHref}}" target="_blank">{{buyer.email}}</a></p>{{/buyer.hasEmail}}
    {{#buyer.hasTaxIds}}{{#buyer.taxIds}}<p>{{label}} {{value}}</p>{{/buyer.taxIds}}{{/buyer.hasTaxIds}}
  </div>

  <table class="particulars">
    <tbody>
      <tr><th>{{labels.number}}</th><td class="num">{{meta.number}}</td></tr>
      <tr><th>{{labels.issued}}</th><td class="num">{{meta.issueDate}}</td></tr>
      {{#meta.hasSupplyDate}}<tr><th>{{labels.supplied}}</th><td class="num">{{meta.supplyDate}}</td></tr>{{/meta.hasSupplyDate}}
      {{#meta.hasDueDate}}<tr><th>{{labels.due}}</th><td class="num">{{meta.dueDate}}</td></tr>{{/meta.hasDueDate}}
      {{#meta.hasTerms}}<tr><th>{{labels.terms}}</th><td class="num">{{meta.terms}}</td></tr>{{/meta.hasTerms}}
      {{#meta.hasPurchaseOrder}}<tr><th>{{labels.purchaseOrder}}</th><td class="num">{{meta.purchaseOrder}}</td></tr>{{/meta.hasPurchaseOrder}}
      {{#meta.hasReference}}<tr><th>{{labels.reference}}</th><td class="num">{{meta.reference}}</td></tr>{{/meta.hasReference}}
    </tbody>
  </table>
</section>

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
    <tr class="{{#odd}}is-odd{{/odd}}">
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

<section class="close">
  <div class="close-left">
    {{#payment.hasInstructions}}
    <div class="block avoid-break">
      <p class="block-text">{{{payment.instructionsHtml}}}</p>
    </div>
    {{/payment.hasInstructions}}

    {{#hasNotes}}
    <div class="block avoid-break">
      <p class="cap">{{labels.notes}}</p>
      <p class="block-text">{{{notesHtml}}}</p>
    </div>
    {{/hasNotes}}
  </div>

  <div class="totals avoid-break">
    {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
    <table class="total-table">
      <tbody>
        {{#totals.rows}}
        <tr><th>{{label}}</th><td class="num">{{value}}</td></tr>
        {{/totals.rows}}
      </tbody>
      <tfoot>
        <tr class="grand brand-rule rule-over">
          <th>{{labels.amountDue}}</th>
          <td class="num">{{totals.amountDue}}</td>
        </tr>
      </tfoot>
    </table>
    {{#flags.inclusive}}<p class="grand-note">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
  </div>
</section>

{{#hasTerms}}
<section class="terms avoid-break">
  <p class="cap">{{labels.conditions}}</p>
  <p class="terms-text">{{{termsHtml}}}</p>
</section>
{{/hasTerms}}

<section class="remittance avoid-break">
  <p class="tear">{{labels.detachSlip}}</p>
  <div class="remittance-body">
    <div>
      <p class="cap">{{labels.payment}}</p>
      <p class="remit-strong">{{seller.name}}</p>
      {{#payment.hasRows}}
      <p class="remit-lines">{{#payment.rows}}<span>{{label}} {{value}}</span>{{/payment.rows}}</p>
      {{/payment.hasRows}}
    </div>
    <table class="remit-facts">
      <tbody>
        <tr><th>{{labels.number}}</th><td class="num">{{meta.number}}</td></tr>
        <tr><th>{{labels.billTo}}</th><td class="num">{{buyer.name}}</td></tr>
        {{#meta.hasDueDate}}<tr><th>{{labels.due}}</th><td class="num">{{meta.dueDate}}</td></tr>{{/meta.hasDueDate}}
        <tr class="remit-total"><th>{{labels.amountDue}}</th><td class="num">{{totals.amountDue}}</td></tr>
      </tbody>
    </table>
  </div>
</section>

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
    <table class="pay">
      <tbody>
        {{#payment.rows}}<tr><th>{{label}}</th><td class="num">{{value}}</td></tr>{{/payment.rows}}
      </tbody>
    </table>
    {{/payment.hasRows}}
    {{#payment.hasLink}}<p class="pay-link">{{payment.link}}</p>{{/payment.hasLink}}
  </div>
</footer>
{{/payment.hasAccount}}
`
