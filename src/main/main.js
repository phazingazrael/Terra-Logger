import { app, BrowserWindow } from 'electron'
import * as path from 'path'

import Package from '../../package.json'
import server from './server'

const title = 'Terra-Logger v' + Package.version

app.whenReady().then(async () => {
  // Create a BrowserWindow with contextIsolation enabled.
  server;
  const bw = new BrowserWindow({
    title: title,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js')
    },
    icon: '../assets/icons/png/512x512.png'
  })

  bw.maximize()
  bw.loadURL('http://localhost:3000')
  bw.on('closed', () => null)
  bw.webContents.openDevTools()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
