/* ============================================================
   画布背景视频 · IndexedDB 持久化（按项目 key）
   本地视频不塞进 localStorage（体积限制），存 Blob 到 IndexedDB，
   每个项目一个 key，刷新/切 tab 后自动恢复。
   仅用于预览叠加，不做导出。
   ============================================================ */

const DB_NAME = "overlay-studio";
const LEGACY_DB_NAME = "motion-playground";
const DB_VERSION = 1;
const STORE = "media";

function metaKeyOf(key: string): string {
  return `${key}-meta`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveVideoForKey(
  key: string,
  blob: Blob,
  name: string,
): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.objectStore(STORE).put(name, metaKeyOf(key));
    await txDone(tx);
    db.close();
  } catch {
    /* 存储不可用时静默降级为仅当前会话 */
  }
}

function openLegacyDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(LEGACY_DB_NAME, 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readPair(
  db: IDBDatabase,
  key: string,
): Promise<{ blob: Blob; name: string } | null> {
  try {
    const store = db.transaction(STORE, "readonly").objectStore(STORE);
    const [blob, name] = await Promise.all([
      new Promise<Blob | undefined>((res) => {
        const r = store.get(key);
        r.onsuccess = () => res(r.result as Blob | undefined);
        r.onerror = () => res(undefined);
      }),
      new Promise<string | undefined>((res) => {
        const r = store.get(metaKeyOf(key));
        r.onsuccess = () => res(r.result as string | undefined);
        r.onerror = () => res(undefined);
      }),
    ]);
    return blob ? { blob, name: name || "background.mp4" } : null;
  } catch {
    return null;
  }
}

/** 读取指定 key 的背景视频；若新库无此 key，尝试从旧库（motion-playground）迁移 */
export async function loadVideoForKey(
  key: string,
): Promise<{ blob: Blob; name: string } | null> {
  try {
    const db = await openDb();
    const found = await readPair(db, key);
    db.close();
    if (found) return found;
    // 旧库迁移：从 motion-playground 库读并写回新库
    const legacy = await openLegacyDb();
    if (!legacy) return null;
    const lfound = await readPair(legacy, key);
    legacy.close();
    if (!lfound) return null;
    await saveVideoForKey(key, lfound.blob, lfound.name);
    return lfound;
  } catch {
    return null;
  }
}

export async function clearVideoForKey(key: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.objectStore(STORE).delete(metaKeyOf(key));
    await txDone(tx);
    db.close();
  } catch {
    /* 忽略 */
  }
}
