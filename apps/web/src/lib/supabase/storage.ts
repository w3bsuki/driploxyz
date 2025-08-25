import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Robust WebP image conversion following SvelteKit best practices
 * Ensures consistent quality and proper handling across all browsers
 */
async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Calculate dimensions - max 1200px for optimal performance
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;
          
          // Scale down if needed, maintaining aspect ratio
          if (width > MAX_SIZE || height > MAX_SIZE) {
            const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          } else {
            // Ensure integers even without scaling
            width = Math.floor(width);
            height = Math.floor(height);
          }
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context not available');
          }
          
          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // White background for transparent images
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to WebP with consistent quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // If WebP fails (very rare), fallback to JPEG
                canvas.toBlob(
                  (jpegBlob) => {
                    if (!jpegBlob) {
                      reject(new Error('Image conversion failed'));
                      return;
                    }
                    
                    // Create File from JPEG blob but still name it .webp
                    const fallbackFile = new File(
                      [jpegBlob],
                      file.name.replace(/\.[^/.]+$/, '.webp'),
                      { type: 'image/jpeg' }
                    );
                    
                    console.warn('[convertToWebP] Used JPEG fallback for:', file.name);
                    resolve(fallbackFile);
                  },
                  'image/jpeg',
                  0.85
                );
                return;
              }
              
              // Create File from WebP blob
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.webp'),
                { type: 'image/webp' }
              );
              
              // Log compression results
              const reduction = ((1 - webpFile.size / file.size) * 100).toFixed(1);
              console.log(`[convertToWebP] Compressed ${file.name}: ${reduction}% smaller`);
              
              resolve(webpFile);
            },
            'image/webp',
            0.85 // Consistent quality for all images
          );
        } catch (error) {
          reject(new Error(`Image processing failed: ${error}`));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Use data URL for better compatibility
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Supabase Storage with WebP conversion
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  let fileToUpload: File;
  
  // Convert to WebP if in browser environment
  if (typeof document !== 'undefined') {
    try {
      fileToUpload = await convertToWebP(file);
    } catch (error) {
      console.error('[uploadImage] Conversion error:', error);
      // If conversion fails, use original file
      fileToUpload = file;
    }
  } else {
    fileToUpload = file;
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const extension = fileToUpload.type === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `${userId}/${timestamp}-${randomId}.${extension}`;
  
  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
      contentType: fileToUpload.type
    });
  
  if (error) {
    throw error;
  }
  
  if (!data?.path) {
    throw new Error('Upload failed - no path returned');
  }
  
  // Return public URL
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
  
  return { url, path: data.path };
}

/**
 * Upload multiple images with progress tracking
 */
export async function uploadImages(
  supabase: SupabaseClient,
  files: File[],
  bucket: string = 'product-images',
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImage[]> {
  const uploadedImages: UploadedImage[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const uploaded = await uploadImage(supabase, files[i], bucket, userId);
      uploadedImages.push(uploaded);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to upload file ${i + 1}:`, error);
      // Continue with remaining files
      onProgress?.(i + 1, files.length);
    }
  }
  
  return uploadedImages;
}

export async function deleteImage(
  supabase: SupabaseClient,
  path: string,
  bucket: string = 'product-images'
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  return !error;
}

export async function deleteImages(
  supabase: SupabaseClient,
  paths: string[],
  bucket: string = 'product-images'
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);
  
  return !error;
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  let fileToUpload: File;
  
  // Try to convert avatar to WebP for consistency
  if (typeof document !== 'undefined') {
    try {
      fileToUpload = await convertToWebP(file);
    } catch (error) {
      // For avatars, fallback to original is acceptable
      fileToUpload = file;
    }
  } else {
    fileToUpload = file;
  }
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const extension = fileToUpload.type === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `avatars/${userId}/${timestamp}-${randomId}.${extension}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
      contentType: fileToUpload.type
    });
  
  if (error) {
    throw error;
  }
  
  if (!data?.path) {
    throw new Error('Upload failed - no path returned');
  }
  
  return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
}