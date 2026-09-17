/* Getting rows out of whatever file someone hands us.

   Three shapes reach this app in practice: a CSV exported by accounting
   software, a spreadsheet someone keeps their rates in, and a time-tracking
   export. All three arrive here and leave as a plain grid of strings —
   nothing downstream has to know which kind it was.

   The CSV reader is written out rather than pulled in, because the common
   cases are exactly the ones a naive `split(',')` gets wrong: quoted fields
   holding commas, quotes escaped by doubling, line breaks inside a cell, and
   the semicolons that every spreadsheet in continental Europe writes instead
   of commas. */

export interface Table {
  headers: string[]
  rows: string[][]
  /** What the reader decided the file was, for the message shown after. */
  source: 'csv' | 'xlsx' | 'json'
  /** Rows dropped because they were entirely empty. */
  skipped: number
}

export class ImportError extends Error {}

/* Which character separates the columns.

   Decided by counting candidates outside quoted sections in the first few
   lines and taking the one that appears most consistently — a file whose
   rows all have four semicolons is semicolon-delimited, whatever else it
   contains. */
export function detectDelimiter (text: string): string {
  const sample = text.split(/\r?\n/).filter((line) => line.trim()).slice(0, 12)
  if (sample.length === 0) return ','

  const candidates = [',', ';', '\t', '|']
  let best = ','
  let bestScore = -1

  for (const candidate of candidates) {
    const counts = sample.map((line) => countOutsideQuotes(line, candidate))
    const first = counts[0]
    if (!first) continue
    /* Consistency matters more than volume: a column of prose full of commas
       should not beat the semicolon that actually divides the columns. */
    const consistent = counts.every((count) => count === first)
    const score = first * (consistent ? 10 : 1)
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  return best
}

function countOutsideQuotes (line: string, char: string): number {
  let count = 0
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]
    if (c === '"') {
      if (quoted && line[i + 1] === '"') { i += 1; continue }
      quoted = !quoted
    } else if (c === char && !quoted) {
      count += 1
    }
  }
  return count
}

export function parseCsv (text: string, delimiter = detectDelimiter(text)): string[][] {
  /* A byte order mark would otherwise become part of the first header, and
     "﻿Description" matches nothing. */
  const input = text.replace(/^﻿/, '')

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]

    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') { field += '"'; i += 1 }
        else quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') { quoted = true; continue }

    if (char === delimiter) { row.push(field); field = ''; continue }

    if (char === '\r') {
      if (input[i + 1] === '\n') i += 1
      row.push(field); field = ''; rows.push(row); row = []
      continue
    }

    if (char === '\n') {
      row.push(field); field = ''; rows.push(row); row = []
      continue
    }

    field += char
  }

  /* Whatever was still being read when the file ended is a real cell. */
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }

  return rows
}

/* A spreadsheet.

   Read through the same library the app exports with, loaded only when
   someone actually imports a spreadsheet. Only the first worksheet is read:
   a file with several sheets is almost always one table plus notes, and
   guessing which is which would be worse than asking. */
export async function parseXlsx (bytes: ArrayBuffer): Promise<string[][]> {
  const { default: Excel } = await import('exceljs')
  const wb = new Excel.Workbook()
  try {
    await wb.xlsx.load(bytes)
  } catch {
    throw new ImportError('That spreadsheet could not be read. Save it as .xlsx or .csv and try again.')
  }

  const sheet = wb.worksheets[0]
  if (!sheet) throw new ImportError('That spreadsheet has no sheets in it.')

  const rows: string[][] = []
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values: string[] = []
    /* Row values are 1-based and the zeroth slot is always empty. */
    const raw = row.values as unknown[]
    for (let c = 1; c < raw.length; c += 1) values.push(cellText(raw[c]))
    rows.push(values)
  })
  return rows
}

/* A cell's text, whatever kind of cell it was.

   Spreadsheets hold dates as dates, formulas as objects carrying a cached
   result, and rich text as an array of runs. All of them have to come out as
   the string a person would see in the cell. */
