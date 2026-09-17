/* The look of the printed sheet.

   Every value here reaches the page as a CSS custom property, which is why a
   template's CSS can lean on var(--accent) or var(--rule-w) and why editing a
   token in the inspector redraws a template the user has rewritten by hand.
   Lengths are in millimetres: the output is paper, not a screen. */

export type DividerStyle =
  | 'plain' | 'accent' | 'tab' | 'fade' | 'dashes' | 'dots' | 'double'
  | 'bookend' | 'centre' | 'duotone' | 'blocks' | 'pinstripe' | 'dashdot'

export interface DividerOption {
  id: DividerStyle
  name: string
}

/* Named for what they look like rather than for how they are drawn. */
export const DIVIDERS: ReadonlyArray<DividerOption> = [
  { id: 'plain', name: 'Plain rule' },
  { id: 'accent', name: 'Accent rule' },
  { id: 'tab', name: 'Brand tab' },
  { id: 'fade', name: 'Fading rule' },
  { id: 'dashes', name: 'Dashed' },
  { id: 'dots', name: 'Dotted' },
  { id: 'double', name: 'Double rule' },
  { id: 'bookend', name: 'Bookends' },
  { id: 'centre', name: 'Centred' },
  { id: 'duotone', name: 'Two-tone' },
  { id: 'blocks', name: 'Blocks' },
  { id: 'pinstripe', name: 'Pinstripe' },
  { id: 'dashdot', name: 'Dash and dot' },
]

export interface InvoiceTheme {
  // colour
  paper: string
  ink: string
  inkSoft: string
  accent: string
  accentInk: string
  line: string
  lineStrong: string
  bandBg: string
  bandInk: string
  zebra: string

  // type
  fontDisplay: string
  fontBody: string
  fontNum: string
  sizeTitle: number
  sizeHeading: number
  sizeBody: number
  sizeSmall: number
  sizeTotal: number
  weightTitle: number
  weightHeading: number
  trackTitle: number
  trackLabel: number
  caseTitle: 'none' | 'uppercase' | 'lowercase'
  caseLabel: 'none' | 'uppercase' | 'lowercase'
  lineHeight: number

  // rules and boxes
  /* The character of the section dividers — the rule under the letterhead
     and the one over the total. They are the most looked-at marks on an
     invoice after the figure itself, which makes them the cheapest place to
     put a house style. */
  dividerStyle: DividerStyle
  ruleW: number
  ruleStrongW: number
  radius: number
  cellPadX: number
  cellPadY: number

  // spacing
  pageMargin: number
  blockGap: number
  headGap: number
  tableGap: number

  // marks
  logoWidth: number
  showZebra: boolean
  showPaidStamp: boolean
}

/* A neutral starting point. Each template ships its own overrides on top of
   this, so a token the template never mentions still has a sane value. */
export const DEFAULT_THEME: InvoiceTheme = {
  paper: '#FFFFFF',
  ink: '#16191F',
  inkSoft: '#6B7280',
  accent: '#17457A',
  accentInk: '#FFFFFF',
  line: '#DCE0E6',
  lineStrong: '#9AA1AC',
  bandBg: '#16191F',
  bandInk: '#FFFFFF',
  zebra: '#F6F7F9',

  fontDisplay: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif",
  fontBody: "'Segoe UI', system-ui, sans-serif",
  fontNum: "'Segoe UI', system-ui, sans-serif",
  sizeTitle: 9,
  sizeHeading: 3.6,
  sizeBody: 3.1,
  sizeSmall: 2.5,
  sizeTotal: 5,
  weightTitle: 600,
  weightHeading: 600,
  trackTitle: -0.02,
  trackLabel: 0.12,
  caseTitle: 'none',
  caseLabel: 'uppercase',
  lineHeight: 1.45,

  dividerStyle: 'plain',
  ruleW: 0.2,
  ruleStrongW: 0.5,
  radius: 0,
  cellPadX: 2.4,
  cellPadY: 2,

  pageMargin: 16,
  blockGap: 8,
  headGap: 10,
  tableGap: 6,

  logoWidth: 34,
  showZebra: false,
  showPaidStamp: true,
}

