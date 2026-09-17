/* Paper.

   Millimetres, because that is what the sheet in the printer is measured in
   and what @page wants. The US sizes are stated in millimetres too rather
   than kept in inches, so there is one unit in the codebase and no place
   where a conversion can be forgotten. */

import type { Orientation, PaperSize } from '@model/invoice'

export interface PaperDimensions { w: number; h: number }

export const PAPER_SIZES: Record<PaperSize, PaperDimensions> = {
  A4: { w: 210, h: 297 },
  Letter: { w: 215.9, h: 279.4 },
  Legal: { w: 215.9, h: 355.6 },
  A5: { w: 148, h: 210 },
}

export const PAPER_LABELS: Record<PaperSize, string> = {
  A4: 'A4 · 210 × 297 mm',
  Letter: 'Letter · 8.5 × 11 in',
  Legal: 'Legal · 8.5 × 14 in',
  A5: 'A5 · 148 × 210 mm',
}

/** CSS pixels per millimetre, at the 96dpi the preview and Chromium both use. */
export const MM_PX = 96 / 25.4

export function pageDimensions (paper: PaperSize, orientation: Orientation) {
  const size = PAPER_SIZES[paper] ?? PAPER_SIZES.A4
  const landscape = orientation === 'landscape'
  return {
    w: landscape ? size.h : size.w,
    h: landscape ? size.w : size.h,
    landscape,
  }
}

/* Type is drawn for A4 and has to hold its proportions on a smaller sheet.

   Without this, a theme's millimetre sizes take a larger share of A5 than
   they were drawn to and headings start crowding what sits under them. Only
   type is scaled: a margin, a rule weight and a cell's padding are physical
   facts about the printed page, not type, and stay where they were set. */
export function typeScale (width: number, height: number): number {
  const a4 = PAPER_SIZES.A4
  const ratio = Math.sqrt((width * height) / (a4.w * a4.h))
  return Math.round(Math.min(1.15, Math.max(0.8, ratio)) * 1000) / 1000
}
