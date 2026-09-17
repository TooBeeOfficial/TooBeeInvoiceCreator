/* The sheet itself, drawn in an iframe.

   An iframe rather than a div, because the template's CSS is written for a
   page and must not meet the app's own stylesheet — `.items` on an invoice
   and `.items` in the interface are different things, and nothing inside here
   can reach out and restyle the window around it.

   The frame is created once and then written into. Replacing its srcDoc on
   every keystroke would reload the document, flash white and throw away the
   scroll position — so instead the stylesheet's text and the body's markup
   are set directly, which repaints without a reload. */

import { useEffect, useRef, useState } from 'react'
import styles from './PreviewFrame.module.css'

const SKELETON = '<!doctype html><html><head><meta charset="utf-8"><style id="sheet"></style></head><body></body></html>'

export interface PreviewFrameProps {
  body: string
  css: string
  /** Page width in millimetres; the frame is laid out at exactly this. */
  widthMm: number
  minHeightMm: number
  scale: number
  title: string
  /* Called for a wheel with Ctrl or Shift held, in the parent window's
     coordinates. The frame has to forward these itself: a wheel over an
     iframe is dispatched inside that iframe's document and never reaches the
     page around it, so a listener out there sees nothing while the pointer
     is over the sheet — which is most of the time. */
  onZoomWheel: (deltaY: number, deltaMode: number, clientX: number, clientY: number) => void
  /* A middle-button drag on the sheet, in the parent's coordinates.

     All three are forwarded, not just the press. A press inside an iframe
     takes the rest of the gesture with it — the movements and the release go
     on being delivered to this document however far the pointer travels, and
     no amount of ignoring the pointer out there changes that. So the frame
     follows the drag it caught and reports where it goes. */
  onPanStart: (clientX: number, clientY: number) => void
  onPanMove: (clientX: number, clientY: number) => void
  onPanEnd: () => void
  /* A drag that began on the grey outside: the frame steps out of the way so
     the sheet does not swallow the movements as the pointer crosses it. */
  panning: boolean
}

const MM_PX = 96 / 25.4
const MIDDLE_BUTTON = 1

export function PreviewFrame ({
  body,
  css,
  widthMm,
  minHeightMm,
  scale,
  title,
  onZoomWheel,
  onPanStart,
  onPanMove,
  onPanEnd,
  panning,
}: PreviewFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  /* In a ref, not a local: the listeners are re-attached whenever the scale
     changes, and a drag in progress has to survive that. */
  const dragging = useRef(false)
  const [ready, setReady] = useState(false)
  const [contentHeight, setContentHeight] = useState(minHeightMm * MM_PX)

  /* Paint whenever the document changes, and measure what it came to so the
     frame can be exactly as tall as the invoice — an invoice that runs onto a
     second page has to be scrollable, not clipped. */
  useEffect(() => {
    if (!ready) return
    const frame = frameRef.current
    const doc = frame?.contentDocument
    if (!doc) return

    const style = doc.getElementById('sheet')
    if (style) style.textContent = css
    doc.body.innerHTML = body

    const measure = () => {
      const height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, minHeightMm * MM_PX)
      setContentHeight(height)
    }
    measure()

    /* Images arrive after the markup does; a logo dropping in changes the
       height of the letterhead and therefore of the sheet. */
    const observer = new ResizeObserver(measure)
    observer.observe(doc.body)
    return () => observer.disconnect()
  }, [body, css, minHeightMm, ready])

  /* The wheel, caught inside the frame and handed out.

     A point inside the frame is in the sheet's own unscaled pixels, so it is
     multiplied by the scale and offset by where the frame sits on screen
     before the parent can use it. */
  useEffect(() => {
    if (!ready) return
    const frame = frameRef.current
    const doc = frame?.contentDocument
    if (!frame || !doc) return

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.shiftKey) return
      event.preventDefault()
      const box = frame.getBoundingClientRect()
      onZoomWheel(
        event.deltaY,
        event.deltaMode,
        box.left + event.clientX * scale,
        box.top + event.clientY * scale,
      )
    }

    /* A point inside the frame is in the sheet's own unscaled pixels; the
       same conversion the wheel uses puts it back in the window's. */
    const toWindow = (event: MouseEvent) => {
      const box = frame.getBoundingClientRect()
      return { x: box.left + event.clientX * scale, y: box.top + event.clientY * scale }
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!dragging.current) return
      const point = toWindow(event)
      onPanMove(point.x, point.y)
    }

    const onMouseUp = () => {
      if (!dragging.current) return
      dragging.current = false
      onPanEnd()
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== MIDDLE_BUTTON) return
      /* Inside the frame as well as outside it: the autoscroll widget belongs
         to whichever document the press landed in. */
      event.preventDefault()
      dragging.current = true
      const point = toWindow(event)
      onPanStart(point.x, point.y)
    }

    doc.addEventListener('wheel', onWheel, { passive: false })
    doc.addEventListener('mousedown', onMouseDown)
    doc.addEventListener('mousemove', onMouseMove)
    doc.addEventListener('mouseup', onMouseUp)
    return () => {
      doc.removeEventListener('wheel', onWheel)
      doc.removeEventListener('mousedown', onMouseDown)
      doc.removeEventListener('mousemove', onMouseMove)
      doc.removeEventListener('mouseup', onMouseUp)
    }
  }, [ready, scale, onZoomWheel, onPanStart, onPanMove, onPanEnd])

  return (
    <div
      className={styles.holder}
      style={{
        width: widthMm * MM_PX * scale,
        height: contentHeight * scale,
      }}
    >
      <iframe
        ref={frameRef}
        className={styles.frame}
        title={title}
        srcDoc={SKELETON}
        /* Same origin so the app can write into the frame, but no
           allow-scripts: nothing inside a template can execute, which matters
           for an invoice file that arrived by email. */
        sandbox="allow-same-origin"
        scrolling="no"
        onLoad={() => setReady(true)}
        style={{
          width: widthMm * MM_PX,
          height: contentHeight,
          transform: `scale(${scale})`,
          pointerEvents: panning ? 'none' : undefined,
        }}
      />
    </div>
  )
}
