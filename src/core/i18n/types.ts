/* What a translation has to provide.

   Split in two, because the app has two audiences. `document` is the words
   printed on the invoice, read by whoever you billed — so it follows the
   document's own language, which may not be yours. `app` is the interface,
   read only by you, and follows your preference.

   Both are plain objects rather than a flat key-value bag so that a missing
   string is a type error at build time rather than a blank space on a
   printed invoice.

   A few things are deliberately *not* in here. Typeface names are the names
   of the faces themselves; paper sizes are A4 and Letter in every language;
   currency codes are ISO. Translating any of those would make them wrong. */

export interface DocumentLabels {
  invoice: string
  simpleInvoice: string
  from: string
  billTo: string
  number: string
  issued: string
  due: string
  supplied: string
  terms: string
  purchaseOrder: string
  reference: string
  currency: string
  description: string
  quantity: string
  unit: string
  unitPrice: string
  discount: string
  tax: string
  amount: string
  subtotal: string
  shipping: string
  rounding: string
  total: string
  amountDue: string
  notes: string
  conditions: string
  payment: string
  bank: string
  accountName: string
  accountNumber: string
  sortCode: string
  routing: string
  iban: string
  bic: string
  payLink: string
  paymentReference: string
  /** Under the payment code in the footer: what it is and what to do with it. */
  scanToPay: string
  /** The stamp across a settled invoice. */
  paid: string
  /** The totals row: what has been received so far, against the total. */
  paidToDate: string
  /** The row for money received over the total, which is owed back. */
  overpaid: string
  taxIncluded: string
  taxAnalysis: string
  rate: string
  taxable: string
  unitsBilled: string
  /* How many lines those units came from: "across 6 lines". `{count}` is
     replaced before the page is built, because a template cannot count. */
  acrossLines: string
  /* The greeting on a letter-shaped invoice. `{name}` is replaced with the
     contact's name, and the whole line is a pattern rather than a word
     because where the name goes, and what follows it, differ by language. */
  salutation: string
  /** How that letter closes, above the sender's name. */
  signOff: string
  detachSlip: string
  page: string
  of: string
}

/* Words with a number in them carry a placeholder rather than being glued
   together from fragments, because word order is not ours to assume. */