/* token key -> [css custom property, unit] */
export const TOKEN_MAP: Record<string, [string, string]> = {
  paper: ['--paper', ''],
  ink: ['--ink', ''],
  inkSoft: ['--ink-soft', ''],
  accent: ['--accent', ''],
  accentInk: ['--accent-ink', ''],
  line: ['--line', ''],
  lineStrong: ['--line-strong', ''],
  bandBg: ['--band-bg', ''],
  bandInk: ['--band-ink', ''],
  zebra: ['--zebra', ''],

  fontDisplay: ['--font-display', ''],
  fontBody: ['--font-body', ''],
  fontNum: ['--font-num', ''],
  sizeTitle: ['--size-title', 'mm'],
  sizeHeading: ['--size-heading', 'mm'],
  sizeBody: ['--size-body', 'mm'],
  sizeSmall: ['--size-small', 'mm'],
  sizeTotal: ['--size-total', 'mm'],
  weightTitle: ['--weight-title', ''],
  weightHeading: ['--weight-heading', ''],
  trackTitle: ['--track-title', 'em'],
  trackLabel: ['--track-label', 'em'],
  caseTitle: ['--case-title', ''],
  caseLabel: ['--case-label', ''],
  lineHeight: ['--line-height', ''],

  ruleW: ['--rule-w', 'mm'],
  ruleStrongW: ['--rule-strong-w', 'mm'],
  radius: ['--radius', 'mm'],
  cellPadX: ['--cell-pad-x', 'mm'],
  cellPadY: ['--cell-pad-y', 'mm'],

  pageMargin: ['--page-margin', 'mm'],
  blockGap: ['--block-gap', 'mm'],
  headGap: ['--head-gap', 'mm'],
  tableGap: ['--table-gap', 'mm'],

  logoWidth: ['--logo-width', 'mm'],
}

/* Palettes offered in the inspector. Colour only: choosing one leaves the
   type and the spacing a template set exactly as they were, because a palette
   is a decision about ink, not about layout.

   Every palette sets every colour, including the paper. That is not padding:
   a palette is applied over whatever the last one left behind, so one that
   named nine tokens and left the tenth alone would hand a dark sheet to the
   next palette that happens not to mention paper. The set is only safe to
   click through in any order if each entry is complete.

   The three groups below are what the tokens actually do rather than a
   filing convenience. On white paper the accent is the only colour and it
   has to hold its own against black text. On tinted paper the whole sheet
   carries a cast, so the inks are warmed or cooled to sit on it. Reversed,
   everything swaps: the band becomes the light thing on a dark ground, and
   the accent has to be light enough to read against the paper rather than
   dark enough to read against it. */
export interface Palette {
  id: string
  name: string
  tokens: Partial<InvoiceTheme>
}

const WHITE = '#FFFFFF'

