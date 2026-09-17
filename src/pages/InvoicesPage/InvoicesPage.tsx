/* The list.

   The first screen, because the question people open an invoicing app to
   answer is usually "who hasn't paid me" rather than "let me write a new
   one". So the four figures come first, the list underneath, and the search
   and filters between them.

   Nothing here holds invoice data of its own: every row is an entry in the
   index, and every action that changes one goes to the file on disk. */

import { useMemo, useState } from 'react'
import type { LibraryEntry } from '@model/library'
import type { EffectiveStatus, InvoiceStatus } from '@model/invoice'
import { entryStatus } from '@core/status/status'
import { bridge } from '@core/storage/desktop'
import { useLibraryStore } from '@store/useLibraryStore'
import { useDocStore } from '@store/useDocStore'
import { usePrefsStore } from '@store/usePrefsStore'
import { useUiStore } from '@store/useUiStore'
import { newDocument, openDocument, exportLibraryCsv } from '@store/documentActions'
import { useT } from '@hooks/useT'
import { Button } from '@elements/Button/Button'
import { Select } from '@elements/Select/Select'
import { TextInput } from '@elements/TextInput/TextInput'
import { Icon } from '@elements/Icon/Icon'
import { EmptyState } from '@elements/EmptyState/EmptyState'
import { SummaryStrip } from '@components/SummaryStrip/SummaryStrip'
import { InvoiceTable } from '@components/InvoiceTable/InvoiceTable'
import type { SortKey } from '@components/InvoiceTable/InvoiceTable'
import styles from './InvoicesPage.module.css'

/* Overdue is in the list even though it is worked out rather than stored:
   it is the one people look for. Void is there too — rarely wanted, but an
   invoice that has been cancelled is otherwise impossible to find again. */
const STATUS_FILTERS: ReadonlyArray<EffectiveStatus> = ['draft', 'sent', 'overdue', 'paid', 'void']

type Period = 'all' | 'month' | 'year' | 'lastYear'

/* The window a period covers, as the two ISO dates an issue date is compared
   against. Dates are stored as yyyy-mm-dd, so the comparison is a string
   comparison and the whole thing needs no date arithmetic and no timezone —
   which is the one place a filter like this usually goes wrong, by asking
   what "this month" means in a timezone that is not the user's. */
