/* Every layout the app knows about.

   Built-in templates are plain data compiled into the app; templates the user
   saves are the same shape, read from disk at startup and registered here.
   Nothing else in the codebase reaches into a template directly — a lookup
   always comes through this file, so a missing or deleted template resolves
   to something printable instead of a blank sheet. */

import type { InvoiceTemplate } from '@model/template'
import modernMinimal from './modern-minimal'
import classicStatement from './classic-statement'
import continental from './continental'
import letterheadNote from './letterhead-note'
import timesheet from './timesheet'
import sidebarLedger from './sidebar-ledger'
import vatStatement from './vat-statement'
import studioBold from './studio-bold'
import compactSimplified from './compact-simplified'
import boxedLedger from './boxed-ledger'
import solidSlate from './solid-slate'
import plainSlip from './plain-slip'
import tillRoll from './till-roll'

/* Ordered as the rail shows them: the full-page layouts first, from the
   plainest to the most assertive, then the short forms — which are ordered
   the same way, from the one with nothing drawn on it to the one that looks
   like it came out of a till. */
export const BUILTIN_TEMPLATES: InvoiceTemplate[] = [
  modernMinimal,
  boxedLedger,
  solidSlate,
  classicStatement,
  letterheadNote,
  timesheet,
  vatStatement,
  continental,
  sidebarLedger,
  studioBold,
  plainSlip,
  compactSimplified,
  tillRoll,
]

/* Templates the user saved, registered at startup. Held here rather than in
   the store because a template is data the renderer needs, not state the UI
   reasons about. */
let userTemplates: InvoiceTemplate[] = []

export function setUserTemplates (templates: InvoiceTemplate[]): void {
  userTemplates = templates.map((t) => ({ ...t, custom: true }))
}

export function allTemplates (): InvoiceTemplate[] {
  return [...BUILTIN_TEMPLATES, ...userTemplates]
}

export function findTemplate (id: string): InvoiceTemplate | undefined {
  return allTemplates().find((t) => t.id === id)
}

/** Always returns something. A file naming a template that is gone still opens. */
export function getTemplate (id: string): InvoiceTemplate {
  return findTemplate(id) ?? BUILTIN_TEMPLATES[0]
}

export const templatesFor = (detail: InvoiceTemplate['detail']): InvoiceTemplate[] =>
  allTemplates().filter((t) => t.detail === detail)
