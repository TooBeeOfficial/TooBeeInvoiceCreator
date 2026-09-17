# TooBee Invoice Creator

A Windows desktop app for writing, designing and exporting invoices — as real vector PDFs, as
formatted Excel workbooks with live formulas, and as flat CSV for accounting software.

```
npm install
npm run dev        # development, with hot reload
npm run start      # build and run the production app
npm run typecheck  # types only
npm run build      # typecheck, then build to dist/
npm run dist       # package a Windows installer into dist/
npm run icon       # redraw build/icon.ico from the SVG artwork
```

## What it does

**Writes invoices.** Structured line items — description, quantity, unit, unit price, discount and
tax per line — never a block of typed text. Subtotal, tax and grand total are worked out in one
place and printed everywhere.

**Tracks them.** Every invoice you save is listed with what it came to and whether it has been paid:
draft, sent, paid, overdue or void. Overdue is worked out from the due date rather than stored, so
it is never stale. You can mark an invoice paid from the list without opening it.

**Remembers what you sell.** The item catalogue keeps your services and products with their
prices, so they go onto an invoice in one click. Save a line straight from an invoice with its ⋯
menu, or fill the catalogue in one go by importing a price list.

**Imports rows from elsewhere.** CSV, Excel (.xlsx) and JSON, landing either as line items on the
invoice in front of you or as entries in the catalogue. The importer proposes what each column
means and shows you the first few rows as they will arrive — nothing is brought in on a guess you
have not seen. It understands what real exports actually contain: semicolon-delimited European
CSVs, prices written `1,250.00` or `1.250,00`, negatives in brackets, tax as `20%` or `0.2`, and
time-tracker durations like `01:30:00`, which become 1.5 hours.

**Designs them.** Three templates to start from, a palette and type inspector that restyles any of
them, and a code panel holding the template's own Mustache markup and CSS for when the controls do
not reach far enough.

**Exports them.**

| Format | What it is |
| --- | --- |
| PDF | The invoice as it prints. Rendered by Chromium from the same HTML the preview shows, so it is real vector text, selectable and searchable. |
| XLSX | One invoice, laid out as the client reads it, with the amount column and the totals left as live formulas. |
| CSV | The data dump: one row per line item with the invoice fields repeated, plain decimals, ISO dates. What QuickBooks and Xero want, and what a pivot table can add up. |

The invoice list also exports every invoice at once as a single CSV.

## Templates

| Template | For | Signature |
| --- | --- | --- |
| **Modern Minimal** | Freelancers and studios sending a full invoice | The amount due and the date it is due announced under the letterhead, before the detail — hairline rules, no boxes |
| **Classic Statement** | Billing a business that still files paper | Serif letterhead, ruled and bordered table, and a remittance advice along the foot with a cut line |
| **Letterhead Note** | Consultants and anyone billing someone they know | Written as a letter — dated, addressed, a salutation when the client has a contact name, and signed over a real rule at the foot |
| **Timesheet** | Work billed by the hour, day or unit | The quantity is set as a figure worth reading, and the units are totalled at the foot beside the money |
| **Continental** | Invoices going in an envelope in Europe | DIN 5008: return address and recipient positioned for a DIN long window, particulars in a block beside them, and fold and punch marks down the left edge |
| **VAT Statement** | A taxable supply, especially across a border | The only one that prints a tax analysis — net charged at each rate and the tax it came to — with both registration numbers on their own lines |
| **Sidebar Ledger** | Invoices carrying a lot of standing detail | Your details and bank block go down a solid coloured band; the work gets the whole main column |
| **Studio Bold** | Studios and photographers | Editorial. The number and the total are set as headlines and there is not a box on the sheet |
| **Compact Simplified** | Receipts and small retail sales | A single dense column with dotted leaders running from each item to its price. Drawn for A5 |

Nine built in. Compact Simplified carries the short form of an invoice — supplier, date, what was sold, the rate of
tax and the total including it — which is all a UK retail sale under £250 needs. The others carry the
full set. The **Detail** control in the editor switches a document between the two shapes.

