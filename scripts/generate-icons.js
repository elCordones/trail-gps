const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  const rootDir = path.resolve(__dirname, '..');
  const webAppDir = path.join(rootDir, 'web-app');
  const trailGpsAssets = path.join(rootDir, 'trail-gps', 'assets');
  const assetsBrandDir = path.join(rootDir, 'assets', 'brand');

  // Source master image
  const rawMasterPath = path.join(assetsBrandDir, 'master-icon.jfif');
  if (!fs.existsSync(rawMasterPath)) {
    throw new Error(`No s'ha trobat ${rawMasterPath}`);
  }

  console.log('✂️  Retallant i eliminant el marc exterior per ajustar el disseny a pantalla completa...');
  
  // The dial center is at (1020, 1020) with squircle width/height 1520px
  // Extracting { left: 260, top: 260, width: 1520, height: 1520 } eliminates the outer canvas frame
  const croppedMasterPath = path.join(assetsBrandDir, 'master-icon.png');
  await sharp(rawMasterPath)
    .extract({ left: 260, top: 260, width: 1520, height: 1520 })
    .resize(1024, 1024, { kernel: 'lanczos3' })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(croppedMasterPath);

  console.log(`✅ Imatge mestre netejada i desada a: ${croppedMasterPath}`);

  // Create favicon.svg with embedded crisp base64
  const icon512Base64 = (await sharp(croppedMasterPath).resize(512, 512, { kernel: 'lanczos3' }).png().toBuffer()).toString('base64');
  const faviconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${icon512Base64}" width="512" height="512" />
</svg>`;

  fs.writeFileSync(path.join(rootDir, 'favicon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'favicon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'icon.svg'), faviconSvgContent, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'icon.svg'), faviconSvgContent, 'utf8');
  console.log('✅ favicon.svg i icon.svg desats');

  // Background for Android adaptive icon
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

    // Expo & React Native
    { name: 'icon.png', size: 1024, targets: [trailGpsAssets] },
    { name: 'splash-icon.png', size: 512, targets: [trailGpsAssets] },
    { name: 'android-icon-foreground.png', size: 1024, targets: [trailGpsAssets] },
    { name: 'android-icon-monochrome.png', size: 1024, targets: [trailGpsAssets] }
  ];

  for (const task of iconTasks) {
    const buffer = await sharp(croppedMasterPath)
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

  // Clean test files
  const test1 = path.join(assetsBrandDir, 'option1-cropped-squircle.png');
  const test2 = path.join(assetsBrandDir, 'option2-clean-dial.png');
  if (fs.existsSync(test1)) fs.unlinkSync(test1);
  if (fs.existsSync(test2)) fs.unlinkSync(test2);

  console.log('🎉 Totes les icones s\'han regenerat sense cap marc exterior i perfectament enquadrades!');
}

generateIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
