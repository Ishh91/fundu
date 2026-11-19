import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const sizes = [16, 32, 48];
const images = sizes.map((size) => {
  const filePath = path.join(PUBLIC, `favicon-${size}x${size}.png`);
  const data = fs.readFileSync(filePath);
  return { size, data };
});

const headerSize = 6;
const dirEntrySize = 16;
const numImages = images.length;
let currentOffset = headerSize + dirEntrySize * numImages;

const entries = [];
for (const img of images) {
  const entry = Buffer.alloc(dirEntrySize);
  entry.writeUInt8(img.size, 0); // width
  entry.writeUInt8(img.size, 1); // height
  entry.writeUInt8(0, 2); // color palette count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(img.data.length, 8); // size of image data
  entry.writeUInt32LE(currentOffset, 12); // offset of image data
  entries.push(entry);
  currentOffset += img.data.length;
}

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // image type: 1 = ICO
header.writeUInt16LE(numImages, 4); // number of images

const icoBuffer = Buffer.concat([
  header,
  ...entries,
  ...images.map((img) => img.data),
]);

fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), icoBuffer);
console.log(`Generated valid multi-resolution favicon.ico (${icoBuffer.length} bytes) containing: ${sizes.join(', ')} px frames.`);