They are chosen from a dropdown in the design panel, grouped into the ones
that ship with the app and the ones you have saved, with a line under it
describing whichever is selected. The sheet beside the panel is already a
full-size preview, so a grid of postage-stamp thumbnails would tell you less
than that sentence does.

## The look

The chrome is the TooBee Calender Maker's press console, ported so the two
apps read as one family: the same slate body, the same hairline rules, the
same bee gold, the same 2px cut corner. Only the status inks are this app's
own — cyan for sent, green for paid, the brand magenta for overdue.

One rule is worth knowing before touching `styles/tokens.css`. **Bee gold
splits in two, because one gold cannot do both jobs.** On a slate panel it is
9:1 and reads beautifully; on white it is 1.85:1 and disappears.

- `--accent` fills a shape, and carries `--accent-ink-on` as its ink.
- `--accent-ink` is the gold used *as* ink — text, a rule, an indicator — and
  it darkens to `#8A6200` in the light theme so it still reads on paper white.

Using the wrong one is the single easiest way to make this palette unreadable.
Three greys were lifted a shade from the Calender Maker's originals so that
hint text, the draft pill and the overdue pill clear 4.5:1 as small text;
every foreground/background pair in both themes is at AA.

The icon is the Calender Maker's sheet made into an invoice — same paper,
same square corners, same gold header band, same bee in front — with two item
rows ruled off to their amounts and a total struck under a double rule. The
binder tabs went with the calendar they belonged to. `build/icon.svg` is the
full drawing and `build/icon-small.svg` a simplified cut used at 32px and
below, where an outlined wing would only antialias to grey mush.

## How it is put together

```
electron/          the desktop shell: dialogs, files, the PDF worker
src/
  types/           the file format and every contract in it — no logic
  core/            all the functionality, as plain TypeScript
    money/         integer minor-unit arithmetic, and formatting at the edge
    totals/        calcTotals — the only place a money figure is worked out
    document/      the view model, the base stylesheet, the renderer
    export/        pdf, xlsx, csv, file naming
    import/        csv/xlsx/json readers, column detection, row mapping
    storage/       reading and writing files, the library index, preferences
    validation/    what is missing and what is merely risky
    numbering/     the invoice number sequence
    status/        draft, sent, paid, overdue, void
  templates/       one folder per layout: markup.ts, styles.ts, index.ts
  store/           zustand: the open document, the library, preferences, the window
  elements/        atoms — Button, Field, TextInput, StatusPill, Money, Splitter…
  components/      composites — LineItemsTable, Inspector, InvoiceTable…
  pages/           Invoices, Editor, Items, Clients, My company
  hooks/           bootstrap, theme, keyboard
  styles/          design tokens, reset, the shared control body
```

Every element, component and page is its own folder with its own `.module.css`. The rule the layout
follows: **`core/` never imports React and never touches the DOM.** It is the arithmetic, the file
format and the exports, and it can be run — and is run — outside a browser. Everything above it
wires those functions to controls.

The other rule: **`src/types/` is the file format.** Adding a field to an invoice means deciding
once, there, what it is called on disk.

### How a page is built

```
InvoiceDoc ──► calcTotals ──► buildViewModel ──► Mustache(template.html) ──► HTML
                                                 + baseCss
                                                 + template.css
                                                 + the user's own CSS, last
```

Templates can print a value and ask whether something exists. They cannot add up, format or decide —
all of that happened in `buildViewModel`, which is what keeps the design separate from the
arithmetic. Rewrite a template by hand and no calculation moves; change how tax is worked out and
every template follows.

The preview, the PDF and the template rail all go through `renderDocument`, so what is on screen is
literally what comes out of the printer. The preview writes into a live iframe rather than reloading
it, which is why typing never flickers or loses the scroll position — and that iframe has scripting
switched off, as does the offscreen window that renders the PDF.

### Money

Every amount the app computes is an integer in the currency's minor unit, rounded half away from
zero, and rounded exactly once — at the point an amount becomes real. Unit prices are the single
exception: they are stored as decimals, because a rate can legitimately be 0.125 per unit, and are
turned into minor units when a line total is worked out.

