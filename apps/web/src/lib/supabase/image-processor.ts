export interface ImageSize {
  width: number;
  height: number;
  quality: number;
  suffix: string;
}

export const IMAGE_SIZES = {
  thumbnail: {
    width: 400,
    height: 400,
    quality: 0.85,
    suffix: 'thumb'
  },
  medium: {
    width: 800,
    height: 800,
    quality: 0.90,
    suffix: 'med'
  },
  large: {
    width: 1200,
    height: 1200,
    quality: 0.92,
    suffix: 'large'
  }
} as const;

export async function processImage(
  file: File,
  size: ImageSize = IMAGE_SIZES.medium
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      try {
        canvas.width = size.width;
        canvas.height = size.height;
        
        const sourceWidth = img.width;
        const sourceHeight = img.height;
        const targetSize = size.width;
        
        // Scale to cover the square
        const scale = Math.max(targetSize / sourceWidth, targetSize / sourceHeight);
        const scaledWidth = sourceWidth * scale;
        const scaledHeight = sourceHeight * scale;
        
        // Center the image
        const x = (targetSize - scaledWidth) / 2;
        const y = (targetSize - scaledHeight) / 2;
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetSize, targetSize);
        
        // Draw centered image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert to WebP with specified quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          'image/webp',
          size.quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Create object URL for the image
    try {
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

