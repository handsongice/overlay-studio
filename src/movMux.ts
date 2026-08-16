/* ============================================================
   MOV muxer · QuickTime 透明视频（PNG codec）
   把已渲染好的透明 PNG 帧直接封装成 .mov 文件：
   - 视频样本 = PNG 帧字节（QuickTime 'png ' 编码，depth 32 带 alpha）
   - 纯 JS 零依赖，无需 ffmpeg/WebCodecs，兼容剪映 / PR / FCP
   - 1920×1080、帧率按项目设置（timescale 600，24/30/60 均整除）
   - 帧直接以 Blob 部件拼接，不整段复制字节，降低大导出内存峰值
   ============================================================ */

const TIMESCALE = 600;

function u32(v: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, v >>> 0);
  return b;
}
function u16(v: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, v & 0xffff);
  return b;
}
function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}
/** 标准 box：size(4) + type(4) + payload */
function box(type: string, ...payload: Uint8Array[]): Uint8Array {
  const body = concat(...payload);
  return concat(u32(body.length + 8), new TextEncoder().encode(type), body);
}
/** 文件级 box（mdat 等需要按实际文件偏移计算的用自定义大小） */
function fullBox(type: string, versionFlags: number, ...payload: Uint8Array[]): Uint8Array {
  return box(type, u32(versionFlags), ...payload);
}

const MATRIX_IDENTITY = concat(
  u32(0x00010000), u32(0), u32(0),
  u32(0), u32(0x00010000), u32(0),
  u32(0), u32(0), u32(0x40000000),
);

function buildMoov(
  frameCount: number,
  fps: number,
  width: number,
  height: number,
  offsets: number[],
  sizes: number[],
): Uint8Array {
  const ticksPerFrame = Math.round(TIMESCALE / fps);
  const totalTicks = frameCount * ticksPerFrame;

  // ---------- mvhd ----------
  const mvhd = fullBox(
    "mvhd",
    0,
    u32(0), u32(0), // creation / modification
    u32(TIMESCALE),
    u32(totalTicks),
    u32(0x00010000), // rate
    u16(0x0100), u16(0), // volume / reserved
    new Uint8Array(8), // reserved
    MATRIX_IDENTITY,
    new Uint8Array(24), // pre_defined
    u32(2), // next_track_ID
  );

  // ---------- tkhd ----------
  const tkhd = fullBox(
    "tkhd",
    0x00000007,
    u32(0), u32(0),
    u32(1), // track_ID
    u32(0),
    u32(totalTicks),
    new Uint8Array(8),
    u16(0), u16(0), u16(0), u16(0), // layer / alt / volume / reserved
    MATRIX_IDENTITY,
    u32(width << 16),
    u32(height << 16),
  );

  // ---------- mdhd ----------
  const mdhd = fullBox(
    "mdhd",
    0,
    u32(0), u32(0),
    u32(TIMESCALE),
    u32(totalTicks),
    u16(0x55c4), u16(0), // language / pre_defined
  );

  // ---------- hdlr ----------
  const hdlr = fullBox(
    "hdlr",
    0,
    u32(0),
    new TextEncoder().encode("vide"),
    new Uint8Array(12),
    concat(new TextEncoder().encode("VideoHandler"), new Uint8Array(1)),
  );

  // ---------- vmhd ----------
  const vmhd = fullBox("vmhd", 0x00000001, u16(0), new Uint8Array(6));

  // ---------- dinf / dref / url ----------
  const url = box("url ", u32(1));
  const dref = fullBox("dref", 0, u32(1), url);
  const dinf = box("dinf", dref);

  // ---------- stsd（PNG sample entry，depth 32 带 alpha） ----------
  const compressorname = new Uint8Array(32);
  compressorname.set(new TextEncoder().encode("png "), 0);
  const pngEntry = concat(
    new Uint8Array(6), // reserved
    u16(1), // data_reference_index
    u16(0), u16(0), // pre_defined / reserved
    new Uint8Array(12), // pre_defined[3]
    u16(width),
    u16(height),
    u32(0x00480000), u32(0x00480000), // resolution
    u32(0), // reserved
    u16(1), // frame_count
    compressorname,
    u16(32), // depth（带 alpha）
    u16(0xffff), // pre_defined
  );
  const stsd = fullBox("stsd", 0, u32(1), box("png ", pngEntry));

  // ---------- stts / stsc / stsz / stco ----------
  const stts = fullBox(
    "stts",
    0,
    u32(1),
    u32(frameCount),
    u32(ticksPerFrame),
  );
  const stsc = fullBox(
    "stsc",
    0,
    u32(1),
    u32(1), // first_chunk
    u32(1), // samples_per_chunk
    u32(1), // sample_description_index
  );
  const stszBody = concat(u32(0), u32(frameCount), ...sizes.map(u32));
  const stsz = fullBox("stsz", 0, stszBody);
  const stco = fullBox(
    "stco",
    0,
    u32(frameCount),
    concat(...offsets.map(u32)),
  );

  const stbl = box("stbl", stsd, stts, stsc, stsz, stco);
  const minf = box("minf", vmhd, dinf, stbl);
  const mdia = box("mdia", mdhd, hdlr, minf);
  const trak = box("trak", tkhd, mdia);
  return box("moov", mvhd, trak);
}

/** 把 PNG 帧 Blob 列表封装为透明 MOV 视频 Blob */
export async function muxPngFramesToMov(
  frames: Blob[],
  fps: number,
  width: number,
  height: number,
): Promise<Blob> {
  if (frames.length === 0) throw new Error("没有可封装的帧");

  // ftyp
  const ftyp = box(
    "ftyp",
    new TextEncoder().encode("qt  "),
    u32(0),
    new TextEncoder().encode("qt  "),
  );

  // mdat：帧直接作为 Blob 部件拼接（不整段复制字节）
  const payloadSize = frames.reduce((n, f) => n + f.size, 0);
  const mdatSize = 8 + payloadSize;
  const mdat = new Blob([
    u32(mdatSize),
    new TextEncoder().encode("mdat"),
    ...frames,
  ]);

  // stco offsets：文件 = ftyp + mdat(8 + payload)，帧从 mdat payload 起始
  const mdatPayloadStart = ftyp.length + 8;
  const offsets: number[] = [];
  const sizes: number[] = [];
  let cursor = 0;
  for (const f of frames) {
    offsets.push(mdatPayloadStart + cursor);
    sizes.push(f.size);
    cursor += f.size;
  }

  const moov = buildMoov(frames.length, fps, width, height, offsets, sizes);
  return new Blob([ftyp, mdat, moov], { type: "video/quicktime" });
}
