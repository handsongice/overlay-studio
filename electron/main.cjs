/* ============================================================
   Overlay Studio · Electron 主进程
   - 双击 .app / .exe 即可启动，无需 Node / npm / 命令行
   - 加载构建产物 dist/index.html（file://，全部数据仍在
     localStorage / IndexedDB，与浏览器版完全一致）
   - 导出透明 MOV 触发下载时，弹系统「另存为」选择保存位置
   - --smoke 参数：自动化验证（加载完成截图后退出）
   ============================================================ */
const { app, BrowserWindow, dialog, session } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

app.setName("Overlay Studio");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 950,
    minWidth: 1100,
    minHeight: 720,
    title: "Overlay Studio",
    backgroundColor: "#0c0c0e",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const indexPath = path.join(__dirname, "..", "dist", "index.html");
  mainWindow.loadFile(indexPath);

  // 导出下载 → 弹系统另存为对话框（预填建议文件名）
  session.defaultSession.on("will-download", (event, item) => {
    event.preventDefault();
    const suggested = item.getFilename() || "overlay-studio-transparent.mov";
    const win = BrowserWindow.getFocusedWindow() || mainWindow;
    dialog
      .showSaveDialog(win, {
        title: "保存导出的透明动效层",
        defaultPath: suggested,
        filters: [{ name: "MOV 视频", extensions: ["mov"] }],
      })
      .then(({ canceled, filePath }) => {
        if (canceled || !filePath) {
          item.cancel();
          return;
        }
        item.setSavePath(filePath);
        item.once("done", (_e, state) => {
          if (state === "completed") {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("download-saved", filePath);
            }
          }
        });
        item.resume();
      })
      .catch(() => item.cancel());
  });

  // 自动化验证：--smoke
  if (process.argv.includes("--smoke")) {
    mainWindow.webContents.once("did-finish-load", async () => {
      try {
        await new Promise((r) => setTimeout(r, 1500));
        const title = mainWindow.webContents.getTitle();
        const out = process.env.SMOKE_SHOT
          ? process.env.SMOKE_SHOT
          : "/tmp/ov_smoke.png";
        const image = await mainWindow.webContents.capturePage();
        fs.writeFileSync(out, image.toPNG());
        console.log("SMOKE_OK title=" + title + " shot=" + out);
        app.exit(0);
      } catch (e) {
        console.error("SMOKE_FAIL", e);
        app.exit(1);
      }
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
