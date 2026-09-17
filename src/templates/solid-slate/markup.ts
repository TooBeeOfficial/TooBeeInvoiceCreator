/* Solid Slate — the markup.

   The same complete invoice as every other full layout, set in one column,
   with the items printed white out of a solid black panel.

   Single column throughout, because a panel that runs the full width of the
   sheet leaves nothing to sit beside it. The paperwork above it is a
   letterhead, one line of dates and the customer; the paperwork below it is
   the totals, how to pay, and the conditions. Nothing is arranged into
   facing columns, so nothing competes with the slab in the middle. */

export const html = `<header class="head">
  {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
  <div class="head-row">
    <p class="house">{{seller.name}}</p>
    <p class="mark"><span class="doctype">{{heading}}</span> <span class="docnumber num">{{meta.number}}</span></p>
  </div>
  <p class="house-lines">
    {{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}
    {{#seller.hasEmail}}<span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span>{{/seller.hasEmail}}
    {{#seller.hasPhone}}<span>{{seller.phone}}</span>{{/seller.hasPhone}}
    {{#seller.hasWebsite}}<span>{{seller.website}}</span>{{/seller.hasWebsite}}
    {{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}
  </p>
</header>

<section class="to avoid-break">
  <p class="cap">{{labels.billTo}}</p>
  <p class="to-name">{{buyer.name}}</p>
  {{#buyer.hasContactName}}<p class="to-line">{{buyer.contactName}}</p>{{/buyer.hasContactName}}
  {{#buyer.addressLines}}<p class="to-line">{{text}}</p>{{/buyer.addressLines}}
  {{#buyer.hasEmail}}<p class="to-line"><a href="{{buyer.emailHref}}" target="_blank">{{buyer.email}}</a></p>{{/buyer.hasEmail}}
  {{#buyer.hasPhone}}<p class="to-line">{{buyer.phone}}</p>{{/buyer.hasPhone}}
  {{#buyer.taxIds}}<p class="to-line">{{label}} {{value}}</p>{{/buyer.taxIds}}
</section>

{{#hasTitle}}<p class="doctitle">{{title}}</p>{{/hasTitle}}

<p class="strip avoid-break">
  <span><em>{{labels.issued}}</em> {{meta.issueDate}}</span>
  {{#meta.hasSupplyDate}}<span><em>{{labels.supplied}}</em> {{meta.supplyDate}}</span>{{/meta.hasSupplyDate}}
  {{#meta.hasDueDate}}<span><em>{{labels.due}}</em> {{meta.dueDate}}</span>{{/meta.hasDueDate}}
  {{#meta.hasTerms}}<span><em>{{labels.terms}}</em> {{meta.terms}}</span>{{/meta.hasTerms}}
  {{#meta.hasPurchaseOrder}}<span><em>{{labels.purchaseOrder}}</em> {{meta.purchaseOrder}}</span>{{/meta.hasPurchaseOrder}}
  {{#meta.hasReference}}<span><em>{{labels.reference}}</em> {{meta.reference}}</span>{{/meta.hasReference}}
  <span><em>{{labels.currency}}</em> {{currency.code}}</span>
</p>

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

<section class="sums avoid-break">
  {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
  <dl class="total-rows">
    {{#totals.rows}}
    <div class="total-row"><dt>{{label}}</dt><dd class="num">{{value}}</dd></div>
    {{/totals.rows}}
  </dl>
  <div class="grand">
    <span class="grand-label">{{labels.amountDue}}</span>
    <span class="grand-value num">{{totals.amountDue}}</span>
  </div>
  {{#flags.inclusive}}<p class="aside right">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
</section>

{{#totals.hasTax}}
<table class="analysis avoid-break">
  <thead>
    <tr>
      <th>{{labels.taxAnalysis}}</th>
      <th class="num">{{labels.rate}}</th>
      <th class="num">{{labels.taxable}}</th>
      <th class="num">{{labels.tax}}</th>
    </tr>
  </thead>
  <tbody>
    {{#totals.taxRows}}
    <tr>
      <td>{{name}}</td>
      <td class="num">{{rate}}</td>
      <td class="num">{{base}}</td>
      <td class="num">{{amount}}</td>
    </tr>
    {{/totals.taxRows}}
  </tbody>
</table>
{{/totals.hasTax}}

{{#payment.hasInstructions}}
<section class="block avoid-break">
  <p class="aside">{{{payment.instructionsHtml}}}</p>
</section>
{{/payment.hasInstructions}}

{{#hasNotes}}
<section class="block avoid-break">
  <p class="cap">{{labels.notes}}</p>
  <p class="aside">{{{notesHtml}}}</p>
</section>
{{/hasNotes}}

{{#hasTerms}}
<section class="block avoid-break">
  <p class="cap">{{labels.conditions}}</p>
  <p class="aside">{{{termsHtml}}}</p>
</section>
{{/hasTerms}}

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
    {{#payment.hasLink}}<p class="aside link">{{payment.link}}</p>{{/payment.hasLink}}
  </div>
</footer>
{{/payment.hasAccount}}
`
