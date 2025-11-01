// Profile API Service
// Handles user profile data and completion status

import apiClient, { ApiResponse } from './apiClient';

/**
 * Profile Data Interface
 */
export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profile Completion Status
 */
export interface ProfileCompletionStatus {
  completionPercentage: number;
  missingFields: string[];
  suggestions: string[];
}

/**
 * Profile API Service Class
 */
class ProfileService {
  /**
   * Get user profile data
   */
  async getProfile(): Promise<ApiResponse<ProfileData>> {
    return apiClient.get('/user/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<ProfileData>): Promise<ApiResponse<ProfileData>> {
    return apiClient.put('/user/profile', updates);
  }

  /**
   * Get profile completion status
   */
  async getProfileCompletion(): Promise<ApiResponse<ProfileCompletionStatus>> {
    return apiClient.get('/user/profile/completion');
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(imageUri: string): Promise<ApiResponse<{ profilePicture: string }>> {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile-picture.jpg',
    } as any);

    return apiClient.post('/user/profile/picture', formData);
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete('/user/profile/picture');
  }

  /**
   * Verify profile
   */
  async verifyProfile(verificationData: {
    documentType: 'id' | 'passport' | 'license';
    documentNumber: string;
    documentImage: string;
  }): Promise<ApiResponse<{ verificationStatus: 'pending' | 'approved' | 'rejected' }>> {
    return apiClient.post('/user/profile/verify', verificationData);
  }
}

// Export singleton instance
const profileService = new ProfileService();
export default profileService;
