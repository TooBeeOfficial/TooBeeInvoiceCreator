/* What a file gets called when it leaves the app.

   Named after the invoice number and the client, because that is how the
   file will be looked for a year later — in a folder, by eye, with fifty
   others around it. Anything a filesystem objects to is replaced rather than
   dropped, so two different invoices cannot collapse onto one name. */

import type { InvoiceDoc } from '@model/invoice'

const FORBIDDEN = /[\\/:*?"<>|]+/g

export function safeName (text: string, fallback = 'invoice'): string {
  const cleaned = text
    .replace(FORBIDDEN, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .slice(0, 80)
  return cleaned || fallback
}

export function suggestFilename (doc: InvoiceDoc, extension: string): string {
  const number = safeName(doc.meta.number, 'invoice')
  const client = doc.buyer.name.trim() ? ` ${safeName(doc.buyer.name)}` : ''
  return `${number}${client}.${extension}`
}

/** The name for an export covering many invoices at once. */
export function suggestBatchFilename (count: number, extension: string): string {
  const stamp = new Date().toISOString().slice(0, 10)
  return `invoices ${stamp} (${count}).${extension}`
}
