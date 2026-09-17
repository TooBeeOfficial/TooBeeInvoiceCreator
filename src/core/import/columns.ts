/* Working out what the columns in someone else's file mean.

   The app never guesses silently — whatever this decides is shown in the
   import dialog as a set of dropdowns the person can correct before anything
   is brought in. What this does is make the common cases correct before they
   look, so that importing a Toggl export or a price list is a glance and a
   click rather than eight dropdowns.

   Matching is on the header text, normalised and compared against the words
   each field is actually called in the exports people have. Order matters:
   the list is walked in priority order and the first unclaimed column wins,
   so "Description" goes to the description rather than to the note field
   that also lists it. */

export type ImportField =
  | 'description'
  | 'details'
  | 'quantity'
  | 'unit'
  | 'unitPrice'
  | 'amount'
  | 'taxRate'
  | 'category'

export interface FieldSpec {
  id: ImportField
  label: string
  /** What it does, shown under the dropdown in the dialog. */
  note: string
  /** Header words that mean this field, lower-cased and stripped. */
  synonyms: string[]
}

/* Priority order. `description` is matched before `details` and `unitPrice`
   before `amount`, because a file with both should put the obvious one in
   the obvious place. */
export const FIELDS: FieldSpec[] = [
  {
    id: 'description',
    label: 'Description',
    note: 'What was sold. The one column an import cannot do without.',
    synonyms: [
      'description', 'item', 'items', 'product', 'service', 'name', 'title',
      'task', 'activity', 'work', 'project', 'job', 'line', 'lineitem',
      'summary', 'label', 'article', 'position', 'bezeichnung', 'designation',
      'concepto', 'descrizione', 'omschrijving',
    ],
  },
  {
    id: 'quantity',
    label: 'Quantity',
    note: 'How many, or how long. Durations like 01:30 become 1.5.',
    synonyms: [
      'quantity', 'qty', 'qte', 'count', 'units', 'hours', 'hrs', 'hour',
      'duration', 'time', 'timespent', 'billablehours', 'days', 'amountofunits',
      'menge', 'anzahl', 'cantidad', 'quantita', 'aantal',
    ],
  },
  {
    id: 'unitPrice',
    label: 'Unit price',
    note: 'The price of one. If you only have a line total, map that instead.',
    synonyms: [
      'unitprice', 'price', 'rate', 'unitcost', 'cost', 'priceeach', 'each',
      'hourlyrate', 'ratehr', 'rateperhour', 'perunit', 'pricepersunit',
      'einzelpreis', 'preis', 'prixunitaire', 'precio', 'prezzo', 'prijs',
    ],
  },
  {
    id: 'amount',
    label: 'Line total',
    note: 'The whole line. Used to work out a unit price when there is none.',
    synonyms: [
      'amount', 'total', 'linetotal', 'subtotal', 'value', 'sum', 'net',
      'nettotal', 'amountdue', 'extended', 'extendedprice', 'betrag',
      'gesamt', 'montant', 'importe', 'totale', 'bedrag',
    ],
  },
  {
    id: 'unit',
    label: 'Unit',
    note: 'Hours, items, days — printed after the quantity.',
    synonyms: ['unit', 'uom', 'measure', 'unitofmeasure', 'einheit', 'unite', 'unidad'],
  },
  {
    id: 'taxRate',
    label: 'Tax rate',
    note: 'A percentage. 20, 20%, or 0.2 are all understood.',
    synonyms: [
      'taxrate', 'tax', 'vat', 'vatrate', 'gst', 'gstrate', 'salestax',
      'taxpercent', 'vatpercent', 'mwst', 'ustsatz', 'tva', 'iva', 'btw',
    ],
  },
  {
    id: 'details',
    label: 'Note',
    note: 'A second line under the description.',
    synonyms: [
      'details', 'detail', 'note', 'notes', 'comment', 'comments', 'memo',
      'remark', 'remarks', 'longdescription', 'client', 'reference',
    ],
  },
  {
    id: 'category',
    label: 'Category',
    note: 'Only used when saving to your items. Not printed.',
    synonyms: ['category', 'group', 'type', 'kind', 'class', 'kategorie', 'categorie', 'categoria'],
  },
]

/** A header reduced to the letters that carry its meaning. */
export function normalize (header: string): string {
  return header
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export type Mapping = Partial<Record<ImportField, number>>

/* Reads a set of headers and proposes a mapping.

   Exact matches are taken first across every field, so a column called
   exactly "Rate" cannot be stolen by a fuzzy match on something else. Only
   then are the looser contains-matches considered. */
export function detectMapping (headers: string[]): Mapping {
  const normalized = headers.map(normalize)
  const taken = new Set<number>()
  const mapping: Mapping = {}

  const claim = (field: ImportField, index: number) => {
    mapping[field] = index
    taken.add(index)
  }

  for (const field of FIELDS) {
    const index = normalized.findIndex((header, i) => !taken.has(i) && header && field.synonyms.includes(header))
    if (index !== -1) claim(field.id, index)
  }

  for (const field of FIELDS) {
    if (mapping[field.id] !== undefined) continue
    const index = normalized.findIndex((header, i) =>
      !taken.has(i) && header.length > 2 && field.synonyms.some((word) => header.includes(word) || word.includes(header)))
    if (index !== -1) claim(field.id, index)
  }

  /* A file with one obvious text column and one obvious number column and no
     usable headers at all still imports: the first column becomes the
     description so there is something to correct rather than nothing. */
  if (mapping.description === undefined && headers.length > 0 && !taken.has(0)) {
    claim('description', 0)
  }

  return mapping
}
