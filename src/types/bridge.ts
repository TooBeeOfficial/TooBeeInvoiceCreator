/* The shape of the desktop bridge exposed by electron/preload.cjs.

   Declared here so the app can be typed against it, and so the one place that
   touches `window` — core/storage/desktop.ts — is the only place that has to
   know the bridge might be absent, as it is when the UI runs in a browser
   tab during `npm run dev:web`. */

export interface FileResult {
  ok: boolean
  canceled?: boolean
  missing?: boolean
  error?: string
  filePath?: string
  data?: string
}

export interface ImageResult {
  ok: boolean
  canceled?: boolean
  error?: string
  dataUrl?: string
  name?: string
}

export interface ImportResult {
  ok: boolean
  canceled?: boolean
  error?: string
  filePath?: string
  name?: string
  /** The file extension, lower-cased and without its dot. */
  ext?: string
  bytes?: Uint8Array
}

export interface DesktopBridge {
  isDesktop: true

  readLibrary: () => Promise<unknown>
  writeLibrary: (library: unknown) => Promise<{ ok: boolean }>

  readPrefs: () => Promise<unknown>
  writePrefs: (prefs: unknown) => Promise<{ ok: boolean }>

  listTemplates: () => Promise<unknown[]>
  saveTemplate: (template: unknown) => Promise<{ ok: boolean; file?: string }>
  deleteTemplate: (id: string) => Promise<{ ok: boolean; error?: string }>

  saveDoc: (payload: { data: string; filePath?: string | null; suggested?: string }) => Promise<FileResult>
  openDoc: (payload?: { filePath?: string }) => Promise<FileResult>
  writeDocPath: (payload: { filePath: string; data: string }) => Promise<FileResult>
  docExists: (filePath: string) => Promise<boolean>

  exportPdf: (payload: {
    html: string
    widthMm: number
    heightMm: number
    landscape: boolean
    suggested: string
  }) => Promise<FileResult>
  exportText: (payload: { text: string; suggested: string; filterName: string; ext: string }) => Promise<FileResult>
  exportBinary: (payload: { buffer: ArrayBuffer; suggested: string; filterName: string; ext: string }) => Promise<FileResult>

  pickImage: () => Promise<ImageResult>
  importFile: () => Promise<ImportResult>
  showItem: (filePath: string) => Promise<boolean>

  onMenu: (handler: (action: string) => void) => () => void
}

declare global {
  interface Window {
    invoicer?: DesktopBridge
  }
}
