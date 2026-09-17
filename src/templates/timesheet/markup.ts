/* Timesheet — the markup.

   For work billed by the hour, the day or the unit. The difference from the
   other layouts is that the quantity is treated as a figure worth reading
   rather than a small number beside a price: it gets its own emphasis in the
   table and is totalled at the foot, next to the money.

   Anyone billing time is asked two questions about an invoice — how much, and
   how many hours — and most invoice layouts only answer the first. */

export const html = `<header class="head brand-rule rule-under">
  <div class="from">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="from-name">{{seller.name}}</p>
    <p class="from-lines">
      {{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}
      {{#seller.hasEmail}}<span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span>{{/seller.hasEmail}}
    </p>
    {{#seller.hasTaxIds}}
    <p class="from-lines">{{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}</p>
    {{/seller.hasTaxIds}}
  </div>

  <div class="mark">
    <p class="doctype">{{heading}}</p>
    <p class="docnumber">{{meta.number}}</p>
  </div>
</header>

<section class="strip avoid-break">
  <div class="strip-cell">
    <p class="cap">{{labels.billTo}}</p>
    <p class="strong">{{buyer.name}}</p>
    {{#buyer.hasContactName}}<p class="line">{{buyer.contactName}}</p>{{/buyer.hasContactName}}
    {{#buyer.addressLines}}<p class="line">{{text}}</p>{{/buyer.addressLines}}
    {{#buyer.taxIds}}<p class="line">{{label}} {{value}}</p>{{/buyer.taxIds}}
  </div>

  <div class="strip-cell">
    <p class="cap">{{labels.issued}}</p>
    <p class="strong">{{meta.issueDate}}</p>
    {{#meta.hasSupplyDate}}
    <p class="cap cap-second">{{labels.supplied}}</p>
    <p class="strong">{{meta.supplyDate}}</p>
    {{/meta.hasSupplyDate}}
    {{#meta.hasPurchaseOrder}}<p class="line">{{labels.purchaseOrder}} {{meta.purchaseOrder}}</p>{{/meta.hasPurchaseOrder}}
    {{#meta.hasReference}}<p class="line">{{labels.reference}} {{meta.reference}}</p>{{/meta.hasReference}}
  </div>

  {{#meta.hasDueDate}}
  <div class="strip-cell strip-due">
    <p class="cap">{{labels.due}}</p>
    <p class="strong">{{meta.dueDate}}</p>
    {{#meta.hasTerms}}<p class="line">{{meta.terms}}</p>{{/meta.hasTerms}}
  </div>
  {{/meta.hasDueDate}}
</section>

{{#hasTitle}}<p class="subject">{{title}}</p>{{/hasTitle}}

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

<section class="close avoid-break">
  {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}

  <div class="tally">
    <p class="cap">{{labels.unitsBilled}}</p>
    <p class="tally-value num">{{totals.quantityTotal}}</p>
    <p class="tally-note">{{totals.lineCountNote}}</p>
  </div>

  <div class="totals">
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
  </div>
</section>

{{#payment.hasInstructions}}
<p class="foot-note avoid-break">{{{payment.instructionsHtml}}}</p>
{{/payment.hasInstructions}}

{{#hasNotes}}<p class="foot-note">{{{notesHtml}}}</p>{{/hasNotes}}
{{#hasTerms}}<p class="foot-note foot-terms">{{{termsHtml}}}</p>{{/hasTerms}}

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
`
