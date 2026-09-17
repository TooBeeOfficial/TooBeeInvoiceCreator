/* Writing the invoice.

   Three columns: what it says, what it looks like, and how it is styled. The
   form is on the left because that is where the work is, the sheet is beside
   it because every change should be visible on the page immediately, and the
   design panel is on the right where it can be closed when it is not wanted.

   The sections run in the order an invoice is actually written: who it is
   for, what is on it, what that comes to, how to pay. Anything optional is
   collapsed until it is needed. */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { InvoiceDoc } from '@model/invoice'
import type { AppStrings } from '@core/i18n'
import type { Totals } from '@core/totals/calcTotals'
import { calcTotals } from '@core/totals/calcTotals'
import { formatMoney } from '@core/money/format'
import { validateInvoice } from '@core/validation/validateInvoice'
import { useDocStore } from '@store/useDocStore'
import { usePrefsStore } from '@store/usePrefsStore'
import { useLibraryStore } from '@store/useLibraryStore'
import { useUiStore } from '@store/useUiStore'
import { Panel } from '@elements/Panel/Panel'
import { Button } from '@elements/Button/Button'
import { Textarea } from '@elements/Textarea/Textarea'
import { Field } from '@elements/Field/Field'
import { InvoiceDetails } from '@components/InvoiceDetails/InvoiceDetails'
import { PartyForm } from '@components/PartyForm/PartyForm'
import { LineItemsTable } from '@components/LineItems/LineItemsTable'
import { TaxSettings } from '@components/TaxSettings/TaxSettings'
import { PaymentForm } from '@components/PaymentForm/PaymentForm'
import { PaymentQr, PaymentQrToggle } from '@components/PaymentQr/PaymentQr'
import { PaymentsReceived } from '@components/PaymentsReceived/PaymentsReceived'
import { LogoField } from '@components/LogoField/LogoField'
import { IssueList } from '@components/IssueList/IssueList'
import { TotalsLedger } from '@components/TotalsLedger/TotalsLedger'
import { DocumentPreview } from '@components/DocumentPreview/DocumentPreview'
import { Inspector } from '@components/Inspector/Inspector'
import { Menu } from '@components/Menu/Menu'
import { ImportDialog } from '@components/ImportDialog/ImportDialog'
import { Splitter } from '@elements/Splitter/Splitter'
import { PANEL_LIMITS } from '@core/factory/defaults'
import { useT } from '@hooks/useT'
import styles from './EditorPage.module.css'

