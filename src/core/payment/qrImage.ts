/* Drawing a QR code.

   The matrix comes from qrcode-generator, a small dependency with none of
   its own — the one piece of this app not written here, because a payment
   code that is subtly wrong is worse than no payment code, and Reed-Solomon
   over GF(256) is not a thing to get subtly wrong on a Tuesday.

   What is written here is the picture: an SVG of one path, one rectangle per
   dark module. SVG rather than a bitmap because this is going on paper — at
   print resolution a 25mm bitmap of a 45-module code is a grid of soft grey
   squares, and a soft grey square is a module a scanner has to guess at.

   Black on white, never the invoice's accent colour. A scanner wants the
   highest contrast it can get and expects dark-on-light in that order; a
   tasteful dark blue code on a cream panel is a code that reads on the third
   try, in good light, if the phone is new. */

import qrcode from 'qrcode-generator'

/* The library encodes a string to bytes as Latin-1 by default, which turns
   every umlaut in a payee's name into a question mark. Payloads here declare
   themselves as UTF-8, so UTF-8 is what has to go in. */
qrcode.stringToBytes = (text: string): number[] => Array.from(new TextEncoder().encode(text))

/* Four blank modules on every side. The quiet zone is part of the symbol,
   not padding around it: a code butted against a rule or a block of text is
   one a reader will not find. */
const QUIET = 4

/* Error correction M — about 15% of the code can be obscured and still read.
   The payment-code specification names this level, and it is the right one
   for paper: L is thrifty on a screen that is never creased, H makes a
   denser code for damage that an invoice does not usually suffer. */
const CORRECTION = 'M' as const

/* One payload is re-rendered on every keystroke, by the preview and by every
   template thumbnail beside it. The encoder is quick, but not so quick that
   doing it thirty times for the same string is free. */
const cache = new Map<string, string>()
const CACHE_LIMIT = 16

/** An SVG data URI for `text`, or null if it cannot be encoded. */
export function qrSvgDataUri (text: string): string | null {
  if (!text) return null

  const hit = cache.get(text)
  if (hit) return hit

  let svg: string
  try {
    const code = qrcode(0, CORRECTION)
    code.addData(text, 'Byte')
    code.make()
    svg = draw(code.getModuleCount(), (row, col) => code.isDark(row, col))
  } catch {
    /* Only thrown by data too long for the largest symbol, which the payload
       builders already rule out. A code that cannot be drawn is simply one
       the invoice does not print. */
    return null
  }

  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string)
  cache.set(text, uri)
  return uri
}

function draw (modules: number, isDark: (row: number, col: number) => boolean): string {
  const size = modules + QUIET * 2
  let path = ''
  for (let row = 0; row < modules; row += 1) {
    for (let col = 0; col < modules; col += 1) {
      if (isDark(row, col)) path += `M${col + QUIET} ${row + QUIET}h1v1h-1z`
    }
  }

  /* `shape-rendering: crispEdges` turns off antialiasing: a module edge
     smeared over two pixels is contrast the scanner does not get back. */
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">`
    + `<rect width="${size}" height="${size}" fill="#ffffff"/>`
    + `<path d="${path}" fill="#000000"/>`
    + '</svg>'
}
