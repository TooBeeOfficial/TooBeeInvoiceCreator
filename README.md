# TooBee Invoice Creator

Write, design and export invoices — PDF, XLSX and CSV.

A desktop invoicing application built with Electron and React. Everything runs
locally: invoices are plain JSON files you keep wherever you like, and the app
never talks to a server.

---

## Contents

- [What it does](#what-it-does)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project layout](#project-layout)
- [How it fits together](#how-it-fits-together)
- [Where your data lives](#where-your-data-lives)
- [Building a release](#building-a-release)
- [Tech stack](#tech-stack)

---

## What it does

**Invoicing.** Line items with quantities, unit prices, per-line tax rates and
discounts. Totals are computed in minor units to avoid floating-point drift,
with rounding allocated across lines rather than applied at the end. Payments
received are tracked against each invoice, so an invoice knows what is still
owed and carries a status derived from that.

**Thirteen built-in templates.** Full-page layouts — Modern Minimal, Boxed
Ledger, Solid Slate, Classic Statement, Letterhead Note, Timesheet, VAT
Statement, Continental, Sidebar Ledger, Studio Bold — plus short forms: Plain
Slip, Compact Simplified and Till Roll. Each is Mustache markup with its own
stylesheet, and layouts can be customised live from a built-in code panel and
saved as your own templates.

**Export.** PDF rendered by Chromium from the same HTML the preview shows, so
the output is vector with real selectable text rather than a picture of a page.
XLSX workbooks keep the arithmetic live as formulas. CSV for a single invoice
or a batch.

**Import.** CSV, TSV, XLSX/XLS and JSON. The CSV reader handles quoted fields
containing commas, doubled-quote escapes, line breaks inside cells, and
auto-detects the delimiter — including the semicolons that continental European
spreadsheets use.

**SEPA payment QR codes.** Invoices can carry an EPC069-12 code (the GiroCode)
that European banking apps scan to pre-fill a transfer with the payee, IBAN,
amount and reference. IBANs are validated against their own ISO 13616 checksum
before a code is printed, and no code is produced when nothing is owed.

**22 locales, 14 interface languages.** Dates, numbers and currency are driven
by `Intl` from the document's locale, while the interface language is chosen
separately. Regional variants are distinguished where it matters — `de-AT` and
`de-DE` read the same German but format figures differently.

**Libraries.** Reusable items, saved clients, and your own company details,
so recurring work does not have to be retyped.

---

## Getting started

**Requirements:** Node.js 18 or newer (not pinned in `package.json`; Vite 5
and Electron 32 both need at least 18) and npm.

```bash
git clone <repository-url>
cd InvoiceCreator
npm install
npm run dev
```

`npm run dev` starts Vite on port 5173 and launches the Electron shell once the
dev server is listening. Hot reload works in the renderer.

To work on the UI alone in a browser tab, without the Electron shell:

```bash
npm run dev:web
```

In browser mode the desktop bridge is absent, so anything that touches the
filesystem degrades gracefully — PDF export falls back to the browser's own
print dialog, and other exports download as files.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server plus the Electron shell |
| `npm run dev:web` | Renderer only, in a browser tab |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Typecheck, then build the renderer |
| `npm run build:fast` | Build without typechecking |
| `npm start` | Build and run the production shell |
| `npm run dist` | Package a Windows NSIS installer |
| `npm run icon` | Regenerate the application icon |

---

## Project layout

```
electron/          Main process and the preload bridge
  main.cjs         Windows, menus, IPC handlers, file dialogs
  preload.cjs      The only surface exposed to the renderer
scripts/           Build and launch helpers
src/
  core/            Everything that is not React
    document/      View model and HTML rendering
    export/        PDF, XLSX, CSV
    import/        Table reading and column mapping
    i18n/          Dictionaries and locale definitions
    money/         Minor-unit arithmetic and formatting
    payment/       IBAN validation, EPC payload, QR drawing
    storage/       Document files, preferences, library
    totals/        Totals and rounding allocation
    validation/    Pre-flight checks on a document
  components/      Composite UI
  elements/        Primitive inputs and controls
  pages/           Invoices, Editor, Items, Clients, Company
  store/           Zustand stores
  templates/       The thirteen built-in layouts, plus the registry
  types/           Shared TypeScript models
```

Imports use path aliases defined in [`vite.config.ts`](vite.config.ts):
`@core`, `@model`, `@elements`, `@components`, `@store`, `@templates`,
`@pages`, `@styles`, `@hooks`.

---

## How it fits together

**A document is data.** An invoice is a plain object; nothing in the rendering
path mutates it. `core/document/viewModel.ts` turns a document plus a locale
into a flat, already-formatted view model, and a template renders that with
Mustache. Templates therefore contain no logic and no knowledge of the app —
which is what makes a user-written template safe to load.

**Templates are registered, never reached into.** Everything goes through
`templates/registry.ts`, so an invoice naming a template that has been deleted
still opens, falling back to a built-in rather than a blank sheet.

**The desktop bridge is optional.** `core/storage/desktop.ts` is the single
place that touches `window.invoicer`, and it is written for the bridge being
absent. That is what lets the same renderer run in a browser tab.

**Content Security Policy is strict.** `script-src 'self'` — nothing in the app
builds code at runtime. The preview frame renders template markup with
scripting switched off, as does the offscreen window that prints the PDF. The
policy is injected at build time by a Vite plugin and is looser only in
development, where hot reload needs `eval` and a websocket.

---

## Where your data lives

Invoices are saved as `.json` files wherever you choose. They are the source of
truth and are yours to move, back up or version-control.

The app keeps its own state in Electron's `userData` directory
(`%APPDATA%\TooBee Invoice Creator\` on Windows):

| File | Contents |
| --- | --- |
| `library.json` | Index of known invoices, saved items and clients |
| `preferences.json` | Settings, locale, theme |
| `templates/*.json` | Templates you have saved |

`library.json` is an index, not the source of truth — deleting it loses the
list, not the invoices.

---

## Building a release

```bash
npm run dist
```

Produces a Windows NSIS installer via electron-builder. Configuration lives in
the `build` block of [`package.json`](package.json).

**Note on code signing:** builds are currently unsigned, so Windows SmartScreen
and Defender will warn on first run and may flag the installer heuristically.
Fixing this properly requires a code-signing certificate — either Azure
Artifact Signing or a traditional OV/EV certificate — configured under
`build.win`. Unsigned binaries cannot accumulate reputation, so each release
starts from zero.

---

## Tech stack

| | |
| --- | --- |
| Shell | Electron 32 |
| UI | React 18, TypeScript 5.6 |
| Build | Vite 5 |
| State | Zustand 4 |
| Templating | Mustache |
| Spreadsheets | ExcelJS |
| QR encoding | qrcode-generator |
| Editor | CodeMirror 6 |

Styling is CSS Modules throughout — no UI framework.

---

## License

Not currently specified. Add a `LICENSE` file before distributing or accepting
contributions.
