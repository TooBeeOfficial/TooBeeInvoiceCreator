/* Preferences, held for the length of the session.

   Every write goes straight to disk. There is no Save button for
   preferences, because nobody thinks of setting their own address as a
   document they have to remember to keep. */

import { create } from 'zustand'
import type { Preferences, NumberingScheme, Defaults, AppTheme, PanelWidths } from '@model/prefs'
import type { Party } from '@model/party'
import type { SavedItem } from '@model/savedItem'
import type { SavedStyle } from '@model/savedStyle'
import { defaultPreferences } from '@core/factory/defaults'
import { loadPreferences, savePreferences } from '@core/storage/prefs'
import { makeId } from '@core/ids'

interface PrefsState {
  prefs: Preferences
  ready: boolean

  load: () => Promise<Preferences>
  set: (patch: Partial<Preferences>) => void
  setTheme: (theme: AppTheme) => void
  setLanguage: (language: string) => void
  setSeller: (patch: Partial<Party>) => void
  setNumbering: (patch: Partial<NumberingScheme>) => void
  setDefaults: (patch: Partial<Defaults>) => void
  setLastFile: (filePath: string | null) => void
  /** Written when a drag ends, not on every pixel of it. */
  setPanels: (patch: Partial<PanelWidths>) => void

  saveClient: (client: Party) => Party
  removeClient: (id: string) => void

  /** Adds or updates one catalogue item, matched on id. */
  saveItem: (item: SavedItem) => SavedItem
  removeItem: (id: string) => void
  /** Adds many at once, as an import does. Returns how many were added. */
  addItems: (items: SavedItem[]) => number
  /** Records that an item was used, so the ones you reach for surface first. */
  useItem: (id: string) => void

  /** Saves a look under a name, replacing one of the same name. */
  saveStyle: (style: SavedStyle) => SavedStyle
  removeStyle: (id: string) => void
}

export const usePrefsStore = create<PrefsState>((set, get) => {
  const persist = (prefs: Preferences) => {
    set({ prefs })
    void savePreferences(prefs)
  }

  return {
    prefs: defaultPreferences(),
    ready: false,

    load: async () => {
      const prefs = await loadPreferences()
      set({ prefs, ready: true })
      return prefs
    },

    set: (patch) => persist({ ...get().prefs, ...patch }),

    setTheme: (appTheme) => persist({ ...get().prefs, appTheme }),

    setLanguage: (language) => persist({ ...get().prefs, language }),

    setSeller: (patch) => {
      const prefs = get().prefs
      persist({ ...prefs, seller: { ...prefs.seller, ...patch } })
    },

    setNumbering: (patch) => {
      const prefs = get().prefs
      persist({ ...prefs, numbering: { ...prefs.numbering, ...patch } })
    },

    setDefaults: (patch) => {
      const prefs = get().prefs
      persist({ ...prefs, defaults: { ...prefs.defaults, ...patch } })
    },

    setLastFile: (lastFilePath) => persist({ ...get().prefs, lastFilePath }),

    setPanels: (patch) => {
      const prefs = get().prefs
      persist({ ...prefs, panels: { ...prefs.panels, ...patch } })
    },

    /* Saving a client either updates the one already in the book or adds a
       new one. Matched on id, so renaming a client keeps their history
       rather than leaving a second copy under the old name. */
    saveClient: (client) => {
      const prefs = get().prefs
      const id = client.id && client.id !== 'buyer' ? client.id : makeId('client')
      const stored: Party = { ...client, id }
      const exists = prefs.clients.some((c) => c.id === id)
      const clients = exists
        ? prefs.clients.map((c) => (c.id === id ? stored : c))
        : [stored, ...prefs.clients]
      persist({ ...prefs, clients })
      return stored
    },

    removeClient: (id) => {
      const prefs = get().prefs
      persist({ ...prefs, clients: prefs.clients.filter((c) => c.id !== id) })
    },

    /* ------------------------------------------------------- catalogue */

    saveItem: (item) => {
      const prefs = get().prefs
      const id = item.id || makeId('item')
      const stored: SavedItem = { ...item, id, updatedAt: new Date().toISOString() }
      const exists = prefs.items.some((i) => i.id === id)
      const items = exists
        ? prefs.items.map((i) => (i.id === id ? stored : i))
        : [stored, ...prefs.items]
      persist({ ...prefs, items })
      return stored
    },

    removeItem: (id) => {
      const prefs = get().prefs
      persist({ ...prefs, items: prefs.items.filter((i) => i.id !== id) })
    },

    /* An import that runs twice should not leave two of everything, so an
       incoming item with the same description and price as one already in
       the catalogue replaces it rather than joining it. */
    addItems: (incoming) => {
      const prefs = get().prefs
      const key = (i: SavedItem) => `${i.description.trim().toLowerCase()}|${i.unitPrice}`
      const byKey = new Map(prefs.items.map((i) => [key(i), i]))
      let added = 0
      for (const item of incoming) {
        const existing = byKey.get(key(item))
        byKey.set(key(item), existing ? { ...item, id: existing.id, useCount: existing.useCount } : item)
        if (!existing) added += 1
      }
      persist({ ...prefs, items: [...byKey.values()] })
      return added
    },

    useItem: (id) => {
      const prefs = get().prefs
      persist({
        ...prefs,
        items: prefs.items.map((i) => (i.id === id ? { ...i, useCount: i.useCount + 1 } : i)),
      })
    },

    /* ----------------------------------------------------------- styles */

    /* Matched on the name rather than the id, because saving under a name
       that is already taken is how someone says "update that one" — and two
       styles called "House" would be a list you cannot read. */
    saveStyle: (style) => {
      const prefs = get().prefs
      const name = style.name.trim()
      const existing = prefs.styles.find((s) => s.name.trim().toLowerCase() === name.toLowerCase())
      const stored: SavedStyle = {
        ...style,
        name,
        id: existing?.id ?? (style.id || makeId('style')),
        updatedAt: new Date().toISOString(),
      }
      const styles = existing
        ? prefs.styles.map((s) => (s.id === stored.id ? stored : s))
        : [stored, ...prefs.styles]
      persist({ ...prefs, styles })
      return stored
    },

    removeStyle: (id) => {
      const prefs = get().prefs
      persist({ ...prefs, styles: prefs.styles.filter((s) => s.id !== id) })
    },
  }
})
