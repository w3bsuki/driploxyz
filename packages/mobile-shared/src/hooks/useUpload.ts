import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8
    });

    return result.canceled ? [] : result.assets;
  };

  const uploadImage = async (uri: string, path: string) => {
    setUploading(true);
    setProgress(0);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      setProgress(100);
      return data.path;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadImages = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const uploadedPaths: string[] = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const filename = `${Date.now()}-${i}.jpg`;
      const path = await uploadImage(asset.uri, filename);
      uploadedPaths.push(path);
    }

    return uploadedPaths;
  };

  return {
    uploading,
    progress,
    pickImages,
    uploadImage,
    uploadImages,
  };
}