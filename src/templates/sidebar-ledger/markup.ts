/* Sidebar Ledger — the markup.

   Everything that stays the same from one invoice to the next — who you are,
   how to reach you, how to pay you — goes down a coloured band on the left.
   What changes gets the whole of the main column: the client, the work, the
   figures.

   It reads well because it separates the two things a reader does with an
   invoice. They check who it is from once, and then they spend their time in
   the table. */

export const html = `<div class="layout">
  <aside class="rail avoid-break">
    {{#logo.has}}<img class="logo" src="{{logo.src}}" alt="{{seller.name}}">{{/logo.has}}
    <p class="rail-name">{{seller.name}}</p>

    {{#seller.hasAddress}}
    <div class="rail-block">
      {{#seller.addressLines}}<p class="rail-line">{{text}}</p>{{/seller.addressLines}}
    </div>
    {{/seller.hasAddress}}

    <div class="rail-block">
      {{#seller.hasEmail}}<p class="rail-line"><a href="{{seller.emailHref}}" target="_blank">{{seller.email}}</a></p>{{/seller.hasEmail}}
      {{#seller.hasPhone}}<p class="rail-line">{{seller.phone}}</p>{{/seller.hasPhone}}
      {{#seller.hasWebsite}}<p class="rail-line">{{seller.website}}</p>{{/seller.hasWebsite}}
    </div>

    {{#seller.hasTaxIds}}
    <div class="rail-block">
      {{#seller.taxIds}}<p class="rail-line"><span class="rail-key">{{label}}</span>{{value}}</p>{{/seller.taxIds}}
    </div>
    {{/seller.hasTaxIds}}

    {{#payment.hasAccount}}
    <div class="rail-block rail-pay">
      <p class="rail-cap">{{labels.payment}}</p>
      {{#payment.rows}}<p class="rail-line"><span class="rail-key">{{label}}</span>{{value}}</p>{{/payment.rows}}
      {{#payment.hasLink}}<p class="rail-line">{{payment.link}}</p>{{/payment.hasLink}}
      {{#payment.qr.has}}
      <figure class="pay-qr">
        <img src="{{payment.qr.src}}" alt="{{payment.qr.alt}}">
        <figcaption>{{payment.qr.caption}}</figcaption>
      </figure>
      {{/payment.qr.has}}
    </div>
    {{/payment.hasAccount}}
  </aside>

  <main class="main">
    <header class="head brand-rule rule-under">
      <div>
        <p class="doctype">{{heading}}</p>
        <p class="docnumber">{{meta.number}}</p>
        {{#hasTitle}}<p class="doctitle">{{title}}</p>{{/hasTitle}}
      </div>
      <dl class="dates">
        <div class="date"><dt>{{labels.issued}}</dt><dd>{{meta.issueDate}}</dd></div>
        {{#meta.hasDueDate}}<div class="date"><dt>{{labels.due}}</dt><dd>{{meta.dueDate}}</dd></div>{{/meta.hasDueDate}}
        {{#meta.hasTerms}}<div class="date"><dt>{{labels.terms}}</dt><dd>{{meta.terms}}</dd></div>{{/meta.hasTerms}}
        {{#meta.hasPurchaseOrder}}<div class="date"><dt>{{labels.purchaseOrder}}</dt><dd>{{meta.purchaseOrder}}</dd></div>{{/meta.hasPurchaseOrder}}
        {{#meta.hasReference}}<div class="date"><dt>{{labels.reference}}</dt><dd>{{meta.reference}}</dd></div>{{/meta.hasReference}}
      </dl>
    </header>

    <section class="billed avoid-break">
      <p class="cap">{{labels.billTo}}</p>
      <p class="billed-name">{{buyer.name}}</p>
      {{#buyer.hasContactName}}<p class="billed-line">{{buyer.contactName}}</p>{{/buyer.hasContactName}}
      {{#buyer.addressLines}}<p class="billed-line">{{text}}</p>{{/buyer.addressLines}}
      {{#buyer.hasEmail}}<p class="billed-line"><a href="{{buyer.emailHref}}" target="_blank">{{buyer.email}}</a></p>{{/buyer.hasEmail}}
      {{#buyer.taxIds}}<p class="billed-line">{{label}} {{value}}</p>{{/buyer.taxIds}}
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

    <section class="totals avoid-break">
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
    </section>

    {{#payment.hasInstructions}}
    <p class="note-text avoid-break">{{{payment.instructionsHtml}}}</p>
    {{/payment.hasInstructions}}

    {{#hasNotes}}
    <section class="note avoid-break">
      <p class="cap">{{labels.notes}}</p>
      <p class="note-text">{{{notesHtml}}}</p>
    </section>
    {{/hasNotes}}

    {{#hasTerms}}
    <section class="terms avoid-break">
      <p class="cap">{{labels.conditions}}</p>
      <p class="terms-text">{{{termsHtml}}}</p>
    </section>
    {{/hasTerms}}
  </main>
</div>
`