Tax-inclusive prices are extracted rather than added: a £120 line at 20% holds £20 of tax, not £24.
A document discount is spread across the lines in proportion to what each contributes, using the
largest-remainder method, so the parts always sum to the whole and tax is charged on what is really
owed.

### Tax

Stored at its widest: every line carries a list of taxes. The three modes decide only how much of
that list the editor shows and uses.

- **One rate** — a single rate governs the invoice.
- **Per line** — each line carries its own rate. Totals group by rate.
- **Several per line** — GST and PST on the same line, both charged on the same net.

Switching between them never loses what was typed, because nothing is thrown away — which is also
why the structured e-invoicing formats now landing across the EU are a mapping job from this shape
rather than a re-architecture.

### Where things live

Invoices are ordinary `.json` files, saved wherever you choose. The app keeps an index of them in its
own data folder so the list can be drawn without opening a dozen documents — but the index is a
cache, and when it and a file disagree, **the file wins**. A file that has been moved or deleted is
marked as missing in the list rather than quietly dropped.

Preferences — your business details, the client book, the item catalogue, the numbering scheme, what
a new invoice starts as — live beside it and never travel inside a document.

Those are split across two places on purpose. **My company** holds facts about your business, which
are the things that end up printed on an invoice. **Settings** — the gear on the rail — holds facts
about this installation: the theme, the language, whether the last invoice reopens on start. Mixing
the two is how a settings screen becomes a list nobody can find anything in. Changing a default never reaches back into an
invoice already written.

## Importing

The importer is three steps: choose a file, check the column mapping, import. The middle step is
the point — every column is a dropdown showing a sample of what is actually in it, so a mapping
the app got wrong is one click to correct rather than an import to undo.

| It understands | Because |
| --- | --- |
| `;` `,` `tab` `\|` delimiters | Chosen by which one divides the rows *consistently*, so prose full of commas in a semicolon file does not win |
| `1,250.00` and `1.250,00` | Whichever separator comes last is the decimal one |
| `(45.00)` | Accounting software writes negatives in brackets |
| `20%` and `0.2` | A percentage-formatted cell holds a fraction; an explicit `%` always wins |
| `01:30:00`, `2:15`, `1h 30m` | Time trackers export durations, invoices want hours |
| A line total but no unit price | The price is worked out from the quantity, and the app says it did |
| No header row at all | Columns are named by position so the mapping step still has something to offer |

Rows with nothing in the description column are counted and reported rather than dropped in
silence: an import that says "48 lines" when the file had 50 is telling you something.

Re-importing the same price list updates the items already in the catalogue instead of leaving two
of everything — matched on description and price.

## Invoice numbers

The app proposes the next number and steps its counter on when an invoice is saved, not when one is
opened, so an abandoned draft does not burn a number and leave a hole in the sequence. The field
stays editable throughout: someone arriving from a spreadsheet with 214 invoices behind them carries
on at 215. Type a higher number by hand and the counter catches up rather than handing out one that
is already in use.

## Payments

An invoice is rarely paid or unpaid. It is paid up to a point — a deposit, a part payment, an
instalment — so what arrives is recorded as a list rather than a tick box. **Payments received** in
the editor takes a date, an amount, how it came and the reference the payer quoted; **Record
payment** arrives with today's date and whatever is still outstanding already filled in, because
that is the ordinary case. A refund is a payment with a negative amount, not a second kind of
record, so the arithmetic stays one code path.

Three decisions are worth knowing:

**The total and the amount due are different figures, and both are kept.** `calcTotals` returns
`total` — what the invoice came to, which paying some of it never changes — alongside `paid` and
`amountDue`. The printed sheet shows only the amount due until something has been paid, at which
point the total joins the rows above it and "Amount due" starts meaning what it says. With no
payments recorded, every template prints exactly what it printed before.

**Payments decide whether an invoice is paid; nothing else about it.** The stored status is what
the user asserted, and `reconcile` in `core/status/status.ts` is the one place the two are squared
up. It stamps the paid date from the payment that crossed the line rather than from today, so
entering a transfer that landed last Tuesday dates it last Tuesday. Removing a payment unwinds
`paid` back to `sent` and nothing else: a draft stays a draft, and money against a void invoice
raises a check rather than quietly reviving it.

