/* The workbench: the sheet, on a surface, at a size you choose.

   Zoom starts as "fit", which is not a number but a promise — the sheet
   stays as large as the space allows and re-fits when the window or the
   inspector changes the space. Zooming in or out turns that promise into a
   number, and the Fit button gives it back. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { InvoiceDoc } from '@model/invoice'
import { renderDocument } from '@core/document/render'
import { pageDimensions, MM_PX } from '@core/document/paper'
import { getTemplate } from '@templates/registry'
import { useUiStore, ZOOM_MAX, ZOOM_MIN } from '@store/useUiStore'
import { IconButton } from '@elements/IconButton/IconButton'
import { useT } from '@hooks/useT'
import { PreviewFrame } from './PreviewFrame'
import styles from './DocumentPreview.module.css'

export interface DocumentPreviewProps {
  doc: InvoiceDoc
  className?: string
}

const PADDING = 48

/* `button` on a press and `buttons` during a move are two different
   numberings, and the middle button is 1 in one and 4 in the other. */
const MIDDLE_BUTTON = 1
const MIDDLE_HELD = 4

/* How far a sheet may be carried off: half the space it is in, so at worst
   half of it is still on screen and it can always be dragged back. */
const hold = (value: number, span: number): number =>
  Math.max(-span / 2, Math.min(span / 2, value))

/* The same bounds the store keeps, applied before it so the anchoring maths
   works on the value that will actually be used. */
const clampZoom = (zoom: number) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * 100) / 100))

