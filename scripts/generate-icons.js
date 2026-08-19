const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIconsFromMaster() {
  const rootDir = path.resolve(__dirname, '..');
  const webAppDir = path.join(rootDir, 'web-app');
  const trailGpsAssets = path.join(rootDir, 'trail-gps', 'assets');
  const assetsBrandDir = path.join(rootDir, 'assets', 'brand');

  // Ensure directories exist
  [webAppDir, trailGpsAssets, assetsBrandDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Source master icon
  let masterPath = path.join(rootDir, 'nova icona.jfif');
  if (!fs.existsSync(masterPath)) {
    masterPath = path.join(assetsBrandDir, 'master-icon.jfif');
  }
  if (!fs.existsSync(masterPath)) {
    throw new Error('No s\'ha trobat el fitxer d\'icona mestre (nova icona.jfif / master-icon.jfif)');
  }

  console.log(`🎨 Carregant imatge mestre des de: ${masterPath}`);

  // Create standard master PNG 2048x2048 in assets/brand/
  const masterPNGPath = path.join(assetsBrandDir, 'master-icon.png');
  await sharp(masterPath)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(masterPNGPath);
  console.log(`✅ Master PNG generat a: ${masterPNGPath}`);

  // Generate Favicon SVG embedding the crisp PNG
  const icon512Base64 = (await sharp(masterPNGPath).resize(512, 512, { kernel: 'lanczos3' }).png().toBuffer()).toString('base64');
  const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${icon512Base64}" width="512" height="512" />
</svg>`;

  fs.writeFileSync(path.join(rootDir, 'favicon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'favicon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'icon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'icon.svg'), faviconSvgContent, 'utf8');
  console.log('✅ favicon.svg i icon.svg desats');

  // Background only for Android adaptive background
  const bgBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0F172A
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

    // Expo & React Native App
    { name: 'icon.png', size: 1024, targets: [trailGpsAssets] },
    { name: 'splash-icon.png', size: 512, targets: [trailGpsAssets] },
    { name: 'android-icon-foreground.png', size: 1024, targets: [trailGpsAssets] },
    { name: 'android-icon-monochrome.png', size: 1024, targets: [trailGpsAssets] }
  ];

  for (const task of iconTasks) {
    const buffer = await sharp(masterPNGPath)
      .resize(task.size, task.size, {
        kernel: 'lanczos3',
        fit: 'contain',
        background: { r: 15, g: 23, b: 42, alpha: 1 }
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

  console.log('🎉 Tots els assets de la nova icona s\'han generat correctament amb màxima nitidesa!');
}

generateIconsFromMaster().catch(err => {
  console.error('Error generant icones:', err);
  process.exit(1);
});
