/* The state of the window rather than the state of the invoice.

   Which page you are on, how far the preview is zoomed, which inspector tab
   is showing, and what the app is currently telling you. None of it belongs
   in a document — opening someone else's invoice should not move your
   furniture — so none of it is ever written into one. */

import { create } from 'zustand'
import { makeId } from '@core/ids'
import { DEFAULT_PANELS } from '@core/factory/defaults'

export type PageId = 'invoices' | 'editor' | 'items' | 'clients' | 'company'
export type InspectorTab = 'template' | 'style' | 'layout' | 'code'
export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

export interface Toast {
  id: string
  tone: ToastTone
  message: string
  /** An optional thing to do about it, shown as a button on the toast. */
  action?: { label: string; run: () => void }
}

export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 2

export interface ConfirmRequest {
  title: string
  body: string
  confirmLabel: string
  tone: 'default' | 'danger'
  resolve: (confirmed: boolean) => void
}

interface UiState {
  page: PageId
  inspectorOpen: boolean
  inspectorTab: InspectorTab
  /** null means fit the sheet to the space available. */
  zoom: number | null
  /* What "fit" last worked out to. Published by the preview so that zooming
     from the keyboard starts at the size on screen rather than jumping to
     100% first — pressing zoom-in should make the sheet slightly bigger, not
     suddenly different. */
  fitScale: number
  toasts: Toast[]
  confirm: ConfirmRequest | null
  shortcutsOpen: boolean
  settingsOpen: boolean

  /* Pane widths live here while they are being dragged, so a drag repaints
     at pointer speed without writing to disk. Preferences take a copy when
     the drag ends. */
  formWidth: number
  inspectorWidth: number

  go: (page: PageId) => void
  toggleInspector: (open?: boolean) => void
  setInspectorTab: (tab: InspectorTab) => void
  setZoom: (zoom: number | null) => void
  setFitScale: (scale: number) => void
  /** Steps the zoom from wherever it is now, fit included. */
  stepZoom: (step: number) => void
  nudgeZoom: (step: number, current: number) => void

  notify: (message: string, tone?: ToastTone, action?: Toast['action']) => void
  dismiss: (id: string) => void

  ask: (request: Omit<ConfirmRequest, 'resolve'>) => Promise<boolean>
  answer: (confirmed: boolean) => void

  setShortcuts: (open: boolean) => void
  setSettings: (open: boolean) => void

  setFormWidth: (width: number) => void
  setInspectorWidth: (width: number) => void
  /** Seeds both from preferences once they have been read. */
  adoptPanels: (widths: { form: number; inspector: number }) => void
}

const TOAST_MS = 4600

export const useUiStore = create<UiState>((set, get) => ({
  page: 'invoices',
  inspectorOpen: true,
  inspectorTab: 'template',
  zoom: null,
  fitScale: 0.6,
  toasts: [],
  confirm: null,
  shortcutsOpen: false,
  settingsOpen: false,
  formWidth: DEFAULT_PANELS.form,
  inspectorWidth: DEFAULT_PANELS.inspector,

  go: (page) => set({ page }),
  toggleInspector: (open) => set((s) => ({ inspectorOpen: open ?? !s.inspectorOpen })),
  setInspectorTab: (inspectorTab) => set({ inspectorTab, inspectorOpen: true }),
  setZoom: (zoom) => set({ zoom: zoom === null ? null : clamp(zoom) }),
  setFitScale: (fitScale) => set({ fitScale }),

  stepZoom: (step) => set((s) => ({ zoom: clamp((s.zoom ?? s.fitScale) + step) })),

  /* Zooming from "fit" has to start somewhere, so it starts from whatever
     fit actually worked out to — the sheet grows from the size on screen
     rather than jumping to 100% first. */
  nudgeZoom: (step, current) => set({ zoom: clamp(current + step) }),

  notify: (message, tone = 'info', action) => {
    const id = makeId('toast')
    set((s) => ({ toasts: [...s.toasts, { id, tone, message, action }] }))
    /* Warnings and failures stay until they are dismissed: a message saying
       something did not happen should not disappear before it is read. */
    if (tone === 'info' || tone === 'success') {
      setTimeout(() => get().dismiss(id), TOAST_MS)
    }
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  ask: (request) => new Promise<boolean>((resolve) => {
    set({ confirm: { ...request, resolve } })
  }),

  answer: (confirmed) => {
    const request = get().confirm
    set({ confirm: null })
    request?.resolve(confirmed)
  },

  setShortcuts: (shortcutsOpen) => set({ shortcutsOpen }),

  setSettings: (settingsOpen) => set({ settingsOpen }),

  setFormWidth: (formWidth) => set({ formWidth }),
  setInspectorWidth: (inspectorWidth) => set({ inspectorWidth }),
  adoptPanels: ({ form, inspector }) => set({ formWidth: form, inspectorWidth: inspector }),
}))

const clamp = (zoom: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * 100) / 100))
