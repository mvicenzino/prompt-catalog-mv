import sharp from 'sharp';
import { mkdir } from 'fs/promises';
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

async function generateIcons() {
  // Ensure directories exist
  await mkdir(iconsDir, { recursive: true });
  await mkdir(splashDir, { recursive: true });

  const sourcePath = join(publicDir, 'logo.png');

  console.log('Generating PWA icons...');

  // Generate standard icons
  for (const size of iconSizes) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 15, alpha: 1 } // Match app background
      })
      .png()
      .toFile(outputPath);
    console.log(`  Created: icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon (180x180 with padding)
  const appleTouchPath = join(iconsDir, 'apple-touch-icon.png');
  await sharp(sourcePath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 15, alpha: 1 }
    })
    .png()
    .toFile(appleTouchPath);
  console.log('  Created: apple-touch-icon.png');

  console.log('\nGenerating splash screens...');

  // Generate splash screens
  for (const splash of splashSizes) {
    const outputPath = join(splashDir, `${splash.name}.png`);

    // Create background with centered logo
    const logoSize = Math.min(splash.width, splash.height) * 0.2; // Logo is 20% of smallest dimension

    // First resize the logo
    const resizedLogo = await sharp(sourcePath)
      .resize(Math.round(logoSize), Math.round(logoSize), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Create splash with logo centered
    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 10, g: 10, b: 15, alpha: 1 } // #0a0a0f
      }
    })
      .composite([{
        input: resizedLogo,
        gravity: 'center'
      }])
      .png()
      .toFile(outputPath);

    console.log(`  Created: ${splash.name}.png`);
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
