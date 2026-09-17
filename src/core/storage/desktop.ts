/* The one place that knows whether there is a desktop underneath.

   Everything else calls these functions and gets an answer of the same shape
   whether it is running in Electron or in a browser tab during `npm run
   dev:web`. The browser cannot open a file dialog that writes where the user
   points, so it falls back to a download and says so in the result — callers
   report what happened rather than pretending a save went somewhere it did
   not. */

import type { DesktopBridge, FileResult } from '@model/bridge'

export const bridge = (): DesktopBridge | null =>
  (typeof window !== 'undefined' && window.invoicer) || null

export const isDesktop = (): boolean => !!bridge()

/** Hands the browser a file. Used only when there is no desktop shell. */
export function downloadBlob (data: BlobPart, filename: string, mime: string): FileResult {
  if (typeof document === 'undefined') return { ok: false, error: 'No browser to download with.' }
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  /* Revoked on the next turn: revoking immediately cancels the download in
     some builds of Chromium before it has read the blob. */
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return { ok: true, filePath: filename }
}

/** Opens a file the user picks, in the browser. Resolves null if they cancel. */
export function readFileFromBrowser (accept: string): Promise<{ name: string; text: string } | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve(null)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, text: String(reader.result ?? '') })
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.click()
  })
}