export const PALETTES: ReadonlyArray<Palette> = [
  /* ------------------------------------------------------- white paper */

  {
    id: 'ledger',
    name: 'Ledger',
    tokens: {
      paper: WHITE, accent: '#17457A', accentInk: WHITE, ink: '#16191F', inkSoft: '#6B7280',
      line: '#DCE0E6', lineStrong: '#9AA1AC', bandBg: '#16191F', bandInk: WHITE, zebra: '#F6F7F9',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    tokens: {
      paper: WHITE, accent: '#3F4855', accentInk: WHITE, ink: '#1B1F26', inkSoft: '#767E8B',
      line: '#E2E5EA', lineStrong: '#A8AEB8', bandBg: '#2B323C', bandInk: WHITE, zebra: '#F5F6F8',
    },
  },
  {
    id: 'ink',
    name: 'Plain ink',
    tokens: {
      paper: WHITE, accent: '#16191F', accentInk: WHITE, ink: '#16191F', inkSoft: '#767676',
      line: '#D8D8D8', lineStrong: '#8E8E8E', bandBg: '#16191F', bandInk: WHITE, zebra: '#F5F5F5',
    },
  },
  {
    id: 'oxblood',
    name: 'Oxblood',
    tokens: {
      paper: WHITE, accent: '#7A1F2B', accentInk: '#FFF7F3', ink: '#1C1418', inkSoft: '#77676B',
      line: '#E6DCDE', lineStrong: '#B39BA0', bandBg: '#3A1A20', bandInk: '#FFF7F3', zebra: '#FAF5F5',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    tokens: {
      paper: WHITE, accent: '#0B5D3B', accentInk: '#F2F8F4', ink: '#151A17', inkSoft: '#6A7670',
      line: '#DBE4DE', lineStrong: '#9BAAA1', bandBg: '#123227', bandInk: '#F2F8F4', zebra: '#F4F8F5',
    },
  },
  {
    id: 'copper',
    name: 'Copper',
    tokens: {
      paper: WHITE, accent: '#9A5B23', accentInk: '#FBF6F0', ink: '#1F1A15', inkSoft: '#7C7167',
      line: '#E8E0D6', lineStrong: '#B7A896', bandBg: '#2E241B', bandInk: '#FBF6F0', zebra: '#FAF7F2',
    },
  },

  /* --------------------------------------------------- white, in colour

     Brighter than the six above, and the reason they are separate: an
     accent this saturated is doing the job of a second voice on the page
     rather than a quiet mark of house style. Each is still dark enough to
     read as text at small sizes, which rules out most of the colours that
     look best on a screen. */

  {
    id: 'cobalt',
    name: 'Cobalt',
    tokens: {
      paper: WHITE, accent: '#1D4ED8', accentInk: WHITE, ink: '#141A25', inkSoft: '#6B7489',
      /* The band is the accent darkened rather than the accent itself: a
         heading bar is small reversed type, and the accent as drawn is a
         shade too bright to read white out of. */
      line: '#DCE2F0', lineStrong: '#98A4C0', bandBg: '#173FAD', bandInk: WHITE, zebra: '#F4F6FD',
    },
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    tokens: {
      paper: WHITE, accent: '#0E6E70', accentInk: '#F0FAFA', ink: '#12201F', inkSoft: '#647676',
      line: '#D7E6E6', lineStrong: '#94ACAC', bandBg: '#0A5254', bandInk: '#F0FAFA', zebra: '#F2F9F9',
    },
  },
  {
    id: 'plum',
    name: 'Plum',
    tokens: {
      paper: WHITE, accent: '#5E2A6E', accentInk: '#FAF3FC', ink: '#1A1420', inkSoft: '#736A7C',
      line: '#E5DCEA', lineStrong: '#AC9DB6', bandBg: '#3A1A45', bandInk: '#FAF3FC', zebra: '#F9F5FB',
    },
  },
  {
    id: 'tangerine',
    name: 'Tangerine',
    tokens: {
      paper: WHITE, accent: '#C0410B', accentInk: '#FFF6F0', ink: '#1F1611', inkSoft: '#7E6E64',
      line: '#EEDFD6', lineStrong: '#BFA292', bandBg: '#2B1710', bandInk: '#FFF6F0', zebra: '#FDF6F2',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    tokens: {
      paper: WHITE, accent: '#A51F5B', accentInk: '#FFF4F8', ink: '#1E1319', inkSoft: '#7C6A72',
      line: '#EEDCE4', lineStrong: '#BF9AA9', bandBg: '#3B1023', bandInk: '#FFF4F8', zebra: '#FDF4F7',
    },
  },
  {
    id: 'olive',
    name: 'Olive',
    tokens: {
      paper: WHITE, accent: '#4C5C16', accentInk: '#F7FAEE', ink: '#1A1D12', inkSoft: '#6E7360',
      line: '#E2E6D6', lineStrong: '#A8AE93', bandBg: '#2A3110', bandInk: '#F7FAEE', zebra: '#F7F9F0',
    },
  },
  {
    id: 'indigo',
    name: 'Indigo',
    tokens: {
      paper: WHITE, accent: '#35348C', accentInk: '#F4F4FC', ink: '#15151F', inkSoft: '#6C6C82',
      line: '#DEDEEE', lineStrong: '#9E9EBC', bandBg: '#22215C', bandInk: '#F4F4FC', zebra: '#F5F5FC',
    },
  },
  {
    id: 'violet',
    name: 'Violet',
    tokens: {
      paper: WHITE, accent: '#4C3BCF', accentInk: '#F6F4FF', ink: '#17141F', inkSoft: '#6F6A84',
      line: '#E1DEF4', lineStrong: '#A49DC6', bandBg: '#2E238A', bandInk: '#F6F4FF', zebra: '#F6F5FE',
    },
  },
  {
    id: 'sky',
    name: 'Sky',
    tokens: {
      paper: WHITE, accent: '#0B6FA4', accentInk: '#F0F8FC', ink: '#111A20', inkSoft: '#647585',
      line: '#D8E5EE', lineStrong: '#95AABA', bandBg: '#0A4E73', bandInk: '#F0F8FC', zebra: '#F2F8FB',
    },
  },
  {
    id: 'petrol',
    name: 'Petrol',
    tokens: {
      paper: WHITE, accent: '#1E4E5F', accentInk: '#F0F7F9', ink: '#121A1D', inkSoft: '#66757A',
      line: '#DAE5E9', lineStrong: '#99AAB0', bandBg: '#12333F', bandInk: '#F0F7F9', zebra: '#F3F8F9',
    },
  },
  {
    id: 'jade',
    name: 'Jade',
    tokens: {
      paper: WHITE, accent: '#12775C', accentInk: '#F0FAF6', ink: '#111D19', inkSoft: '#647871',
      line: '#D8E8E2', lineStrong: '#95ADA5', bandBg: '#0C4F3D', bandInk: '#F0FAF6', zebra: '#F2F9F6',
    },
  },
  {
    id: 'mustard',
    name: 'Mustard',
    tokens: {
      paper: WHITE, accent: '#846200', accentInk: '#FFFBEE', ink: '#1D1A10', inkSoft: '#77705C',
      line: '#E9E3CE', lineStrong: '#B6AC8C', bandBg: '#2B2409', bandInk: '#FFFBEE', zebra: '#FBF8EE',
    },
  },

  /* --------------------------------------------------------- tinted paper

     The sheet itself is off-white. Worth having for two opposite reasons: a
     warm ground makes a printed invoice look less like something that came
     out of a laser printer this morning, and a cold one makes a technical
     document look deliberate. Both need the inks adjusted — black type on
     cream reads harsh, so the ink is browned to match. */

  {
    id: 'manila',
    name: 'Manila',
    tokens: {
      paper: '#FBF6EA', accent: '#7A5B18', accentInk: '#FBF6EA', ink: '#2A2115', inkSoft: '#7C7060',
      line: '#E6DCC6', lineStrong: '#B7A98C', bandBg: '#2A2115', bandInk: '#FBF6EA', zebra: '#F5EEDC',
    },
  },
  {
    id: 'newsprint',
    name: 'Newsprint',
    tokens: {
      paper: '#F2F1ED', accent: '#33332F', accentInk: '#F2F1ED', ink: '#1F1F1D', inkSoft: '#6E6E68',
      line: '#DCDBD4', lineStrong: '#9C9B93', bandBg: '#1F1F1D', bandInk: '#F2F1ED', zebra: '#E9E8E2',
    },
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    tokens: {
      paper: '#EDF2F8', accent: '#12508C', accentInk: '#EDF2F8', ink: '#10243C', inkSoft: '#5D7390',
      line: '#D3DEEC', lineStrong: '#94A8C2', bandBg: '#10243C', bandInk: '#EDF2F8', zebra: '#E4EBF5',
    },
  },
  {
    id: 'parchment',
    name: 'Parchment',
    tokens: {
      paper: '#F6EFE1', accent: '#6B4A1E', accentInk: '#F6EFE1', ink: '#2B2318', inkSoft: '#7B6E5C',
      line: '#E2D6BE', lineStrong: '#B2A184', bandBg: '#3A2E1D', bandInk: '#F6EFE1', zebra: '#EFE6D3',
    },
  },
  {
    id: 'celadon',
    name: 'Celadon',
    tokens: {
      paper: '#EDF4EF', accent: '#1F5F44', accentInk: '#EDF4EF', ink: '#152019', inkSoft: '#61756A',
      line: '#D6E4DA', lineStrong: '#97AC9F', bandBg: '#152A20', bandInk: '#EDF4EF', zebra: '#E4EDE7',
    },
  },
  {
    id: 'blush',
    name: 'Blush',
    tokens: {
      paper: '#FBF0F2', accent: '#8C2B44', accentInk: '#FBF0F2', ink: '#221619', inkSoft: '#7D6A6E',
      line: '#EEDAE0', lineStrong: '#BE9BA4', bandBg: '#331820', bandInk: '#FBF0F2', zebra: '#F5E6E9',
    },
  },

  /* -------------------------------------------------------------- reversed

     Light type on a dark sheet. Worth saying plainly: these are for a PDF
     somebody reads on a screen, not for a sheet somebody prints — a page of
     solid dark uses a great deal of toner and comes out banded on most
     office printers. The app prints exactly what is shown either way, which
     is the point, so the choice stays available and the warning stays here.

     Everything swaps. The band is now the light thing on a dark ground, so
     bandBg and bandInk trade places, and the accent has to be light enough
     to read against the paper instead of dark enough. The rules go up in
     lightness rather than down, because a hairline darker than a dark sheet
     is a hairline nobody can see. */

  {
    id: 'midnight',
    name: 'Midnight',
    tokens: {
      paper: '#11151C', accent: '#7FB2FF', accentInk: '#11151C', ink: '#E8ECF2', inkSoft: '#98A2B2',
      line: '#262D38', lineStrong: '#3C4553', bandBg: '#E8ECF2', bandInk: '#11151C', zebra: '#171C25',
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    tokens: {
      paper: '#0A0A0A', accent: '#FFFFFF', accentInk: '#0A0A0A', ink: '#F2F2F2', inkSoft: '#9A9A9A',
      line: '#232323', lineStrong: '#4A4A4A', bandBg: '#F2F2F2', bandInk: '#0A0A0A', zebra: '#141414',
    },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    tokens: {
      paper: '#1C1F24', accent: '#FFB454', accentInk: '#1C1F24', ink: '#ECEFF3', inkSoft: '#9AA1AB',
      line: '#2D323A', lineStrong: '#444B56', bandBg: '#FFB454', bandInk: '#1C1F24', zebra: '#22262D',
    },
  },
  {
    id: 'deepsea',
    name: 'Deep sea',
    tokens: {
      paper: '#0E1E24', accent: '#5ECFC8', accentInk: '#0E1E24', ink: '#E3F0F2', inkSoft: '#8FA8AC',
      line: '#1D3038', lineStrong: '#405C67', bandBg: '#5ECFC8', bandInk: '#0E1E24', zebra: '#13262D',
    },
  },
  {
    id: 'espresso',
    name: 'Espresso',
    tokens: {
      paper: '#1B1512', accent: '#E0A46A', accentInk: '#1B1512', ink: '#F2E9E0', inkSoft: '#A89689',
      line: '#2C231E', lineStrong: '#5C4B40', bandBg: '#F2E9E0', bandInk: '#1B1512', zebra: '#221A16',
    },
  },
  {
    id: 'nightshade',
    name: 'Nightshade',
    tokens: {
      paper: '#1A1222', accent: '#C9A6FF', accentInk: '#1A1222', ink: '#EDE6F5', inkSoft: '#A093AF',
      line: '#2A1F36', lineStrong: '#554169', bandBg: '#C9A6FF', bandInk: '#1A1222', zebra: '#21182B',
    },
  },
  {
    id: 'pine',
    name: 'Pine',
    tokens: {
      paper: '#101C16', accent: '#6FD39B', accentInk: '#101C16', ink: '#E4F0E9', inkSoft: '#8EA69A',
      line: '#1D2E24', lineStrong: '#415B49', bandBg: '#6FD39B', bandInk: '#101C16', zebra: '#15241C',
    },
  },
  {
    id: 'oxide',
    name: 'Oxide',
    tokens: {
      paper: '#1D1A19', accent: '#FF8A72', accentInk: '#1D1A19', ink: '#F0EAE8', inkSoft: '#A2968F',
      line: '#2E2926', lineStrong: '#5C524B', bandBg: '#FF8A72', bandInk: '#1D1A19', zebra: '#241F1E',
    },
  },
  {
    id: 'steel',
    name: 'Steel',
    tokens: {
      paper: '#1A2028', accent: '#A9C2DE', accentInk: '#1A2028', ink: '#E9EEF4', inkSoft: '#94A1B0',
      line: '#28303B', lineStrong: '#4C5A6C', bandBg: '#A9C2DE', bandInk: '#1A2028', zebra: '#202730',
    },
  },
]

/* Face stacks that exist on a stock Windows install. A desktop app has to
   print the same on a machine that has never been online, so nothing here is
   fetched: these are the fonts already on the box. */
export interface FaceOption { id: string; name: string; stack: string }

export const FACES: ReadonlyArray<FaceOption> = [
  { id: 'segoe', name: 'Segoe UI', stack: "'Segoe UI', system-ui, sans-serif" },
  { id: 'segoe-semibold', name: 'Segoe UI Semibold', stack: "'Segoe UI Semibold', 'Segoe UI', system-ui, sans-serif" },
  { id: 'bahnschrift', name: 'Bahnschrift', stack: "Bahnschrift, 'DIN Next', 'Segoe UI', sans-serif" },
  { id: 'calibri', name: 'Calibri', stack: "Calibri, 'Segoe UI', sans-serif" },
  { id: 'arial', name: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { id: 'tahoma', name: 'Tahoma', stack: 'Tahoma, Verdana, sans-serif' },
  { id: 'verdana', name: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  { id: 'georgia', name: 'Georgia', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'cambria', name: 'Cambria', stack: "Cambria, Georgia, 'Times New Roman', serif" },
  { id: 'constantia', name: 'Constantia', stack: 'Constantia, Georgia, serif' },
  { id: 'times', name: 'Times New Roman', stack: "'Times New Roman', Times, serif" },
  { id: 'garamond', name: 'Garamond', stack: "Garamond, 'Times New Roman', serif" },
  { id: 'consolas', name: 'Consolas', stack: "Consolas, 'Courier New', monospace" },
  { id: 'couriernew', name: 'Courier New', stack: "'Courier New', Courier, monospace" },
]
