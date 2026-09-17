/* Getting a finished invoice out of the app.

   Four destinations, one shape of answer, so the UI can report what happened
   without knowing which one it asked for. Each says where the file went, or
   that the user cancelled, or what went wrong — never nothing. */

import type { InvoiceDoc } from '@model/invoice'
import type { FileResult } from '@model/bridge'
import { getTemplate } from '@templates/registry'
import { renderDocument } from '@core/document/render'
import { bridge, downloadBlob } from '@core/storage/desktop'
import { suggestBatchFilename, suggestFilename } from './filename'
import { buildCsv } from './csv'
import { buildWorkbook } from './xlsx'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/* The PDF.

   Rendered by Chromium from the same HTML the preview shows, which is what
   makes it vector: real text, selectable and searchable, at whatever size the
   paper is — not a picture of a page. */
export async function exportPdf (doc: InvoiceDoc): Promise<FileResult> {
  const template = getTemplate(doc.settings.templateId)
  const { html, width, height, landscape } = renderDocument(doc, template, { mode: 'print' })
  const api = bridge()

  if (!api) {
    /* No shell to print with: hand the document to the browser's own print
       dialog, where "Save as PDF" is one step away. */
    const win = window.open('', '_blank')
    if (!win) return { ok: false, error: 'Allow pop-ups to export from the browser.' }
    win.document.write(html)
    win.document.close()
    win.addEventListener('load', () => win.print())
    return { ok: true, filePath: 'printed' }
  }

  return api.exportPdf({
    html,
    widthMm: width,
    heightMm: height,
    landscape,
    suggested: suggestFilename(doc, 'pdf'),
  })
}

/** This invoice as a formatted spreadsheet, with the arithmetic left live. */
export async function exportXlsx (doc: InvoiceDoc): Promise<FileResult> {
  let buffer: ArrayBuffer
  try {
    buffer = await buildWorkbook(doc)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'The spreadsheet could not be built.' }
  }
  const suggested = suggestFilename(doc, 'xlsx')
  const api = bridge()
  if (!api) return downloadBlob(buffer, suggested, XLSX_MIME)
  return api.exportBinary({ buffer, suggested, filterName: 'Excel workbook', ext: 'xlsx' })
}

/** This invoice as rows: one per line item, for accounting software. */
export async function exportCsv (doc: InvoiceDoc): Promise<FileResult> {
  const text = buildCsv([doc])
  const suggested = suggestFilename(doc, 'csv')
  const api = bridge()
  if (!api) return downloadBlob(text, suggested, 'text/csv;charset=utf-8')
  return api.exportText({ text, suggested, filterName: 'CSV', ext: 'csv' })
}

/** Every invoice in one file, which is how a year gets reconciled. */
export async function exportCsvBatch (docs: InvoiceDoc[]): Promise<FileResult> {
  if (docs.length === 0) return { ok: false, error: 'There are no invoices to export.' }
  const text = buildCsv(docs)
  const suggested = suggestBatchFilename(docs.length, 'csv')
  const api = bridge()
  if (!api) return downloadBlob(text, suggested, 'text/csv;charset=utf-8')
  return api.exportText({ text, suggested, filterName: 'CSV', ext: 'csv' })
}