**How much is paid is not a status.** It could have been a fifth state next to *overdue*, and it
is not, because an invoice can be forty per cent paid *and* twenty days late — one list cannot say
both. Settlement is its own axis (`unpaid` / `part` / `settled` / `over`) and is shown beside the
status rather than instead of it: "Overdue · £400 of £1,000".

An amount is always in the invoice's own currency. A payment that arrived in another one is
recorded as what actually cleared, converted — the totals are integer minor units of a single
currency, and the exchange difference is an accountant's line of its own.

## Two languages, not one

The app has two languages running at once, and they are deliberately separate
settings.

| | Set in | Governs |
| --- | --- | --- |
| **App language** | Settings (the gear on the rail) | The words in the window. Nothing on an invoice changes |
| **Document language** | Per invoice, under Details — with a default in Settings | The words printed on the page, and how its dates and figures are written |

A freelancer in Berlin billing a client in Paris wants German in the window and
French on the invoice. Each document carries its own `settings.locale`, so an
invoice written in French last spring still opens in French however the app is
set today.

Fourteen languages, the same set the Calender Maker speaks and listed in the
same order, so someone who uses both finds their own in the same place:
English, Turkish, Greek, Italian, Spanish, German, French, Dutch, Portuguese,
Swedish, Polish, Russian, Japanese and Chinese.

They spread across twenty-two locales, because a language is not a locale:
`de-AT` and `de-DE` read the same German but write dates and figures
differently, and an invoice has to get both right. There is no `zh-TW` on the
list — the Chinese dictionary is Simplified, and offering a Traditional locale
that then printed 发票 rather than 發票 would promise something the app does
not have.

