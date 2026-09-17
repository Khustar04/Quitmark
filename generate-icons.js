import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourcePath = join(__dirname, 'public', 'logo.png');

async function generateIcons() {
  try {
    await sharp(sourcePath)
      .resize(256, 256)
      .png()
      .toFile(join(__dirname, 'public', 'favicon.png'));

    await sharp(sourcePath)
      .resize(192, 192)
      .png()
      .toFile(join(__dirname, 'public', 'pwa-192x192.png'));
      
    await sharp(sourcePath)
      .resize(512, 512)
      .png()
      .toFile(join(__dirname, 'public', 'pwa-512x512.png'));
      
    // Create a maskable version (the logo is already rounded, but let's just make it the same for now)
    await sharp(sourcePath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 13, g: 15, b: 23, alpha: 1 } // #0D0F17 - Dark app background
      })
      .png()
      .toFile(join(__dirname, 'public', 'pwa-512x512-maskable.png'));

    console.log('Icons generated successfully.');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
