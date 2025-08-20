import sharp from 'sharp';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export async function processImageToWebP(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 85,
    format = 'webp'
  } = options;

  // Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Process with sharp
  const processedBuffer = await sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality })
    .toBuffer();

  return processedBuffer;
}

export async function createImageVariants(
  file: File,
  baseName: string
): Promise<{ buffer: Buffer; fileName: string; size: string }[]> {
  const variants = [
    { width: 1200, height: 1200, quality: 85, suffix: 'large' },
    { width: 600, height: 600, quality: 80, suffix: 'medium' },
    { width: 300, height: 300, quality: 75, suffix: 'small' }
  ];

  const results = [];

  for (const variant of variants) {
    const buffer = await processImageToWebP(file, {
      maxWidth: variant.width,
      maxHeight: variant.height,
      quality: variant.quality
    });

    results.push({
      buffer,
      fileName: `${baseName}_${variant.suffix}.webp`,
      size: variant.suffix
    });
  }

  return results;
}