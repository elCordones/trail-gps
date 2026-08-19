const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function makePureDial() {
  const rootDir = path.resolve(__dirname, '..');
  const rawMaster = path.join(rootDir, 'assets', 'brand', 'master-icon.jfif');
  const outputTest = path.join(rootDir, 'assets', 'brand', 'pure-dial-test.png');

  const size = 1024;
  const dialDiameter = 890; // 87% of 1024 (Apple HIG safe zone)
  const dialRadius = dialDiameter / 2;

  // In 2048x2048 raw: dial center is (1020, 1020), diameter is 1340px
  const rawDial = await sharp(rawMaster)
    .extract({ left: 350, top: 350, width: 1340, height: 1340 })
    .resize(dialDiameter, dialDiameter, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // Create circular SVG mask for antialiased edge
  const maskSvg = Buffer.from(`
    <svg width="${dialDiameter}" height="${dialDiameter}">
      <circle cx="${dialRadius}" cy="${dialRadius}" r="${dialRadius - 1}" fill="white" />
    </svg>
  `);

  const maskedDial = await sharp(rawDial)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Solid dark background
  const bgSvg = Buffer.from(`
    <svg width="${size}" height="${size}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#070B14" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bg)" />
    </svg>
  `);

  const offset = Math.round((size - dialDiameter) / 2);

  await sharp(bgSvg)
    .composite([
      {
        input: maskedDial,
        left: offset,
        top: offset
      }
    ])
    .png({ quality: 100 })
    .toFile(outputTest);

  console.log('✅ pure-dial-test.png creat!');
}

makePureDial().catch(console.error);