export function DocumentPreview ({ doc, className }: DocumentPreviewProps) {
  const t = useT()
  const zoom = useUiStore((s) => s.zoom)
  const setZoom = useUiStore((s) => s.setZoom)
  const nudgeZoom = useUiStore((s) => s.nudgeZoom)
  const setFitScale = useUiStore((s) => s.setFitScale)

  const surfaceRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState(0)

  /* How far the sheet has been carried away from where the layout puts it.

     Scrolling can only move a sheet that is bigger than the space it is in,
     and most of the time it is not: at Fit it is exactly the size of the
     window, and a drag would have nothing to do. So an axis with no room to
     scroll is moved by shifting the sheet itself instead, which works at any
     size. It is a transform, so it costs no layout and the scrollable area
     does not grow as the paper wanders.

     Kept in a ref as well as in state because the drag writes it straight to
     the element sixty times a second; the state is what survives a re-render
     and is set once, at the end. */
  const drift = useRef({ x: 0, y: 0 })
  const [restingDrift, setRestingDrift] = useState({ x: 0, y: 0 })

  const showDrift = useCallback(() => {
    const stage = stageRef.current
    if (stage) stage.style.transform = `translate(${drift.current.x}px, ${drift.current.y}px)`
  }, [])

  /* Back to where the layout would have put it. The Fit control does this as
     well as resetting the zoom, so there is always one obvious way to find a
     sheet that has been dragged off into the grey. */
  const recentre = useCallback(() => {
    drift.current = { x: 0, y: 0 }
    setRestingDrift({ x: 0, y: 0 })
    showDrift()
  }, [showDrift])

  const template = useMemo(() => getTemplate(doc.settings.templateId), [doc.settings.templateId])
  const rendered = useMemo(() => renderDocument(doc, template, { mode: 'screen' }), [doc, template])
  const { w, h } = pageDimensions(doc.settings.paper, doc.settings.orientation)

  /* The sheet is re-fitted whenever the space around it changes: opening the
     inspector, dragging the window, switching to landscape. */
  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width))
    observer.observe(surface)
    setAvailable(surface.clientWidth)
    return () => observer.disconnect()
  }, [])

  const fitScale = available > 0
    ? Math.min(1.6, Math.max(0.2, (available - PADDING) / (w * MM_PX)))
    : 0.6
  const scale = zoom ?? fitScale
  const percent = Math.round(scale * 100)

  /* Told to the store so a keyboard zoom can start from the size actually on
     screen. Only when it moves, so this does not loop. */
  useEffect(() => { setFitScale(fitScale) }, [fitScale, setFitScale])

  /* Zooming with the wheel, held under the pointer.

     The sheet grows about whatever the cursor is over rather than about the
     top left corner, so reading a figure and zooming into it keeps that
     figure where it was. Without that anchoring the page slides away and
     every zoom needs a scroll to undo it.

     `clientX` and `clientY` are in this window's coordinates. That matters
     because most of the time the pointer is over the preview's iframe, whose
     wheel events are dispatched inside its own document and never reach this
     one — the frame catches those and converts them before calling here. */
  const zoomAt = useCallback((deltaY: number, deltaMode: number, clientX: number, clientY: number) => {
    const surface = surfaceRef.current
    if (!surface) return

    const ui = useUiStore.getState()
    const current = ui.zoom ?? ui.fitScale
    /* A line of scroll is not a pixel; a page is not either. */
    const steps = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY
    const next = clampZoom(current * Math.exp(-steps * 0.0015))
    if (next === current) return

    const box = surface.getBoundingClientRect()
    const offsetX = clientX - box.left
    const offsetY = clientY - box.top
    /* Where the pointer is in the sheet's own coordinates, before and after.
       A sheet that has been dragged is no longer where the layout put it, so
       the drift comes off before the sum and goes back on after it. */
    const sheetX = (surface.scrollLeft + offsetX - drift.current.x) / current
    const sheetY = (surface.scrollTop + offsetY - drift.current.y) / current

    setZoom(next)
    requestAnimationFrame(() => {
      surface.scrollLeft = sheetX * next - offsetX + drift.current.x
      surface.scrollTop = sheetY * next - offsetY + drift.current.y
    })
  }, [setZoom])

  /* The grey around the sheet. Bound by hand rather than with onWheel because
     React attaches wheel listeners passively, and a passive listener cannot
     call preventDefault — which is what stops Chromium zooming the whole
     interface instead of the paper. */
  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.shiftKey) return
      event.preventDefault()
      zoomAt(event.deltaY, event.deltaMode, event.clientX, event.clientY)
    }
    surface.addEventListener('wheel', onWheel, { passive: false })
    return () => surface.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  /* Holding the middle button and moving drags the sheet about, the way it
     works in a map or a drawing program. It is the quickest way around a page
     that has been zoomed past the window, and it costs no chrome.

     Only where the drag starts has to be caught in two places — the grey
     below, and the frame, which forwards it. Once it has started the iframe
     is made deaf to the pointer, so every move and the release land out here
     whatever they are over. Without that the sheet would swallow them the
     moment the cursor crossed onto the paper, which is immediately. */
  const [panning, setPanning] = useState(false)
  const endPan = useRef<(() => void) | null>(null)

  /* The listeners go on at the press itself rather than in an effect keyed on
     the panning flag. An effect would not run until React had re-rendered,
     and the first movement can arrive before that — a drag that begins with a
     flick would lose its opening millimetres. */
  /* Where the drag began and what the sheet's position was then.

     Every movement is worked out from the press rather than from the movement
     before it, so the same movement arriving twice lands the sheet in the
     same place instead of moving it twice as far. That matters because a drag
     that starts on the paper is delivered to the paper's own document — the
     press inside an iframe takes the whole gesture with it — so the frame
     forwards those movements out here, while a drag that starts on the grey
     arrives on the window directly. Either source, same answer. */
  const pan = useRef<{
    fromX: number
    fromY: number
    scrollLeft: number
    scrollTop: number
    driftX: number
    driftY: number
    carryX: boolean
    carryY: boolean
  } | null>(null)

  /* Stable, because the frame's listeners are torn down and put back when
     anything it depends on changes — and a callback that changed identity on
     every render would do that in the middle of a drag. */
  const stopPan = useCallback(() => { endPan.current?.() }, [])

  const movePan = useCallback((clientX: number, clientY: number) => {
    const surface = surfaceRef.current
    const at = pan.current
    if (!surface || !at) return

    const dx = clientX - at.fromX
    const dy = clientY - at.fromY

    if (at.carryX) drift.current.x = hold(at.driftX + dx, surface.clientWidth)
    else surface.scrollLeft = at.scrollLeft - dx

    if (at.carryY) drift.current.y = hold(at.driftY + dy, surface.clientHeight)
    else surface.scrollTop = at.scrollTop - dy

    showDrift()
  }, [showDrift])

  const startPan = useCallback((clientX: number, clientY: number) => {
    const surface = surfaceRef.current
    const stage = stageRef.current
    if (!surface || !stage) return
    endPan.current?.()

    /* Which mechanism each axis uses, settled once here and not asked again
       until the next drag.

       It has to be settled once because carrying the sheet *creates* room to
       scroll: a translated box counts towards the scrollable area, so an axis
       re-measured mid-drag would start scrolling the moment the first
       millimetre of carry had been applied, and the sheet would judder
       between the two mechanisms.

       And the room is worked out from `offsetWidth`, which is the layout
       size and is not affected by the transform, rather than `scrollWidth`,
       which is. */
    const pad = getComputedStyle(surface)
    const roomX = stage.offsetWidth + parseFloat(pad.paddingLeft) + parseFloat(pad.paddingRight) - surface.clientWidth
    const roomY = stage.offsetHeight + parseFloat(pad.paddingTop) + parseFloat(pad.paddingBottom) - surface.clientHeight
    const carryX = roomX <= 0
    const carryY = roomY <= 0

    pan.current = {
      fromX: clientX,
      fromY: clientY,
      scrollLeft: surface.scrollLeft,
      scrollTop: surface.scrollTop,
      driftX: drift.current.x,
      driftY: drift.current.y,
      carryX,
      carryY,
    }

    /* Whether this environment reports which buttons are down at all.

       `buttons` is how a drag notices that the button was let go somewhere
       this window could not see it — over another application, or off the
       edge of the screen. But not every source of input fills it in, and one
       that always reports nothing would end the drag on its first movement.
       So it is only believed once it has been seen to work. */
    let buttonsReported = false

    const move = (event: MouseEvent) => {
      if (event.buttons !== 0) buttonsReported = true
      if (buttonsReported && (event.buttons & MIDDLE_HELD) === 0) { stop(); return }
      movePan(event.clientX, event.clientY)
    }

    const stop = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', stop)
      pan.current = null
      endPan.current = null
      setPanning(false)
      /* What the drag wrote by hand, told to React, so a re-render for any
         other reason does not snap the sheet back. */
      setRestingDrift({ ...drift.current })
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', stop)
    endPan.current = stop
    setPanning(true)
  }, [movePan])

  /* A drag still running when the preview goes away takes its listeners with
     it rather than leaving them on the window. */
  useEffect(() => () => endPan.current?.(), [])

  /* Changing the size re-decides where the sheet sits: at a new zoom it may
     have room to scroll where a moment ago it had none, and a sheet left
     hanging in the grey from the old size would be in the way. */
  useEffect(() => { recentre() }, [zoom, recentre])

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return
    const onDown = (event: MouseEvent) => {
      if (event.button !== MIDDLE_BUTTON) return
      /* Stops the autoscroll widget — the four-way arrow that otherwise
         appears and takes the drag over. */
      event.preventDefault()
      startPan(event.clientX, event.clientY)
    }
    surface.addEventListener('mousedown', onDown)
    return () => surface.removeEventListener('mousedown', onDown)
  }, [startPan])

  return (
    <div className={[styles.preview, className].filter(Boolean).join(' ')}>
      {/* A carried sheet still counts towards the scrollable area, which
          would put up a scrollbar onto empty grey. The axis that is being
          carried is not one that had anywhere to scroll in the first place,
          so it is closed off while the sheet is away from home. */}
      <div
        className={[styles.surface, panning ? styles.panning : ''].filter(Boolean).join(' ')}
        ref={surfaceRef}
        style={{
          overflowX: restingDrift.x !== 0 ? 'hidden' : undefined,
          overflowY: restingDrift.y !== 0 ? 'hidden' : undefined,
        }}
      >
        <div
          className={styles.stage}
          ref={stageRef}
          style={{ transform: `translate(${restingDrift.x}px, ${restingDrift.y}px)` }}
        >
          <PreviewFrame
            body={rendered.body}
            css={rendered.css}
            widthMm={w}
            minHeightMm={h}
            scale={scale}
            onZoomWheel={zoomAt}
            onPanStart={startPan}
            onPanMove={movePan}
            onPanEnd={stopPan}
            panning={panning}
            title={doc.meta.number || t.rail.untitled}
          />
        </div>
      </div>

      <div className={styles.zoombar}>
        <IconButton
          icon="zoomOut"
          label={t.preview.zoomOut}
          size="sm"
          disabled={scale <= ZOOM_MIN}
          onClick={() => nudgeZoom(-0.1, scale)}
        />
        {/* The figure is always a figure — the Fit button beside it is lit
            when the size is being worked out rather than chosen, which says
            the same thing without a word that needs translating. */}
        <button
          type="button"
          className={styles.percent}
          onClick={() => { setZoom(zoom === null ? 1 : null); recentre() }}
          title={zoom === null ? '100%' : t.preview.fit}
        >
          {percent}%
        </button>
        <IconButton
          icon="zoomIn"
          label={t.preview.zoomIn}
          size="sm"
          disabled={scale >= ZOOM_MAX}
          onClick={() => nudgeZoom(0.1, scale)}
        />
        <span className={styles.divider} aria-hidden="true" />
        <IconButton
          icon="fit"
          label={t.preview.fit}
          size="sm"
          active={zoom === null && restingDrift.x === 0 && restingDrift.y === 0}
          onClick={() => { setZoom(null); recentre() }}
        />
        <span className={styles.paper}>
          {doc.settings.paper} · {template.name}
        </span>
      </div>
    </div>
  )
}
