/* ============================================================
   Overlay Studio · Electron 主进程
   - 双击 .app / .exe 即可启动，无需 Node / npm / 命令行
   - 加载构建产物 dist/index.html（file://，全部数据仍在
     localStorage / IndexedDB，与浏览器版完全一致）
   - 导出透明 MOV：渲染层通过 preload 桥流式写盘，默认保存到
     系统「下载」文件夹（同名自动加序号），完成后 UI 可
     「打开所在文件夹 / 查看视频」
   - --smoke 参数：自动化验证（加载完成截图后退出）
   ============================================================ */
const {
  app,
  BrowserWindow,
  dialog,
  session,
  ipcMain,
  shell,
} = require("electron");
const path = require("node:path");
const fs = require("node:fs");

app.setName("Overlay Studio");

let mainWindow = null;

/* ---------- 导出 MOV：流式写入（默认保存到系统下载文件夹） ---------- */
const openWriters = new Map(); // filePath -> fd

/** 生成不冲突的保存路径：~/Downloads/<name>.mov、<name> (1).mov … */
function uniqueDownloadPath(filename) {
  const dir = app.getPath("downloads");
  const safe = String(filename || "overlay-studio-transparent.mov")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();
  let filePath = path.join(dir, safe);
  let n = 1;
  while (fs.existsSync(filePath)) {
    const ext = path.extname(safe);
    const base = path.basename(safe, ext);
    filePath = path.join(dir, `${base} (${n})${ext}`);
    n++;
  }
  return filePath;
}

ipcMain.handle("save-mov-start", async (_e, filename) => {
  try {
    const filePath = uniqueDownloadPath(filename);
    const fd = fs.openSync(filePath, "w");
    openWriters.set(filePath, fd);
    return { ok: true, filePath };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

ipcMain.handle("save-mov-chunk", (_e, filePath, chunk) => {
  const fd = openWriters.get(filePath);
  if (fd == null) return { ok: false, error: "writer not found" };
  try {
    fs.writeSync(fd, Buffer.from(chunk));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

ipcMain.handle("save-mov-end", (_e, filePath, bytes) => {
  const fd = openWriters.get(filePath);
  if (fd == null) return { ok: false, error: "writer not found" };
  try {
    fs.closeSync(fd);
    openWriters.delete(filePath);
    return { ok: true, filePath, bytes: Number(bytes) || 0 };
  } catch (err) {
    openWriters.delete(filePath);
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

ipcMain.handle("save-mov-abort", (_e, filePath) => {
  const fd = openWriters.get(filePath);
  if (fd != null) {
    try { fs.closeSync(fd); } catch { /* ignore */ }
    openWriters.delete(filePath);
  }
  try { fs.unlinkSync(filePath); } catch { /* 文件可能不存在 */ }
  return { ok: true };
});

/* ---------- 打开文件 / 显示所在文件夹 ---------- */
ipcMain.handle("show-item-in-folder", (_e, p) => {
  if (typeof p === "string" && p) shell.showItemInFolder(p);
  return true;
});

ipcMain.handle("open-path", async (_e, p) => {
  if (typeof p !== "string" || !p) return "invalid path";
  const err = await shell.openPath(p);
  return err || "";
});

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
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const indexPath = path.join(__dirname, "..", "dist", "index.html");
  mainWindow.loadFile(indexPath);

  // 兜底：任何其它下载也默认落到系统下载文件夹（正常导出走 IPC，不触发这里）
  session.defaultSession.on("will-download", (event, item) => {
    event.preventDefault();
    const suggested = item.getFilename() || "overlay-studio-transparent.mov";
    const filePath = uniqueDownloadPath(suggested);
    item.setSavePath(filePath);
    item.once("done", (_e, state) => {
      if (state === "completed" && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("download-saved", filePath);
      }
    });
    item.resume();
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
