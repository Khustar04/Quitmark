import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const logoPath = path.join(rootDir, 'public', 'logo.png');
const assetsDir = path.join(rootDir, 'assets');

async function main() {
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Create a 1024x1024 solid dark background matching Quitmark's dark theme (#0D0F17)
  const bgBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 13, g: 15, b: 23, alpha: 1 }, // #0D0F17
    },
  })
    .png()
    .toBuffer();

  await sharp(bgBuffer).toFile(path.join(assetsDir, 'icon-background.png'));
  console.log('Created icon-background.png');

  // 2. Resize the logo to fit comfortably inside the safe zone (600x600 inside 1024x1024 = ~58% of canvas)
  // This ensures no corners get cut off on ANY Android device (Samsung, Pixel, Xiaomi, etc.)
  const resizedLogo = await sharp(logoPath)
    .resize(600, 600, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // 3. Create icon-foreground.png (1024x1024 transparent canvas with the centered logo)
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resizedLogo,
        top: Math.round((1024 - 600) / 2),
        left: Math.round((1024 - 600) / 2),
      },
    ])
    .png()
    .toFile(path.join(assetsDir, 'icon-foreground.png'));
  console.log('Created icon-foreground.png (with safe-zone margins)');

  // 4. Create icon-only.png (1024x1024 with background + centered logo) for legacy launchers and stores
  await sharp(bgBuffer)
    .composite([
      {
        input: resizedLogo,
        top: Math.round((1024 - 600) / 2),
        left: Math.round((1024 - 600) / 2),
      },
    ])
    .png()
    .toFile(path.join(assetsDir, 'icon-only.png'));
  console.log('Created icon-only.png');

  // 5. Create splash.png (2732x2732 dark background with centered logo)
  const splashLogo = await sharp(logoPath)
    .resize(700, 700, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 13, g: 15, b: 23, alpha: 1 },
    },
  })
    .composite([
      {
        input: splashLogo,
        top: Math.round((2732 - 700) / 2),
        left: Math.round((2732 - 700) / 2),
      },
    ])
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  console.log('Created splash.png');

  // Also create splash-dark.png
  fs.copyFileSync(
    path.join(assetsDir, 'splash.png'),
    path.join(assetsDir, 'splash-dark.png')
  );

  console.log('All source assets created with proper Android safe-zone padding!');
}

main().catch(console.error);
