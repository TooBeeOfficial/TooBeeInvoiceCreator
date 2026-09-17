/* Studio Bold — the markup.

   An editorial layout: the invoice number set as a headline across the top,
   the parties in a row of columns beneath it, and a table with no boxes at
   all. Made for studios and photographers, where the invoice is the last
   thing a client sees from you and may as well look like the rest of your
   work.

   The structure is the same as every other template here. Only the emphasis
   moves: type does the work that rules and fills do elsewhere. */

export const html = `<header class="head">
  <div class="headline">
    <p class="eyebrow">{{heading}}</p>
    <h1 class="number">{{meta.number}}</h1>
  </div>
  {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
</header>

{{#hasTitle}}<p class="subject">{{title}}</p>{{/hasTitle}}

<section class="columns avoid-break brand-rule rule-over">
  <div class="column">
    <p class="cap">{{labels.from}}</p>
    <p class="strong">{{seller.name}}</p>
    {{#seller.addressLines}}<p class="line">{{text}}</p>{{/seller.addressLines}}
    {{#seller.hasEmail}}<p class="line"><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></p>{{/seller.hasEmail}}
    {{#seller.hasPhone}}<p class="line">{{seller.phone}}</p>{{/seller.hasPhone}}
    {{#seller.taxIds}}<p class="line">{{label}} {{value}}</p>{{/seller.taxIds}}
  </div>

  <div class="column">
    <p class="cap">{{labels.billTo}}</p>
    <p class="strong">{{buyer.name}}</p>
    {{#buyer.hasContactName}}<p class="line">{{buyer.contactName}}</p>{{/buyer.hasContactName}}
    {{#buyer.addressLines}}<p class="line">{{text}}</p>{{/buyer.addressLines}}
    {{#buyer.hasEmail}}<p class="line"><a href="{{buyer.emailHref}}" target="_blank">{{buyer.email}}</a></p>{{/buyer.hasEmail}}
    {{#buyer.taxIds}}<p class="line">{{label}} {{value}}</p>{{/buyer.taxIds}}
  </div>

  <div class="column">
    <p class="cap">{{labels.issued}}</p>
    <p class="strong">{{meta.issueDate}}</p>
    {{#meta.hasDueDate}}
    <p class="cap cap-second">{{labels.due}}</p>
    <p class="strong">{{meta.dueDate}}</p>
    {{/meta.hasDueDate}}
    {{#meta.hasTerms}}<p class="line">{{meta.terms}}</p>{{/meta.hasTerms}}
    {{#meta.hasPurchaseOrder}}<p class="line">{{labels.purchaseOrder}} {{meta.purchaseOrder}}</p>{{/meta.hasPurchaseOrder}}
    {{#meta.hasReference}}<p class="line">{{labels.reference}} {{meta.reference}}</p>{{/meta.hasReference}}
  </div>
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

<section class="sum avoid-break">
  {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
  <dl class="sum-rows">
    {{#totals.rows}}
    <div class="sum-row"><dt>{{label}}</dt><dd class="num">{{value}}</dd></div>
    {{/totals.rows}}
  </dl>

  <div class="grand brand-rule rule-over">
    <p class="grand-label">{{labels.amountDue}}</p>
    <p class="grand-value num">{{totals.amountDue}}</p>
    {{#flags.inclusive}}<p class="grand-note">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
  </div>
</section>

<section class="foot">
  {{#payment.hasInstructions}}
  <div class="foot-block avoid-break">
    <p class="line">{{{payment.instructionsHtml}}}</p>
  </div>
  {{/payment.hasInstructions}}

  {{#hasNotes}}
  <div class="foot-block avoid-break">
    <p class="cap">{{labels.notes}}</p>
    <p class="line">{{{notesHtml}}}</p>
  </div>
  {{/hasNotes}}
</section>

{{#hasTerms}}
<section class="terms avoid-break">
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
    {{#payment.rows}}<p class="line"><span class="key">{{label}}</span>{{value}}</p>{{/payment.rows}}
    {{#payment.hasLink}}<p class="line link">{{payment.link}}</p>{{/payment.hasLink}}
  </div>
</footer>
{{/payment.hasAccount}}
`