**Both sides are translated in full.** Every label on every one of the nine
templates comes from the dictionary, so a template you write by hand in the
code panel is translated too without doing anything — and so does every word
in the window: the pages, the forms, the design panel, the dialogs, the
validation messages, the toasts, and the phrases the list builds ("9 days
overdue", "£400 of £1,000").

Four things are deliberately left alone, because translating them would make
them wrong: typeface names are the names of the faces, paper sizes are A4 and
Letter everywhere, currency codes are ISO, and the key names in the shortcuts
list are what is printed on the keyboard.

Anything with a number or a name in it is a pattern rather than a sentence
glued together from fragments — `'{days} days overdue'`, `'Dear {name},'` —
because word order is not ours to assume. The salutation is the clearest case:
Japanese puts the honorific after the name, so `{name} 様` is the whole line.

Translations live in `core/i18n/dictionaries/`, one file per language, each
typed against the English one — so a string added to English and nowhere else
is a build error rather than a gap someone finds on a printed invoice. That
strictness is what makes the set trustworthy: there is no silent fallback, and
`tsc` refuses to build until all fourteen have the new word.

## Section dividers

The rules that separate one part of a sheet from another — under the
letterhead, above the amount due — carry more of an invoice's character than
their size suggests, so they can be styled. The control is **Divider**, in the
Spacing tab under Rules, and it offers thirteen:

| | |
|---|---|
| **Plain rule** | the template's own rule, untouched |
| **Accent rule** | the same rule in the house colour |
| **Brand tab** | a bar of accent at the left, hairline after it |
| **Bookends** | accent at both ends, hairline between them |
| **Fading rule** | accent fading out across the width |
| **Centred** | weighted to the middle, gone by both margins |
| **Two-tone** | half accent, half ink |
| **Dashed** · **Dotted** | the ruled patterns |
| **Blocks** | long bars of accent with short gaps |
| **Pinstripe** | fine hatching — solid at arm's length, ruled up close |
| **Dash and dot** | the rule a ledger or a plan drawing uses |
| **Double rule** | the double underline a ledger closes a column with |

Templates do not each implement this. A template marks the rules it considers
section dividers with `brand-rule`, and says which edge each one sits on with
`rule-under` or `rule-over`; `core/document/baseCss.ts` does the painting. So
a divider is one gradient, described once, and a new template joins in by
adding two classes.

Three things about the drawing are worth knowing before changing it:

- The stripe is painted into the border the template already owns, with
  `border-image`. Nothing moves, and no template's markup changes for the
  paint itself.
- **A collapsed table throws border images away.** Where a divider lives on
  table cells — the total row of Classic Statement — it is painted as a
  background stripe over the border instead. A stripe drawn once across the
  width would restart in every cell, so the brand tab and the fading rule fall
  back to a plain accent bar there; the repeating patterns tile and carry
  across unchanged.
- **The double rule cannot be a gradient.** A border image is sliced *across*
  the edge, so it can carry a pattern along a rule but never through it. The
  double rule is drawn as a real `border-style: double`, which is why the edge
  has to be named — and it is given at least 1.1mm, because a browser renders
  a double border under about 3px as a single line.

## Saved styles

A saved style is the whole look of an invoice — colour, typefaces, sizes,
letterforms, spacing, rules and marks — kept under a name and put back on any
invoice in one click.

It is deliberately everything the **Style** and **Spacing** tabs can change
between them, because those two are one decision in practice: the margins a
layout wants depend on the type it is set in, and half of that saved on its
own does not look like anything. The control therefore appears at the top of
both tabs — the same component, mounted twice, so it is never on the tab you
are not looking at.

Saved styles are shown as swatches, in the same card the built-in palettes
use, because a look is recognised by its colours long before its name is read
— and because the two are the same kind of thing from where you are sitting.
Colour lives in the Style tab with them rather than under Template, which is
about layout and paper.

What a style is *not* is a layout. It carries no template, no paper size and
nothing that was typed, so applying one changes how the invoice looks and not
a word of what it says.

Saving under a name that already exists updates that style rather than making
a second one; the panel says **Update style** instead of **Save style** when
that is what the button will do. It reads the current theme against every
saved one token by token, so "House is applied" is a fact rather than a guess,
and it stops claiming it the moment you nudge anything.

Styles live in preferences alongside the client book and the item catalogue,
so they are yours rather than any one document's.

## Full and simple

The **Detail** control in the editor decides how much of the document prints.

| | Full | Simple |
| --- | --- | --- |
| Heads the page | Invoice | Receipt |
| Your name, address, registration number | prints | prints |
| How to pay you | prints | prints |
| Line items, tax, total | prints | prints |
| Note to the client | prints | prints |
| The client's address, contact and VAT number | prints | dropped — the name is kept |
| Purchase order, reference, supply date | prints | dropped |
| Terms and conditions | prints | dropped |

Simple is the short form: enough for a UK retail sale under £250, or a receipt
over a counter. It drops between a sixth and a fifth of the printed page
depending on the layout. Nothing is deleted from the document — switching back
to Full brings it all straight back.

Two things it never drops, on principle: **your own details**, because a
simplified invoice still has to say who issued it, and **how to pay you**,
because nothing that costs the user money should disappear behind a
presentation switch.

The rule lives in `core/document/viewModel.ts`, not in the templates. A
template asking `{{#hasTerms}}` is asking whether there are terms to print, so
in the short form the answer is simply no. Every layout gets the behaviour
without a line of template code — including one you write by hand in the code
panel — and there is one place to read to find out what the two forms differ
by.

Choosing a different template does not change the setting. How much detail
prints is a decision about the transaction, not about the layout.

## Checks, not blocks

The editor's **Checks** panel says what is missing. Errors mean the document is not an invoice yet —
no number, nobody to bill, nothing billed for. Warnings mean it will print and total correctly but
something is missing that an accountant or a tax office would expect.

Neither stops you exporting. A US freelancer has no VAT number and should not be nagged into
inventing one.

## The editor's panes

The form, the sheet and the design panel are divided by draggable splitters.
They can also be moved from the keyboard: focus a divider and use the arrow
keys (Shift for bigger steps), Home to reset it, End to push it to its limit.
Double-clicking resets it too.

Widths are held to bounds worked out from the room actually available, so the
sheet always keeps a usable minimum however far the other two are dragged, and
shrinking the window pulls the panes in rather than pushing the preview out of
sight. The arrangement is saved when a drag ends — not on every pixel of it —
and comes back next time you open the app.

### How the form column reflows

The panes are resizable, so the forms inside them answer to **how wide the
column is, not how wide the window is**. A media query measures the wrong thing
here: the window can be 2,000px across while the form column is dragged down to
420. Everything inside asks `@container editor-form` instead, declared on the
scrolling area in `EditorPage.module.css`.

| Column content width | What changes |
| --- | --- |
| above 640px | Details and tax rows three across, address two |
| 640px | Three-column rows drop to two |
| 560px | The items table stops being a table: each line becomes a stacked card, with the figures labelled since the column headings are gone |
| 430px | Everything goes to one column, panel padding tightens, the amount due takes its own line in the totals bar |

560px is not arbitrary — it is the items table's own minimum for the columns an
invoice shows by default, so the table stacks at exactly the point it would
otherwise start scrolling sideways.

The stacked form changes no markup. It is still a table, still one row per line,
and still read as a table by a screen reader; only the boxes change. Because
there are no columns left to line them up, the rule *between* two lines is made
heavier than any rule inside one.

## Keyboard

| | |
| --- | --- |
| `Ctrl+1` … `Ctrl+5` | Invoices · Editor · Items · Clients · My company |
| `Ctrl+F` | Search this page |
| `Ctrl+,` | Settings |
| `Ctrl+N` / `Ctrl+O` | New invoice · Open |
| `Ctrl+S` / `Ctrl+Shift+S` | Save · Save as |
| `Ctrl+E` or `Ctrl+P` | Export PDF |
| `Ctrl+Shift+E` | Export Excel |
| `Ctrl+Enter` | Add a line and put the cursor in it |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo · Redo |
| `Ctrl` `+` / `-` / `0` | Zoom in · out · fit |
| `Ctrl` or `Shift` + wheel | Zoom the sheet about the pointer |
| Middle button, held | Drag the sheet about |
| `Ctrl+B` | Show or hide the design panel |
| Arrows on a focused divider | Resize a pane (`Shift` for bigger steps, `Home` to reset) |
| `F1` · `F5` · `F11` | Shortcuts · Reload · Full screen |

A chord always fires, even while typing — `Ctrl+Enter` is meant to be pressed
mid-field, so you can type a line and start the next without reaching for the
mouse. The one exception is undo: inside a text field the browser's own undo
wins, because it puts back the letters rather than rewinding the document.

Both of the mouse gestures on the sheet have the same awkwardness behind them:
the preview is an **iframe**, and a wheel or a press over it is dispatched
inside *that* document and never reaches the window around it. A listener on
the grey surface sees nothing while the pointer is over the paper, which is
most of the time. So the frame catches both itself and hands them out, first
converting the point from the sheet's own unscaled pixels back into the
window's.

Panning goes further, because **a press inside an iframe takes the whole
gesture with it**. Once the button goes down on the paper, the movements and
the release keep being delivered to the sheet's own document however far the
pointer travels, and no amount of ignoring the pointer out here takes them
back — implicit capture is not something `pointer-events: none` can override.
So the frame follows the drag it caught and reports where it goes, converting
each point out of the sheet's unscaled pixels as it does.

Which means a drag can be reported from either document, and sometimes from
both. So every movement is worked out **from the press** rather than from the
movement before it: the same movement arriving twice lands the sheet in the
same place instead of moving it twice as far.

The press is `preventDefault`ed in both documents — otherwise Chromium puts up
its four-way autoscroll widget and takes the drag over — the frame still steps
aside with `pointer-events: none` so a drag begun on the grey is not swallowed
as the cursor crosses the paper, and the left button is deliberately untouched,
so selecting a figure to copy still works.

One more thing, which cost two rounds to find: **`event.buttons` is how a drag
notices the button was released somewhere this window could not see**, but not
every source of input fills it in. Electron's `sendInputEvent` reports `0`
throughout, so a handler that trusts it blindly ends the drag on its first
movement. It is only believed here once it has been seen to report something.

**The drag works at any size**, including the usual one. Scrolling can only
move a sheet bigger than the space it is in, and at Fit it is exactly the size
of the window — so an axis with nothing to scroll carries the sheet instead,
by transform. Each axis decides for itself, which is what a page zoomed past
the window sideways but not downwards needs.

Two things about that are worth knowing before touching it:

- **Which mechanism an axis uses is settled once, at the press.** Carrying the
  sheet *creates* room to scroll — a translated box counts towards the
  scrollable area — so an axis re-measured mid-drag flips to scrolling the
  moment the first millimetre of carry lands, and the sheet judders between
  the two. The room is measured from `offsetWidth`, which is the layout size,
  rather than `scrollWidth`, which the transform has already inflated.
- **A carried sheet is kept within half the window**, so at worst half of it
  is on screen and it can always be dragged back. Fit brings it home, and
  changing the zoom does too, since at a new size where it sits is a new
  question.

The zoom keys are taken by the main process before the page sees them.
Chromium claims `Ctrl+0`, `Ctrl+=` and `Ctrl+-` for its own page zoom, which
would scale the rails and panels along with everything else; intercepting them
there means they scale the paper instead. Wheel zoom is anchored on the
pointer, so zooming into a figure keeps that figure where it was.

It is caught in two places, which is not redundancy. The sheet is an iframe,
and a wheel over an iframe is dispatched inside *that* document and never
reaches the page around it — so a listener on the preview surface sees nothing
while the pointer is over the paper, which is most of the time. The frame
catches its own wheel events and converts the pointer into the parent
window's coordinates before handing them out.

## Security

The renderer runs under a Content Security Policy, set in `vite.config.ts` and
injected into `index.html` per mode.

`script-src 'self'` is the line that matters: nothing in this app builds code
at runtime, so nothing needs `unsafe-eval`. That matters here because this
window opens files that came from elsewhere — an invoice is JSON and a logo is
a data URL, but a template carries markup and CSS that someone wrote, and the
code panel exists to let them write more.

`style-src` does allow inline styles, and has to: React writes element style
attributes, CodeMirror injects a stylesheet, and the preview is a `srcdoc`
iframe which inherits this policy and carries the template's own `<style>`.
Inline style is a far smaller risk than inline script.

Development is looser — Vite's hot reload needs `unsafe-eval` and a websocket —
and that looseness never reaches a built app.

Alongside it: context isolation on, node integration off, the preview frame and
the PDF worker both run with scripting disabled, pinch and `Ctrl`+wheel cannot
scale the interface, and **developer tools are unavailable outside
development** — the keys are swallowed rather than ignored, and anything that
does manage to open them gets them closed again.

## A note on layout

The window is a frame: `html`, `body`, the shell and its main row all clip, and
every scrolling region is a pane that knows its own bounds. That is deliberate,
and it is worth knowing why.

The app once grew a band of empty ground below the interface — the whole window
would scroll, taking the rail and the sheet with it. The cause was the
`.sr-only` class used to name icon-only controls for screen readers. The usual
recipe for it is `position: absolute`, and with no positioned ancestor its
containing block resolved to the `body`. An absolutely positioned element is
not clipped by an `overflow` ancestor that is not its containing block — so one
sitting deep inside a 3,000px scrolled form reported its position in *document*
coordinates, and the document stretched to reach it.

It is now left in normal flow at 1px square with a negative margin: no space
taken, clipped like everything else, still read aloud. The clipping on the
shell stays as a guard, but nothing is relying on it.

## Running in a browser

`npm run dev:web` serves the UI without the Electron shell. Everything works except what needs the
machine: file dialogs fall back to downloads, the PDF goes to the browser's print dialog, and the
library lives in local storage. The fallbacks all sit behind `core/storage/desktop.ts`, which is the
only file in the app that knows whether there is a desktop underneath.

## Adding a template

Copy a folder in `src/templates/`, change `markup.ts` and `styles.ts`, and register it in
`registry.ts`. Write the CSS against the theme tokens — `var(--accent)`, `var(--rule-w)`,
`var(--page-margin)` — and the inspector's palette, type and spacing controls will drive your layout
without any further work. The view model a template renders against is documented by its own type in
`core/document/viewModel.ts`.
#   T o o B e e I n v o i c e C r e a t o r  
 