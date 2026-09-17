/* Picking a file and getting a table out of it.

   The one place that knows which reader a file needs. Everything after this
   works on a grid of strings and never asks where it came from. */

import { bridge } from '@core/storage/desktop'
import { parseCsv, parseXlsx, toTable, ImportError } from './readTable'
import type { Table } from './readTable'

export interface PickedTable {
  table: Table
  /** The file's own name, for the message shown after importing. */
  name: string
}

export interface PickOutcome {
  canceled?: boolean
  error?: string
  picked?: PickedTable
}

const TEXT_TYPES = new Set(['csv', 'tsv', 'txt'])
const SHEET_TYPES = new Set(['xlsx', 'xlsm'])

export async function pickTable (): Promise<PickOutcome> {
  const api = bridge()

  if (api) {
    const result = await api.importFile()
    if (result.canceled) return { canceled: true }
    if (!result.ok || !result.bytes) return { error: result.error ?? 'That file could not be read.' }
    return build(result.bytes, result.ext ?? '', result.name ?? 'file')
  }

  const picked = await pickInBrowser()
  if (!picked) return { canceled: true }
  const ext = picked.name.split('.').pop()?.toLowerCase() ?? ''
  return build(new Uint8Array(picked.bytes), ext, picked.name)
}

async function build (bytes: Uint8Array, ext: string, name: string): Promise<PickOutcome> {
  try {
    if (SHEET_TYPES.has(ext)) {
      /* A copy into a fresh buffer: the array that arrives over the bridge
         can be a view onto a larger one, and the reader needs the bytes on
         their own. */
      const grid = await parseXlsx(bytes.slice().buffer)
      return { picked: { table: toTable(grid, 'xlsx'), name } }
    }

    if (ext === 'xls') {
      return { error: 'That is the old Excel format. Open it and save it as .xlsx or .csv first.' }
    }

    const text = new TextDecoder('utf-8').decode(bytes)

    if (ext === 'json') {
      return { picked: { table: toTable(jsonGrid(text), 'json'), name } }
    }

    if (TEXT_TYPES.has(ext) || !ext) {
      return { picked: { table: toTable(parseCsv(text), 'csv'), name } }
    }

    /* An unfamiliar extension holding something comma-shaped is worth a try
       rather than a refusal — plenty of exports arrive as .dat or .text. */
    return { picked: { table: toTable(parseCsv(text), 'csv'), name } }
  } catch (error) {
    if (error instanceof ImportError) return { error: error.message }
    return { error: 'That file could not be read as a table.' }
  }
}

/* JSON, flattened into rows.

   Handles the two shapes that turn up: an array of objects, and an object
   with an array of objects under some key — which is what most accounting
   APIs hand back. */
function jsonGrid (text: string): string[][] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportError('That file is not valid JSON.')
  }

  const rows = findRows(parsed)
  if (!rows) throw new ImportError('That JSON has no list of records in it.')

  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  return [
    headers,
    ...rows.map((row) => headers.map((header) => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    })),
  ]
}

function findRows (value: unknown): Array<Record<string, unknown>> | null {
  if (Array.isArray(value) && value.every((v) => v && typeof v === 'object' && !Array.isArray(v))) {
    return value as Array<Record<string, unknown>>
  }
  if (value && typeof value === 'object') {
    /* An invoice file of our own: its lines are the rows worth importing. */
    const object = value as Record<string, unknown>
    for (const key of ['lines', 'items', 'rows', 'data', 'records', 'lineItems']) {
      const found = findRows(object[key])
      if (found) return found
    }
  }
  return null
}

function pickInBrowser (): Promise<{ name: string; bytes: ArrayBuffer } | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve(null)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.tsv,.txt,.xlsx,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, bytes: reader.result as ArrayBuffer })
      reader.onerror = () => resolve(null)
      reader.readAsArrayBuffer(file)
    }
    input.click()
  })
}
