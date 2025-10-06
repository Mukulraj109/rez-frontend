// Image Upload Service
// Handles image uploads to backend (Cloudinary)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

interface UploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

export const uploadProfileImage = async (imageUri: string, token?: string): Promise<UploadResult> => {
  try {
    console.log('📤 [IMAGE UPLOAD] Starting upload...');
    console.log('📤 [IMAGE UPLOAD] Platform:', Platform.OS);
    console.log('📤 [IMAGE UPLOAD] Image URI:', imageUri);
    console.log('📤 [IMAGE UPLOAD] API URL:', API_URL);

    // Try to get token from parameter first, then from AsyncStorage
    let authToken = token;
    if (!authToken) {
      authToken = await AsyncStorage.getItem('authToken');
    }

    if (!authToken) {
      console.error('❌ [IMAGE UPLOAD] No auth token found');
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    console.log('✅ [IMAGE UPLOAD] Auth token found');

    // Create FormData
    const formData = new FormData();

    // Handle image file based on platform
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    console.log('📁 [IMAGE UPLOAD] Filename:', filename);
    console.log('📁 [IMAGE UPLOAD] Type:', type);

    if (Platform.OS === 'web') {
      // On web, imageUri is a blob URL, we need to fetch it first
      console.log('🌐 [IMAGE UPLOAD] Web platform - fetching blob...');
      const blob = await fetch(imageUri).then(r => r.blob());
      console.log('🌐 [IMAGE UPLOAD] Blob size:', blob.size);
      formData.append('avatar', blob, filename);
    } else {
      // On mobile (React Native)
      formData.append('avatar', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        name: filename,
        type,
      } as any);
    }

    console.log('📤 [IMAGE UPLOAD] FormData prepared, sending request...');

    const response = await fetch(`${API_URL}/user/auth/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        // Don't set Content-Type, let browser/fetch set it with boundary
      },
      body: formData,
    });

    console.log('📤 [IMAGE UPLOAD] Response status:', response.status);

    const data = await response.json();
    console.log('📤 [IMAGE UPLOAD] Response data:', data);

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
    console.error('❌ [IMAGE UPLOAD] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
