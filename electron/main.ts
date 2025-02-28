import { app, BrowserWindow } from "electron";
import path from "path";
const { screen } = require('electron');

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: fullWidth, height: fullHeight } = primaryDisplay.workAreaSize;
  const width = Math.floor(fullWidth * 0.8);
  const height = Math.floor(fullHeight * 0.8);

  const win = new BrowserWindow({
    width: width,
    height: height,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      devTools: true
    },
  });
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.toggleDevTools();
    }
  });
  win.setMenu(null);
  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
