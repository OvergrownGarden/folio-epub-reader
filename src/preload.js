const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  readEpub: (filePath) => ipcRenderer.invoke('read-epub', filePath),
  loadLibrary: () => ipcRenderer.invoke('load-library'),
  saveLibrary: (data) => ipcRenderer.invoke('save-library', data),
  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),
  close: () => ipcRenderer.send('win-close'),
  installUpdate: () => ipcRenderer.send('install-update'),
});
