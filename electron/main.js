const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.argv.includes('--developer') || !app.isPackaged

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
