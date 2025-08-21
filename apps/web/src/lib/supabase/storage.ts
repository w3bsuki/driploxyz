import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

async function optimizeImageToWebP(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Image optimization timeout after 10 seconds'));
    }, 10000);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        const maxWidth = 1200;
        const maxHeight = 1200;
        
        let { width, height } = img;
        
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
  userId: string
): Promise<UploadedImage> {
  console.log('Starting image upload process...', file.name);
  
  try {
    // Always optimize to WebP
    console.log('Optimizing image to WebP...');
    const optimizedFile = await optimizeImageToWebP(file);
    console.log('Image optimized successfully, size:', optimizedFile.size);
    
    // Generate unique filename with .webp extension
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${timestamp}-${randomId}.webp`;
    
    console.log('Uploading to Supabase...', fileName);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, optimizedFile, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    console.log('Upload successful:', url);
    
    return {
      url,
      path: data.path
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

export async function uploadImages(
  supabase: SupabaseClient,
  files: File[],
  bucket: string = 'product-images',
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImage[]> {
  const uploadedImages: UploadedImage[] = [];
  
  console.log(`Starting batch upload of ${files.length} images...`);
  
  for (let i = 0; i < files.length; i++) {
    try {
      console.log(`Processing image ${i + 1}/${files.length}: ${files[i].name}`);
      const uploaded = await uploadImage(supabase, files[i], bucket, userId);
      uploadedImages.push(uploaded);
      console.log(`Successfully uploaded image ${i + 1}/${files.length}`);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      // Continue with other images instead of stopping completely
    }
  }
  
  if (uploadedImages.length === 0) {
    throw new Error('Failed to upload any images');
  }
  
  console.log(`Batch upload completed: ${uploadedImages.length}/${files.length} images uploaded successfully`);
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
    console.error('Delete error:', error);
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
    console.error('Delete error:', error);
    return false;
  }
  
  return true;
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `avatars/${userId}/${timestamp}.${file.name.split('.').pop()?.toLowerCase() || 'jpg'}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }
  
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  
  return url;
}