import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG = "/Users/Hilde.Skjolberg@vg.no/Downloads/sidelinja.svg";
const OUT = path.join(__dirname, "../public");

// The icon already has a solid background with rounded corners baked in —
// no extra padding needed. For maskable we add a slight canvas expand.

async function render(size, outFile, opts = {}) {
  const { maskable = false } = opts;
  let pipeline = sharp(SVG);
  if (maskable) {
    // Maskable safe zone = 40% of icon area. Render icon at ~82% and center on bg.
    const inner = Math.round(size * 0.82);
    const pad = Math.round((size - inner) / 2);
    const iconBuf = await sharp(SVG).resize(inner, inner).png().toBuffer();
    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 41, g: 82, b: 163, alpha: 1 },
      },
    }).composite([{ input: iconBuf, top: pad, left: pad }]);
  } else {
    pipeline = pipeline.resize(size, size);
  }
  await pipeline.png().toFile(outFile);
  console.log(`✓ ${path.basename(outFile)}`);
}

// Build a multi-size .ico from PNG buffers (16, 32, 48)
async function buildIco(sizes, outFile) {
  const pngs = await Promise.all(
    sizes.map((s) => sharp(SVG).resize(s, s).png().toBuffer())
  );

  // ICO format: 6-byte header + N*16 dir entries + image data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: icon
  header.writeUInt16LE(sizes.length, 4);

  const dirSize = sizes.length * 16;
  const dataOffset = 6 + dirSize;
  const dirs = [];
  let offset = dataOffset;

  for (let i = 0; i < sizes.length; i++) {
    const buf = pngs[i];
    const dir = Buffer.alloc(16);
    const s = sizes[i];
    dir.writeUInt8(s >= 256 ? 0 : s, 0);   // width  (0 = 256)
    dir.writeUInt8(s >= 256 ? 0 : s, 1);   // height
    dir.writeUInt8(0, 2);                   // color count
    dir.writeUInt8(0, 3);                   // reserved
    dir.writeUInt16LE(1, 4);               // color planes
    dir.writeUInt16LE(32, 6);              // bits per pixel
    dir.writeUInt32LE(buf.length, 8);      // size of image data
    dir.writeUInt32LE(offset, 12);         // offset
    dirs.push(dir);
    offset += buf.length;
  }

  const ico = Buffer.concat([header, ...dirs, ...pngs]);
  fs.writeFileSync(outFile, ico);
  console.log(`✓ ${path.basename(outFile)}`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  // PNG icons
  await render(180, path.join(OUT, "apple-touch-icon.png"));
  await render(192, path.join(OUT, "icon-192.png"));
  await render(512, path.join(OUT, "icon-512.png"));
  await render(512, path.join(OUT, "maskable-icon-512.png"), { maskable: true });

  // favicon.svg — copy as-is (browsers use it at any resolution)
  fs.copyFileSync(SVG, path.join(OUT, "favicon.svg"));
  console.log("✓ favicon.svg");

  // favicon.ico — 16, 32, 48 sizes packed
  await buildIco([16, 32, 48], path.join(OUT, "favicon.ico"));

  console.log("\nAll icons generated in public/");
}

main().catch((e) => { console.error(e); process.exit(1); });
