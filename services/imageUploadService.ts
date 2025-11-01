// Image Upload Service
// Handles image uploads to backend (Cloudinary)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';
const UPLOAD_TIMEOUT = 120000; // 120 seconds timeout for image upload (increased)

interface UploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

export const uploadProfileImage = async (imageUri: string, token?: string): Promise<UploadResult> => {
  const startTime = Date.now();
  console.log('📤 [IMAGE UPLOAD] Starting upload...');
  
  try {
    // Try to get token from parameter first, then from AsyncStorage
    let authToken = token;
    if (!authToken) {
      authToken = (await AsyncStorage.getItem('authToken')) ?? undefined;
    }

    if (!authToken) {
      console.error('❌ [IMAGE UPLOAD] No auth token found');
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Create FormData
    const formData = new FormData();

    // Handle image file based on platform
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
      // On web, imageUri is a blob URL, we need to fetch it first
      console.log('🌐 [IMAGE UPLOAD] Converting blob for web...');
      const blob = await fetch(imageUri).then(r => r.blob());
      console.log(`📦 [IMAGE UPLOAD] Blob size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Check file size (max 5MB)
      if (blob.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'Image too large. Please select an image smaller than 5MB.'
        };
      }
      
      formData.append('avatar', blob, filename);
    } else {
      // On mobile (React Native)
      console.log('📱 [IMAGE UPLOAD] Preparing mobile image...');
      formData.append('avatar', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: filename,
        type,
      } as any);
    }

    console.log(`🚀 [IMAGE UPLOAD] Uploading to: ${API_URL}/user/auth/upload-avatar`);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏱️ [IMAGE UPLOAD] Upload timeout after 120 seconds');
      controller.abort();
    }, UPLOAD_TIMEOUT);

    const response = await fetch(`${API_URL}/user/auth/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        // Don't set Content-Type, let browser/fetch set it with boundary
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️ [IMAGE UPLOAD] Upload took ${uploadTime} seconds`);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [IMAGE UPLOAD] Upload failed:', data.message);
      return {
        success: false,
        error: data.message || 'Upload failed'
      };
    }

    console.log('✅ [IMAGE UPLOAD] Upload successful!');
    return {
      success: true,
      avatarUrl: data.data?.profile?.avatar || data.data?.avatar
    };
  } catch (error) {
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ [IMAGE UPLOAD] Error after ${uploadTime} seconds:`, error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Upload timeout. Please check your internet connection and try again with a smaller image.'
        };
      }
      
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.'
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
    };
  }
};
