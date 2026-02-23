#!/usr/bin/env node
/**
 * PWA 아이콘 PNG 생성 스크립트
 * 외부 라이브러리 없이 순수 Node.js로 PNG 파일 생성
 */
const fs = require('fs');
const zlib = require('zlib');

// CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, c]);
}

function createPNG(size, maskable) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  const raw = Buffer.alloc(size * (1 + size * 4));
  const radius = maskable ? 0 : Math.floor(size * 0.22);
  const center = size / 2;

  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 4);
    raw[row] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const p = row + 1 + x * 4;
      const t = (x + y) / (2 * size);
      const r = Math.round(74 + (22 - 74) * t);
      const g = Math.round(222 + (163 - 222) * t);
      const b = Math.round(128 + (74 - 128) * t);

      // Rounded corner check
      let inside = true;
      if (!maskable && radius > 0) {
        const corners = [
          [radius, radius],
          [size - radius - 1, radius],
          [radius, size - radius - 1],
          [size - radius - 1, size - radius - 1],
        ];
        for (const [cx, cy] of corners) {
          const inCornerZone =
            (x < radius && y < radius && cx === radius && cy === radius) ||
            (x > size - radius - 1 && y < radius && cx === size - radius - 1 && cy === radius) ||
            (x < radius && y > size - radius - 1 && cx === radius && cy === size - radius - 1) ||
            (x > size - radius - 1 && y > size - radius - 1 && cx === size - radius - 1 && cy === size - radius - 1);
          if (inCornerZone && Math.hypot(x - cx, y - cy) > radius) {
            inside = false;
            break;
          }
        }
      }

      // Draw sprout stem (white vertical line in center)
      let isWhite = false;
      const stemW = size * 0.035;
      const stemTop = size * 0.42;
      const stemBot = size * 0.72;

      if (Math.abs(x - center) < stemW && y >= stemTop && y <= stemBot) {
        isWhite = true;
      }

      // Left leaf (ellipse tilted left-up from stem top)
      const leafCx = center - size * 0.12;
      const leafCy = stemTop - size * 0.02;
      const leafRx = size * 0.14;
      const leafRy = size * 0.08;
      const angle = -0.5; // tilt
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const dx1 = x - leafCx, dy1 = y - leafCy;
      const rx1 = cos * dx1 + sin * dy1;
      const ry1 = -sin * dx1 + cos * dy1;
      if ((rx1 * rx1) / (leafRx * leafRx) + (ry1 * ry1) / (leafRy * leafRy) <= 1) {
        isWhite = true;
      }

      // Right leaf (ellipse tilted right-up from stem top)
      const leafCx2 = center + size * 0.12;
      const leafCy2 = stemTop - size * 0.02;
      const angle2 = 0.5;
      const cos2 = Math.cos(angle2), sin2 = Math.sin(angle2);
      const dx2 = x - leafCx2, dy2 = y - leafCy2;
      const rx2 = cos2 * dx2 + sin2 * dy2;
      const ry2 = -sin2 * dx2 + cos2 * dy2;
      if ((rx2 * rx2) / (leafRx * leafRx) + (ry2 * ry2) / (leafRy * leafRy) <= 1) {
        isWhite = true;
      }

      // Top small leaf (small circle above stem)
      const topR = size * 0.06;
      const topCy = stemTop - size * 0.08;
      if (Math.hypot(x - center, y - topCy) < topR) {
        isWhite = true;
      }

      // Ground arc (brown/soil colored arc at bottom)
      let isSoil = false;
      const soilTop = stemBot + size * 0.02;
      const soilCx = center;
      const soilRx = size * 0.22;
      const soilRy = size * 0.06;
      const sdx = x - soilCx, sdy = y - soilTop;
      if (sdy >= 0 && (sdx * sdx) / (soilRx * soilRx) + (sdy * sdy) / (soilRy * soilRy) <= 1) {
        isSoil = true;
      }

      if (inside) {
        if (isWhite) {
          raw[p] = 255; raw[p + 1] = 255; raw[p + 2] = 255; raw[p + 3] = 255;
        } else if (isSoil) {
          raw[p] = 180; raw[p + 1] = 140; raw[p + 2] = 100; raw[p + 3] = 255;
        } else {
          raw[p] = r; raw[p + 1] = g; raw[p + 2] = b; raw[p + 3] = 255;
        }
      } else {
        raw[p] = 0; raw[p + 1] = 0; raw[p + 2] = 0; raw[p + 3] = 0;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', iend),
  ]);
}

// Generate all icons
const configs = [
  { size: 192, maskable: false, name: 'icon-192.png' },
  { size: 512, maskable: false, name: 'icon-512.png' },
  { size: 192, maskable: true, name: 'icon-maskable-192.png' },
  { size: 512, maskable: true, name: 'icon-maskable-512.png' },
];

for (const { size, maskable, name } of configs) {
  const png = createPNG(size, maskable);
  fs.writeFileSync(`public/${name}`, png);
  console.log(`✅ Generated ${name} (${size}x${size}, ${maskable ? 'maskable' : 'regular'})`);
}

console.log('\nDone! All PWA icons generated.');
