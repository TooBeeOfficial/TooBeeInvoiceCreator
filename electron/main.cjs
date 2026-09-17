/* The desktop shell.

   Everything here is plumbing the browser cannot do: native file dialogs,
   reading and writing the user's invoice files, and rendering a real vector
   PDF with Chromium's own print engine. No invoice knowledge lives in this
   process — the window sends finished HTML and finished bytes, and this side
   only decides where they land. */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron')
const path = require('node:path')
const fs = require('node:fs/promises')
const os = require('node:os')

const isDev = process.env.NODE_ENV === 'development'
let win = null

/* ------------------------------------------------------------------ window */

function createWindow () {
  win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1180,
    minHeight: 720,
    backgroundColor: '#15171C',
    show: false,
    autoHideMenuBar: true,
    title: 'TooBee Invoice Creator',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  /* The keys above are the only way in, but a stray menu role or an
     inherited setting should not be able to leave them open in a built app. */
  if (!isDev) {
    win.webContents.on('devtools-opened', () => win.webContents.closeDevTools())
  }

  /* The window's own keys, taken before the page sees them.

     Reload stays on F5 alone: Ctrl+R belongs to the document in this app.

     The zoom trio is here rather than in the window because Chromium claims
     Ctrl+0, Ctrl+= and Ctrl+- for its own page zoom, which would scale the
     whole interface — rails, panels and all — instead of the sheet. Taking
     them here stops that, and forwarding them down the menu channel means
     the app still gets to zoom the paper. */
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const key = input.key
    const ctrl = input.control || input.meta
    const devTools = key === 'F12' || (input.control && input.shift && key.toLowerCase() === 'i')

    if (key === 'F5') { event.preventDefault(); win.webContents.reload(); return }
    if (key === 'F11') { event.preventDefault(); win.setFullScreen(!win.isFullScreen()); return }

    /* Developer tools belong to development. In a built app the keys are
       swallowed rather than ignored, so Chromium's own binding cannot open
       them either — an invoicing app has no business handing someone a
       console over the top of a customer's books. */
    if (devTools) {
      event.preventDefault()
      if (isDev) win.webContents.toggleDevTools()
      return
    }

    if (!ctrl) return
    if (key === '0') { event.preventDefault(); send('menu', 'zoomFit') }
    else if (key === '=' || key === '+') { event.preventDefault(); send('menu', 'zoomIn') }
    else if (key === '-' || key === '_') { event.preventDefault(); send('menu', 'zoomOut') }
  })

  /* Pinch and Ctrl+wheel would scale the interface for the same reason. */
  win.webContents.setVisualZoomLevelLimits(1, 1)

  if (isDev) win.loadURL('http://localhost:5173')
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

  // external links open in the real browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('com.rbt.invoicecreator')
  /* On Windows the application menu is the window's own menu bar and drops
     over the sheet when Alt is tapped, which is no use in an app you are
     reading a page in. Every command it held is a shortcut instead. */
  Menu.setApplicationMenu(process.platform === 'darwin' ? buildMenu() : null)
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function send (channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload)
}

function buildMenu () {
  return Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New invoice', accelerator: 'CmdOrCtrl+N', click: () => send('menu', 'new') },
        { label: 'Open invoice...', accelerator: 'CmdOrCtrl+O', click: () => send('menu', 'open') },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('menu', 'save') },
        { label: 'Save as...', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('menu', 'saveAs') },
        { type: 'separator' },
        { label: 'Export PDF...', accelerator: 'CmdOrCtrl+E', click: () => send('menu', 'exportPdf') },
        { label: 'Export Excel...', accelerator: 'CmdOrCtrl+Shift+E', click: () => send('menu', 'exportXlsx') },
        { label: 'Export CSV...', click: () => send('menu', 'exportCsv') },
        { type: 'separator' },
        { label: 'Settings...', accelerator: 'CmdOrCtrl+,', click: () => send('menu', 'settings') },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Fit to window', accelerator: 'CmdOrCtrl+0', click: () => send('menu', 'zoomFit') },
        { label: 'Zoom in', accelerator: 'CmdOrCtrl+Plus', click: () => send('menu', 'zoomIn') },
        { label: 'Zoom out', accelerator: 'CmdOrCtrl+-', click: () => send('menu', 'zoomOut') },
        { type: 'separator' },
        { role: 'reload', accelerator: 'F5' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [{ label: 'Keyboard shortcuts', accelerator: 'F1', click: () => send('menu', 'shortcuts') }],
    },
  ])
}

