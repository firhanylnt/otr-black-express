import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MEDIA_DIR = path.join(__dirname, '../public/media');
const MAX_WIDTH = 1920;
const QUALITY = 80;

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;

  const tmpPath = filePath + '.tmp';

  try {
    const pipeline = sharp(filePath).resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: QUALITY, progressive: true }).toFile(tmpPath);
    } else if (ext === '.png') {
      await pipeline.png({ compressionLevel: 9 }).toFile(tmpPath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality: QUALITY }).toFile(tmpPath);
    } else {
      console.log(`  SKIP ${path.basename(filePath)} (unsupported format)`);
      return;
    }

    const newSize = fs.statSync(tmpPath).size;
    fs.renameSync(tmpPath, filePath);

    const saved = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
    console.log(`  ✓ ${path.basename(filePath)}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB (${saved}% saved)`);
  } catch (err) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.error(`  ✗ ${path.basename(filePath)}: ${err.message}`);
  }
}

async function main() {
  const files = fs.readdirSync(MEDIA_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Compressing ${files.length} images in ${MEDIA_DIR}\n`);

  for (const file of files) {
    await compressImage(path.join(MEDIA_DIR, file));
  }

  console.log('\nDone.');
}

main();
