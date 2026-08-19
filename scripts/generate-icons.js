const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// Master SVG templates
function getMasterSVG({ isMaskable = false, isTransparent = false, isBackgroundOnly = false, isForegroundOnly = false, isAppleTouch = false } = {}) {
  // ViewBox: 512 x 512
  const bgGradient = `
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070C16" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#0B132B" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#1E293B" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#FF6D00" stop-opacity="0.6" />
    </linearGradient>
  `;

  const mountainGradients = `
    <linearGradient id="mtnBack" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="mtnFrontLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="mtnFrontRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0B1220" />
    </linearGradient>
    <linearGradient id="contourGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.1" />
      <stop offset="50%" stop-color="#38BDF8" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.05" />
    </linearGradient>
  `;

  const trackGradients = `
    <linearGradient id="trailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF5500" />
      <stop offset="40%" stop-color="#FF7700" />
      <stop offset="80%" stop-color="#FFAA00" />
      <stop offset="100%" stop-color="#FFD600" />
    </linearGradient>
    <filter id="trailGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;

  const arrowGradients = `
    <linearGradient id="arrowLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A5F3FC" />
      <stop offset="40%" stop-color="#22D3EE" />
      <stop offset="100%" stop-color="#00E5FF" />
    </linearGradient>
    <linearGradient id="arrowRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C4DF" />
      <stop offset="70%" stop-color="#0891B2" />
      <stop offset="100%" stop-color="#0E7490" />
    </linearGradient>
    <filter id="arrowShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.85" />
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#00E5FF" flood-opacity="0.55" />
    </filter>
    <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#FFAA00" flood-opacity="0.9" />
    </filter>
  `;

  const radarArcs = `
    <!-- Concentric GPS Wave Beams -->
    <path d="M 330 115 A 85 85 0 0 1 395 180" fill="none" stroke="#00E5FF" stroke-width="4.5" stroke-linecap="round" stroke-opacity="0.85" />
    <path d="M 350 95 A 115 115 0 0 1 435 180" fill="none" stroke="#00E5FF" stroke-width="3.5" stroke-linecap="round" stroke-opacity="0.5" />
    <path d="M 370 75 A 145 145 0 0 1 475 180" fill="none" stroke="#00E5FF" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.25" />
  `;

  const topoLines = `
    <!-- Topographic contour curves -->
    <path d="M 20 440 Q 140 410 260 445 T 500 420" fill="none" stroke="url(#contourGrad)" stroke-width="2" />
    <path d="M 10 390 Q 160 360 290 400 T 510 370" fill="none" stroke="url(#contourGrad)" stroke-width="2" />
    <path d="M 30 330 Q 170 300 310 340 T 490 310" fill="none" stroke="url(#contourGrad)" stroke-width="2" />
    <path d="M 60 270 Q 200 240 340 280 T 480 250" fill="none" stroke="url(#contourGrad)" stroke-width="1.5" />
  `;

  const mountains = `
    <!-- Back Mountain Peak -->
    <polygon points="120,380 270,180 420,380" fill="url(#mtnBack)" />
    
    <!-- Main Left Mountain Ridge -->
    <polygon points="40,460 210,190 320,460" fill="url(#mtnFrontLeft)" />
    <!-- Main Right Ridge Shade -->
    <polygon points="210,190 320,460 380,460 210,190" fill="url(#mtnFrontRight)" />

    <!-- Mountain Peak Highlights / Snow-Edge -->
    <polyline points="190,222 210,190 230,225" fill="none" stroke="#67E8F9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.7" />
  `;

  const trail = `
    <!-- GPX Track Outer Glow -->
    <path d="M 75 450 C 120 410, 100 360, 160 330 C 220 300, 210 240, 280 210 C 315 195, 335 180, 360 160"
          fill="none" stroke="#FF6D00" stroke-width="18" stroke-linecap="round" stroke-opacity="0.35" filter="url(#trailGlow)" />

    <!-- GPX Track Core Line (S-Trail) -->
    <path d="M 75 450 C 120 410, 100 360, 160 330 C 220 300, 210 240, 280 210 C 315 195, 335 180, 360 160"
          fill="none" stroke="url(#trailGrad)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Dashed Center Line (Tech GPX aesthetic) -->
    <path d="M 75 450 C 120 410, 100 360, 160 330 C 220 300, 210 240, 280 210 C 315 195, 335 180, 360 160"
          fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 12" stroke-opacity="0.9" />

    <!-- Trail Waypoints (Glowing Orbs) -->
    <circle cx="75" cy="450" r="7" fill="#FFAA00" stroke="#FFFFFF" stroke-width="2.5" filter="url(#dotGlow)" />
    <circle cx="160" cy="330" r="6" fill="#FFAA00" stroke="#FFFFFF" stroke-width="2" filter="url(#dotGlow)" />
    <circle cx="280" cy="210" r="6" fill="#FFAA00" stroke="#FFFFFF" stroke-width="2" filter="url(#dotGlow)" />
  `;

  // Navigation Arrow centered and oriented dynamically forward-northeast
  const arrow = `
    <!-- Delta Arrow Group with 3D Rotation and Glow -->
    <g transform="translate(355, 165) rotate(32)" filter="url(#arrowShadow)">
      <!-- Base Outer White Contrast Halo -->
      <path d="M 0 -82 L 54 52 L 0 28 L -54 52 Z"
            fill="#FFFFFF" stroke="#FFFFFF" stroke-width="9" stroke-linejoin="round" />

      <!-- Left Cyan Wing (Sunlit) -->
      <path d="M 0 -80 L 0 28 L -52 50 Z"
            fill="url(#arrowLeftGrad)" />

      <!-- Right Cyan Wing (Shadowed) -->
      <path d="M 0 -80 L 52 50 L 0 28 Z"
            fill="url(#arrowRightGrad)" />

      <!-- Center Keel Spine Line -->
      <line x1="0" y1="-78" x2="0" y2="28" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-opacity="0.8" />
    </g>
  `;

  let backgroundMarkup = '';
  if (!isTransparent && !isForegroundOnly) {
    if (isMaskable || isAppleTouch) {
      // Full solid bleed square for Apple iOS touch icon and maskable Android
      backgroundMarkup = `
        <rect width="512" height="512" fill="url(#bgGrad)" />
        <rect x="0" y="0" width="512" height="512" fill="none" stroke="url(#borderGrad)" stroke-width="3" />
      `;
    } else {
      // Standard rounded squircle for web browser / previews
      backgroundMarkup = `
        <rect x="6" y="6" width="500" height="500" rx="112" fill="url(#bgGrad)" />
        <rect x="6" y="6" width="500" height="500" rx="112" fill="none" stroke="url(#borderGrad)" stroke-width="4" />
        <path d="M 120 8 Q 256 12 392 8" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
      `;
    }
  }

  if (isBackgroundOnly) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>${bgGradient}</defs>
  <rect width="512" height="512" fill="url(#bgGrad)" />
</svg>`;
  }

  let content = `
    ${topoLines}
    ${mountains}
    ${radarArcs}
    ${trail}
    ${arrow}
  `;

  if (isMaskable) {
    content = `<g transform="translate(51, 51) scale(0.8)">${content}</g>`;
  } else if (isAppleTouch) {
    // Apple Touch Icon: Centered with 90% scale so iOS squircle mask clips nicely
    content = `<g transform="translate(25.6, 25.6) scale(0.9)">${content}</g>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    ${bgGradient}
    ${mountainGradients}
    ${trackGradients}
    ${arrowGradients}
  </defs>
  ${backgroundMarkup}
  ${content}
</svg>`;
}

