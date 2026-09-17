/* Modern Minimal — the markup.

   The layout leads with the one thing a client opens an invoice to find out:
   how much, and by when. That pair sits directly under the letterhead in a
   band of its own, before the detail of what was bought. Everything below it
   is evidence for that number.

   Mustache only prints and asks whether something is there; every figure
   arriving here was worked out and formatted in core/document/viewModel.ts. */

export const html = `<header class="head brand-rule rule-under">
  <div class="brand">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="brand-name">{{seller.name}}</p>
    {{#seller.hasAddress}}
    <p class="brand-lines">{{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}</p>
    {{/seller.hasAddress}}
    <p class="brand-contact">
      {{#seller.hasEmail}}<span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span>{{/seller.hasEmail}}
      {{#seller.hasPhone}}<span>{{seller.phone}}</span>{{/seller.hasPhone}}
      {{#seller.hasWebsite}}<span>{{seller.website}}</span>{{/seller.hasWebsite}}
    </p>
    {{#seller.hasTaxIds}}
    <p class="brand-ids">{{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}</p>
    {{/seller.hasTaxIds}}
  </div>

  <div class="mark">
    <p class="mark-label">{{heading}}</p>
    <p class="mark-number">{{meta.number}}</p>
    {{#hasTitle}}<p class="mark-title">{{title}}</p>{{/hasTitle}}
  </div>
</header>

<section class="callout avoid-break">
  <div class="callout-due">
    <p class="cap">{{labels.amountDue}}</p>
    <p class="callout-total num">{{totals.amountDue}}</p>
  </div>
  <div class="callout-when">
    {{#meta.hasDueDate}}
    <p class="cap">{{labels.due}}</p>
    <p class="callout-date">{{meta.dueDate}}</p>
    {{/meta.hasDueDate}}
    {{#meta.hasTerms}}<p class="callout-terms">{{meta.terms}}</p>{{/meta.hasTerms}}
  </div>
</section>

<section class="parties avoid-break">
  <div class="party">
    <p class="cap">{{labels.billTo}}</p>
    <p class="party-name">{{buyer.name}}</p>
    {{#buyer.hasContactName}}<p class="party-line">{{buyer.contactName}}</p>{{/buyer.hasContactName}}
    {{#buyer.addressLines}}<p class="party-line">{{text}}</p>{{/buyer.addressLines}}
    {{#buyer.hasEmail}}<p class="party-line"><a href="{{buyer.emailHref}}" target="_blank">{{buyer.email}}</a></p>{{/buyer.hasEmail}}
    {{#buyer.hasTaxIds}}
    {{#buyer.taxIds}}<p class="party-line">{{label}} {{value}}</p>{{/buyer.taxIds}}
    {{/buyer.hasTaxIds}}
  </div>

  <dl class="facts">
    <div class="fact"><dt>{{labels.issued}}</dt><dd>{{meta.issueDate}}</dd></div>
    {{#meta.hasSupplyDate}}<div class="fact"><dt>{{labels.supplied}}</dt><dd>{{meta.supplyDate}}</dd></div>{{/meta.hasSupplyDate}}
    {{#meta.hasPurchaseOrder}}<div class="fact"><dt>{{labels.purchaseOrder}}</dt><dd>{{meta.purchaseOrder}}</dd></div>{{/meta.hasPurchaseOrder}}
    {{#meta.hasReference}}<div class="fact"><dt>{{labels.reference}}</dt><dd>{{meta.reference}}</dd></div>{{/meta.hasReference}}
    <div class="fact"><dt>{{labels.currency}}</dt><dd>{{currency.code}}</dd></div>
  </dl>
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

{{#hasTerms}}
<section class="terms avoid-break">
  <p class="cap">{{labels.conditions}}</p>
  <p class="terms-text">{{{termsHtml}}}</p>
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
    <dl class="pay">
      {{#payment.rows}}<div class="pay-row"><dt>{{label}}</dt><dd>{{value}}</dd></div>{{/payment.rows}}
    </dl>
    {{/payment.hasRows}}
    {{#payment.hasLink}}<p class="pay-link">{{payment.link}}</p>{{/payment.hasLink}}
  </div>
</footer>
{{/payment.hasAccount}}
`