function cellText (value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString().slice(0, 10)

  if (typeof value === 'object') {
    const object = value as Record<string, unknown>
    /* A formula cell: the cached result is what the sheet was showing. */
    if ('result' in object) return cellText(object.result)
    if ('text' in object) return cellText(object.text)
    if ('richText' in object && Array.isArray(object.richText)) {
      return object.richText.map((run) => cellText((run as Record<string, unknown>).text)).join('')
    }
    if ('hyperlink' in object) return cellText(object.hyperlink)
  }

  return String(value)
}

/* Turns a raw grid into a table with headers.

   The header row is the first row that is not empty. A file with no header —
   straight into the data — is detected by looking for a row that is mostly
   words rather than figures, and if there isn't one the columns are named by
   position so the mapping step still has something to offer. */
export function toTable (grid: string[][], source: Table['source']): Table {
  const rows = grid.filter((row) => row.some((cell) => cell.trim() !== ''))
  const skipped = grid.length - rows.length

  if (rows.length === 0) throw new ImportError('That file has no rows in it.')

  const first = rows[0].map((cell) => cell.trim())
  const looksLikeHeader = first.filter((cell) => cell && !isNumeric(cell)).length >= Math.max(1, Math.ceil(first.length / 2))

  if (looksLikeHeader) {
    return {
      headers: first.map((cell, i) => cell || `Column ${i + 1}`),
      rows: rows.slice(1),
      source,
      skipped,
    }
  }

  return {
    headers: first.map((_, i) => `Column ${i + 1}`),
    rows,
    source,
    skipped,
  }
}

export function isNumeric (text: string): boolean {
  return parseNumber(text) !== null
}

/* A number, out of whatever a human or a spreadsheet wrote.

   "£1,250.00", "1 250,00", "(45.00)" for a credit, "20%" — all of them are
   numbers somebody expects the app to understand, and all of them appear in
   real exports. */
export function parseNumber (text: string): number | null {
  if (typeof text === 'number') return Number.isFinite(text) ? text : null
  const raw = String(text ?? '').trim()
  if (!raw) return null

  /* Accounting software writes negatives in brackets. */
  const negative = /^\(.*\)$/.test(raw)

  let cleaned = raw
    .replace(/^\(|\)$/g, '')
    .replace(/[^\d.,\-+]/g, '')
    .trim()

  if (!cleaned || cleaned === '-' || cleaned === '+') return null

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  if (lastComma > -1 && lastDot > -1) {
    /* Whichever comes last is the decimal separator; the other groups. */
    if (lastComma > lastDot) cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    else cleaned = cleaned.replace(/,/g, '')
  } else if (lastComma > -1) {
    /* One comma: a decimal in Europe, a thousands mark in "1,250". Three
       digits after it and nothing before the group means grouping. */
    const after = cleaned.length - lastComma - 1
    cleaned = after === 3 && /^\d{1,3}(,\d{3})+$/.test(cleaned)
      ? cleaned.replace(/,/g, '')
      : cleaned.replace(',', '.')
  }

  const value = Number(cleaned)
  if (!Number.isFinite(value)) return null
  return negative ? -value : value
}

/* A duration, as time trackers write it.

   Toggl, Harvest and Clockify all export "01:30:00" or "1:30" where an
   invoice wants 1.5 hours. Anything that is already a plain number is left
   alone. */
export function parseDuration (text: string): number | null {
  const raw = String(text ?? '').trim()
  if (!raw) return null

  const clock = /^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/.exec(raw)
  if (clock) {
    const hours = Number(clock[1])
    const minutes = Number(clock[2])
    const seconds = Number(clock[3] ?? 0)
    return Math.round((hours + minutes / 60 + seconds / 3600) * 10000) / 10000
  }

  /* "1h 30m", "90m", "2 hrs" */
  const spelled = /^(?:(\d+(?:[.,]\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+)\s*m(?:in(?:ute)?s?)?)?$/i.exec(raw)
  if (spelled && (spelled[1] || spelled[2])) {
    const hours = spelled[1] ? Number(spelled[1].replace(',', '.')) : 0
    const minutes = spelled[2] ? Number(spelled[2]) : 0
    return Math.round((hours + minutes / 60) * 10000) / 10000
  }

  return parseNumber(raw)
}