/* --------------------------------------------------------------- app data */

const dataDir = () => app.getPath('userData')
const userTemplateDir = () => path.join(dataDir(), 'templates')

async function ensureDir (dir) {
  await fs.mkdir(dir, { recursive: true })
  return dir
}

async function readJson (file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')) } catch { return fallback }
}

/* The library is the app's own record of which invoice files exist and what
   was last seen inside them. The files themselves stay wherever the user put
   them — this is an index, never the source of truth. */
const libraryFile = () => path.join(dataDir(), 'library.json')

ipcMain.handle('library:read', async () => readJson(libraryFile(), null))

ipcMain.handle('library:write', async (_e, library) => {
  await ensureDir(dataDir())
  await fs.writeFile(libraryFile(), JSON.stringify(library, null, 2), 'utf8')
  return { ok: true }
})

const prefsFile = () => path.join(dataDir(), 'preferences.json')
ipcMain.handle('prefs:read', async () => readJson(prefsFile(), null))
ipcMain.handle('prefs:write', async (_e, prefs) => {
  await ensureDir(dataDir())
  await fs.writeFile(prefsFile(), JSON.stringify(prefs, null, 2), 'utf8')
  return { ok: true }
})

/* ---------------------------------------------------------- user templates */

ipcMain.handle('templates:list', async () => {
  const dir = await ensureDir(userTemplateDir())
  const files = await fs.readdir(dir)
  const out = []
  for (const f of files.filter((n) => n.endsWith('.json'))) {
    const t = await readJson(path.join(dir, f), null)
    if (t) out.push({ ...t, custom: true })
  }
  return out
})

ipcMain.handle('templates:save', async (_e, template) => {
  const dir = await ensureDir(userTemplateDir())
  const safe = String(template.id || 'template').replace(/[^\w-]+/g, '-')
  const file = path.join(dir, safe + '.json')
  await fs.writeFile(file, JSON.stringify(template, null, 2), 'utf8')
  return { ok: true, file }
})

ipcMain.handle('templates:delete', async (_e, id) => {
  const safe = String(id || '').replace(/[^\w-]+/g, '-')
  try {
    await fs.unlink(path.join(userTemplateDir(), safe + '.json'))
    return { ok: true }
  } catch (err) { return { ok: false, error: err.message } }
})

/* -------------------------------------------------------- invoice documents */

ipcMain.handle('doc:save', async (_e, { data, filePath, suggested }) => {
  let target = filePath
  if (!target) {
    const res = await dialog.showSaveDialog(win, {
      title: 'Save invoice',
      defaultPath: suggested || 'invoice.json',
      filters: [{ name: 'Invoice document', extensions: ['json'] }],
    })
    if (res.canceled || !res.filePath) return { ok: false, canceled: true }
    target = res.filePath
  }
  try {
    await fs.writeFile(target, data, 'utf8')
    return { ok: true, filePath: target }
  } catch (err) { return { ok: false, error: err.message } }
})

ipcMain.handle('doc:open', async (_e, { filePath } = {}) => {
  let target = filePath
  if (!target) {
    const res = await dialog.showOpenDialog(win, {
      title: 'Open invoice',
      properties: ['openFile'],
      filters: [{ name: 'Invoice document', extensions: ['json'] }],
    })
    if (res.canceled || !res.filePaths.length) return { ok: false, canceled: true }
    target = res.filePaths[0]
  }
  try {
    const data = await fs.readFile(target, 'utf8')
    return { ok: true, filePath: target, data }
  } catch (err) {
    return { ok: false, error: err.message, missing: err.code === 'ENOENT' }
  }
})

/* Used when the list marks an invoice paid: the file is rewritten where it
   already lives, with no dialog and no change of path. */
ipcMain.handle('doc:writePath', async (_e, { filePath, data }) => {
  try {
    await fs.writeFile(filePath, data, 'utf8')
    return { ok: true, filePath }
  } catch (err) { return { ok: false, error: err.message } }
})

