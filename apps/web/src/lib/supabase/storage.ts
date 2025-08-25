import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Upload image directly without conversion for now
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  console.error('[UPLOAD DEBUG] Starting upload:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    bucket,
    userId
  });

  try {
    // Generate filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${timestamp}-${randomId}.${ext}`;
    
    console.error('[UPLOAD DEBUG] Uploading to path:', fileName);
    
    // Direct upload without conversion
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    console.error('[UPLOAD DEBUG] Upload response:', { data, error });
    
    if (error) {
      console.error('[UPLOAD ERROR]', error);
      throw error;
    }
    
    if (!data?.path) {
      throw new Error('No path returned');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    console.error('[UPLOAD SUCCESS]', url);
    
    return { url, path: data.path };
  } catch (error) {
    console.error('[UPLOAD FAILED]', error);
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
  const ext = file.name.split('.').pop() || 'jpg';
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
    throw new Error('No path returned');
  }
  
  return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
}