function periodStart (period: Period): { from: string; to: string } | null {
  if (period === 'all') return null
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  if (period === 'month') return { from: `${year}-${month}-01`, to: `${year}-${month}-31` }
  if (period === 'year') return { from: `${year}-01-01`, to: `${year}-12-31` }
  return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` }
}

export function InvoicesPage () {
  const t = useT()
  const library = useLibraryStore((s) => s.library)
  const busy = useLibraryStore((s) => s.busy)
  const refresh = useLibraryStore((s) => s.refresh)
  const setStatus = useLibraryStore((s) => s.setStatus)
  const forget = useLibraryStore((s) => s.forget)
  const readDoc = useLibraryStore((s) => s.readDoc)

  const prefs = usePrefsStore((s) => s.prefs)
  const start = useDocStore((s) => s.start)
  const go = useUiStore((s) => s.go)
  const notify = useUiStore((s) => s.notify)
  const ask = useUiStore((s) => s.ask)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<EffectiveStatus | 'all'>('all')
  const [client, setClient] = useState('')
  const [period, setPeriod] = useState<Period>('all')
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'issueDate', direction: 'desc' })

  const entries = library.entries

  /* Only the clients actually billed, in alphabetical order. Built from the
     index rather than from the client book, because the question this
     answers is "which of these invoices are theirs", and an invoice written
     for somebody never saved to the book is still one of these invoices. */
  const clients = useMemo(() => {
    const names = new Set(entries.map((entry) => entry.buyerName.trim()).filter(Boolean))
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [entries])

  const filtering = filter !== 'all' || client !== '' || period !== 'all' || query.trim() !== ''

  const clearFilters = () => {
    setQuery('')
    setFilter('all')
    setClient('')
    setPeriod('all')
  }

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const since = periodStart(period)
    const filtered = entries.filter((entry) => {
      if (filter !== 'all') {
        const status = entryStatus(entry)
        /* "Sent" means sent and still waiting, overdue included: an invoice
           that has gone past its due date has not stopped being sent, and
           somebody filtering for sent invoices is asking what is out. */
        const matches = filter === 'sent' ? status === 'sent' || status === 'overdue' : status === filter
        if (!matches) return false
      }
      if (client && entry.buyerName.trim() !== client) return false
      /* Filtered on the issue date rather than the due date: a period is a
         question about when the work was billed, which is also the date an
         accountant's quarter is drawn around. */
      if (since && !(entry.issueDate >= since.from && entry.issueDate <= since.to)) return false
      if (!needle) return true
      return `${entry.number} ${entry.buyerName}`.toLowerCase().includes(needle)
    })

    const direction = sort.direction === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const key = sort.key
      if (key === 'total') return (a.total - b.total) * direction
      return String(a[key] ?? '').localeCompare(String(b[key] ?? '')) * direction
    })
  }, [entries, query, filter, client, period, sort])

  const onSort = (key: SortKey) => {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: key === 'total' || key.endsWith('Date') ? 'desc' : 'asc' })
  }

  const onOpen = (entry: LibraryEntry) => { void openDocument(entry.filePath) }

  const onDuplicate = async (entry: LibraryEntry) => {
    const source = await readDoc(entry)
    if (!source) {
      notify(t.toasts.couldNotRead, 'danger')
      return
    }
    start(prefs, { basedOn: source })
    go('editor')
    notify(t.toasts.startedFrom.replace('{number}', entry.number), 'success')
  }

  const onStatus = async (entry: LibraryEntry, status: InvoiceStatus) => {
    const result = await setStatus(entry, status)
    if (!result.ok) notify(result.error ?? t.toasts.couldNotSave, 'danger')
    else {
      notify(t.toasts.markedAs
        .replace('{number}', entry.number)
        .replace('{status}', t.status[status].toLowerCase()), 'success')
    }
  }

  const onReveal = (entry: LibraryEntry) => { void bridge()?.showItem(entry.filePath) }

  const onForget = async (entry: LibraryEntry) => {
    const confirmed = await ask({
      title: t.invoices.forgetTitle.replace('{number}', entry.number || t.invoices.untitled),
      body: t.invoices.forgetBody,
      confirmLabel: t.invoices.forgetConfirm,
      tone: 'danger',
    })
    if (confirmed) await forget(entry.id)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t.invoices.title}</h1>
            <p className={styles.subtitle}>
              {entries.length === 0
                ? t.invoices.nothingSaved
                : (entries.length === 1 ? t.invoices.countOne : t.invoices.countMany)
                  .replace('{count}', String(entries.length))}
            </p>
          </div>

          <div className={styles.headActions}>
            <Button icon="refresh" onClick={() => { void refresh() }} disabled={busy}>
              {t.invoices.checkFiles}
            </Button>
            <Button icon="download" onClick={() => { void exportLibraryCsv() }} disabled={entries.length === 0}>
              {t.invoices.exportAll}
            </Button>
            <Button icon="folder" onClick={() => { void openDocument() }}>{t.invoices.open}</Button>
            <Button variant="primary" icon="plus" onClick={() => { void newDocument() }}>{t.invoices.newInvoice}</Button>
          </div>
        </header>

        <SummaryStrip entries={entries} onFilter={setFilter} active={filter} />

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Icon name="search" size={15} className={styles.searchIcon} />
            <TextInput
              value={query}
              onValueChange={setQuery}
              placeholder={t.invoices.search}
              aria-label={t.invoices.searchLabel}
              className={styles.searchInput}
              data-search
            />
          </div>

          <Select
            className={styles.filter}
            value={filter}
            aria-label={t.invoices.colStatus}
            options={[
              { value: 'all', label: t.invoices.anyStatus },
              ...STATUS_FILTERS.map((status) => ({ value: status, label: t.status[status] })),
            ]}
            onValueChange={(value) => setFilter(value as EffectiveStatus | 'all')}
          />

          {/* Offered only once there is more than one client to choose
              between. A picker with a single name in it is a control that
              cannot change anything. */}
          {clients.length > 1 ? (
            <Select
              className={styles.filter}
              value={client}
              aria-label={t.invoices.colClient}
              options={[
                { value: '', label: t.invoices.anyClient },
                ...clients.map((name) => ({ value: name, label: name })),
              ]}
              onValueChange={setClient}
            />
          ) : null}

          <Select
            className={styles.filter}
            value={period}
            aria-label={t.invoices.period}
            options={[
              { value: 'all', label: t.invoices.anyTime },
              { value: 'month', label: t.invoices.thisMonth },
              { value: 'year', label: t.invoices.thisYear },
              { value: 'lastYear', label: t.invoices.lastYear },
            ]}
            onValueChange={(value) => setPeriod(value as Period)}
          />

          {filtering ? (
            <Button size="sm" variant="ghost" icon="close" onClick={clearFilters}>
              {t.invoices.clearFilters}
            </Button>
          ) : null}

          <span className={styles.count}>
            {shown.length === entries.length
              ? t.invoices.shown.replace('{count}', String(shown.length))
              : t.invoices.shownOf
                .replace('{count}', String(shown.length))
                .replace('{total}', String(entries.length))}
          </span>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon="file"
            title={t.invoices.emptyTitle}
            body={t.invoices.emptyBody}
            action={<Button variant="primary" icon="plus" onClick={() => { void newDocument() }}>{t.invoices.emptyAction}</Button>}
          />
        ) : shown.length === 0 ? (
          <EmptyState
            icon="search"
            title={t.invoices.noMatchTitle}
            body={t.invoices.noMatchBody}
            action={<Button onClick={clearFilters}>{t.invoices.clearFilters}</Button>}
          />
        ) : (
          <InvoiceTable
            entries={shown}
            sort={sort}
            onSort={onSort}
            onOpen={onOpen}
            onStatus={(entry, status) => { void onStatus(entry, status) }}
            onDuplicate={(entry) => { void onDuplicate(entry) }}
            onReveal={onReveal}
            onForget={(entry) => { void onForget(entry) }}
          />
        )}
      </div>
    </div>
  )
}
