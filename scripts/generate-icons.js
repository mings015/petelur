// Generates PNG icons for PWA without external dependencies
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// --- Minimal PNG encoder ---

function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table.push(c >>> 0);
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = (table[(crc ^ b) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, c]);
}

function makePNG(size, getPixel) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB

  const row = 1 + size * 3;
  const raw = Buffer.alloc(size * row);
  for (let y = 0; y < size; y++) {
    raw[y * row] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = getPixel(x, y, size);
      raw[y * row + 1 + x * 3] = r;
      raw[y * row + 1 + x * 3 + 1] = g;
      raw[y * row + 1 + x * 3 + 2] = b;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 6 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// --- Icon design ---

function drawIcon(x, y, size) {
  const BG   = [30, 58, 95];       // #1E3A5F
  const WHITE = [255, 255, 255];
  const YOLK  = [245, 158, 11];    // #F59E0B

  // Normalised coords: centre = (0,0), range roughly -1..1
  const nx = (x / size - 0.5) * 2;
  const ny = (y / size - 0.5) * 2;

  // Rounded-rect background (corner radius ~23%)
  const r = 0.23;
  const ax = Math.abs(nx), ay = Math.abs(ny);
  const inBg =
    ax <= 1 && ay <= 1 &&
    !(ax > 1 - r && ay > 1 - r && Math.hypot(ax - (1 - r), ay - (1 - r)) > r);

  if (!inBg) return WHITE; // outside → white (transparent substitute for PNG)

  // Egg body: vertical ellipse, centre slightly below mid
  const ex = nx, ey = ny - 0.06;
  const inEgg = (ex * ex) / (0.42 * 0.42) + (ey * ey) / (0.55 * 0.55) < 1;
  if (!inEgg) return BG;

  // Yolk: circle inside egg
  const yx = nx, yy = ny - 0.02;
  if (yx * yx + yy * yy < 0.17 * 0.17) return YOLK;

  return WHITE;
}

// --- Generate ---

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const buf = makePNG(size, drawIcon);
  const out = path.join(outDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(out, buf);
  console.log(`✓ ${out}  (${(buf.length / 1024).toFixed(1)} KB)`);
}
