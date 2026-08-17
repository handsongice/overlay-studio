/* ============================================================
   Overlay Studio · Preload（安全桥）
   在 contextIsolation 下只暴露最小必要 API：
   - saveMov*：把导出 MOV 流式写入主进程（保存到系统下载文件夹）
   - showItemInFolder：在文件管理器中显示导出文件
   - openPath：用系统默认程序打开导出文件（QuickTime 等）
   ============================================================ */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("overlayStudio", {
  /** 开始一次 MOV 保存：主进程确定目标路径（下载文件夹 + 自动去重），并写入头部 */
  saveMovStart: (filename, header) =>
    ipcRenderer.invoke("save-mov-start", filename, header),
  /** 追加一个字节块 */
  saveMovChunk: (filePath, chunk) =>
    ipcRenderer.invoke("save-mov-chunk", filePath, chunk),
  /** 在文件指定偏移补写字节（用于修正 mdat size） */
  saveMovPatch: (filePath, offset, bytes) =>
    ipcRenderer.invoke("save-mov-patch", filePath, offset, bytes),
  /** 结束写入并关闭文件 */
  saveMovEnd: (filePath, bytes) =>
    ipcRenderer.invoke("save-mov-end", filePath, bytes),
  /** 中止并删除半成品 */
  saveMovAbort: (filePath) => ipcRenderer.invoke("save-mov-abort", filePath),
  /** 在文件管理器中显示（macOS Finder / Windows 资源管理器） */
  showItemInFolder: (p) => ipcRenderer.invoke("show-item-in-folder", p),
  /** 用系统默认程序打开文件（macOS QuickTime 等） */
  openPath: (p) => ipcRenderer.invoke("open-path", p),
});
