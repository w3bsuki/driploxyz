import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Simple image compression for all browsers including iOS
 */
async function convertToWebP(file: File): Promise<Blob> {
  // Skip conversion on iOS - just return compressed JPEG
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        // Max 1200px
        const MAX_SIZE = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_SIZE) {
          height = (height * MAX_SIZE) / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = (width * MAX_SIZE) / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Simple compression - JPEG for iOS, WebP for others
        if (isIOS) {
          canvas.toBlob(
            (blob) => resolve(blob || file),
            'image/jpeg',
            0.75
          );
        } else {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                // Fallback to JPEG
                canvas.toBlob(
                  (jpegBlob) => resolve(jpegBlob || file),
                  'image/jpeg',
                  0.75
                );
              }
            },
            'image/webp',
            0.80
          );
        }
      };
      
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  let fileToUpload = file;
  
  // Only compress if in browser
  if (typeof document !== 'undefined') {
    fileToUpload = await convertToWebP(file);
  }
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${userId}/${timestamp}-${randomId}.webp`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  if (!data?.path) throw new Error('Upload failed');
  
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
  return { url, path: data.path };
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
    const uploaded = await uploadImage(supabase, files[i], bucket, userId);
    uploadedImages.push(uploaded);
    onProgress?.(i + 1, files.length);
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
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatars/${userId}/${timestamp}-${randomId}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw error;
  }
  
  if (!data?.path) {
    throw new Error('Upload failed - no path returned');
  }
  
  return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
}