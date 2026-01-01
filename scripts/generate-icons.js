import sharp from 'sharp';
import { mkdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const iconsDir = join(publicDir, 'icons');
const splashDir = join(publicDir, 'splash');

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Splash screen sizes for iOS
const splashSizes = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' },
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },
  { width: 750, height: 1334, name: 'apple-splash-750-1334' },
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208' },
  { width: 640, height: 1136, name: 'apple-splash-640-1136' },
];

// Yellow brand color
const BRAND_YELLOW = '#FFE135';
const DARK_BG = '#09090b';

async function generateIcons() {
  // Ensure directories exist
  await mkdir(iconsDir, { recursive: true });
  await mkdir(splashDir, { recursive: true });

  // Read the SVG file
  const svgPath = join(publicDir, 'logo.svg');
  const svgContent = await readFile(svgPath);

  console.log('Generating PWA icons from logo.svg...');

  // Generate standard icons - these are the app icons
  for (const size of iconSizes) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);

    // For small icons, render SVG at higher resolution then resize for quality
    const renderSize = Math.max(size * 2, 512);

    await sharp(svgContent, { density: 300 })
      .resize(renderSize, renderSize)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  Created: icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon (180x180) - iOS requires no transparency
  const appleTouchPath = join(iconsDir, 'apple-touch-icon.png');
  await sharp(svgContent, { density: 300 })
    .resize(512, 512)
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log('  Created: apple-touch-icon.png');

  // Generate maskable icon (with safe zone padding for Android adaptive icons)
  // Android adaptive icons need ~20% padding around the logo for the safe zone
  const maskableSize = 512;
  const safePadding = Math.round(maskableSize * 0.1); // 10% padding on each side
  const logoSize = maskableSize - (safePadding * 2);

  // Render logo
  const logoBuffer = await sharp(svgContent, { density: 300 })
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();

  // Create maskable icon with padding
  const maskablePath = join(iconsDir, 'maskable-icon-512x512.png');
  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: BRAND_YELLOW
    }
  })
    .composite([{
      input: logoBuffer,
      gravity: 'center'
    }])
    .png()
    .toFile(maskablePath);
  console.log('  Created: maskable-icon-512x512.png');

  // Also create 192x192 maskable
  const maskable192Path = join(iconsDir, 'maskable-icon-192x192.png');
  await sharp(maskablePath)
    .resize(192, 192)
    .png()
    .toFile(maskable192Path);
  console.log('  Created: maskable-icon-192x192.png');

  console.log('\nGenerating splash screens...');

  // Generate splash screens with centered logo on dark background
  for (const splash of splashSizes) {
    const outputPath = join(splashDir, `${splash.name}.png`);

    // Logo is 15% of the smallest dimension
    const logoSplashSize = Math.round(Math.min(splash.width, splash.height) * 0.15);

    // Render the logo at splash size
    const splashLogoBuffer = await sharp(svgContent, { density: 300 })
      .resize(logoSplashSize, logoSplashSize)
      .png()
      .toBuffer();

    // Create splash with dark background and centered logo
    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: DARK_BG
      }
    })
      .composite([{
        input: splashLogoBuffer,
        gravity: 'center'
      }])
      .png()
      .toFile(outputPath);

    console.log(`  Created: ${splash.name}.png`);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('\nIcon summary:');
  console.log('  - Standard icons: 16x16 to 512x512 (yellow P on yellow bg)');
  console.log('  - Apple Touch Icon: 180x180');
  console.log('  - Maskable icons: 192x192, 512x512 (for Android adaptive icons)');
  console.log('  - Splash screens: 8 sizes for iOS');
}

generateIcons().catch(console.error);
