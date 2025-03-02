import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import * as fs from "fs";
const { screen } = require("electron");

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
      devTools: true,
    },
  });
  win.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      win.webContents.toggleDevTools();
    }
  });
  win.setMenu(null);
  win.loadURL("http://localhost:5173");
}

const chatLogPath = path.join(__dirname, "../chat-log.txt");

ipcMain.handle("save-chat-log", async (_, messages) => {
  try {
    await fs.promises.writeFile(chatLogPath, JSON.stringify(messages));
    return true;
  } catch (error) {
    console.error("Failed to save chat log:", error);
    return false;
  }
});

ipcMain.handle("load-chat-log", async () => {
  try {
    if (!fs.existsSync(chatLogPath)) {
      return [];
    }
    const data = await fs.promises.readFile(chatLogPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load chat log:", error);
    return [];
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
