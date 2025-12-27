const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  openFile: () => ipcRenderer.invoke('open-file'),
  exportFile: (options) => ipcRenderer.invoke('export-file', options),
  // Menu event listeners
  onMenuNew: (callback) => ipcRenderer.on('menu-new', callback),
  onMenuOpen: (callback) => ipcRenderer.on('menu-open', callback),
  onMenuSave: (callback) => ipcRenderer.on('menu-save', callback),
  onMenuExportMd: (callback) => ipcRenderer.on('menu-export-md', callback),
  onMenuExportTxt: (callback) => ipcRenderer.on('menu-export-txt', callback),
  onMenuToggleSplit: (callback) => ipcRenderer.on('menu-toggle-split', callback),
  onSetLineSpacing: (callback) => ipcRenderer.on('set-line-spacing', (event, value) => callback(value)),
  onFormatBold: (callback) => ipcRenderer.on('format-bold', callback),
  onFormatItalic: (callback) => ipcRenderer.on('format-italic', callback),
  onFormatUnderline: (callback) => ipcRenderer.on('format-underline', callback),
  onFormatHeading: (callback) => ipcRenderer.on('format-heading', (event, level) => callback(level)),
  onFormatParagraph: (callback) => ipcRenderer.on('format-paragraph', callback),
  onFormatBulletList: (callback) => ipcRenderer.on('format-bullet-list', callback),
  onFormatNumberedList: (callback) => ipcRenderer.on('format-numbered-list', callback),
  onFormatIndentList: (callback) => ipcRenderer.on('format-indent-list', callback),
  onFormatUnindentList: (callback) => ipcRenderer.on('format-unindent-list', callback),
})

contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
})
