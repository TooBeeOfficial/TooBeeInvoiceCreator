/* Plain Slip — the markup.

   The least a receipt can be and still be one: who was paid, when, what for,
   how much. Every block is a paragraph rather than a box, and the only rule
   on the sheet sits above the total, because that is the one place the eye
   has to be told to stop.

   The lines are a table for the sake of a screen reader and for the column
   of figures staying a column — not for any border, of which it has none. */

export const html = `<header class="top">
  <div class="who">
    {{#logo.has}}<img class="mark" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="name">{{seller.name}}</p>
    {{#seller.hasAddress}}
    <p class="quiet">{{#seller.addressLines}}<span>{{text}}</span>{{/seller.addressLines}}</p>
    {{/seller.hasAddress}}
    {{#seller.hasEmail}}<p class="quiet"><span><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></span></p>{{/seller.hasEmail}}
    {{#seller.hasTaxIds}}
    <p class="quiet">{{#seller.taxIds}}<span>{{label}} {{value}}</span>{{/seller.taxIds}}</p>
    {{/seller.hasTaxIds}}
  </div>

  <div class="ref">
    <p class="kind">{{heading}}</p>
    <p class="no num">{{meta.number}}</p>
    <p class="quiet on">{{meta.issueDate}}</p>
  </div>
</header>

{{#buyer.name}}
<p class="for"><span class="label">{{labels.billTo}}</span> {{buyer.name}}</p>
{{/buyer.name}}

<table class="lines">
  <tbody>
    {{#lines}}
    <tr>
      <td class="what">
        <span class="what-desc">{{description}}</span>
        {{#hasDetails}}<span class="quiet">{{{detailsHtml}}}</span>{{/hasDetails}}
        <span class="quiet num">{{quantity}}{{#hasUnit}} {{unit}}{{/hasUnit}} &times; {{unitPrice}}{{#columns.tax}} &middot; {{rate}}{{/columns.tax}}</span>
      </td>
      <td class="much num">{{amount}}</td>
    </tr>
    {{/lines}}
  </tbody>
</table>

<div class="close avoid-break">
  <table class="sums">
    <tbody>
      {{#totals.rows}}
      <tr><th>{{label}}</th><td class="num">{{value}}</td></tr>
      {{/totals.rows}}
      <tr class="grand brand-rule rule-over">
        <th>{{labels.amountDue}}</th>
        <td class="num">{{totals.amountDue}}</td>
      </tr>
    </tbody>
  </table>
  {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
</div>

{{#flags.inclusive}}<p class="quiet after">{{labels.taxIncluded}}</p>{{/flags.inclusive}}
{{#meta.hasDueDate}}
<p class="quiet after">{{labels.due}} {{meta.dueDate}}{{#meta.hasTerms}} &middot; {{meta.terms}}{{/meta.hasTerms}}</p>
{{/meta.hasDueDate}}

{{#payment.hasInstructions}}
<p class="quiet after avoid-break">{{{payment.instructionsHtml}}}</p>
{{/payment.hasInstructions}}

{{#hasNotes}}<p class="quiet after">{{{notesHtml}}}</p>{{/hasNotes}}

{{#payment.hasAccount}}
<footer class="sheet-foot">
  {{#payment.qr.has}}
  <figure class="pay-qr">
    <img src="{{payment.qr.src}}" alt="{{payment.qr.alt}}">
    <figcaption>{{payment.qr.caption}}</figcaption>
  </figure>
  {{/payment.qr.has}}
  <div class="pay-details">
    <p class="label">{{labels.payment}}</p>
    {{#payment.hasRows}}
    <p class="pay-rows">{{#payment.rows}}<span><em>{{label}}</em>{{value}}</span>{{/payment.rows}}</p>
    {{/payment.hasRows}}
    {{#payment.hasLink}}<p class="quiet link">{{payment.link}}</p>{{/payment.hasLink}}
  </div>
</footer>
{{/payment.hasAccount}}
`
