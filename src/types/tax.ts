/* Tax.

   The stored shape is always the widest one: every line carries a list of
   taxes. The three modes below do not change what is stored, only how much
   of it the editor puts in front of you and how new lines are filled in.
   That way switching a document from one rate to per-line rates — or to a
   pair of taxes on every line — never loses what was typed and never needs
   a migration. */

export type TaxMode =
  /** One rate governs the whole invoice. The editor shows a single control. */
  | 'invoice'
  /** Each line carries its own single rate. Totals group by rate. */
  | 'line'
  /** Each line may carry several named taxes, e.g. GST + PST. */
  | 'multi'

export interface TaxLine {
  id: string
  /** What prints next to the amount: "VAT", "Sales tax", "GST", "Zero rated". */
  label: string
  /** A percentage, not a fraction: 20 means 20%. */
  rate: number
  /** Marks a line as exempt/zero-rated rather than merely taxed at 0%. */
  exempt?: boolean
}

/** One row of the totals block: every line taxed at this label and rate. */
export interface TaxSummaryRow {
  key: string
  label: string
  rate: number
  /** Net amount that this tax was charged on, in minor units. */
  base: number
  /** Tax charged, in minor units. */
  amount: number
}

/* Starting points offered in the inspector. Not law, just the rates people
   reach for most; every one of them is editable. */
export const COMMON_TAXES: ReadonlyArray<{ label: string; rate: number; note: string }> = [
  { label: 'No tax', rate: 0, note: 'Not registered, or out of scope' },
  { label: 'VAT', rate: 20, note: 'UK standard' },
  { label: 'VAT', rate: 19, note: 'Germany standard' },
  { label: 'VAT', rate: 21, note: 'Netherlands, Spain standard' },
  { label: 'VAT', rate: 5, note: 'UK reduced' },
  { label: 'VAT', rate: 0, note: 'Zero rated' },
  { label: 'Sales tax', rate: 8.875, note: 'New York City' },
  { label: 'GST', rate: 10, note: 'Australia' },
  { label: 'GST', rate: 5, note: 'Canada federal' },
]
