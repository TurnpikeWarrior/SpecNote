const { app, BrowserWindow, screen, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.argv.includes('--developer') || !app.isPackaged

// Set app name for macOS menu bar
app.setName('SpecNote')

let mainWindow = null

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../src/assets/icons/icon.png'),
    title: 'SpecNote',
    width: Math.min(1400, width - 100),
    height: Math.min(900, height - 100),
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 14 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Set up macOS application menu with correct app name
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'SpecNote',
        submenu: [
          { role: 'about', label: 'About SpecNote' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide', label: 'Hide SpecNote' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit', label: 'Quit SpecNote' }
        ]
      },
      {
        label: 'File',
        submenu: [
          { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu-new') },
          { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu-open') },
          { type: 'separator' },
          { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu-save') },
          { type: 'separator' },
          { label: 'Export as Markdown...', accelerator: 'CmdOrCtrl+Shift+M', click: () => mainWindow?.webContents.send('menu-export-md') },
          { label: 'Export as Plain Text...', accelerator: 'CmdOrCtrl+Shift+T', click: () => mainWindow?.webContents.send('menu-export-txt') },
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' }
        ]
      },
      {
        label: 'Format',
        submenu: [
          { label: 'Bold', accelerator: 'CmdOrCtrl+B', click: () => mainWindow?.webContents.send('format-bold') },
          { label: 'Italic', accelerator: 'CmdOrCtrl+I', click: () => mainWindow?.webContents.send('format-italic') },
          { label: 'Underline', accelerator: 'CmdOrCtrl+U', click: () => mainWindow?.webContents.send('format-underline') },
          { type: 'separator' },
          {
            label: 'Line Spacing',
            submenu: [
              { label: 'Single (1.0)', click: () => mainWindow?.webContents.send('set-line-spacing', 1.0) },
              { label: 'Compact (1.2)', click: () => mainWindow?.webContents.send('set-line-spacing', 1.2) },
              { label: 'Normal (1.4)', click: () => mainWindow?.webContents.send('set-line-spacing', 1.4) },
              { label: 'Relaxed (1.5)', click: () => mainWindow?.webContents.send('set-line-spacing', 1.5) },
              { label: 'Loose (1.75)', click: () => mainWindow?.webContents.send('set-line-spacing', 1.75) },
              { label: 'Double (2.0)', click: () => mainWindow?.webContents.send('set-line-spacing', 2.0) },
            ]
          },
          { type: 'separator' },
          {
            label: 'Heading',
            submenu: [
              { label: 'Heading 1', click: () => mainWindow?.webContents.send('format-heading', 1) },
              { label: 'Heading 2', click: () => mainWindow?.webContents.send('format-heading', 2) },
              { label: 'Heading 3', click: () => mainWindow?.webContents.send('format-heading', 3) },
              { label: 'Paragraph', click: () => mainWindow?.webContents.send('format-paragraph') },
            ]
          },
          { type: 'separator' },
          { label: 'Bullet List', click: () => mainWindow?.webContents.send('format-bullet-list') },
          { label: 'Numbered List', click: () => mainWindow?.webContents.send('format-numbered-list') },
          { type: 'separator' },
          { label: 'Indent List Item (⌘])', click: () => mainWindow?.webContents.send('format-indent-list') },
          { label: 'Unindent List Item (⌘[)', click: () => mainWindow?.webContents.send('format-unindent-list') },
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Toggle Split View', accelerator: 'CmdOrCtrl+\\', click: () => mainWindow?.webContents.send('menu-toggle-split') },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          { label: 'Keyboard Shortcuts', accelerator: 'CmdOrCtrl+/', click: () => mainWindow?.webContents.send('menu-shortcuts') }
        ]
      }
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// File operations
ipcMain.handle('save-file', async (event, { content, filePath, defaultName }) => {
  try {
    let targetPath = filePath

    if (!targetPath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultName,
        filters: [
          { name: 'SpecNote Document', extensions: ['specnote'] },
          { name: 'JSON', extensions: ['json'] },
        ],
      })

      if (result.canceled) {
        return { success: false, canceled: true }
      }

      targetPath = result.filePath
    }

    fs.writeFileSync(targetPath, content, 'utf-8')

    return {
      success: true,
      filePath: targetPath,
      fileName: path.basename(targetPath, path.extname(targetPath)),
    }
  } catch (error) {
    console.error('Save error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('open-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [
        { name: 'SpecNote Document', extensions: ['specnote'] },
        { name: 'JSON', extensions: ['json'] },
      ],
      properties: ['openFile'],
    })

    if (result.canceled) {
      return { success: false, canceled: true }
    }

    const filePath = result.filePaths[0]
    const content = fs.readFileSync(filePath, 'utf-8')

    return {
      success: true,
      filePath,
      fileName: path.basename(filePath, path.extname(filePath)),
      content,
    }
  } catch (error) {
    console.error('Open error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('export-file', async (event, { content, defaultName, extension }) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: [
        { name: extension === 'md' ? 'Markdown' : 'Plain Text', extensions: [extension] },
      ],
    })

    if (result.canceled) {
      return { success: false, canceled: true }
    }

    fs.writeFileSync(result.filePath, content, 'utf-8')

    return { success: true, filePath: result.filePath }
  } catch (error) {
    console.error('Export error:', error)
    return { success: false, error: error.message }
  }
})
