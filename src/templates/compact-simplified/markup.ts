/* Compact Simplified — the markup.

   The short form: the supplier, the date, what was sold, the rate of tax and
   the total including it. That is the whole of a simplified invoice in the
   UK for a retail sale under £250, and it is close enough to a receipt to
   serve over the counter anywhere else.

   Everything optional has been cut rather than hidden, so the sheet stays
   short. The buyer's block appears only when there is a buyer — a counter
   sale has nobody to address. */

export const html = `<header class="till brand-rule rule-under">
  <div class="till-house">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="house">{{seller.name}}</p>
    {{#seller.hasAddress}}
    <p class="house-lines">{{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}</p>
    {{/seller.hasAddress}}
    {{#seller.hasTaxIds}}
    <p class="house-lines">{{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}</p>
    {{/seller.hasTaxIds}}
    {{#seller.hasEmail}}<p class="house-lines"><span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span></p>{{/seller.hasEmail}}
  </div>
  <div class="till-mark">
    <p class="doctype">{{heading}}</p>
    <p class="till-number num">{{meta.number}}</p>
    <p class="till-date">{{meta.issueDate}}</p>
  </div>
</header>

{{#buyer.name}}
<section class="to avoid-break">
  <span class="cap">{{labels.billTo}}</span>
  <span class="to-name">{{buyer.name}}</span>
  {{#buyer.addressLines}}<span class="to-line">{{text}}</span>{{/buyer.addressLines}}
  {{#buyer.hasTaxIds}}{{#buyer.taxIds}}<span class="to-line">{{label}} {{value}}</span>{{/buyer.taxIds}}{{/buyer.hasTaxIds}}
</section>
{{/buyer.name}}

<ul class="tape">
  {{#lines}}
  <li class="tape-line">
    <span class="tape-desc">
      {{description}}
      {{#hasDetails}}<span class="tape-details">{{{detailsHtml}}}</span>{{/hasDetails}}
      <span class="tape-qty num">{{quantity}}{{#hasUnit}} {{unit}}{{/hasUnit}} × {{unitPrice}}{{#columns.tax}} · {{rate}}{{/columns.tax}}</span>
    </span>
    <span class="leader"></span>
    <span class="tape-amount num">{{amount}}</span>
  </li>
  {{/lines}}
</ul>

<section class="sum avoid-break">
  {{#totals.rows}}
  <p class="sum-row"><span>{{label}}</span><span class="leader"></span><span class="num">{{value}}</span></p>
  {{/totals.rows}}
  <p class="sum-total brand-rule rule-over">
    {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
    <span class="sum-total-label">{{labels.amountDue}}</span>
    <span class="sum-total-value num">{{totals.amountDue}}</span>
  </p>
  {{#flags.inclusive}}<p class="sum-note">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
</section>

{{#meta.hasDueDate}}
<p class="due-line"><span class="cap">{{labels.due}}</span> <span class="num">{{meta.dueDate}}</span>{{#meta.hasTerms}} · {{meta.terms}}{{/meta.hasTerms}}</p>
{{/meta.hasDueDate}}

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
    <p class="pay-rows">{{#payment.rows}}<span><em>{{label}}</em> {{value}}</span>{{/payment.rows}}</p>
    {{/payment.hasRows}}
    {{#payment.hasLink}}<p class="pay-link">{{payment.link}}</p>{{/payment.hasLink}}
  </div>
</footer>
{{/payment.hasAccount}}
`