export interface AppStrings {
  nav: {
    invoices: string
    editor: string
    items: string
    clients: string
    company: string
    sections: string
  }
  rail: {
    file: string
    export: string
    save: string
    settings: string
    undo: string
    redo: string
    designPanel: string
    hideDesignPanel: string
    untitled: string
    unsaved: string
    saved: string
    notSaved: string
  }
  file: {
    newInvoice: string
    openInvoice: string
    saveAs: string
    shortcuts: string
    settings: string
    settingsNote: string
  }
  exports: {
    pdf: string
    pdfNote: string
    excel: string
    excelNote: string
    csv: string
    csvNote: string
  }
  settings: {
    title: string
    subtitle: string
    appearance: string
    theme: string
    themeHint: string
    system: string
    light: string
    dark: string
    followSystem: string
    alwaysLight: string
    alwaysDark: string
    language: string
    appLanguage: string
    appLanguageHint: string
    documentLanguage: string
    documentLanguageHint: string
    translationNote: string
    onStart: string
    reopenLast: string
    reopenLastHint: string
    numbers: string
    close: string
  }
  document: {
    language: string
    languageHint: string
  }
  common: {
    cancel: string
    save: string
    close: string
    optional: string
    /** Read out after a required field's label; never shown on screen. */
    required: string
    open: string
    remove: string
    duplicate: string
    dismiss: string
    import: string
    clearSearch: string
  }
  /** The states an invoice can be in, as the list shows them. */
  status: {
    draft: string
    sent: string
    paid: string
    overdue: string
    void: string
  }
  /* The due column's plain sentence. The ones with `{days}` are patterns. */
  due: {
    paid: string
    void: string
    notSent: string
    noDueDate: string
    today: string
    tomorrow: string
    inDays: string
    oneDayOverdue: string
    daysOverdue: string
  }
  invoices: {
    title: string
    nothingSaved: string
    /** "12 invoices on this machine." */
    countOne: string
    countMany: string
    checkFiles: string
    exportAll: string
    open: string
    newInvoice: string
    search: string
    searchLabel: string
    /* The "no filter" option at the top of each picker. Written as what it
       shows rather than as the word "all", because the list under it is
       what the reader is choosing from. */
    anyStatus: string
    anyClient: string
    anyTime: string
    /** Names the period picker for a screen reader. */
    period: string
    thisMonth: string
    thisYear: string
    lastYear: string
    shown: string
    shownOf: string
    emptyTitle: string
    emptyBody: string
    emptyAction: string
    noMatchTitle: string
    noMatchBody: string
    clearFilters: string
    /** The four tiles above the list. */
    outstanding: string
    outstandingNote: string
    overdue: string
    overdueNote: string
    paid: string
    paidNote: string
    drafts: string
    draftsNote: string
    moreCurrencies: string
    /** The table itself. */
    colInvoice: string
    colClient: string
    colIssued: string
    colDue: string
    colStatus: string
    colAmount: string
    untitled: string
    lineOne: string
    lineMany: string
    fileGone: string
    markPaid: string
    markAs: string
    showInFolder: string
    forget: string
    forgetTitle: string
    forgetBody: string
    forgetConfirm: string
    paidOf: string
  }
  editor: {
    detailsTitle: string
    detailsNote: string
    billToTitle: string
    billToNote: string
    fromTitle: string
    fromNote: string
    itemsTitle: string
    itemsNote: string
    taxTitle: string
    taxNote: string
    payTitle: string
    payNote: string
    receivedTitle: string
    receivedNote: string
    notesTitle: string
    noteToClient: string
    noteToClientHint: string
    noteToClientPlaceholder: string
    conditions: string
    conditionsHint: string
    conditionsPlaceholder: string
    checksTitle: string
    checksNote: string
    set: string
    notSet: string
    resizeForm: string
    resizeDesign: string
    invoiceDetails: string
    useClient: string
    saveClient: string
    savedClient: string
  }
  details: {
    number: string
    currency: string
    status: string
    issueDate: string
    terms: string
    dueDate: string
    ownTerms: string
    ownTermsHint: string
    ownTermsPlaceholder: string
    purchaseOrder: string
    reference: string
    supplyDate: string
    supplyDateHint: string
    title: string
    titleHint: string
    titlePlaceholder: string
    detail: string
    detailLabel: string
    full: string
    simple: string
    /** What each of those two actually leaves on the page. */
    fullHint: string
    simpleHint: string
    termsOnReceipt: string
    termsDays: string
    termsCustom: string
  }
  party: {
    name: string
    namePlaceholder: string
    contact: string
    contactHint: string
    email: string
    emailPlaceholder: string
    /** The button beside an address that opens the machine's mail client. */
    sendEmail: string
    phone: string
    website: string
    websitePlaceholder: string
    street: string
    streetPlaceholder: string
    street2: string
    town: string
    postCode: string
    region: string
    country: string
    registrations: string
    registrationLabel: string
    registrationNumber: string
    addRegistration: string
    removeRegistration: string
  }
  lines: {
    columns: string
    description: string
    quantity: string
    unit: string
    unitPrice: string
    discount: string
    tax: string
    amount: string
    rowActions: string
    addLine: string
    fromItems: string
    import: string
    descriptionPlaceholder: string
    notePlaceholder: string
    addNote: string
    moveUp: string
    moveDown: string
    saveToItems: string
    savedToItems: string
    rowMenu: string
    /** Screen-reader labels: "Quantity, line 3". */
    fieldOnLine: string
  }
  tax: {
    applies: string
    howApplied: string
    modeInvoice: string
    modeLine: string
    modeMulti: string
    name: string
    nameHint: string
    rate: string
    commonRates: string
    commonRatesHint: string
    inclusive: string
    inclusiveHint: string
    discount: string
    discountType: string
    discountNone: string
    discountPercent: string
    discountAmount: string
    discountValue: string
    discountLabel: string
    shippingLabel: string
    shipping: string
    taxShipping: string
    roundTotal: string
    roundTotalHint: string
  }
  payment: {
    instructions: string
    instructionsHint: string
    instructionsPlaceholder: string
    bank: string
    accountName: string
    iban: string
    bic: string
    accountNumber: string
    sortCode: string
    routingNumber: string
    payOnline: string
    payOnlineHint: string
    payOnlinePlaceholder: string
    reference: string
    referenceHint: string
    qr: string
    /** One line under the section's title. */
    qrNote: string
    /** The switch on the section's title row. Its words do not change. */
    qrToggle: string
    /** Shown in the section while the code is switched off. */
    qrHint: string
    /** Shown when the code is on but there is no account to encode yet. */
    qrNeedsIban: string
    /** Shown in place of the hint when the IBAN will not encode. */
    qrBadIban: string
    /** Shown when nothing is owed, so there is no transfer to encode. */
    qrNothingDue: string
    /** Shown when the invoice is not in euro, which the code cannot carry. */
    qrNotEuro: string
  }
  received: {
    date: string
    amount: string
    method: string
    methodPlaceholder: string
    reference: string
    record: string
    removePayment: string
    nothingYet: string
    /** "£400 of £1,200 paid" and the collapsed summaries. */
    paidOf: string
    paidInFull: string
    stillDue: string
    methods: string[]
  }
  logo: {
    none: string
    choose: string
    replace: string
    remove: string
    width: string
    formats: string
    needsDesktop: string
  }
  checks: {
    allClear: string
    number: string
    numberDuplicate: string
    issueDate: string
    dueBeforeIssue: string
    noTerms: string
    sellerName: string
    buyerName: string
    sellerAddress: string
    buyerAddress: string
    sellerContact: string
    noLines: string
    lineDescription: string
    lineQuantity: string
    lineZeroQuantity: string
    sellerTaxId: string
    buyerTaxId: string
    noPaymentRoute: string
    paymentAmount: string
    paymentDate: string
    paymentEarly: string
    paidButVoid: string
  }
  ledger: {
    subtotal: string
    shipping: string
    rounding: string
    total: string
    paidToDate: string
    overpaid: string
    amountDue: string
  }
  preview: {
    zoomIn: string
    zoomOut: string
    fit: string
    opening: string
  }
  inspector: {
    title: string
    tabs: string
    hide: string
    tabTemplate: string
    tabStyle: string
    tabSpacing: string
    tabCode: string
    opening: string
    layout: string
    template: string
    builtIn: string
    savedByYou: string
    saveAsTemplate: string
    templateName: string
    deleteTemplate: string
    deleteTemplateTitle: string
    deleteTemplateBody: string
    templateSaved: string
    templateDeleted: string
    paper: string
    size: string
    orientation: string
    portrait: string
    landscape: string
    palette: string
    colour: string
    accent: string
    ink: string
    inkSoft: string
    paperColour: string
    line: string
    lineStrong: string
    zebra: string
    /** The tinted band some templates run behind the table head. */
    bandBg: string
    bandInk: string
    typefaces: string
    display: string
    body: string
    figures: string
    size2: string
    baseSize: string
    headingSize: string
    totalSize: string
    sizeHeadline: string
    sizeSmall: string
    lineHeight: string
    letterforms: string
    titleWeight: string
    headingWeight: string
    titleTracking: string
    labelTracking: string
    labels: string
    labelCase: string
    caseNormal: string
    caseUpper: string
    spacing: string
    pageMargin: string
    underLetterhead: string
    betweenBlocks: string
    aboveTable: string
    table: string
    cellPadX: string
    cellPadY: string
    zebraRows: string
    rules: string
    divider: string
    hairline: string
    strongRule: string
    cornerRadius: string
    marks: string
    stampPaid: string
    savedStyles: string
    saveStyle: string
    updateStyle: string
    styleName: string
    styleNameLabel: string
    removeStyle: string
    resetTheme: string
    whatToEdit: string
    html: string
    css: string
    revert: string
    codeNote: string
  }
  /** The names the divider control lists. */
  dividers: {
    plain: string
    accent: string
    tab: string
    fade: string
    dashes: string
    dots: string
    double: string
    bookend: string
    centre: string
    duotone: string
    blocks: string
    pinstripe: string
    dashdot: string
  }
  catalogue: {
    title: string
    subtitle: string
    newItem: string
    import: string
    search: string
    searchLabel: string
    emptyTitle: string
    emptyBody: string
    emptyAction: string
    noMatchTitle: string
    noMatchBody: string
    editTitle: string
    newTitle: string
    note: string
    description: string
    descriptionPlaceholder: string
    secondLine: string
    secondLineHint: string
    unitPrice: string
    unit: string
    category: string
    categoryHint: string
    ownRate: string
    ownRateHint: string
    taxName: string
    rate: string
    save: string
    addToInvoice: string
    needsDescription: string
    savedItem: string
    addedToInvoice: string
    removeTitle: string
    removeBody: string
  }
  clients: {
    title: string
    subtitle: string
    add: string
    emptyTitle: string
    emptyBody: string
    emptyAction: string
    editTitle: string
    newTitle: string
    note: string
    save: string
    needsName: string
    saved: string
    removeTitle: string
    removeBody: string
  }
  company: {
    title: string
    businessTitle: string
    businessNote: string
    numbersTitle: string
    numbersNote: string
    prefix: string
    nextNumber: string
    digits: string
    digitsHint: string
    preview: string
    includeYear: string
    resetYearly: string
    resetYearlyHint: string
    defaultsTitle: string
    defaultsNote: string
    currency: string
    paper: string
    template: string
    taxName: string
    taxRate: string
    terms: string
    termsHint: string
    taxApplies: string
    taxMode: string
    inclusive: string
    inclusiveHint: string
    standingNote: string
    standingNoteHint: string
    standingPayment: string
    standingPaymentHint: string
  }
  importer: {
    titleInvoice: string
    titleItems: string
    choose: string
    chooseNote: string
    destination: string
    columns: string
    previewTitle: string
    rows: string
    skipped: string
    skippedOne: string
    nothingUsable: string
    failed: string
    close: string
  }
  shortcuts: {
    title: string
    file: string
    edit: string
    view: string
    document: string
    newInvoice: string
    open: string
    save: string
    saveAs: string
    exportPdf: string
    exportExcel: string
    exportCsv: string
    undo: string
    redo: string
    addLine: string
    search: string
    settings: string
    designPanel: string
    zoomIn: string
    zoomOut: string
    zoomFit: string
    goInvoices: string
    goEditor: string
    goItems: string
    goClients: string
    goCompany: string
    shortcuts: string
    note: string
  }
  toasts: {
    saved: string
    savedDownloads: string
    exported: string
    showFile: string
    couldNotRead: string
    couldNotSave: string
    fileMissing: string
    startedFrom: string
    markedAs: string
    noInvoicesToExport: string
    discardTitle: string
    discardBody: string
    discardConfirm: string
  }
}

export interface Dictionary {
  document: DocumentLabels
  app: AppStrings
}
