/* Renders build/icon.svg (and the small-size cut, build/icon-small.svg) into a
   Windows .ico. Run with: npm run icon

   Lifted from the Calender Maker unchanged apart from the paths, because the
   two apps draw their icons the same way and a second implementation would
   only be a second thing to keep right.

   Electron is the rasteriser — it is already a dependency, and Chromium draws
   the SVG at each target size as vector rather than downsampling one big
   bitmap, so the 16px cut stays crisp. Sizes up to 64 are written as raw DIBs
   and the two large ones as PNG, which is the layout Windows itself uses. */

/* Run under plain node (or with ELECTRON_RUN_AS_NODE set, as some terminals
   do) this re-launches itself in a real Electron with that variable stripped —
   the same trap scripts/start.cjs guards against. */
if (!process.versions.electron || process.env.ELECTRON_RUN_AS_NODE) {
  const { spawnSync } = require('node:child_process')
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  const r = spawnSync(require('electron'), [__filename], { stdio: 'inherit', env })
  process.exit(r.status ?? 0)
}

const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')

const ROOT = path.join(__dirname, '..')
const SIZES = [16, 20, 24, 32, 40, 48, 64, 128, 256]
const SMALL_CUT = 32          // at or below this, use the simplified artwork

const svg = (f) => fs.readFileSync(path.join(ROOT, 'build', f), 'utf8')
const big = svg('icon.svg')
const small = svg('icon-small.svg')

const PAGE = path.join(os.tmpdir(), 'toobee-invoice-icon-render.html')

function writePage () {
  const enc = (m) => 'data:image/svg+xml;base64,' + Buffer.from(m).toString('base64')
  fs.writeFileSync(PAGE,
    `<html><head><meta charset="utf-8"><style>
       html,body{margin:0;padding:0;background:transparent;overflow:hidden}
       img{position:absolute;top:0;left:0;display:block}
       #small{display:none}
     </style></head><body>
     <img id="big" src="${enc(big)}"><img id="small" src="${enc(small)}">
     </body></html>`)
}

/* One window, one page: each size is drawn at its own CSS size in the corner
   and captured by rect. Spinning up a window per size makes Chromium refuse
   the navigation after the first one. */
async function draw (win, size) {
  await win.webContents.executeJavaScript(`(() => {
    const big = document.getElementById('big'), small = document.getElementById('small')
    const on = ${size} <= ${SMALL_CUT} ? small : big, off = on === small ? big : small
    off.style.display = 'none'; on.style.display = 'block'
    on.style.width = on.style.height = '${size}px'
    return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  })()`)
  const img = await win.webContents.capturePage({ x: 0, y: 0, width: size, height: size })
  return img.getSize().width === size ? img : img.resize({ width: size, height: size })
}

/* ------------------------------------------------------------------- ico */

function dib (img, size) {
  const bgra = img.toBitmap()                       // top-down BGRA
  const stride = size * 4
  const xor = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    bgra.copy(xor, y * stride, (size - 1 - y) * stride, (size - y) * stride)
  }
  const maskStride = (((size + 31) >> 5) << 2)      // 1bpp, 4-byte aligned
  const and = Buffer.alloc(maskStride * size)       // zeroed: alpha does the work
  const head = Buffer.alloc(40)
  head.writeUInt32LE(40, 0)
  head.writeInt32LE(size, 4)
  head.writeInt32LE(size * 2, 8)                    // xor + and, as the format wants
  head.writeUInt16LE(1, 12)
  head.writeUInt16LE(32, 14)
  head.writeUInt32LE(xor.length + and.length, 20)
  return Buffer.concat([head, xor, and])
}

function ico (entries) {
  const dir = Buffer.alloc(6)
  dir.writeUInt16LE(0, 0); dir.writeUInt16LE(1, 2); dir.writeUInt16LE(entries.length, 4)
  let offset = 6 + entries.length * 16
  const table = []
  for (const e of entries) {
    const row = Buffer.alloc(16)
    row.writeUInt8(e.size >= 256 ? 0 : e.size, 0)
    row.writeUInt8(e.size >= 256 ? 0 : e.size, 1)
    row.writeUInt16LE(1, 4)
    row.writeUInt16LE(32, 6)
    row.writeUInt32LE(e.data.length, 8)
    row.writeUInt32LE(offset, 12)
    table.push(row)
    offset += e.data.length
  }
  return Buffer.concat([dir, ...table, ...entries.map((e) => e.data)])
}

app.disableHardwareAcceleration()
app.whenReady().then(async () => {
  writePage()
  const win = new BrowserWindow({
    width: 256, height: 256, useContentSize: true,
    show: false, frame: false, transparent: true, backgroundColor: '#00000000',
    webPreferences: { offscreen: true, sandbox: false },
  })
  await win.loadFile(PAGE)
  await new Promise((r) => setTimeout(r, 300))

  const entries = []
  for (const size of SIZES) {
    const img = await draw(win, size)
    entries.push({ size, data: size >= 128 ? img.toPNG() : dib(img, size) })
    if (size === 256) fs.writeFileSync(path.join(ROOT, 'build', 'icon.png'), img.toPNG())
    process.stdout.write(`  ${size}×${size}
`)
  }
  win.destroy()

  // the favicon the dev server and the built page load, from the same artwork
  fs.copyFileSync(path.join(ROOT, 'build', 'icon.svg'), path.join(ROOT, 'public', 'icon.svg'))

  const buf = ico(entries)
  for (const out of ['build/icon.ico', 'electron/icon.ico']) {
    fs.writeFileSync(path.join(ROOT, out), buf)
    console.log(`wrote ${out} (${buf.length} bytes)`)
  }
  app.exit(0)
}).catch((err) => { console.error(err); app.exit(1) })
