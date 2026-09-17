/* Till Roll — the markup.

   A receipt shaped like the one that comes out of a till: everything in one
   narrow column, the shop's name centred at the top, each line of the sale
   written over two lines rather than squeezed into columns that a 58mm
   printer would never have had room for.

   Nothing here is arranged left and right except the figures. That is the
   whole discipline of the layout — a column of words down the left and a
   column of money down the right, and no third thing competing with them. */

export const html = `<header class="head">
  {{#logo.has}}<img class="mark" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
  <p class="shop">{{seller.name}}</p>
  {{#seller.hasAddress}}
  <p class="shop-lines">{{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}</p>
  {{/seller.hasAddress}}
  {{#seller.hasPhone}}<p class="shop-lines"><span>{{seller.phone}}</span></p>{{/seller.hasPhone}}
  {{#seller.hasTaxIds}}
  <p class="shop-lines">{{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}</p>
  {{/seller.hasTaxIds}}
</header>

<p class="kind brand-rule rule-over rule-under">{{heading}}</p>

<dl class="stub">
  <div class="stub-row"><dt>{{labels.number}}</dt><dd class="num">{{meta.number}}</dd></div>
  <div class="stub-row"><dt>{{labels.issued}}</dt><dd class="num">{{meta.issueDate}}</dd></div>
  {{#meta.hasDueDate}}<div class="stub-row"><dt>{{labels.due}}</dt><dd class="num">{{meta.dueDate}}</dd></div>{{/meta.hasDueDate}}
  {{#buyer.name}}<div class="stub-row"><dt>{{labels.billTo}}</dt><dd>{{buyer.name}}</dd></div>{{/buyer.name}}
</dl>

<ul class="sale">
  {{#lines}}
  <li class="sold">
    <p class="sold-what">{{description}}</p>
    {{#hasDetails}}<p class="sold-note">{{{detailsHtml}}}</p>{{/hasDetails}}
    <p class="sold-figures">
      <span class="sold-each num">{{quantity}}{{#hasUnit}} {{unit}}{{/hasUnit}} &times; {{unitPrice}}{{#columns.tax}} &middot; {{rate}}{{/columns.tax}}</span>
      <span class="sold-amount num">{{amount}}</span>
    </p>
  </li>
  {{/lines}}
</ul>

<dl class="sums brand-rule rule-over">
  {{#totals.rows}}
  <div class="sum-row"><dt>{{label}}</dt><dd class="num">{{value}}</dd></div>
  {{/totals.rows}}
</dl>

<p class="grand brand-rule rule-over">
  {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
  <span class="grand-label">{{labels.amountDue}}</span>
  <span class="grand-value num">{{totals.amountDue}}</span>
</p>

{{#flags.inclusive}}<p class="aside">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
{{#meta.hasTerms}}<p class="aside">{{meta.terms}}</p>{{/meta.hasTerms}}

{{#payment.hasInstructions}}
<p class="aside avoid-break">{{{payment.instructionsHtml}}}</p>
{{/payment.hasInstructions}}

{{#hasNotes}}<p class="aside foot">{{{notesHtml}}}</p>{{/hasNotes}}

{{#payment.hasAccount}}
<section class="pay avoid-break">
  <p class="kind brand-rule rule-over rule-under">{{labels.payment}}</p>
  {{#payment.hasRows}}
  <dl class="stub">
    {{#payment.rows}}<div class="stub-row"><dt>{{label}}</dt><dd class="num">{{value}}</dd></div>{{/payment.rows}}
  </dl>
  {{/payment.hasRows}}
  {{#payment.hasLink}}<p class="aside link">{{payment.link}}</p>{{/payment.hasLink}}
  {{#payment.qr.has}}
  <figure class="pay-qr">
    <img src="{{payment.qr.src}}" alt="{{payment.qr.alt}}">
    <figcaption>{{payment.qr.caption}}</figcaption>
  </figure>
  {{/payment.qr.has}}
</section>
{{/payment.hasAccount}}
`
