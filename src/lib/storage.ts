// Supabase Storage utilities for image uploads
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder path (e.g., 'services', 'hero')
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('website-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('website-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full URL or path of the image to delete
 */
export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/website-images\/(.+)$/);

    if (!pathMatch) {
      console.warn('Could not extract path from URL:', imageUrl);
      return;
    }

    const filePath = pathMatch[1];

    const { error } = await supabase.storage
      .from('website-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
    }
  } catch (err) {
    console.error('Error deleting image:', err);
  }
}

/**
 * Convert a File to base64 (fallback for when Supabase is not configured)
 * @param file - The file to convert
 * @returns Promise with base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
