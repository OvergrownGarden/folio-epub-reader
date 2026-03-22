const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let win;

// ── AUTO UPDATER CONFIG ──
autoUpdater.autoDownload = true;          // download silently in background
autoUpdater.autoInstallOnAppQuit = true;  // install when user quits

function setupUpdater() {
  // Silently check for updates 3 seconds after launch
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {}); // swallow network errors
  }, 3000);

  // Update downloaded — show a small prompt
  autoUpdater.on('update-downloaded', () => {
    if (!win) return;
    win.webContents.executeJavaScript(`
      if (typeof showUpdateBanner === 'function') showUpdateBanner();
    `).catch(() => {});
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 600,
    minHeight: 500,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0e0d',
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'src/icon.ico'),
  });

  win.loadFile(path.join(__dirname, 'src/index.html'));

  // Block ALL navigation — prevents black screen from epub anchor links
  win.webContents.on('will-navigate', (e, url) => {
    const expected = 'file://' + path.join(__dirname, 'src', 'index.html').replace(/\\/g, '/');
    if (url !== expected) e.preventDefault();
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  win.once('ready-to-show', () => {
    if (app.isPackaged) setupUpdater(); // only check updates in built app
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ── IPC ──
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(win, {
    filters: [{ name: 'EPUB Books', extensions: ['epub'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

ipcMain.handle('read-epub', async (event, filePath) => {
  try { return fs.readFileSync(filePath).toString('base64'); } catch (e) { return null; }
});

ipcMain.on('win-minimize', () => win.minimize());
ipcMain.on('win-maximize', () => { win.isMaximized() ? win.unmaximize() : win.maximize(); });
ipcMain.on('win-close', () => win.close());
ipcMain.on('install-update', () => autoUpdater.quitAndInstall());

const libraryPath = () => path.join(app.getPath('userData'), 'library.json');

ipcMain.handle('load-library', () => {
  try {
    if (fs.existsSync(libraryPath())) return JSON.parse(fs.readFileSync(libraryPath(), 'utf8'));
  } catch (e) {}
  return [];
});

ipcMain.handle('save-library', (event, data) => {
  try { fs.writeFileSync(libraryPath(), JSON.stringify(data)); } catch (e) {}
});