export function EditorPage () {
  const t = useT()
  const doc = useDocStore((s) => s.doc)
  const patchParty = useDocStore((s) => s.patchParty)
  const patchAddress = useDocStore((s) => s.patchAddress)
  const setTaxIds = useDocStore((s) => s.setTaxIds)
  const useParty = useDocStore((s) => s.useParty)
  const setField = useDocStore((s) => s.setField)

  const prefs = usePrefsStore((s) => s.prefs)
  const saveClient = usePrefsStore((s) => s.saveClient)
  const entries = useLibraryStore((s) => s.library.entries)
  const inspectorOpen = useUiStore((s) => s.inspectorOpen)
  const notify = useUiStore((s) => s.notify)

  const formWidth = useUiStore((s) => s.formWidth)
  const inspectorWidth = useUiStore((s) => s.inspectorWidth)
  const setFormWidth = useUiStore((s) => s.setFormWidth)
  const setInspectorWidth = useUiStore((s) => s.setInspectorWidth)
  const setPanels = usePrefsStore((s) => s.setPanels)

  const [importing, setImporting] = useState(false)

  /* The panes are sized against the room actually available, not against
     the window: the preview keeps its minimum however wide the other two are
     dragged, and shrinking the window pulls them in rather than pushing the
     sheet out of sight. */
  const pageRef = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState(0)

  useEffect(() => {
    const element = pageRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width))
    observer.observe(element)
    setAvailable(element.clientWidth)
    return () => observer.disconnect()
  }, [])

  const room = available || 1200
  const inspectorRoom = inspectorOpen ? inspectorWidth : 0
  const formMax = Math.max(
    PANEL_LIMITS.formMin,
    Math.min(PANEL_LIMITS.formMax, room - inspectorRoom - PANEL_LIMITS.previewMin),
  )
  const inspectorMax = Math.max(
    PANEL_LIMITS.inspectorMin,
    Math.min(PANEL_LIMITS.inspectorMax, room - formWidth - PANEL_LIMITS.previewMin),
  )
  const shownFormWidth = Math.min(formWidth, formMax)
  const shownInspectorWidth = Math.min(inspectorWidth, inspectorMax)

  const totals = useMemo(() => calcTotals(doc), [doc])
  const validation = useMemo(() => validateInvoice(doc, entries, t.checks), [doc, entries, t])

  const errorFor = (id: string) => validation.errors.find((issue) => issue.id === id)?.message

  return (
    <div className={styles.page} ref={pageRef}>
      <section
        className={styles.form}
        aria-label={t.editor.invoiceDetails}
        style={{ width: shownFormWidth }}
      >
        <div className={styles.scroll}>
          <Panel title={t.editor.detailsTitle} description={t.editor.detailsNote}>
            <InvoiceDetails
              doc={doc}
              errors={{
                number: errorFor('number'),
                issueDate: errorFor('issue-date'),
                dueDate: errorFor('due-before-issue'),
              }}
            />
          </Panel>

          <Panel
            title={t.editor.billToTitle}
            description={t.editor.billToNote}
            action={
              <div className={styles.rowActions}>
                {prefs.clients.length > 0 ? (
                  <Menu
                    align="right"
                    items={prefs.clients.map((client) => ({
                      id: client.id,
                      label: client.name || t.invoices.untitled,
                      note: client.address.city || client.email || undefined,
                      run: () => useParty('buyer', client),
                    }))}
                    trigger={(props) => (
                      <Button size="sm" variant="ghost" icon="users" trailingIcon="chevronDown" {...props}>
                        {t.editor.useClient}
                      </Button>
                    )}
                  />
                ) : null}
                <Button
                  size="sm"
                  icon="save"
                  disabled={!doc.buyer.name.trim()}
                  onClick={() => {
                    saveClient(doc.buyer)
                    notify(t.editor.savedClient.replace('{name}', doc.buyer.name), 'success')
                  }}
                >
                  {t.editor.saveClient}
                </Button>
              </div>
            }
          >
            <PartyForm
              party={doc.buyer}
              side="buyer"
              onPatch={(patch, key) => patchParty('buyer', patch, key)}
              onAddress={(patch, key) => patchAddress('buyer', patch, key)}
              onTaxIds={(ids) => setTaxIds('buyer', ids)}
              errors={{ name: errorFor('buyer-name') }}
            />
          </Panel>

          <Panel
            title={t.editor.fromTitle}
            description={t.editor.fromNote}
            collapsible
            defaultOpen={!doc.seller.name.trim()}
            summary={doc.seller.name || t.editor.notSet}
            action={
              <Button
                size="sm"
                variant="ghost"
                icon="refresh"
                disabled={!prefs.seller.name.trim()}
                onClick={() => useParty('seller', prefs.seller)}
              >
                {t.company.businessTitle}
              </Button>
            }
          >
            <PartyForm
              party={doc.seller}
              side="seller"
              onPatch={(patch, key) => patchParty('seller', patch, key)}
              onAddress={(patch, key) => patchAddress('seller', patch, key)}
              onTaxIds={(ids) => setTaxIds('seller', ids)}
              errors={{ name: errorFor('seller-name') }}
            />
            <LogoField doc={doc} />
          </Panel>

          <Panel title={t.editor.itemsTitle} description={t.editor.itemsNote}>
            <LineItemsTable doc={doc} totals={totals} onImport={() => setImporting(true)} />
          </Panel>

          <Panel
            title={t.editor.taxTitle}
            description={t.editor.taxNote}
            collapsible
            defaultOpen
            summary={`${doc.settings.defaultTax.label || 'Tax'} ${doc.settings.defaultTax.rate}%`}
          >
            <TaxSettings doc={doc} />
          </Panel>

          <Panel
            title={t.editor.payTitle}
            description={t.editor.payNote}
            collapsible
            defaultOpen={false}
            summary={doc.payment.iban || doc.payment.accountNumber || doc.payment.link || t.editor.notSet}
          >
            <PaymentForm doc={doc} />
          </Panel>

          {/* Its own section, next to the bank details it encodes rather than
              inside them: the code is the only thing on the invoice a person
              cannot proof-read, so it gets somewhere to be looked at. */}
          <Panel
            title={t.payment.qr}
            description={t.payment.qrNote}
            collapsible
            defaultOpen={false}
            summary={doc.payment.showQr ? t.editor.set : t.editor.notSet}
            action={<PaymentQrToggle doc={doc} />}
          >
            <PaymentQr doc={doc} totals={totals} />
          </Panel>

          <Panel
            title={t.editor.receivedTitle}
            description={t.editor.receivedNote}
            collapsible
            defaultOpen={doc.paymentsReceived.length > 0}
            summary={paymentSummary(doc, totals, t)}
          >
            <PaymentsReceived doc={doc} totals={totals} />
          </Panel>

          <Panel
            title={t.editor.notesTitle}
            collapsible
            defaultOpen={false}
            summary={doc.notes.trim() || doc.terms.trim() ? t.editor.set : t.editor.notSet}
          >
            <Field label={t.editor.noteToClient} hint={t.editor.noteToClientHint}>
              {({ id, describedBy }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  value={doc.notes}
                  onValueChange={(value) => setField('notes', value)}
                  placeholder={t.editor.noteToClientPlaceholder}
                  minRows={2}
                  maxRows={6}
                />
              )}
            </Field>

            <Field label={t.editor.conditions} hint={t.editor.conditionsHint}>
              {({ id, describedBy }) => (
                <Textarea
                  id={id}
                  aria-describedby={describedBy}
                  value={doc.terms}
                  onValueChange={(value) => setField('terms', value)}
                  placeholder={t.editor.conditionsPlaceholder}
                  minRows={2}
                  maxRows={8}
                />
              )}
            </Field>
          </Panel>

          <Panel
            title={t.editor.checksTitle}
            description={t.editor.checksNote}
          >
            <IssueList result={validation} />
          </Panel>
        </div>

        <TotalsLedger doc={doc} totals={totals} />
      </section>

      <Splitter
        side="left"
        value={shownFormWidth}
        min={PANEL_LIMITS.formMin}
        max={formMax}
        reset={PANEL_LIMITS.formDefault}
        onChange={setFormWidth}
        onCommit={(form) => setPanels({ form })}
        label={t.editor.resizeForm}
      />

      <DocumentPreview doc={doc} className={styles.preview} />

      {inspectorOpen ? (
        <>
          <Splitter
            side="right"
            value={shownInspectorWidth}
            min={PANEL_LIMITS.inspectorMin}
            max={inspectorMax}
            reset={PANEL_LIMITS.inspectorDefault}
            onChange={setInspectorWidth}
            onCommit={(inspector) => setPanels({ inspector })}
            label={t.editor.resizeDesign}
          />
          <Inspector doc={doc} width={shownInspectorWidth} />
        </>
      ) : null}

      {importing ? (
        <ImportDialog doc={doc} target="invoice" onClose={() => setImporting(false)} />
      ) : null}
    </div>
  )
}

/* What the closed panel says. Written so it answers the question someone
   collapses the panel still wanting answered: how much is left. */
function paymentSummary (doc: InvoiceDoc, totals: Totals, t: AppStrings): string {
  if (doc.paymentsReceived.length === 0) return t.received.nothingYet
  const locale = doc.settings.locale
  const money = (minor: number) => formatMoney(minor, doc.currency, locale)
  if (totals.amountDue === 0) return t.received.paidInFull.replace('{paid}', money(totals.paid))
  return t.received.stillDue.replace('{amount}', money(totals.amountDue))
}
