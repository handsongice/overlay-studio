/* ============================================================
   极简 ZIP 写入器（STORED 方式，无压缩）
   PNG 本身已是压缩数据，STORE 即可；零依赖，兼容所有现代浏览器。
   仅用于「导出透明动效层」在无 File System Access API 时的兜底。
   ============================================================ */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()): { time: number; date: number } {
  const t =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() & 0x3e) >> 1);
  const d =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    ((date.getMonth() + 1) & 0x0f) << 5 |
    (date.getDate() & 0x1f);
  return { time: t, date: d };
}

/** 把多个二进制块打包成一个 STORED ZIP（返回 Blob） */
export async function zipBlobs(
  entries: { name: string; data: Blob }[],
): Promise<Blob> {
  const chunks: Blob[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBytes = new TextEncoder().encode(name);
    const dataBytes = new Uint8Array(await data.arrayBuffer());
    const crc = crc32(dataBytes);
    const { time, date } = dosDateTime();
    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true); // PK\x03\x04
    dv.setUint16(4, 20, true); // version needed
    dv.setUint16(6, 0x0800, true); // UTF-8 flag
    dv.setUint16(8, 0, true); // method: stored
    dv.setUint16(10, time, true);
    dv.setUint16(12, date, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, dataBytes.length, true); // compressed size
    dv.setUint32(22, dataBytes.length, true); // uncompressed size
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true); // extra len
    local.set(nameBytes, 30);

    chunks.push(new Blob([local, dataBytes]));
    const cen = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(cen.buffer);
    cdv.setUint32(0, 0x02014b50, true); // PK\x01\x02
    cdv.setUint16(4, 20, true); // version made by
    cdv.setUint16(6, 20, true); // version needed
    cdv.setUint16(8, 0x0800, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, time, true);
    cdv.setUint16(14, date, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, dataBytes.length, true);
    cdv.setUint32(24, dataBytes.length, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true); // extra
    cdv.setUint16(32, 0, true); // comment
    cdv.setUint16(34, 0, true); // disk
    cdv.setUint16(36, 0, true); // internal attrs
    cdv.setUint32(38, 0, true); // external attrs
    cdv.setUint32(42, offset, true); // local header offset
    cen.set(nameBytes, 46);
    central.push(cen);

    offset += local.length + dataBytes.length;
  }

  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // PK\x05\x06
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...chunks, ...central, eocd], {
    type: "application/zip",
  });
}

/** 触发浏览器下载 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
