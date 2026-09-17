/* Letterhead Note — the markup.

   An invoice written as a letter. It opens with the date and the addressee
   the way correspondence does, names its subject on one line, and closes
   with a signature rule over the sender's name.

   For the kind of work where the invoice goes to someone you have been
   talking to for weeks. A ruled grid is the wrong register for that; a
   letter is the right one.

   The salutation only prints when a contact name has been filled in — it is
   the person's own name or nothing at all, never "Dear Sir or Madam". */

export const html = `<header class="letterhead brand-rule rule-under">
  <div class="sender">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="sender-name">{{seller.name}}</p>
    <p class="sender-lines">
      {{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}
      {{#seller.hasEmail}}<span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span>{{/seller.hasEmail}}
      {{#seller.hasPhone}}<span>{{seller.phone}}</span>{{/seller.hasPhone}}
    </p>
  </div>
</header>

<section class="addressing avoid-break">
  <div class="addressee">
    <p class="addressee-name">{{buyer.name}}</p>
    {{#buyer.hasContactName}}<p>{{buyer.contactName}}</p>{{/buyer.hasContactName}}
    {{#buyer.addressLines}}<p>{{text}}</p>{{/buyer.addressLines}}
  </div>
  <p class="dateline">{{meta.issueDate}}</p>
</section>

<p class="subject">
  {{#hasTitle}}{{title}}{{/hasTitle}}
  {{^hasTitle}}{{heading}} {{meta.number}}{{/hasTitle}}
</p>

{{#buyer.hasContactName}}<p class="salutation">{{salutation}}</p>{{/buyer.hasContactName}}

<dl class="facts">
  <div class="fact"><dt>{{labels.number}}</dt><dd>{{meta.number}}</dd></div>
  <div class="fact"><dt>{{labels.issued}}</dt><dd>{{meta.issueDate}}</dd></div>
  {{#meta.hasDueDate}}<div class="fact"><dt>{{labels.due}}</dt><dd>{{meta.dueDate}}</dd></div>{{/meta.hasDueDate}}
  {{#meta.hasTerms}}<div class="fact"><dt>{{labels.terms}}</dt><dd>{{meta.terms}}</dd></div>{{/meta.hasTerms}}
  {{#meta.hasPurchaseOrder}}<div class="fact"><dt>{{labels.purchaseOrder}}</dt><dd>{{meta.purchaseOrder}}</dd></div>{{/meta.hasPurchaseOrder}}
  {{#seller.hasTaxIds}}{{#seller.taxIds}}<div class="fact"><dt>{{label}}</dt><dd>{{value}}</dd></div>{{/seller.taxIds}}{{/seller.hasTaxIds}}
</dl>

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
    <span class="grand-label">{{labels.amountDue}}</span>
    <span class="grand-value num">{{totals.amountDue}}</span>
  </div>
  {{#flags.inclusive}}<p class="grand-note">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
</section>

{{#hasNotes}}<p class="body-text">{{{notesHtml}}}</p>{{/hasNotes}}

{{#payment.hasInstructions}}
<p class="body-text avoid-break">{{{payment.instructionsHtml}}}</p>
{{/payment.hasInstructions}}

<section class="signoff avoid-break">
  <p class="closing">{{labels.signOff}}</p>
  <p class="signature-rule"></p>
  <p class="signature-name">{{seller.name}}</p>
</section>

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
`
