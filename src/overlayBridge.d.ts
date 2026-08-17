/* Electron preload 桥的类型声明（浏览器版不存在，均为可选） */
declare global {
  interface SaveMovStartResult {
    ok: boolean;
    filePath?: string;
    error?: string;
  }
  interface SaveMovChunkResult {
    ok: boolean;
    error?: string;
  }
  interface SaveMovEndResult {
    ok: boolean;
    filePath?: string;
    bytes?: number;
    error?: string;
  }

  interface OverlayBridge {
    saveMovStart(
      filename: string,
      header?: Uint8Array,
    ): Promise<SaveMovStartResult>;
    saveMovChunk(filePath: string, chunk: Uint8Array): Promise<SaveMovChunkResult>;
    saveMovPatch(
      filePath: string,
      offset: number,
      bytes: Uint8Array,
    ): Promise<SaveMovChunkResult>;
    saveMovEnd(filePath: string, bytes: number): Promise<SaveMovEndResult>;
    saveMovAbort(filePath: string): Promise<{ ok: boolean }>;
    showItemInFolder(p: string): Promise<boolean>;
    openPath(p: string): Promise<string>;
  }

  interface Window {
    overlayStudio?: OverlayBridge;
  }
}

export {};
