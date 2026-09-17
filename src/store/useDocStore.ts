/* The invoice being worked on.

   One document is open at a time, and this holds it along with where it came
   from, whether it has unsaved changes, and enough history to undo. Every
   edit in the app goes through an action here; no component reaches into the
   document and changes it in place.

   History coalesces by key, so typing a client's name is one undo step and
   not forty. A change with no key — adding a line, switching template —
   always starts a new step, because those are the moments someone means to
   be able to take back. */

import { create } from 'zustand'
import type { InvoiceDoc, InvoiceMeta, InvoiceSettings, InvoiceStatus, PaymentDetails, PaymentRecord, Branding } from '@model/invoice'
import type { InvoiceTheme } from '@model/theme'
import type { Party, PostalAddress, TaxIdentifier } from '@model/party'
import type { LineItem } from '@model/lineItem'
import type { SavedItem } from '@model/savedItem'
import type { TaxLine } from '@model/tax'
import type { Preferences } from '@model/prefs'
import { DEFAULT_THEME } from '@model/theme'
import { currencyByCode } from '@model/money'
import { emptyLine } from '@model/lineItem'
import { makeId } from '@core/ids'
import { newInvoice } from '@core/factory/newInvoice'
import type { NewInvoiceOptions } from '@core/factory/newInvoice'
import { getTemplate } from '@templates/registry'
import { calcTotals } from '@core/totals/calcTotals'
import { reconcile } from '@core/status/status'
import { addDays, todayIso } from '@core/money/format'
import { defaultPreferences } from '@core/factory/defaults'

const HISTORY_LIMIT = 80
const COALESCE_MS = 700

export type PartySide = 'seller' | 'buyer'

interface DocState {
  doc: InvoiceDoc
  filePath: string | null
  dirty: boolean
  past: InvoiceDoc[]
  future: InvoiceDoc[]
  /** The coalescing key and time of the last edit. */
  lastKey: string | null
  lastAt: number

  /* lifecycle */
  start: (prefs: Preferences, options?: NewInvoiceOptions) => InvoiceDoc
  adopt: (doc: InvoiceDoc, filePath: string | null) => void
  markSaved: (filePath: string) => void

  /* history */
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  /* document */
  setField: (field: 'title' | 'notes' | 'terms', value: string) => void
  patchMeta: (patch: Partial<InvoiceMeta>, key?: string) => void
  setStatus: (status: InvoiceStatus) => void
  setTermsDays: (days: number | null) => void
  patchSettings: (patch: Partial<InvoiceSettings>, key?: string) => void
  patchPayment: (patch: Partial<PaymentDetails>, key?: string) => void
  patchBranding: (patch: Partial<Branding>) => void
  patchTheme: (patch: Partial<InvoiceTheme>, key?: string) => void
  resetTheme: () => void
  setCurrency: (code: string) => void
  setTemplate: (templateId: string) => void
  setCustomHtml: (html: string | null) => void
  setCustomCss: (css: string | null) => void

  /* parties */
  patchParty: (side: PartySide, patch: Partial<Party>, key?: string) => void
  patchAddress: (side: PartySide, patch: Partial<PostalAddress>, key?: string) => void
  setTaxIds: (side: PartySide, taxIds: TaxIdentifier[], key?: string) => void
  useParty: (side: PartySide, party: Party) => void

  /* lines */
  addLine: () => string
  /** Puts a catalogue item on the invoice as a new line. */
  addLineFromItem: (item: SavedItem) => void
  /** Appends imported lines, replacing a single empty starter line. */
  addLines: (lines: LineItem[]) => void
  patchLine: (id: string, patch: Partial<LineItem>, key?: string) => void
  setLineTaxes: (id: string, taxes: TaxLine[]) => void
  removeLine: (id: string) => void
  duplicateLine: (id: string) => void
  moveLine: (id: string, direction: -1 | 1) => void

  /** Records money that has arrived, prefilled with what is outstanding. */
  addPaymentReceived: () => string
  patchPaymentReceived: (id: string, patch: Partial<PaymentRecord>, key?: string) => void
  removePaymentReceived: (id: string) => void
}