async function generateAll() {
  console.log('🎨 Generant dissenys d\'icones i assets per a TrailGPS MTB...');

  const rootDir = path.resolve(__dirname, '..');
  const webAppDir = path.resolve(rootDir, 'web-app');
  const trailGpsAssets = path.resolve(rootDir, 'trail-gps', 'assets');

  // Ensure directories exist
  if (!fs.existsSync(trailGpsAssets)) {
    fs.mkdirSync(trailGpsAssets, { recursive: true });
  }

  // 1. Generate SVGs
  const standardSVG = getMasterSVG({ isMaskable: false });
  const appleTouchSVG = getMasterSVG({ isAppleTouch: true });
  const maskableSVG = getMasterSVG({ isMaskable: true });
  const transparentSVG = getMasterSVG({ isTransparent: true });
  const bgOnlySVG = getMasterSVG({ isBackgroundOnly: true });

  // Save master SVG to root and web-app
  fs.writeFileSync(path.join(rootDir, 'favicon.svg'), standardSVG, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'favicon.svg'), standardSVG, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'icon.svg'), standardSVG, 'utf8');
  fs.writeFileSync(path.join(webAppDir, 'icon.svg'), standardSVG, 'utf8');

  console.log('✅ Master SVGs desats amb èxit (favicon.svg, icon.svg)');

  // Helper to render PNG with resvg
  function renderPNG(svgString, size) {
    const resvg = new Resvg(svgString, {
      fitTo: {
        mode: 'width',
        value: size
      }
    });
    const pngData = resvg.render();
    return pngData.asPng();
  }

  // Generate PNG sets
  const tasks = [
    // Web & PWA (Root & web-app)
    { name: 'favicon-32.png', svg: standardSVG, size: 32, targets: [rootDir, webAppDir] },
    { name: 'favicon.png', svg: standardSVG, size: 64, targets: [rootDir, webAppDir, trailGpsAssets] },
    { name: 'favicon.ico', svg: standardSVG, size: 32, targets: [rootDir, webAppDir] },

    // Apple iOS Touch Icons (Full bleed solid background, no transparent corners)
    { name: 'apple-touch-icon.png', svg: appleTouchSVG, size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-precomposed.png', svg: appleTouchSVG, size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-180x180.png', svg: appleTouchSVG, size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-180x180-precomposed.png', svg: appleTouchSVG, size: 180, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-152x152.png', svg: appleTouchSVG, size: 152, targets: [rootDir, webAppDir] },
    { name: 'apple-touch-icon-120x120.png', svg: appleTouchSVG, size: 120, targets: [rootDir, webAppDir] },

    // PWA Manifest Icons
    { name: 'icon-192.png', svg: appleTouchSVG, size: 192, targets: [rootDir, webAppDir] },
    { name: 'icon-512.png', svg: appleTouchSVG, size: 512, targets: [rootDir, webAppDir] },
    { name: 'icon-maskable-192.png', svg: maskableSVG, size: 192, targets: [rootDir, webAppDir] },
    { name: 'icon-maskable-512.png', svg: maskableSVG, size: 512, targets: [rootDir, webAppDir] },

    // Expo & React Native (trail-gps/assets)
    { name: 'icon.png', svg: appleTouchSVG, size: 1024, targets: [trailGpsAssets] },
    { name: 'splash-icon.png', svg: standardSVG, size: 512, targets: [trailGpsAssets] },
    { name: 'android-icon-foreground.png', svg: maskableSVG, size: 1024, targets: [trailGpsAssets] },
    { name: 'android-icon-background.png', svg: bgOnlySVG, size: 1024, targets: [trailGpsAssets] },
    { name: 'android-icon-monochrome.png', svg: transparentSVG, size: 1024, targets: [trailGpsAssets] }
  ];

  for (const task of tasks) {
    const pngBuffer = renderPNG(task.svg, task.size);
    for (const targetDir of task.targets) {
      const destPath = path.join(targetDir, task.name);
      fs.writeFileSync(destPath, pngBuffer);
      console.log(`  -> Generat: ${path.relative(rootDir, destPath)} (${task.size}x${task.size})`);
    }
  }

  console.log('🎉 Tots els fitxers PNG i Apple Touch Icons s\'han generat correctament!');
}

generateAll().catch(err => {
  console.error('Error generant icones:', err);
  process.exit(1);
});
