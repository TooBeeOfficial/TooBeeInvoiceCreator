/* VAT Statement — the markup.

   The layout for a taxable supply across a border. It differs from the other
   full templates in one substantial way: it prints a VAT analysis — for each
   rate charged, the net it was charged on and the tax that came to.

   That table is not decoration. A compliant VAT invoice in the EU and the UK
   has to show the taxable amount per rate, the rate itself, and the tax due,
   and an invoice that gives only a single combined figure is one an auditor
   will ask about. Both registration numbers are given their own line for the
   same reason.

   Every figure in it comes from the same calculation as the totals block, so
   the analysis and the amount due cannot disagree. */

export const html = `<header class="head brand-rule rule-under">
  <div class="from">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="from-name">{{seller.name}}</p>
    {{#seller.addressLines}}<p class="from-line">{{text}}</p>{{/seller.addressLines}}
    {{#seller.hasEmail}}<p class="from-line"><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></p>{{/seller.hasEmail}}
    {{#seller.hasPhone}}<p class="from-line">{{seller.phone}}</p>{{/seller.hasPhone}}
  </div>

  <div class="mark">
    <p class="doctype">{{heading}}</p>
    <table class="particulars">
      <tbody>
        <tr><th>{{labels.number}}</th><td class="num">{{meta.number}}</td></tr>
        <tr><th>{{labels.issued}}</th><td class="num">{{meta.issueDate}}</td></tr>
        {{#meta.hasSupplyDate}}<tr><th>{{labels.supplied}}</th><td class="num">{{meta.supplyDate}}</td></tr>{{/meta.hasSupplyDate}}
        {{#meta.hasDueDate}}<tr><th>{{labels.due}}</th><td class="num">{{meta.dueDate}}</td></tr>{{/meta.hasDueDate}}
        {{#meta.hasPurchaseOrder}}<tr><th>{{labels.purchaseOrder}}</th><td class="num">{{meta.purchaseOrder}}</td></tr>{{/meta.hasPurchaseOrder}}
        <tr><th>{{labels.currency}}</th><td class="num">{{currency.code}}</td></tr>
      </tbody>
    </table>
  </div>
</header>

<section class="parties avoid-break">
  <div class="party">
    <p class="cap">{{labels.from}}</p>
    <p class="party-name">{{seller.name}}</p>
    {{#seller.taxIds}}<p class="party-id"><span>{{label}}</span>{{value}}</p>{{/seller.taxIds}}
  </div>
  <div class="party">
    <p class="cap">{{labels.billTo}}</p>
    <p class="party-name">{{buyer.name}}</p>
    {{#buyer.hasContactName}}<p class="party-line">{{buyer.contactName}}</p>{{/buyer.hasContactName}}
    {{#buyer.addressLines}}<p class="party-line">{{text}}</p>{{/buyer.addressLines}}
    {{#buyer.taxIds}}<p class="party-id"><span>{{label}}</span>{{value}}</p>{{/buyer.taxIds}}
  </div>
</section>

{{#hasTitle}}<p class="doctitle">{{title}}</p>{{/hasTitle}}

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
  {{#totals.hasTax}}
  <div class="analysis avoid-break">
    <p class="cap">Tax analysis</p>
    <table class="vat">
      <thead>
        <tr>
          <th>{{labels.tax}}</th>
          <th class="num">Rate</th>
          <th class="num">Taxable</th>
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
  </div>
  {{/totals.hasTax}}

  <div class="totals avoid-break">
    {{#flags.showStamp}}<span class="paid-stamp">{{labels.paid}}</span>{{/flags.showStamp}}
    <dl class="total-rows">
      {{#totals.rows}}
      <div class="total-row"><dt>{{label}}</dt><dd class="num">{{value}}</dd></div>
      {{/totals.rows}}
    </dl>
    <div class="grand brand-rule rule-over rule-under">
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