export const useDocStore = create<DocState>((set, get) => {
  /* One way in. Everything above is a thin wrapper around this. */
  const commit = (next: InvoiceDoc, key?: string) => {
    const state = get()
    const now = Date.now()
    const coalesce = !!key && state.lastKey === key && now - state.lastAt < COALESCE_MS

    const past = coalesce
      ? state.past
      : [...state.past, state.doc].slice(-HISTORY_LIMIT)

    set({
      doc: next,
      past,
      future: [],
      dirty: true,
      lastKey: key ?? null,
      lastAt: now,
    })
  }

  const edit = (mutate: (doc: InvoiceDoc) => InvoiceDoc, key?: string) => commit(mutate(get().doc), key)

  const partyEdit = (side: PartySide, party: Party): ((doc: InvoiceDoc) => InvoiceDoc) =>
    (doc) => ({ ...doc, [side]: party } as InvoiceDoc)

  return {
    doc: newInvoice(defaultPreferences()),
    filePath: null,
    dirty: false,
    past: [],
    future: [],
    lastKey: null,
    lastAt: 0,

    start: (prefs, options) => {
      const doc = newInvoice(prefs, options)
      set({ doc, filePath: null, dirty: false, past: [], future: [], lastKey: null, lastAt: 0 })
      return doc
    },

    adopt: (doc, filePath) => {
      set({ doc, filePath, dirty: false, past: [], future: [], lastKey: null, lastAt: 0 })
    },

    markSaved: (filePath) => set({ filePath, dirty: false }),

    undo: () => {
      const { past, doc, future } = get()
      if (past.length === 0) return
      const previous = past[past.length - 1]
      set({
        doc: previous,
        past: past.slice(0, -1),
        future: [doc, ...future].slice(0, HISTORY_LIMIT),
        dirty: true,
        lastKey: null,
      })
    },

    redo: () => {
      const { past, doc, future } = get()
      if (future.length === 0) return
      set({
        doc: future[0],
        past: [...past, doc].slice(-HISTORY_LIMIT),
        future: future.slice(1),
        dirty: true,
        lastKey: null,
      })
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    /* ------------------------------------------------------- document */

    setField: (field, value) => edit((doc) => ({ ...doc, [field]: value }), `field:${field}`),

    patchMeta: (patch, key) => edit((doc) => ({ ...doc, meta: { ...doc.meta, ...patch } }), key),

    /* Setting the status by hand is still allowed — an invoice can be marked
       paid without itemising what arrived — but the paid date is worked out
       from the payments when there are any, so the two cannot disagree. */
    setStatus: (status) => edit((doc) => {
      const marked = { ...doc.meta, status, paidDate: status === 'paid' ? doc.meta.paidDate : '' }
      const settled = reconcile(marked, doc.paymentsReceived, calcTotals(doc).total)
      return {
        ...doc,
        meta: {
          ...marked,
          ...settled,
          paidDate: status === 'paid' ? (settled.paidDate || todayIso()) : settled.paidDate,
        },
      }
    }),

    /* Terms and the due date are two views of one decision, so setting the
       terms moves the date with them. Editing the date directly loosens the
       tie instead of fighting it: the terms then say what was typed. */
    setTermsDays: (days) => edit((doc) => ({
      ...doc,
      meta: {
        ...doc.meta,
        termsDays: days,
        dueDate: days === null ? doc.meta.dueDate : addDays(doc.meta.issueDate, days),
        terms: days === null ? doc.meta.terms : days === 0 ? 'Due on receipt' : `Net ${days}`,
      },
    })),

    patchSettings: (patch, key) => edit((doc) => ({ ...doc, settings: { ...doc.settings, ...patch } }), key),

    patchPayment: (patch, key) => edit((doc) => ({ ...doc, payment: { ...doc.payment, ...patch } }), key),

    patchBranding: (patch) => edit((doc) => ({ ...doc, branding: { ...doc.branding, ...patch } })),

    patchTheme: (patch, key) => edit((doc) => ({ ...doc, theme: { ...doc.theme, ...patch } }), key),

    resetTheme: () => edit((doc) => ({
      ...doc,
      theme: { ...DEFAULT_THEME, ...getTemplate(doc.settings.templateId).theme },
    })),

    setCurrency: (code) => edit((doc) => ({ ...doc, currency: currencyByCode(code) })),

    /* Switching template brings its type, colour and spacing with it: a
       layout and the setting it was drawn for are one decision. Anything
       typed into the document is untouched.

       How much detail prints is deliberately not part of that. It is a
       decision about the transaction — whether this is a full invoice or a
       receipt — not about the layout, and having it reset every time
       someone tried a different template would be a setting that quietly
       undoes itself. A template's own `detail` is the starting value for a
       new invoice and nothing more. */
    setTemplate: (templateId) => edit((doc) => {
      const template = getTemplate(templateId)
      return {
        ...doc,
        settings: {
          ...doc.settings,
          templateId: template.id,
          orientation: template.page.orientation,
        },
        theme: { ...DEFAULT_THEME, ...template.theme },
        /* A template the user had rewritten cannot follow them to a new
           layout — its markup describes the old one. */
        customHtml: null,
        customCss: null,
      }
    }),

    setCustomHtml: (customHtml) => edit((doc) => ({ ...doc, customHtml }), 'custom:html'),
    setCustomCss: (customCss) => edit((doc) => ({ ...doc, customCss }), 'custom:css'),

    /* --------------------------------------------------------- parties */

    patchParty: (side, patch, key) =>
      edit((doc) => partyEdit(side, { ...doc[side], ...patch })(doc), key),

    patchAddress: (side, patch, key) =>
      edit((doc) => partyEdit(side, { ...doc[side], address: { ...doc[side].address, ...patch } })(doc), key),

    setTaxIds: (side, taxIds, key) =>
      edit((doc) => partyEdit(side, { ...doc[side], taxIds })(doc), key),

    useParty: (side, party) =>
      edit((doc) => partyEdit(side, { ...party, id: side, address: { ...party.address }, taxIds: party.taxIds.map((t) => ({ ...t })) })(doc)),

    /* ----------------------------------------------------------- lines */

    addLine: () => {
      const id = makeId('line')
      edit((doc) => ({
        ...doc,
        lines: [...doc.lines, emptyLine(id, newLineTaxes(doc))],
      }))
      return id
    },

    /* A catalogue item is copied onto the invoice, never linked to it: the
       price you charged in March must not move when you put the price up in
       June. An item with a rate of its own brings it; one without follows
       whatever this invoice is charging. */
    addLineFromItem: (item) => edit((doc) => ({
      ...doc,
      lines: [...dropEmptyStarter(doc.lines), {
        id: makeId('line'),
        description: item.description,
        details: item.details,
        quantity: 1,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discount: null,
        taxes: item.taxRate === null
          ? newLineTaxes(doc)
          : [{ id: makeId('tax'), label: item.taxLabel || doc.settings.defaultTax.label || 'Tax', rate: item.taxRate }],
      }],
    })),

    addLines: (lines) => edit((doc) => ({
      ...doc,
      lines: [...dropEmptyStarter(doc.lines), ...lines],
    })),

    patchLine: (id, patch, key) => edit((doc) => ({
      ...doc,
      lines: doc.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    }), key),

    setLineTaxes: (id, taxes) => edit((doc) => ({
      ...doc,
      lines: doc.lines.map((line) => (line.id === id ? { ...line, taxes } : line)),
    })),

    /* An invoice always has a line to type into: removing the last one
       leaves an empty row rather than a table with no way back. */
    removeLine: (id) => edit((doc) => {
      const lines = doc.lines.filter((line) => line.id !== id)
      return { ...doc, lines: lines.length ? lines : [emptyLine(makeId('line'), newLineTaxes(doc))] }
    }),

    duplicateLine: (id) => edit((doc) => {
      const index = doc.lines.findIndex((line) => line.id === id)
      if (index === -1) return doc
      const source = doc.lines[index]
      const copy: LineItem = {
        ...source,
        id: makeId('line'),
        taxes: source.taxes.map((t) => ({ ...t, id: makeId('tax') })),
        discount: source.discount ? { ...source.discount } : null,
      }
      const lines = [...doc.lines]
      lines.splice(index + 1, 0, copy)
      return { ...doc, lines }
    }),

    moveLine: (id, direction) => edit((doc) => {
      const index = doc.lines.findIndex((line) => line.id === id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= doc.lines.length) return doc
      const lines = [...doc.lines]
      const [moved] = lines.splice(index, 1)
      lines.splice(target, 0, moved)
      return { ...doc, lines }
    }),

    /* ----------------------------------------------- payments received */

    /* Every one of these ends in settle(), so the status and the money can
       never drift apart: there is no way to change a payment that does not
       also ask whether the invoice is now paid. */

    addPaymentReceived: () => {
      const id = makeId('pay')
      edit((doc) => settle({
        ...doc,
        paymentsReceived: [...doc.paymentsReceived, {
          id,
          date: todayIso(),
          /* Prefilled with what is outstanding, because paying the balance
             is the ordinary case and typing it again is a chore. */
          amount: calcTotals(doc).amountDue,
          method: '',
          reference: '',
          note: '',
        }],
      }))
      return id
    },

    patchPaymentReceived: (id, patch, key) => edit((doc) => settle({
      ...doc,
      paymentsReceived: doc.paymentsReceived.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }), key),

    removePaymentReceived: (id) => edit((doc) => settle({
      ...doc,
      paymentsReceived: doc.paymentsReceived.filter((p) => p.id !== id),
    })),
  }
})

/* The status a document should have, given the payments it now carries. */
function settle (doc: InvoiceDoc): InvoiceDoc {
  return { ...doc, meta: { ...doc.meta, ...reconcile(doc.meta, doc.paymentsReceived, calcTotals(doc).total) } }
}

/* The blank line a new invoice opens with is scaffolding, not content.
   Adding real lines on top of it should not leave an empty row above them. */
function dropEmptyStarter (lines: LineItem[]): LineItem[] {
  if (lines.length !== 1) return lines
  const only = lines[0]
  const untouched = !only.description.trim() && !only.details.trim() && !only.unitPrice
  return untouched ? [] : lines
}

/* A new line starts taxed the way the rest of the invoice is, so adding one
   to a VAT invoice does not quietly create a zero-rated item. */
function newLineTaxes (doc: InvoiceDoc): TaxLine[] {
  if (doc.settings.taxMode === 'invoice') return []
  const last = doc.lines[doc.lines.length - 1]
  if (last?.taxes.length) return last.taxes.map((t) => ({ ...t, id: makeId('tax') }))
  return doc.settings.defaultTax ? [{ ...doc.settings.defaultTax, id: makeId('tax') }] : []
}
