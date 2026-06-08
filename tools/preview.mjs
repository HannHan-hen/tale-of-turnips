// Offline sprite preview. Renders each sprite in tools/spriteExports.ts to a PNG "review
// sheet" (large on grass + on soil, plus near-game-size swatches) so pixel art can be
// eyeballed without launching a browser. Uses esbuild (a Vite dep) to bundle the shared,
// Phaser-free sprite modules, then a tiny built-in PNG encoder. Run: node tools/preview.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(here, 'out');
fs.mkdirSync(outDir, { recursive: true });

// Bundle the shared sprite modules so we render exactly what the game paints.
const bundlePath = path.join(os.tmpdir(), `tot-sprites-${Date.now()}.mjs`);
await build({
  entryPoints: [path.join(here, 'spriteExports.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: bundlePath,
  logLevel: 'silent',
});
const { SPRITES, resolvePixels, palette } = await import(pathToFileURL(bundlePath).href);

// --- tiny RGBA canvas + PNG encoder (Node built-ins only) ---
const rgb = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
function canvas(w, h, bg) {
  const data = Buffer.alloc(w * h * 4);
  const [r, g, b] = rgb(bg);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { w, h, data };
}
function setPx(cv, x, y, color) {
  if (x < 0 || y < 0 || x >= cv.w || y >= cv.h) return;
  const [r, g, b] = rgb(color);
  const i = (y * cv.w + x) * 4;
  cv.data[i] = r;
  cv.data[i + 1] = g;
  cv.data[i + 2] = b;
  cv.data[i + 3] = 255;
}
function rectFill(cv, x, y, w, h, color) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) setPx(cv, x + xx, y + yy, color);
}
function blit(dst, src, ox, oy) {
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      setPx(dst, ox + x, oy + y, (src.data[i] << 16) | (src.data[i + 1] << 8) | src.data[i + 2]);
    }
}
function spritePanel(sprite, scale, bg) {
  const cv = canvas(sprite.width * scale, sprite.height * scale, bg);
  for (const p of resolvePixels(sprite)) rectFill(cv, p.x * scale, p.y * scale, scale, scale, p.color);
  return cv;
}
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const cd = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cd));
  return Buffer.concat([len, cd, crc]);
}
function encodePng(cv) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0);
  ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = cv.w * 4;
  const raw = Buffer.alloc((stride + 1) * cv.h);
  for (let y = 0; y < cv.h; y++) {
    raw[y * (stride + 1)] = 0; // no filter
    cv.data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// --- compose a review sheet for one sprite ---
function reviewSheet(sprite) {
  const big = 12,
    mid = 4,
    small = 2,
    pad = 16,
    gap = 20;
  const a = spritePanel(sprite, big, palette.grass);
  const b = spritePanel(sprite, big, palette.soil);
  const c = spritePanel(sprite, mid, palette.grass); // ~game size at 4x
  const d = spritePanel(sprite, small, palette.grass); // ~true texel size
  const colW = Math.max(c.w, d.w);
  const W = pad + a.w + gap + b.w + gap + colW + pad;
  const H = pad + Math.max(a.h, c.h + gap + d.h) + pad;
  const sheet = canvas(W, H, palette.uiPanel);
  let x = pad;
  blit(sheet, a, x, pad);
  x += a.w + gap;
  blit(sheet, b, x, pad);
  x += b.w + gap;
  blit(sheet, c, x, pad);
  blit(sheet, d, x, pad + c.h + gap);
  return sheet;
}

// --- compose a contact sheet of every sprite at a normalized display size ---
function contactSheet(entries, cols = 4) {
  const pad = 18,
    gap = 14,
    target = 150; // aim each sprite ~150px tall regardless of native size
  const panels = entries.map(([name, sprite]) => {
    const scale = Math.max(4, Math.round(target / sprite.height));
    // alternate grass/soil backgrounds so light and dark sprites both read
    return { name, panel: spritePanel(sprite, scale, palette.grass) };
  });
  const cellW = Math.max(...panels.map((p) => p.panel.w));
  const cellH = Math.max(...panels.map((p) => p.panel.h));
  const rows = Math.ceil(panels.length / cols);
  const W = pad * 2 + cols * cellW + (cols - 1) * gap;
  const H = pad * 2 + rows * cellH + (rows - 1) * gap;
  const sheet = canvas(W, H, palette.uiPanel);
  panels.forEach((p, i) => {
    const cx = pad + (i % cols) * (cellW + gap);
    const cy = pad + Math.floor(i / cols) * (cellH + gap);
    // bottom-center each sprite in its cell so the cast lines up on a shared floor
    blit(sheet, p.panel, cx + ((cellW - p.panel.w) >> 1), cy + (cellH - p.panel.h));
  });
  return sheet;
}

const entries = Object.entries(SPRITES);
for (const [name, sprite] of entries) {
  const png = encodePng(reviewSheet(sprite));
  const file = path.join(outDir, `${name}.png`);
  fs.writeFileSync(file, png);
  console.log('wrote', path.relative(root, file), `(${png.length} bytes)`);
}
const contact = encodePng(contactSheet(entries));
const contactFile = path.join(outDir, '_contact.png');
fs.writeFileSync(contactFile, contact);
console.log('wrote', path.relative(root, contactFile), `(${contact.length} bytes)`);
