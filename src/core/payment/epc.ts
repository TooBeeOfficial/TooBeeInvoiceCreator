/* The payment code an invoice prints, as data.

   This is EPC069-12 — the SEPA Credit Transfer QR, known in German-speaking
   countries as the GiroCode and in the Netherlands and Belgium as the SEPA
   payment QR. Every major European banking app reads it: the customer points
   their phone at the invoice and the transfer form comes up already filled in
   with the payee, the IBAN, the amount and the reference. Nothing is typed,
   so nothing is mistyped, and the payment arrives quoting the reference that
   matches it to this invoice.

   The payload is eleven or twelve lines of plain text, in a fixed order, and
   the order is the whole format — there are no field names. Blank lines are
   how an optional field says it is absent, which is why the lines below are
   built positionally rather than pushed on when they have something in them.

   Two limits are the scheme's, not ours. The transfer is a SEPA credit
   transfer, so the amount can only ever be in euro: an invoice in another
   currency still gets a code, but without an amount in it, so the payer's app
   asks for the figure rather than being told the wrong one. And a name longer
   than 70 characters or a reference longer than 140 is cut, because a reader
   that hits the limit mid-field rejects the whole code. */

import type { InvoiceDoc } from '@model/invoice'
import type { Totals } from '@core/totals/calcTotals'
import { normalizeIban, isValidIban } from './iban'

/** Longest payload any reader has to accept, from the specification. */
export const EPC_MAX_BYTES = 331

const MAX_NAME = 70
const MAX_REMITTANCE = 140

export interface EpcRequest {
  /** Who is being paid. Falls back to the business name on the invoice. */
  name: string
  iban: string
  bic: string
  /** Minor units. Below one cent there is nothing to pay and no code. */
  amount: number
  currencyCode: string
  /** What the payer should quote, so the payment matches the invoice. */
  reference: string
}

/* What the invoice says about being paid, reduced to the six things a
   transfer needs. Kept separate from the payload below so the editor can ask
   whether a code is possible without building one. */
export function epcRequest (doc: InvoiceDoc, totals: Totals): EpcRequest {
  return {
    name: (doc.payment.accountName || doc.seller.name || '').trim(),
    iban: normalizeIban(doc.payment.iban),
    bic: (doc.payment.bic || '').replace(/\s/g, '').toUpperCase(),
    amount: totals.amountDue,
    currencyCode: doc.currency.code,
    reference: (doc.payment.reference || doc.meta.number || '').trim(),
  }
}

export type EpcProblem = 'no-iban' | 'bad-iban' | 'no-name' | 'nothing-due' | 'too-long'

/** Why no code can be printed, or null when one can. */
export function epcProblem (request: EpcRequest): EpcProblem | null {
  if (!request.iban) return 'no-iban'
  if (!isValidIban(request.iban)) return 'bad-iban'
  if (!request.name) return 'no-name'
  /* Asked before the payload is built, because a payload with nothing to pay
     is one `epcPayload` refuses to build — and the refusal would otherwise be
     reported here as a code that came out too long. */
  if (!isPayable(request.amount)) return 'nothing-due'
  const payload = epcPayload(request)
  if (!payload || byteLength(payload) > EPC_MAX_BYTES) return 'too-long'
  return null
}

/* One cent is the smallest transfer the scheme carries, so anything under it
   is nothing to pay: a paid invoice, a zero-total credit note, a draft with
   no lines on it yet. Such a code would scan — it would open a transfer form
   for the right account with the amount left blank — which is worse than no
   code at all, because it invites a payment against an invoice that is not
   asking for one. Checked in every currency: what the code can carry depends
   on the currency, whether anything is owed does not. */
function isPayable (minor: number): boolean {
  return Number.isFinite(minor) && minor >= 1
}

/* The payload itself, or null when the invoice has nothing to make one from.

   Version 002 rather than 001, because 001 requires a BIC and most domestic
   SEPA payments no longer have one to hand. Character set 1 is UTF-8, which
   is what the app has in memory and what the bytes below are encoded as. */
export function epcPayload (request: EpcRequest): string | null {
  const iban = normalizeIban(request.iban)
  const name = clip(request.name, MAX_NAME)
  if (!iban || !isValidIban(iban) || !name) return null
  /* Nothing owed, no code — the same rule the editor reports as
     'nothing-due', kept here as well so that every caller gets it. The
     printed invoice builds its code straight from this function. */
  if (!isPayable(request.amount)) return null

  const lines = [
    'BCD',
    '002',
    '1',
    'SCT',
    request.bic,
    name,
    iban,
    euroAmount(request.amount, request.currencyCode),
    /* Purpose code — a four-letter SEPA classification. Left empty: the
       codes that fit an invoice ("GDDS" for goods, "SCVE" for services)
       describe what was bought, which this cannot know, and a wrong one is
       worse than none. */
    '',
    /* Structured creditor reference (ISO 11649, "RF…") and free-text
       remittance are mutually exclusive — one of the two must be empty. The
       reference typed on an invoice is free text unless it announces itself
       as RF, so it is routed accordingly. */
    ...remittance(request.reference),
    /* The twelfth element — beneficiary-to-originator information, a note
       the payer sees in their banking app — is the one the specification
       lets a writer leave off entirely, and nothing on an invoice belongs
       there that is not already in the reference. Every element before it
       is written even when empty: they are positional, and a reader that
       counts lines has to find the reference where the reference goes. */
  ]

  const payload = lines.join('\n')
  return byteLength(payload) > EPC_MAX_BYTES ? null : payload
}

/* "EUR1234.56", or nothing at all.

   The scheme accepts euro only, between one cent and just under a billion.
   An invoice in sterling or dollars that quotes an IBAN still gets a code —
   the payee and the reference are the parts worth not mistyping — but the
   amount is left for the payer's app to ask for rather than stated in a
   currency the transfer cannot be made in. */
function euroAmount (minor: number, currencyCode: string): string {
  if (currencyCode !== 'EUR') return ''
  if (!Number.isFinite(minor) || minor < 1 || minor > 99999999999) return ''
  const major = Math.round(minor) / 100
  return `EUR${major.toFixed(2)}`
}

/* ISO 11649 structured references start with RF and two check digits, and go
   in their own field: a bank that gets one there passes it through the
   payment chain untouched, which is the entire point of having it. */
function remittance (reference: string): [string, string] {
  const text = clip(reference, MAX_REMITTANCE)
  if (!text) return ['', '']
  return /^RF\d{2}[A-Z0-9]{1,21}$/i.test(text.replace(/\s/g, ''))
    ? [text.replace(/\s/g, '').toUpperCase(), '']
    : ['', text]
}

/* Cut on characters but measured in bytes further up: the limits in the
   specification are character counts, and the payload ceiling is a byte
   count, so both are checked in their own terms. */
function clip (text: string, max: number): string {
  const value = (text || '').replace(/[\r\n]+/g, ' ').trim()
  return value.length > max ? value.slice(0, max).trim() : value
}

function byteLength (text: string): number {
  return new TextEncoder().encode(text).length
}
