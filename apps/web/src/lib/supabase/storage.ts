import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * MANDATORY WebP image conversion for ALL browsers and devices
 * This reduces bandwidth usage and ensures consistent format
 */
async function convertToWebP(file: File): Promise<File> {
  console.log('[convertToWebP] Starting conversion for:', file.name, 'size:', file.size, 'type:', file.type);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const reader = new FileReader();
    
    // Set a timeout for the entire conversion process
    const conversionTimeout = setTimeout(() => {
      console.error('[convertToWebP] Conversion timeout after 10 seconds');
      reject(new Error('Image conversion timeout'));
    }, 10000);
    
    reader.onload = (e) => {
      img.onload = async () => {
        try {
          clearTimeout(conversionTimeout);
          
          // Max 1200px with INTEGER dimensions (critical for canvas)
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_SIZE) {
            height = Math.floor((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.floor((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          } else {
            // Ensure dimensions are integers even if no resizing
            width = Math.floor(width);
            height = Math.floor(height);
          }
          
          console.log('[convertToWebP] Canvas dimensions:', width, 'x', height);
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          // White background for transparency handling
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // FORCE WebP conversion with multiple quality attempts
          let webpBlob: Blob | null = null;
          const qualities = [0.85, 0.80, 0.75, 0.70]; // Try different qualities
          
          for (const quality of qualities) {
            try {
              webpBlob = await new Promise<Blob | null>((resolveBlob) => {
                const blobTimeout = setTimeout(() => resolveBlob(null), 3000);
                
                canvas.toBlob(
                  (blob) => {
                    clearTimeout(blobTimeout);
                    resolveBlob(blob);
                  },
                  'image/webp',
                  quality
                );
              });
              
              if (webpBlob && webpBlob.size > 0) {
                console.log('[convertToWebP] WebP created with quality:', quality, 'size:', webpBlob.size);
                break;
              }
            } catch (err) {
              console.warn('[convertToWebP] WebP attempt failed with quality:', quality, err);
            }
          }
          
          // If WebP still fails, try JPEG as absolute last resort but convert filename
          if (!webpBlob) {
            console.warn('[convertToWebP] WebP conversion failed, attempting JPEG fallback');
            
            webpBlob = await new Promise<Blob | null>((resolveBlob) => {
              const blobTimeout = setTimeout(() => resolveBlob(null), 3000);
              
              canvas.toBlob(
                (blob) => {
                  clearTimeout(blobTimeout);
                  resolveBlob(blob);
                },
                'image/jpeg',
                0.80
              );
            });
          }
          
          if (!webpBlob) {
            throw new Error('Failed to convert image to any format');
          }
          
          // Convert Blob to File with proper type and name
          const convertedFile = new File(
            [webpBlob],
            file.name.replace(/\.[^/.]+$/, '.webp'),
            { type: 'image/webp' }
          );
          
          console.log('[convertToWebP] Conversion successful:', {
            originalSize: file.size,
            convertedSize: convertedFile.size,
            reduction: ((1 - convertedFile.size / file.size) * 100).toFixed(1) + '%',
            type: convertedFile.type
          });
          
          resolve(convertedFile);
        } catch (error) {
          console.error('[convertToWebP] Conversion error:', error);
          reject(error);
        }
      };
      
      img.onerror = () => {
        clearTimeout(conversionTimeout);
        console.error('[convertToWebP] Failed to load image');
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      clearTimeout(conversionTimeout);
      console.error('[convertToWebP] Failed to read file');
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Supabase Storage with MANDATORY WebP conversion
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  console.log('[uploadImage] Starting upload for:', file.name);
  
  let fileToUpload: File = file;
  
  // ALWAYS convert to WebP in browser
  if (typeof document !== 'undefined') {
    try {
      fileToUpload = await convertToWebP(file);
      console.log('[uploadImage] Using converted WebP file:', fileToUpload.size, 'bytes');
    } catch (error) {
      console.error('[uploadImage] Conversion failed, aborting upload:', error);
      throw new Error('Image conversion failed. Please try a different image.');
    }
  }
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  // ALWAYS use .webp extension since we're forcing conversion
  const fileName = `${userId}/${timestamp}-${randomId}.webp`;
  
  console.log('[uploadImage] Uploading to path:', fileName);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/webp'
    });
  
  if (error) {
    console.error('[uploadImage] Upload error:', error);
    throw error;
  }
  
  if (!data?.path) {
    console.error('[uploadImage] No path returned from upload');
    throw new Error('Upload failed - no path returned');
  }
  
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
  console.log('[uploadImage] Upload successful:', url);
  
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
  console.log('[uploadImages] Starting batch upload for', files.length, 'files');
  const uploadedImages: UploadedImage[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      console.log(`[uploadImages] Processing file ${i + 1}/${files.length}`);
      const uploaded = await uploadImage(supabase, files[i], bucket, userId);
      uploadedImages.push(uploaded);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`[uploadImages] Failed to upload file ${i + 1}:`, error);
      // Continue with other files but log the error
      onProgress?.(i + 1, files.length);
    }
  }
  
  console.log('[uploadImages] Batch upload completed:', uploadedImages.length, 'successful');
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
  
  if (error) {
    console.error('[deleteImage] Delete error:', error);
  }
  
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
  
  if (error) {
    console.error('[deleteImages] Batch delete error:', error);
  }
  
  return !error;
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  console.log('[uploadAvatar] Starting avatar upload');
  
  let fileToUpload: File = file;
  
  // Convert avatar to WebP as well for consistency
  if (typeof document !== 'undefined') {
    try {
      fileToUpload = await convertToWebP(file);
      console.log('[uploadAvatar] Avatar converted to WebP');
    } catch (error) {
      console.error('[uploadAvatar] Avatar conversion failed:', error);
      // For avatars, we can proceed with original if conversion fails
      fileToUpload = file;
    }
  }
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `avatars/${userId}/${timestamp}-${randomId}.webp`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
      contentType: fileToUpload.type
    });
  
  if (error) {
    console.error('[uploadAvatar] Upload error:', error);
    throw error;
  }
  
  if (!data?.path) {
    throw new Error('Upload failed - no path returned');
  }
  
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  console.log('[uploadAvatar] Avatar uploaded:', url);
  
  return url;
}