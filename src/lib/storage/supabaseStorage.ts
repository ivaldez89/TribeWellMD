'use client';

import { createClient } from '@/lib/supabase/client';

// Storage bucket names - these must be created in Supabase dashboard
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  IMAGES: 'images',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

export interface UploadOptions {
  bucket: StorageBucket;
  path?: string; // Optional subfolder path
  maxSizeMB?: number;
  allowedTypes?: string[];
  compressImage?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for image compression
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

const DEFAULT_OPTIONS: Partial<UploadOptions> = {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  compressImage: true,
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
};

const AVATAR_OPTIONS: Partial<UploadOptions> = {
  maxSizeMB: 2,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  compressImage: true,
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.85,
};

/**
 * Compress and resize an image file
 */
async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a unique filename for uploads
 */
function generateFileName(userId: string, originalName: string, prefix?: string): string {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const prefixStr = prefix ? `${prefix}_` : '';
  return `${prefixStr}${userId}_${timestamp}_${random}.${extension}`;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  userId: string,
  options: UploadOptions
): Promise<UploadResult> {
  const supabase = createClient();

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const {
    bucket,
    path,
    maxSizeMB,
    allowedTypes,
    compressImage: shouldCompress,
    maxWidth,
    maxHeight,
    quality,
  } = mergedOptions;

  // Validate file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  // Validate file size (before compression)
  const maxBytes = (maxSizeMB || 5) * 1024 * 1024;
  if (file.size > maxBytes * 2) { // Allow 2x for pre-compression
    return {
      success: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  try {
    let uploadData: Blob | File = file;

    // Compress image if needed
    if (shouldCompress && file.type.startsWith('image/') && maxWidth && maxHeight && quality) {
      try {
        uploadData = await compressImage(file, maxWidth, maxHeight, quality);
      } catch (compressError) {
        console.warn('Image compression failed, uploading original:', compressError);
        uploadData = file;
      }
    }

    // Check final size
    if (uploadData.size > maxBytes) {
      return {
        success: false,
        error: `File too large after compression. Maximum size: ${maxSizeMB}MB`,
      };
    }

    // Generate unique filename
    const fileName = generateFileName(userId, file.name);
    const fullPath = path ? `${path}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, uploadData, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Upload an avatar image with optimized settings
 */
export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(file, userId, {
    bucket: STORAGE_BUCKETS.AVATARS,
    path: userId, // Store in user-specific folder
    ...AVATAR_OPTIONS,
  });
}

/**
 * Upload a general image
 */
export async function uploadImage(
  file: File,
  userId: string,
  subfolder?: string
): Promise<UploadResult> {
  return uploadFile(file, userId, {
    bucket: STORAGE_BUCKETS.IMAGES,
    path: subfolder ? `${userId}/${subfolder}` : userId,
    ...DEFAULT_OPTIONS,
  });
}

/**
 * Upload a document (PDF, etc.)
 */
export async function uploadDocument(
  file: File,
  userId: string,
  subfolder?: string
): Promise<UploadResult> {
  return uploadFile(file, userId, {
    bucket: STORAGE_BUCKETS.DOCUMENTS,
    path: subfolder ? `${userId}/${subfolder}` : userId,
    maxSizeMB: 10,
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    compressImage: false,
  });
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Delete an avatar by its URL
 */
export async function deleteAvatar(avatarUrl: string): Promise<boolean> {
  // Extract path from URL
  const match = avatarUrl.match(/\/avatars\/(.+)$/);
  if (!match) return false;

  return deleteFile(STORAGE_BUCKETS.AVATARS, match[1]);
}

/**
 * List files in a bucket/folder
 */
export async function listFiles(
  bucket: StorageBucket,
  folder?: string
): Promise<{ name: string; url: string }[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error || !data) {
      console.error('List files error:', error);
      return [];
    }

    return data
      .filter(item => item.name !== '.emptyFolderPlaceholder')
      .map(item => {
        const path = folder ? `${folder}/${item.name}` : item.name;
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return {
          name: item.name,
          url: urlData.publicUrl,
        };
      });
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

/**
 * Check if Supabase Storage is properly configured
 */
export async function checkStorageConnection(): Promise<{ connected: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // Try to list buckets (this will fail if not configured)
    const { error } = await supabase.storage.listBuckets();

    if (error) {
      return { connected: false, error: error.message };
    }

    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Storage connection failed',
    };
  }
}
