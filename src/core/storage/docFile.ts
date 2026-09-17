/* Reading and writing an invoice file.

   A document on disk outlives the build that wrote it, so everything coming
   back in is read field by field against a known-good default rather than
   trusted wholesale. A file written by an older version opens with its
   missing fields filled in; a file that has been hand-edited into nonsense
   opens as far as it can rather than crashing the app that was asked to
   show it.

   That field-by-field defaulting *is* the migration strategy, and there is no
   other one. A field added to the format reads as its default out of every
   file written before it existed, which is what "an older file still opens"
   means here. The `version` on the document is therefore decorative: it would
   only start being read on a change that defaulting cannot absorb — a field
   that changed meaning rather than one that appeared — and that change would
   be the thing that bumps it. */

import type { InvoiceDoc, InvoiceSettings, PaymentRecord } from '@model/invoice'
import type { Preferences } from '@model/prefs'
import type { Party, PostalAddress } from '@model/party'
import type { LineItem } from '@model/lineItem'
import type { TaxLine } from '@model/tax'
import { emptyParty } from '@model/party'
import { currencyByCode } from '@model/money'
import { DEFAULT_THEME } from '@model/theme'
import { makeId } from '@core/ids'
import { newInvoice } from '@core/factory/newInvoice'
import { defaultPreferences } from '@core/factory/defaults'

export const serializeDoc = (doc: InvoiceDoc): string => JSON.stringify(doc, null, 2)

export class InvoiceFileError extends Error {}

export function parseDoc (text: string, prefs: Preferences = defaultPreferences()): InvoiceDoc {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new InvoiceFileError('That file is not an invoice this app can read.')
  }
  if (!raw || typeof raw !== 'object') {
    throw new InvoiceFileError('That file is not an invoice this app can read.')
  }
  return normalizeDoc(raw as Partial<InvoiceDoc>, prefs)
}

export function normalizeDoc (input: Partial<InvoiceDoc>, prefs: Preferences): InvoiceDoc {
  const base = newInvoice(prefs)
  const settings = mergeSettings(base.settings, input.settings)

  return {
    version: 1,
    id: str(input.id) || base.id,
    title: str(input.title),
    meta: {
      number: str(input.meta?.number),
      issueDate: str(input.meta?.issueDate) || base.meta.issueDate,
      dueDate: str(input.meta?.dueDate),
      terms: str(input.meta?.terms),
      termsDays: numOrNull(input.meta?.termsDays),
      purchaseOrder: str(input.meta?.purchaseOrder),
      reference: str(input.meta?.reference),
      supplyDate: str(input.meta?.supplyDate),
      status: oneOf(input.meta?.status, ['draft', 'sent', 'paid', 'void'] as const, 'draft'),
      paidDate: str(input.meta?.paidDate),
    },
    seller: mergeParty(input.seller, 'seller'),
    buyer: mergeParty(input.buyer, 'buyer'),
    currency: input.currency?.code
      ? { ...currencyByCode(input.currency.code), ...input.currency }
      : base.currency,
    settings,
    lines: mergeLines(input.lines, settings),
    payment: { ...base.payment, ...(input.payment ?? {}) },
    paymentsReceived: mergePayments(input.paymentsReceived),
    notes: str(input.notes),
    terms: str(input.terms),
    branding: {
      logoDataUrl: str(input.branding?.logoDataUrl),
      logoName: str(input.branding?.logoName),
    },
    theme: { ...DEFAULT_THEME, ...(input.theme ?? {}) },
    customHtml: typeof input.customHtml === 'string' ? input.customHtml : null,
    customCss: typeof input.customCss === 'string' ? input.customCss : null,
  }
}

function mergeSettings (base: InvoiceSettings, input?: Partial<InvoiceSettings>): InvoiceSettings {
  if (!input) return base
  return {
    ...base,
    ...input,
    defaultTax: mergeTax(input.defaultTax) ?? base.defaultTax,
    discount: { ...base.discount, ...(input.discount ?? {}) },
    taxMode: oneOf(input.taxMode, ['invoice', 'line', 'multi'] as const, base.taxMode),
    paper: oneOf(input.paper, ['A4', 'Letter', 'Legal', 'A5'] as const, base.paper),
    orientation: oneOf(input.orientation, ['portrait', 'landscape'] as const, base.orientation),
    detail: oneOf(input.detail, ['full', 'simple'] as const, base.detail),
  }
}

function mergeParty (input: Partial<Party> | undefined, id: string): Party {
  const base = emptyParty(id)
  if (!input) return base
  const address: PostalAddress = { ...base.address, ...(input.address ?? {}) }
  return {
    ...base,
    ...input,
    id: str(input.id) || id,
    address,
    taxIds: Array.isArray(input.taxIds)
      ? input.taxIds
          .filter((t) => t && typeof t === 'object')
          .map((t) => ({ label: str(t.label), value: str(t.value) }))
      : [],
  }
}

/* No payments is the honest reading of a file written before they existed:
   the invoice does not claim anything about what arrived, which is different
   from claiming that nothing did. */
function mergePayments (input: unknown): PaymentRecord[] {
  if (!Array.isArray(input)) return []
  return input.map((raw) => {
    const record = (raw ?? {}) as Partial<PaymentRecord>
    return {
      id: str(record.id) || makeId('pay'),
      date: str(record.date),
      amount: num(record.amount, 0),
      method: str(record.method),
      reference: str(record.reference),
      note: str(record.note),
    }
  })
}

function mergeLines (input: unknown, settings: InvoiceSettings): LineItem[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [{
      id: makeId('line'),
      description: '',
      details: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      discount: null,
      taxes: settings.taxMode === 'invoice' ? [] : [{ ...settings.defaultTax, id: makeId('tax') }],
    }]
  }
  return input.map((raw) => {
    const line = (raw ?? {}) as Partial<LineItem>
    return {
      id: str(line.id) || makeId('line'),
      description: str(line.description),
      details: str(line.details),
      quantity: num(line.quantity, 1),
      unit: str(line.unit),
      unitPrice: num(line.unitPrice, 0),
      discount: line.discount && typeof line.discount === 'object'
        ? {
            type: line.discount.type === 'amount' ? 'amount' : 'percent',
            value: num(line.discount.value, 0),
          }
        : null,
      taxes: Array.isArray(line.taxes)
        ? line.taxes.map((t) => mergeTax(t)).filter((t): t is TaxLine => !!t)
        : [],
    }
  })
}

function mergeTax (input: Partial<TaxLine> | undefined): TaxLine | null {
  if (!input || typeof input !== 'object') return null
  return {
    id: str(input.id) || makeId('tax'),
    label: str(input.label),
    rate: num(input.rate, 0),
    ...(input.exempt ? { exempt: true } : {}),
  }
}

/* ------------------------------------------------------------- readers */

const str = (value: unknown): string => (typeof value === 'string' ? value : '')

const num = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const numOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function oneOf<T extends string> (value: unknown, allowed: ReadonlyArray<T>, fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}
