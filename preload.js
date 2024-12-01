const { contextBridge, ipcRenderer } = require("electron");

// Expose methods to the renderer process
contextBridge.exposeInMainWorld("electron", {
  getSources: () => ipcRenderer.invoke("get-sources"),
  convertVideo: (buffer, resolution) =>
    ipcRenderer.invoke("convert-video", buffer, resolution),
});
