import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

async function optimizeImageToWebP(file: File, quality: number = 0.6): Promise<File> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Image optimization timeout after 3 seconds'));
    }, 3000); // Very short timeout to prevent hanging

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // More aggressive size reduction to save egress
        const maxWidth = 800;  // Reduced from 1200
        const maxHeight = 800; // Reduced from 1200
        
        let { width, height } = img;
        
        // Always resize if larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          clearTimeout(timeoutId);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Improve image quality during resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          clearTimeout(timeoutId);
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }
          
              
          const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          resolve(webpFile);
        }, 'image/webp', quality);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string,
  retries: number = 2
): Promise<UploadedImage> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        // Add exponential backoff delay
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      
      // Skip WebP optimization if it's causing issues
      let fileToUpload = file;
      let fileExtension = file.name.split('.').pop() || 'jpg';
      
      // Only optimize if the file is large
      if (file.size > 2 * 1024 * 1024) { // 2MB
        try {
          fileToUpload = await optimizeImageToWebP(file);
          fileExtension = 'webp';
        } catch (err) {
          // If optimization fails, use original
          console.warn('Image optimization failed, using original:', err);
        }
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const fileName = `${userId}/${timestamp}-${randomId}.${fileExtension}`;
      
      // Add timeout to Supabase upload
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(fileName, fileToUpload, {
          contentType: fileExtension === 'webp' ? 'image/webp' : file.type,
          cacheControl: '3600',
          upsert: false
        });
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase upload timeout after 15 seconds')), 15000)
      );
      
      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
      
      return {
        url,
        path: data.path
      };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Don't retry certain errors
      if (lastError.message.includes('Image optimization') || 
          lastError.message.includes('canvas context') ||
          lastError.message.includes('Failed to load image')) {
        throw lastError;
      }
    }
  }
  
  // All retries exhausted
  const finalError = lastError || new Error('Upload failed after all retries');
  throw finalError;
}

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
      // Continue with other images instead of stopping completely
    }
  }
  
  if (uploadedImages.length === 0) {
    throw new Error('Failed to upload any images');
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
  
  if (error) {
    return false;
  }
  
  return true;
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
    return false;
  }
  
  return true;
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  // Optimize avatar to WebP for consistency and egress savings
  const optimizedFile = await optimizeImageToWebP(file, 0.8); // Higher quality for avatars
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `avatars/${userId}/${timestamp}-${randomId}.webp`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, optimizedFile, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }
  
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  
  return url;
}