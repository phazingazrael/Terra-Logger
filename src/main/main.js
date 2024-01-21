import { app, BrowserWindow } from 'electron';
import * as path from 'path';

import Package from "../../package.json";

import global from '../renderer/global';

const os = require('node:os');

const Globals = global.shared;

Globals.settings.version = Package.version;
Globals.settings.os = {
  architecture: os.arch(),
  cpu: os.cpus(),
  platform: os.platform()
}
Globals.settings.os.cpu = Globals.settings.os.cpu[0].model;

let mainWindow;


app.whenReady().then(async () => {
  // Create a BrowserWindow with contextIsolation enabled.
  const bw = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),

    }
  })
  bw.maximize();
  //bw.show();
  bw.loadURL('http://localhost:5173')
  bw.maximize();
  bw.on('closed', () => mainWindow = null);
  bw.webContents.openDevTools();

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});