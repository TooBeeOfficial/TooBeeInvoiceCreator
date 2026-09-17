/* The only surface the window has on the machine. Every call is a request the
   main process may refuse; nothing here touches the filesystem directly. */

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('invoicer', {
  isDesktop: true,

  readLibrary: () => ipcRenderer.invoke('library:read'),
  writeLibrary: (library) => ipcRenderer.invoke('library:write', library),

  readPrefs: () => ipcRenderer.invoke('prefs:read'),
  writePrefs: (prefs) => ipcRenderer.invoke('prefs:write', prefs),

  listTemplates: () => ipcRenderer.invoke('templates:list'),
  saveTemplate: (t) => ipcRenderer.invoke('templates:save', t),
  deleteTemplate: (id) => ipcRenderer.invoke('templates:delete', id),

  saveDoc: (payload) => ipcRenderer.invoke('doc:save', payload),
  openDoc: (payload) => ipcRenderer.invoke('doc:open', payload || {}),
  writeDocPath: (payload) => ipcRenderer.invoke('doc:writePath', payload),
  docExists: (filePath) => ipcRenderer.invoke('doc:exists', filePath),

  exportPdf: (payload) => ipcRenderer.invoke('pdf:export', payload),
  exportText: (payload) => ipcRenderer.invoke('export:text', payload),
  exportBinary: (payload) => ipcRenderer.invoke('export:binary', payload),

  pickImage: () => ipcRenderer.invoke('image:pick'),
  importFile: () => ipcRenderer.invoke('file:import'),
  showItem: (p) => ipcRenderer.invoke('shell:showItem', p),

  onMenu: (handler) => {
    const listener = (_e, action) => handler(action)
    ipcRenderer.on('menu', listener)
    return () => ipcRenderer.removeListener('menu', listener)
  },
})
