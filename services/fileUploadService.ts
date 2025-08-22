// File Upload Service
// Handle image/video uploads with expo-image-picker and file management

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

export interface UploadOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
  mediaTypes?: ImagePicker.MediaTypeOptions;
  videoMaxDuration?: number;
}

export interface UploadResult {
  uri: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  fileSize?: number;
  duration?: number;
  fileName?: string;
  mimeType?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileUploadService {
  private baseUrl: string;

  constructor() {
    // In real app, this would come from environment config
    this.baseUrl = 'https://api.example.com/upload';
  }

  // Request permissions for camera and media library
  async requestPermissions(): Promise<boolean> {
    try {
      // Request camera permissions
      const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Request media library permissions
      const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaResult.status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Media library permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Show image picker options (camera vs gallery)
  async showImagePicker(options: UploadOptions = {}): Promise<UploadResult[]> {
    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Permissions not granted');
    }

    return new Promise((resolve, reject) => {
      Alert.alert(
        'Select Image',
        'Choose how you want to select your image',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve([]) },
          { text: 'Camera', onPress: () => this.pickFromCamera(options).then(resolve).catch(reject) },
          { text: 'Gallery', onPress: () => this.pickFromGallery(options).then(resolve).catch(reject) },
        ],
        { cancelable: true, onDismiss: () => resolve([]) }
      );
    });
  }

  // Pick image from camera
  async pickFromCamera(options: UploadOptions = {}): Promise<UploadResult[]> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect || [1, 1],
        quality: options.quality ?? 0.8,
        videoMaxDuration: options.videoMaxDuration || 30,
      });

      if (result.canceled) {
        return [];
      }

      return this.processPickerResults(result.assets);
    } catch (error) {
      console.error('Error picking from camera:', error);
      throw error;
    }
  }

  // Pick image from gallery
  async pickFromGallery(options: UploadOptions = {}): Promise<UploadResult[]> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect || [1, 1],
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection ?? false,
        videoMaxDuration: options.videoMaxDuration || 30,
      });

      if (result.canceled) {
        return [];
      }

      return this.processPickerResults(result.assets);
    } catch (error) {
      console.error('Error picking from gallery:', error);
      throw error;
    }
  }

  // Process picked files and convert to our format
  private async processPickerResults(assets: ImagePicker.ImagePickerAsset[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const asset of assets) {
      try {
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        
        const result: UploadResult = {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
          fileName: asset.fileName || `${asset.type}_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
          mimeType: asset.mimeType,
          fileSize: fileInfo.exists ? fileInfo.size : undefined,
        };

        results.push(result);
      } catch (error) {
        console.error('Error processing asset:', error);
      }
    }

    return results;
  }

  // Upload file to server
  async uploadFile(
    file: UploadResult,
    uploadType: 'profile' | 'ugc' | 'review',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    try {
      // Create form data
      const formData = new FormData();
      
      // Add the file
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || (file.type === 'image' ? 'image/jpeg' : 'video/mp4'),
        name: file.fileName || 'upload.jpg',
      } as any);

      // Add metadata
      formData.append('type', uploadType);
      formData.append('width', file.width?.toString() || '');
      formData.append('height', file.height?.toString() || '');
      
      if (file.duration) {
        formData.append('duration', file.duration.toString());
      }

      // Mock upload with progress
      return new Promise((resolve, reject) => {
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10 + Math.random() * 20;
          if (progress > 100) progress = 100;
          
          onProgress?.({
            loaded: progress,
            total: 100,
            percentage: Math.round(progress),
          });

          if (progress >= 100) {
            clearInterval(interval);
            
            // Mock successful response
            setTimeout(() => {
              const mockUrl = `https://cdn.example.com/uploads/${uploadType}/${Date.now()}_${file.fileName}`;
              const thumbnailUrl = file.type === 'video' 
                ? `https://cdn.example.com/thumbnails/${Date.now()}_thumb.jpg`
                : undefined;

              resolve({
                url: mockUrl,
                thumbnailUrl,
              });
            }, 500);
          }
        }, 200);
      });

      /* Real implementation would look like this:
      const response = await fetch(`${this.baseUrl}/${uploadType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
      */
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: UploadResult[],
    uploadType: 'profile' | 'ugc' | 'review',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<{ url: string; thumbnailUrl?: string }[]> {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile(
        file,
        uploadType,
        (progress) => onProgress?.(i, progress)
      );
      results.push(result);
    }
    
    return results;
  }

  // Compress image before upload
  async compressImage(uri: string, quality: number = 0.7): Promise<string> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality,
        base64: false,
      });

      // In a real app, you might use a library like expo-image-manipulator
      // to resize/compress the image before upload
      return uri; // For now, return original URI
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  }

  // Get file size in human readable format
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate file before upload
  validateFile(file: UploadResult, maxSizeMB: number = 10, allowedTypes: string[] = ['image', 'video']): {
    isValid: boolean;
    error?: string;
  } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size
    if (file.fileSize && file.fileSize > maxSizeMB * 1024 * 1024) {
      return {
        isValid: false,
        error: `File size ${this.formatFileSize(file.fileSize)} exceeds maximum allowed size of ${maxSizeMB}MB`
      };
    }

    // Check video duration
    if (file.type === 'video' && file.duration && file.duration > 60) {
      return {
        isValid: false,
        error: 'Video duration cannot exceed 60 seconds'
      };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();

// Export utility functions
export const uploadHelpers = {
  // Create thumbnail from video
  async createVideoThumbnail(videoUri: string): Promise<string> {
    // In real app, use expo-video-thumbnails or similar
    return videoUri; // Mock implementation
  },

  // Resize image
  async resizeImage(uri: string, width: number, height: number): Promise<string> {
    // In real app, use expo-image-manipulator
    return uri; // Mock implementation
  },

  // Generate unique filename
  generateFileName(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  },
};