const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const path = require("path");
const { convertToMP4 } = require("./convert"); // Import the conversion module

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Path to preload script
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Keep contextIsolation enabled
    },
  });

  mainWindow.loadFile("index.html");

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
});

// Handle screen capture request from renderer process
ipcMain.handle("get-sources", async () => {
  return await desktopCapturer.getSources({ types: ["screen"] });
});

// Handle video conversion request
ipcMain.handle("convert-video", async (event, buffer, resolution) => {
  try {
    await convertToMP4(buffer, resolution); // Perform conversion using the external module
    return { success: true };
  } catch (error) {
    console.error("Error during conversion:", error);
    return { success: false, error: error.message };
  }
});
