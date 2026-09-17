# Samples

Reference material, not code. Nothing in `src/`, `electron/` or the build
config reads anything in this folder.

## `rendered/`

One self-contained HTML file per built-in template, produced by the PDF export
path (`core/document/render.ts` plus the template's own `markup.ts`/`styles.ts`).
Each file is a finished invoice — open it directly in a browser to see the
layout without running the app. Regenerate one by opening that template in the
editor, loading a sample invoice, and using File ▸ Export PDF's print preview
(or saving the rendered HTML from the preview frame) to capture fresh output
after a template change.

## `invoices.csv`

A three-line-item invoice used to exercise the CSV importer
(`core/import/readTable.ts` and `core/import/mapRows.ts`). Import it from
File ▸ Import in the app to check that column mapping still lines up after a
change to the importer or to `core/import/columns.ts`.
