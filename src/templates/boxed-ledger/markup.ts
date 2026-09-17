/* Boxed Ledger — the markup.

   A full invoice with nothing left out — both parties, every date, the
   registration numbers, the tax analysis, the payment details, the notes and
   the conditions — and only one thing drawn on the page: the box around what
   was bought.

   That is the whole idea. A sheet where everything is boxed is a sheet where
   nothing stands out, so every other block here is set plainly and held in
   place by space alone, and the one ruled object on the paper is the one the
   reader came for. */

export const html = `<header class="head">
  <div class="house">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="house-name">{{seller.name}}</p>
    {{#seller.hasAddress}}
    <p class="house-lines">{{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}</p>
    {{/seller.hasAddress}}
    <p class="house-lines">
      {{#seller.hasEmail}}<span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span>{{/seller.hasEmail}}
      {{#seller.hasPhone}}<span>{{seller.phone}}</span>{{/seller.hasPhone}}
      {{#seller.hasWebsite}}<span>{{seller.website}}</span>{{/seller.hasWebsite}}
    </p>
    {{#seller.hasTaxIds}}
    <p class="house-lines">{{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}</p>
    {{/seller.hasTaxIds}}
  </div>

  <div class="mark">
    <p class="doctype">{{heading}}</p>
    <p class="docnumber num">{{meta.number}}</p>
    {{#hasTitle}}<p class="doctitle">{{title}}</p>{{/hasTitle}}
  </div>
</header>

<section class="facts avoid-break">
  <div class="party">
    <p class="cap">{{labels.billTo}}</p>
    <p class="party-name">{{buyer.name}}</p>
    {{#buyer.hasContactName}}<p class="party-line">{{buyer.contactName}}</p>{{/buyer.hasContactName}}
    {{#buyer.addressLines}}<p class="party-line">{{text}}</p>{{/buyer.addressLines}}
    {{#buyer.hasEmail}}<p class="party-line"><a href="{{buyer.emailHref}}" target="_blank">{{buyer.email}}</a></p>{{/buyer.hasEmail}}
    {{#buyer.hasPhone}}<p class="party-line">{{buyer.phone}}</p>{{/buyer.hasPhone}}
    {{#buyer.taxIds}}<p class="party-line">{{label}} {{value}}</p>{{/buyer.taxIds}}
  </div>

  <dl class="dates">
    <div class="date"><dt>{{labels.issued}}</dt><dd class="num">{{meta.issueDate}}</dd></div>
    {{#meta.hasSupplyDate}}<div class="date"><dt>{{labels.supplied}}</dt><dd class="num">{{meta.supplyDate}}</dd></div>{{/meta.hasSupplyDate}}
    {{#meta.hasDueDate}}<div class="date"><dt>{{labels.due}}</dt><dd class="num">{{meta.dueDate}}</dd></div>{{/meta.hasDueDate}}
    {{#meta.hasTerms}}<div class="date"><dt>{{labels.terms}}</dt><dd>{{meta.terms}}</dd></div>{{/meta.hasTerms}}
    {{#meta.hasPurchaseOrder}}<div class="date"><dt>{{labels.purchaseOrder}}</dt><dd class="num">{{meta.purchaseOrder}}</dd></div>{{/meta.hasPurchaseOrder}}
    {{#meta.hasReference}}<div class="date"><dt>{{labels.reference}}</dt><dd class="num">{{meta.reference}}</dd></div>{{/meta.hasReference}}
    <div class="date"><dt>{{labels.currency}}</dt><dd class="num">{{currency.code}}</dd></div>
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

<section class="close">
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

  <div class="totals avoid-break">
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
    {{#flags.inclusive}}<p class="grand-note">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
  </div>
</section>

<section class="foot">
  {{#payment.hasInstructions}}
  <div class="foot-block avoid-break">
    <p class="foot-text">{{{payment.instructionsHtml}}}</p>
  </div>
  {{/payment.hasInstructions}}

  {{#hasNotes}}
  <div class="foot-block avoid-break">
    <p class="cap">{{labels.notes}}</p>
    <p class="foot-text">{{{notesHtml}}}</p>
  </div>
  {{/hasNotes}}
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
    <dl class="pay-rows">
      {{#payment.rows}}<div class="pay-row"><dt>{{label}}</dt><dd>{{value}}</dd></div>{{/payment.rows}}
    </dl>
    {{/payment.hasRows}}
    {{#payment.hasLink}}<p class="foot-text link">{{payment.link}}</p>{{/payment.hasLink}}
  </div>
</footer>
{{/payment.hasAccount}}
`
