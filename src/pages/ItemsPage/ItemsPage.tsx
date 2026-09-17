/* The item catalogue.

   Things you sell, kept so they need not be typed again — the same idea as
   the client book, and the same rule: putting an item on an invoice copies
   it in. Putting your prices up next spring must not reach back and rewrite
   what you charged last year.

   Items can be typed here one at a time or imported in bulk from a price
   list, a spreadsheet of rates, or a past invoice. */

import { useMemo, useState } from 'react'
import type { SavedItem } from '@model/savedItem'
import { emptySavedItem } from '@model/savedItem'
import { makeId } from '@core/ids'
import { currencyByCode } from '@model/money'
import { formatMoney } from '@core/money/format'
import { toMinor } from '@core/money/money'
import { UNITS } from '@model/lineItem'
import { usePrefsStore } from '@store/usePrefsStore'
import { useDocStore } from '@store/useDocStore'
import { useUiStore } from '@store/useUiStore'
import { Button } from '@elements/Button/Button'
import { Panel } from '@elements/Panel/Panel'
import { Field } from '@elements/Field/Field'
import { TextInput } from '@elements/TextInput/TextInput'
import { NumberInput } from '@elements/NumberInput/NumberInput'
import { Select } from '@elements/Select/Select'
import { Textarea } from '@elements/Textarea/Textarea'
import { Checkbox } from '@elements/Checkbox/Checkbox'
import { Icon } from '@elements/Icon/Icon'
import { EmptyState } from '@elements/EmptyState/EmptyState'
import { ImportDialog } from '@components/ImportDialog/ImportDialog'
import { useT } from '@hooks/useT'
import styles from './ItemsPage.module.css'

