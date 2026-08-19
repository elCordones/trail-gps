const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generatePureDialIcons() {
  const rootDir = path.resolve(__dirname, '..');
  const webAppDir = path.join(rootDir, 'web-app');
  const trailGpsAssets = path.join(rootDir, 'trail-gps', 'assets');
  const assetsBrandDir = path.join(rootDir, 'assets', 'brand');

  const rawMaster = path.join(assetsBrandDir, 'master-icon.jfif');
  const masterPNG = path.join(assetsBrandDir, 'master-icon.png');

  if (!fs.existsSync(rawMaster)) {
    throw new Error(`No s'ha trobat ${rawMaster}`);
  }

  console.log('✨ Extraient exclusivament el dial circular i eliminant qualsevol requadre o doble marc...');

  const size = 1024;
  const dialDiameter = 890; // 87% de la mida (zona segura estàndard Apple iOS)
  const dialRadius = dialDiameter / 2;

  // Extracció del dial circular pur de la imatge de 2048x2048
  const rawDial = await sharp(rawMaster)
    .extract({ left: 350, top: 350, width: 1340, height: 1340 })
    .resize(dialDiameter, dialDiameter, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // Màscara circular perfecta i suau
  const maskSvg = Buffer.from(`
    <svg width="${dialDiameter}" height="${dialDiameter}">
      <circle cx="${dialRadius}" cy="${dialRadius}" r="${dialRadius - 1}" fill="white" />
    </svg>
  `);

  const maskedDial = await sharp(rawDial)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Fons homogeni Dark Slate / OLED
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

  // Desar la nova imatge mestre 1024x1024 sense cap marc
  await sharp(bgSvg)
    .composite([
      {
        input: maskedDial,
        left: offset,
        top: offset
      }
    ])
    .png({ quality: 100 })
    .toFile(masterPNG);

  console.log(`✅ Nova imatge mestre de dial pur desada a: ${masterPNG}`);

  // Generar Favicon SVG
  const icon512Base64 = (await sharp(masterPNG).resize(512, 512, { kernel: 'lanczos3' }).png().toBuffer()).toString('base64');
  const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${icon512Base64}" width="512" height="512" />
</svg>`;

  fs.writeFileSync(path.join(rootDir, 'favicon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'favicon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'icon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'icon.svg'), faviconSvgContent, 'utf8');
  console.log('✅ favicon.svg i icon.svg desats');

  // Background per a Android adaptive icon
  const bgBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }
    }
  }).png().toBuffer();

  const iconTasks = [
    // Web & PWA
    { name: 'favicon-32.png', size: 32, targets: [rootDir, webAppDir] },
    { name: 'favicon.ico', size: 32, targets: [rootDir, webAppDir] },
    { name: 'favicon.png', size: 64, targets: [rootDir, webAppDir, trailGpsAssets] },
    { name: 'apple-touch-icon.png', size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-precomposed.png', size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-180x180.png', size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-180x180-precomposed.png', size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-152x152.png', size: 152, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-120x120.png', size: 120, targets: [rootDir, webAppDir] },
    { name: 'icon-192.png', size: 192, targets: [rootDir, webAppDir] },
    { name: 'icon-512.png', size: 512, targets: [rootDir, webAppDir] },
    { name: 'icon-maskable-192.png', size: 192, targets: [rootDir, webAppDir] },
    { name: 'icon-maskable-512.png', size: 512, targets: [rootDir, webAppDir] },

    // Expo & React Native
    { name: 'icon.png', size: 1024, targets: [trailGpsAssets] },
    { name: 'splash-icon.png', size: 512, targets: [trailGpsAssets] },
    { name: 'android-icon-foreground.png', size: 1024, targets: [trailGpsAssets] },
    { name: 'android-icon-monochrome.png', size: 1024, targets: [trailGpsAssets] }
  ];

  for (const task of iconTasks) {
    const buffer = await sharp(masterPNG)
      .resize(task.size, task.size, {
        kernel: 'lanczos3',
        fit: 'cover'
      })
      .png({ quality: 95, compressionLevel: 9 })
      .toBuffer();

    for (const targetDir of task.targets) {
      const destFile = path.join(targetDir, task.name);
      fs.writeFileSync(destFile, buffer);
      console.log(`  -> Generat: ${path.relative(rootDir, destFile)} (${task.size}x${task.size})`);
    }
  }

  // Android background
  fs.writeFileSync(path.join(trailGpsAssets, 'android-icon-background.png'), bgBuffer);
  console.log(`  -> Generat: trail-gps/assets/android-icon-background.png (1024x1024)`);

  const testFile = path.join(assetsBrandDir, 'pure-dial-test.png');
  if (fs.existsSync(testFile)) fs.unlinkSync(testFile);

  console.log('🎉 Totes les icones s\'han generat sobre fons homogeni pur sense cap doble requadre!');
}

generatePureDialIcons().catch(err => {
  console.error('Error generant icones:', err);
  process.exit(1);
});