ipcMain.handle('doc:exists', async (_e, filePath) => {
  try { await fs.access(filePath); return true } catch { return false }
})

/* ------------------------------------------------------------------ exports */

async function askAndWrite ({ suggested, filterName, ext, bytes }) {
  const res = await dialog.showSaveDialog(win, {
    title: 'Export ' + filterName,
    defaultPath: suggested,
    filters: [{ name: filterName, extensions: [ext] }],
  })
  if (res.canceled || !res.filePath) return { ok: false, canceled: true }
  try {
    await fs.writeFile(res.filePath, bytes)
    return { ok: true, filePath: res.filePath }
  } catch (err) { return { ok: false, error: err.message } }
}

ipcMain.handle('export:text', async (_e, { text, suggested, filterName, ext }) =>
  askAndWrite({ suggested, filterName, ext, bytes: Buffer.from(text, 'utf8') }))

ipcMain.handle('export:binary', async (_e, { buffer, suggested, filterName, ext }) =>
  askAndWrite({ suggested, filterName, ext, bytes: Buffer.from(buffer) }))

ipcMain.handle('pdf:export', async (_e, { html, widthMm, heightMm, landscape, suggested }) => {
  const res = await dialog.showSaveDialog(win, {
    title: 'Export PDF',
    defaultPath: suggested || 'invoice.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  if (res.canceled || !res.filePath) return { ok: false, canceled: true }

  /* Rendered in an offscreen window from a temp file, so a long invoice does
     not have to survive a data: URL round trip. Javascript is off in there
     deliberately: nothing a template carries can execute. */
  const tmp = path.join(os.tmpdir(), 'invoice-' + Date.now() + '.html')
  await fs.writeFile(tmp, html, 'utf8')

  const worker = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true, javascript: false, sandbox: true },
  })

  try {
    await worker.loadFile(tmp)
    await new Promise((r) => setTimeout(r, 350)) // let fonts settle before the snapshot
    const pdf = await worker.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      landscape: !!landscape,
      pageSize: { width: widthMm / 25.4, height: heightMm / 25.4 }, // inches
      margins: { marginType: 'none' },
    })
    await fs.writeFile(res.filePath, pdf)
    return { ok: true, filePath: res.filePath }
  } catch (err) {
    return { ok: false, error: err.message }
  } finally {
    worker.destroy()
    fs.unlink(tmp).catch(() => {})
  }
})

/* ------------------------------------------------------------------- images */

ipcMain.handle('image:pick', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Choose a logo',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] }],
  })
  if (res.canceled || !res.filePaths.length) return { ok: false, canceled: true }
  const file = res.filePaths[0]
  const ext = path.extname(file).slice(1).toLowerCase()
  const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : 'image/' + ext
  const buf = await fs.readFile(file)
  /* The logo travels inside the document as a data URL: an invoice file you
     send to your accountant has to carry its own artwork. */
  return { ok: true, dataUrl: 'data:' + mime + ';base64,' + buf.toString('base64'), name: path.basename(file) }
})

/* Reading a file the app did not write.

   Used by the importer, which has to cope with a CSV, a spreadsheet or
   another invoice. The bytes come back raw and the window decides how to
   read them — the shell has no idea what a line item is and should not
   learn. */
ipcMain.handle('file:import', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Import a file',
    properties: ['openFile'],
    filters: [
      { name: 'Spreadsheets and data', extensions: ['csv', 'xlsx', 'xls', 'json', 'tsv', 'txt'] },
      { name: 'CSV', extensions: ['csv', 'tsv', 'txt'] },
      { name: 'Excel workbook', extensions: ['xlsx', 'xls'] },
      { name: 'Invoice document', extensions: ['json'] },
      { name: 'All files', extensions: ['*'] },
    ],
  })
  if (res.canceled || !res.filePaths.length) return { ok: false, canceled: true }

  const file = res.filePaths[0]
  try {
    const buffer = await fs.readFile(file)
    return {
      ok: true,
      filePath: file,
      name: path.basename(file),
      ext: path.extname(file).slice(1).toLowerCase(),
      bytes: new Uint8Array(buffer),
    }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('shell:showItem', async (_e, filePath) => {
  shell.showItemInFolder(filePath)
  return true
})