export function ItemsPage () {
  const t = useT()
  const items = usePrefsStore((s) => s.prefs.items)
  const currencyCode = usePrefsStore((s) => s.prefs.defaults.currencyCode)
  const saveItem = usePrefsStore((s) => s.saveItem)
  const removeItem = usePrefsStore((s) => s.removeItem)

  const doc = useDocStore((s) => s.doc)
  const addLineFromItem = useDocStore((s) => s.addLineFromItem)
  const useItem = usePrefsStore((s) => s.useItem)

  const go = useUiStore((s) => s.go)
  const notify = useUiStore((s) => s.notify)
  const ask = useUiStore((s) => s.ask)

  const [draft, setDraft] = useState<SavedItem | null>(null)
  const [query, setQuery] = useState('')
  const [importing, setImporting] = useState(false)

  const currency = currencyByCode(currencyCode)

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle
      ? items.filter((item) => `${item.description} ${item.details} ${item.category}`.toLowerCase().includes(needle))
      : items
    return [...filtered].sort((a, b) => b.useCount - a.useCount || a.description.localeCompare(b.description))
  }, [items, query])

  const save = () => {
    if (!draft) return
    if (!draft.description.trim()) {
      notify(t.catalogue.needsDescription, 'warning')
      return
    }
    saveItem(draft)
    notify(t.catalogue.savedItem.replace('{description}', draft.description), 'success')
    setDraft(null)
  }

  const remove = async (item: SavedItem) => {
    const confirmed = await ask({
      title: t.catalogue.removeTitle.replace('{description}', item.description),
      body: t.catalogue.removeBody,
      confirmLabel: t.common.remove,
      tone: 'danger',
    })
    if (!confirmed) return
    removeItem(item.id)
    if (draft?.id === item.id) setDraft(null)
  }

  const addToInvoice = (item: SavedItem) => {
    addLineFromItem(item)
    useItem(item.id)
    notify(t.catalogue.addedToInvoice
      .replace('{description}', item.description)
      .replace('{number}', doc.meta.number), 'success', {
      label: t.common.open,
      run: () => go('editor'),
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t.catalogue.title}</h1>
            <p className={styles.subtitle}>
              {items.length === 0 ? t.invoices.nothingSaved : t.catalogue.subtitle}
            </p>
          </div>

          <div className={styles.headActions}>
            <Button icon="download" onClick={() => setImporting(true)}>{t.catalogue.import}</Button>
            <Button
              variant="primary"
              icon="plus"
              onClick={() => setDraft(emptySavedItem(makeId('item')))}
            >
              {t.catalogue.newItem}
            </Button>
          </div>
        </header>

        {items.length > 0 ? (
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Icon name="search" size={15} className={styles.searchIcon} />
              <TextInput
                value={query}
                onValueChange={setQuery}
                placeholder={t.catalogue.search}
                aria-label={t.catalogue.searchLabel}
                className={styles.searchInput}
                data-search
              />
            </div>
            <span className={styles.count}>
              {shown.length === items.length
                ? t.invoices.shown.replace('{count}', String(shown.length))
                : t.invoices.shownOf
                  .replace('{count}', String(shown.length))
                  .replace('{total}', String(items.length))}
            </span>
          </div>
        ) : null}

        <div className={styles.split}>
          <div className={styles.list}>
            {items.length === 0 ? (
              <EmptyState
                icon="table"
                title={t.catalogue.emptyTitle}
                body={t.catalogue.emptyBody}
                action={<Button icon="download" onClick={() => setImporting(true)}>{t.catalogue.emptyAction}</Button>}
              />
            ) : shown.length === 0 ? (
              <EmptyState
                icon="search"
                title={t.catalogue.noMatchTitle}
                body={t.catalogue.noMatchBody}
                action={<Button onClick={() => setQuery('')}>{t.common.clearSearch}</Button>}
              />
            ) : (
              <ul className={styles.cards}>
                {shown.map((item) => (
                  <li key={item.id}>
                    <div className={[styles.card, draft?.id === item.id ? styles.cardOn : ''].filter(Boolean).join(' ')}>
                      <button type="button" className={styles.cardMain} onClick={() => setDraft({ ...item })}>
                        <span className={styles.cardName}>{item.description}</span>
                        <span className={styles.cardLines}>
                          {[
                            item.category,
                            item.unit,
                            item.taxRate !== null ? `${item.taxRate}%` : '',
                            item.useCount ? `${item.useCount}×` : '',
                          ].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </button>

                      <span className={styles.cardPrice}>
                        {formatMoney(toMinor(item.unitPrice, currency.decimals), currency, 'en-GB')}
                      </span>

                      <div className={styles.cardActions}>
                        <Button size="sm" variant="ghost" icon="plus" onClick={() => addToInvoice(item)}>
                          {t.catalogue.addToInvoice}
                        </Button>
                        <Button size="sm" variant="ghost" icon="trash" onClick={() => { void remove(item) }}>
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
              title={items.some((i) => i.id === draft.id) ? t.catalogue.editTitle : t.catalogue.newTitle}
              description={t.catalogue.note}
              className={styles.editor}
              action={
                <div className={styles.editorActions}>
                  <Button size="sm" onClick={() => setDraft(null)}>{t.common.cancel}</Button>
                  <Button size="sm" variant="primary" onClick={save}>{t.catalogue.save}</Button>
                </div>
              }
            >
              <Field label={t.catalogue.description} required>
                {({ id }) => (
                  <TextInput
                    id={id}
                    value={draft.description}
                    onValueChange={(description) => setDraft({ ...draft, description })}
                    placeholder={t.catalogue.descriptionPlaceholder}
                  />
                )}
              </Field>

              <Field label={t.catalogue.secondLine} hint={t.catalogue.secondLineHint}>
                {({ id, describedBy }) => (
                  <Textarea
                    id={id}
                    aria-describedby={describedBy}
                    value={draft.details}
                    onValueChange={(details) => setDraft({ ...draft, details })}
                    minRows={2}
                    maxRows={4}
                  />
                )}
              </Field>

              <div className={styles.row}>
                <Field label={t.catalogue.unitPrice}>
                  {({ id }) => (
                    <NumberInput
                      id={id}
                      value={draft.unitPrice}
                      onValueChange={(unitPrice) => setDraft({ ...draft, unitPrice })}
                      decimals={currency.decimals}
                      min={0}
                      suffix={currency.symbol}
                    />
                  )}
                </Field>

                <Field label={t.catalogue.unit}>
                  {({ id }) => (
                    <Select
                      id={id}
                      value={draft.unit}
                      options={UNITS.map((unit) => ({ value: unit, label: unit || '—' }))}
                      onValueChange={(unit) => setDraft({ ...draft, unit })}
                    />
                  )}
                </Field>

                <Field label={t.catalogue.category} hint={t.catalogue.categoryHint}>
                  {({ id, describedBy }) => (
                    <TextInput
                      id={id}
                      aria-describedby={describedBy}
                      value={draft.category}
                      onValueChange={(category) => setDraft({ ...draft, category })}
                      placeholder={t.common.optional}
                    />
                  )}
                </Field>
              </div>

              <Checkbox
                checked={draft.taxRate !== null}
                onCheckedChange={(on) => setDraft({ ...draft, taxRate: on ? 0 : null })}
                label={t.catalogue.ownRate}
                hint={t.catalogue.ownRateHint}
              />

              {draft.taxRate !== null ? (
                <div className={styles.row}>
                  <Field label={t.catalogue.taxName}>
                    {({ id }) => (
                      <TextInput
                        id={id}
                        value={draft.taxLabel}
                        onValueChange={(taxLabel) => setDraft({ ...draft, taxLabel })}
                        placeholder="VAT"
                      />
                    )}
                  </Field>

                  <Field label={t.catalogue.rate}>
                    {({ id }) => (
                      <NumberInput
                        id={id}
                        value={draft.taxRate ?? 0}
                        onValueChange={(taxRate) => setDraft({ ...draft, taxRate })}
                        decimals={3}
                        min={0}
                        max={100}
                        suffix="%"
                      />
                    )}
                  </Field>
                </div>
              ) : null}
            </Panel>
          ) : null}
        </div>
      </div>

      {importing ? (
        <ImportDialog doc={doc} target="catalogue" onClose={() => setImporting(false)} />
      ) : null}
    </div>
  )
}
