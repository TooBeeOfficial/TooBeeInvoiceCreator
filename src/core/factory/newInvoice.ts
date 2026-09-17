/* Starting a new invoice.

   A new document inherits from preferences — your details, your numbering,
   your usual currency and terms — and then belongs entirely to itself. Later
   changes to preferences never reach back into an invoice already written,
   because what you charged in March should not move when you change your
   defaults in June. */

import type { InvoiceDoc, InvoiceSettings } from '@model/invoice'
import type { Preferences } from '@model/prefs'
import type { Party } from '@model/party'
import { emptyParty } from '@model/party'
import { emptyLine } from '@model/lineItem'
import { currencyByCode } from '@model/money'
import { DEFAULT_THEME } from '@model/theme'
import { makeId } from '@core/ids'
import { addDays, todayIso } from '@core/money/format'
import { nextNumber } from '@core/numbering/numbering'
import { getTemplate } from '@templates/registry'

export interface NewInvoiceOptions {
  templateId?: string
  /** Bill someone from the client book straight away. */
  buyer?: Party
  /** Copy everything but the identity of an existing invoice. */
  basedOn?: InvoiceDoc
}

export function newInvoice (prefs: Preferences, options: NewInvoiceOptions = {}): InvoiceDoc {
  const defaults = prefs.defaults
  const templateId = options.templateId ?? options.basedOn?.settings.templateId ?? defaults.templateId
  const template = getTemplate(templateId)
  const issueDate = todayIso()
  const taxId = makeId('tax')

  const settings: InvoiceSettings = {
    templateId: template.id,
    paper: defaults.paper,
    orientation: template.page.orientation,
    detail: template.detail,
    locale: defaults.locale,
    taxMode: defaults.taxMode,
    defaultTax: { id: taxId, label: defaults.taxLabel, rate: defaults.taxRate },
    pricesIncludeTax: defaults.pricesIncludeTax,
    discount: { type: 'none', value: 0, label: 'Discount' },
    shipping: 0,
    shippingLabel: 'Shipping',
    shippingTaxable: true,
    showUnit: false,
    showDiscountColumn: false,
    showTaxColumn: false,
    showLineNumbers: false,
    roundTotal: false,
  }

  const base: InvoiceDoc = {
    version: 1,
    id: makeId('inv'),
    title: '',
    meta: {
      number: nextNumber(prefs.numbering),
      issueDate,
      dueDate: defaults.termsDays > 0 ? addDays(issueDate, defaults.termsDays) : issueDate,
      terms: defaults.terms,
      termsDays: defaults.termsDays,
      purchaseOrder: '',
      reference: '',
      supplyDate: '',
      status: 'draft',
      paidDate: '',
    },
    seller: cloneParty(prefs.seller, 'seller'),
    buyer: options.buyer ? cloneParty(options.buyer, 'buyer') : emptyParty('buyer'),
    currency: currencyByCode(defaults.currencyCode),
    settings,
    lines: [emptyLine(makeId('line'), lineTaxes(settings))],
    payment: {
      instructions: defaults.paymentInstructions,
      bankName: '',
      accountName: '',
      iban: '',
      bic: '',
      accountNumber: '',
      sortCode: '',
      routingNumber: '',
      link: '',
      reference: '',
      showQr: true,
    },
    paymentsReceived: [],
    notes: defaults.notes,
    terms: '',
    branding: { logoDataUrl: '', logoName: '' },
    theme: { ...DEFAULT_THEME, ...template.theme },
    customHtml: null,
    customCss: null,
  }

  if (!options.basedOn) return base

  /* A copy keeps the work and drops everything that identified the original:
     its id, its number, its dates and whether it was ever paid. The payments
     are part of that last one — they belong to the invoice that was settled,
     never to the new one — so they are simply not carried over below. */
  const source = options.basedOn
  return {
    ...base,
    title: source.title,
    seller: cloneParty(source.seller, 'seller'),
    buyer: cloneParty(source.buyer, 'buyer'),
    currency: { ...source.currency },
    settings: { ...source.settings, templateId: template.id },
    lines: source.lines.map((line) => ({
      ...line,
      id: makeId('line'),
      taxes: line.taxes.map((t) => ({ ...t, id: makeId('tax') })),
    })),
    payment: { ...source.payment },
    notes: source.notes,
    terms: source.terms,
    branding: { ...source.branding },
    theme: { ...source.theme },
    customHtml: source.customHtml,
    customCss: source.customCss,
  }
}

function lineTaxes (settings: InvoiceSettings) {
  if (settings.taxMode === 'invoice') return []
  return settings.defaultTax ? [{ ...settings.defaultTax, id: makeId('tax') }] : []
}

/* Parties are copied, never shared. A client in the book and the client on
   an invoice are two different things: correcting a typo in the book must
   not silently rewrite an invoice that was sent last month. */
export function cloneParty (party: Party, id: string): Party {
  return {
    ...party,
    id,
    address: { ...party.address },
    taxIds: party.taxIds.map((t) => ({ ...t })),
  }
}
