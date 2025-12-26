const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportFile: (options) => ipcRenderer.invoke('export-file', options),
})

contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
})
