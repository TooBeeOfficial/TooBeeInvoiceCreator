/* The client book.

   Somewhere to keep the people you bill so their address is typed once
   rather than every month. A client here is a template for the "Bill to"
   block, never a link to it: putting a client on an invoice copies them in,
   so correcting a typo in the book next year does not quietly rewrite an
   invoice you sent last spring. */

import { useState } from 'react'
import type { Party } from '@model/party'
import { emptyParty } from '@model/party'
import { makeId } from '@core/ids'
import { countryName } from '@core/geo/countries'
import { isEmailAddress, sendMailTo } from '@core/mail/mailto'
import { usePrefsStore } from '@store/usePrefsStore'
import { useUiStore } from '@store/useUiStore'
import { newDocument } from '@store/documentActions'
import { Button } from '@elements/Button/Button'
import { Panel } from '@elements/Panel/Panel'
import { EmptyState } from '@elements/EmptyState/EmptyState'
import { PartyForm } from '@components/PartyForm/PartyForm'
import { useT } from '@hooks/useT'
import styles from './ClientsPage.module.css'

export function ClientsPage () {
  const t = useT()
  const clients = usePrefsStore((s) => s.prefs.clients)
  const saveClient = usePrefsStore((s) => s.saveClient)
  const removeClient = usePrefsStore((s) => s.removeClient)
  const notify = useUiStore((s) => s.notify)
  const ask = useUiStore((s) => s.ask)

  const [draft, setDraft] = useState<Party | null>(null)

  const edit = (client: Party) => setDraft({ ...client, address: { ...client.address }, taxIds: client.taxIds.map((t) => ({ ...t })) })
  const create = () => setDraft(emptyParty(makeId('client')))

  const save = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      notify(t.clients.needsName, 'warning')
      return
    }
    saveClient(draft)
    notify(t.clients.saved.replace('{name}', draft.name), 'success')
    setDraft(null)
  }

  const remove = async (client: Party) => {
    const confirmed = await ask({
      title: t.clients.removeTitle.replace('{name}', client.name || t.invoices.untitled),
      body: t.clients.removeBody,
      confirmLabel: t.common.remove,
      tone: 'danger',
    })
    if (!confirmed) return
    removeClient(client.id)
    if (draft?.id === client.id) setDraft(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t.clients.title}</h1>
            <p className={styles.subtitle}>
              {clients.length === 0 ? t.invoices.nothingSaved : t.clients.subtitle}
            </p>
          </div>
          <Button variant="primary" icon="plus" onClick={create}>{t.clients.add}</Button>
        </header>

        <div className={styles.split}>
          <div className={styles.list}>
            {clients.length === 0 ? (
              <EmptyState
                icon="users"
                title={t.clients.emptyTitle}
                body={t.clients.emptyBody}
                action={<Button icon="plus" onClick={create}>{t.clients.emptyAction}</Button>}
              />
            ) : (
              <ul className={styles.cards}>
                {clients.map((client) => (
                  <li key={client.id}>
                    <div className={[styles.card, draft?.id === client.id ? styles.cardOn : ''].filter(Boolean).join(' ')}>
                      <button type="button" className={styles.cardMain} onClick={() => edit(client)}>
                        <span className={styles.cardName}>{client.name || t.invoices.untitled}</span>
                        <span className={styles.cardLines}>
                          {[client.address.city, countryName(client.address.countryCode)].filter(Boolean).join(', ') || '—'}
                        </span>
                        {client.email ? <span className={styles.cardLines}>{client.email}</span> : null}
                      </button>

                      <div className={styles.cardActions}>
                        {/* The address is printed inside the card's own
                            button, which cannot hold another one, so the way
                            to write to a client lives out here with the rest
                            of what can be done to them. */}
                        {isEmailAddress(client.email) ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="mail"
                            onClick={() => sendMailTo(client.email)}
                          >
                            {t.party.sendEmail}
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="file"
                          onClick={() => { void newDocument({ buyer: client }) }}
                        >
                          {t.invoices.newInvoice}
                        </Button>
                        <Button size="sm" variant="ghost" icon="trash" onClick={() => { void remove(client) }}>
                          {t.common.remove}
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {draft ? (
            <Panel
              title={clients.some((c) => c.id === draft.id) ? t.clients.editTitle : t.clients.newTitle}
              description={t.clients.note}
              className={styles.editor}
              action={
                <div className={styles.editorActions}>
                  <Button size="sm" onClick={() => setDraft(null)}>{t.common.cancel}</Button>
                  <Button size="sm" variant="primary" onClick={save}>{t.clients.save}</Button>
                </div>
              }
            >
              <PartyForm
                party={draft}
                side="buyer"
                onPatch={(patch) => setDraft({ ...draft, ...patch })}
                onAddress={(patch) => setDraft({ ...draft, address: { ...draft.address, ...patch } })}
                onTaxIds={(taxIds) => setDraft({ ...draft, taxIds })}
              />
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  )
}
