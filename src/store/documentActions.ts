/* The operations that cross more than one store.

   Saving an invoice touches the document, the library index, the preferences
   that hold the number counter and the toast that reports what happened. That
   sequence lives here rather than in a button, so the File menu, the keyboard
   shortcut and the button all do exactly the same thing. */

import type { InvoiceDoc } from '@model/invoice'
import type { NewInvoiceOptions } from '@core/factory/newInvoice'
import { parseDoc, serializeDoc } from '@core/storage/docFile'
import { bridge, readFileFromBrowser, downloadBlob } from '@core/storage/desktop'
import { suggestFilename } from '@core/export/filename'
import { counterFrom } from '@core/numbering/numbering'
import { exportPdf, exportXlsx, exportCsv, exportCsvBatch } from '@core/export/exportService'
import { appStrings } from '@core/i18n'
import { useDocStore } from './useDocStore'
import { usePrefsStore } from './usePrefsStore'
import { useLibraryStore } from './useLibraryStore'
import { useUiStore } from './useUiStore'

/* These run outside React, so the words are fetched when the action fires
   rather than held in a hook. Reading it fresh each time is also what keeps a
   toast in the language the app is set to *now*, not the one it started in. */
const say = () => appStrings(usePrefsStore.getState().prefs.language).toasts

/* Anything that would throw away unsaved work asks first. */
async function confirmDiscard (): Promise<boolean> {
  const { dirty } = useDocStore.getState()
  if (!dirty) return true
  return useUiStore.getState().ask({
    title: say().discardTitle,
    body: say().discardBody,
    confirmLabel: say().discardConfirm,
    tone: 'danger',
  })
}

export async function newDocument (options: NewInvoiceOptions = {}): Promise<void> {
  if (!(await confirmDiscard())) return
  const prefs = usePrefsStore.getState().prefs
  useDocStore.getState().start(prefs, options)
  useUiStore.getState().go('editor')
}

/** Opens a file. With no path, asks the user which one. */
export async function openDocument (filePath?: string): Promise<void> {
  if (!(await confirmDiscard())) return
  const ui = useUiStore.getState()
  const prefs = usePrefsStore.getState().prefs
  const api = bridge()

  let text: string | null = null
  let path: string | null = null

  if (api) {
    const result = await api.openDoc(filePath ? { filePath } : {})
    if (result.canceled) return
    if (!result.ok || !result.data) {
      ui.notify(result.missing ? say().fileMissing : (result.error ?? say().couldNotRead), 'danger')
      return
    }
    text = result.data
    path = result.filePath ?? null
  } else {
    const picked = await readFileFromBrowser('.json')
    if (!picked) return
    text = picked.text
  }

  try {
    const doc = parseDoc(text, prefs)
    useDocStore.getState().adopt(doc, path)
    if (path) {
      await useLibraryStore.getState().record(doc, path)
      usePrefsStore.getState().setLastFile(path)
    }
    ui.go('editor')
  } catch (error) {
    ui.notify(error instanceof Error ? error.message : say().couldNotRead, 'danger')
  }
}

export async function saveDocument ({ saveAs = false } = {}): Promise<boolean> {
  const { doc, filePath } = useDocStore.getState()
  const ui = useUiStore.getState()
  const api = bridge()
  const data = serializeDoc(doc)

  if (!api) {
    downloadBlob(data, suggestFilename(doc, 'json'), 'application/json')
    useDocStore.getState().markSaved(filePath ?? suggestFilename(doc, 'json'))
    ui.notify(say().savedDownloads, 'success')
    return true
  }

  const result = await api.saveDoc({
    data,
    filePath: saveAs ? null : filePath,
    suggested: suggestFilename(doc, 'json'),
  })

  if (result.canceled) return false
  if (!result.ok || !result.filePath) {
    ui.notify(result.error ?? say().couldNotSave, 'danger')
    return false
  }

  useDocStore.getState().markSaved(result.filePath)
  await useLibraryStore.getState().record(doc, result.filePath)
  usePrefsStore.getState().setLastFile(result.filePath)
  catchUpNumbering(doc)

  ui.notify(say().saved.replace('{number}', doc.meta.number), 'success', {
    label: say().showFile,
    run: () => { void api.showItem(result.filePath as string) },
  })
  return true
}

/* Keeps the counter ahead of what has actually been used.

   Someone who types INV-0042 over the proposed number should get 0043 next,
   not 0002 — otherwise the app hands out a number that is already on a saved
   invoice.

   It only ever moves forward, and only past a number that has really been
   used. Saving the same invoice a second time must not step the counter
   again, or a morning of edits would eat a dozen numbers and leave gaps in a
   sequence that is supposed to have none. */
function catchUpNumbering (doc: InvoiceDoc): void {
  const prefs = usePrefsStore.getState().prefs
  const used = counterFrom(doc.meta.number)
  if (used === null || used < prefs.numbering.next) return
  const year = Number(doc.meta.issueDate.slice(0, 4)) || prefs.numbering.year
  usePrefsStore.getState().setNumbering({ next: used + 1, year })
}

/* ------------------------------------------------------------- exports */

type ExportKind = 'pdf' | 'xlsx' | 'csv'

const EXPORT_NAMES: Record<ExportKind, string> = { pdf: 'PDF', xlsx: 'Excel workbook', csv: 'CSV' }

export async function exportDocument (kind: ExportKind): Promise<void> {
  const { doc } = useDocStore.getState()
  const ui = useUiStore.getState()
  const api = bridge()

  const result = kind === 'pdf'
    ? await exportPdf(doc)
    : kind === 'xlsx'
      ? await exportXlsx(doc)
      : await exportCsv(doc)

  if (result.canceled) return
  if (!result.ok) {
    ui.notify(result.error ?? say().couldNotSave, 'danger')
    return
  }

  ui.notify(say().exported.replace('{kind}', EXPORT_NAMES[kind]), 'success', api && result.filePath && result.filePath !== 'printed'
    ? { label: say().showFile, run: () => { void api.showItem(result.filePath as string) } }
    : undefined)
}

/* Every invoice in the library as one CSV.

   Each file is read in turn, because the index holds totals but not line
   items — and this export exists precisely to get the line items out. Files
   that have gone missing are counted and reported rather than skipped
   silently. */
export async function exportLibraryCsv (): Promise<void> {
  const ui = useUiStore.getState()
  const { library, readDoc } = useLibraryStore.getState()
  const entries = library.entries.filter((e) => !e.missing)

  if (entries.length === 0) {
    ui.notify(say().noInvoicesToExport, 'warning')
    return
  }

  const docs: InvoiceDoc[] = []
  let unreadable = 0
  for (const entry of entries) {
    const doc = await readDoc(entry)
    if (doc) docs.push(doc)
    else unreadable += 1
  }

  const result = await exportCsvBatch(docs)
  if (result.canceled) return
  if (!result.ok) {
    ui.notify(result.error ?? say().couldNotSave, 'danger')
    return
  }

  ui.notify(
    say().exported.replace('{kind}', `${docs.length} × CSV`),
    unreadable === 0 ? 'success' : 'warning',
  )
}
