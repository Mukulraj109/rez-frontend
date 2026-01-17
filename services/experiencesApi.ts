/**
 * Experiences API Service
 * Handles store experiences for homepage sections
 */

import apiClient, { ApiResponse } from './apiClient';

// Store Experience interface
export interface StoreExperience {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  iconType: 'emoji' | 'url' | 'icon-name';
  type: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  backgroundColor?: string;
  storeCount?: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  benefits?: string[];
}

// Homepage Experience format
export interface HomepageExperience {
  icon: string;
  title: string;
  type: string;
  badge?: string;
  subtitle?: string;
}

class ExperiencesService {
  /**
   * Get all active experiences
   */
  async getExperiences(params?: {
    featured?: boolean;
    limit?: number;
  }): Promise<ApiResponse<{
    experiences: StoreExperience[];
    total: number;
  }>> {
    try {
      console.log('🏪 [EXPERIENCES API] Fetching store experiences...');

      const response = await apiClient.get<{
        experiences: StoreExperience[];
        total: number;
      }>('/experiences', {
        ...(params?.featured && { featured: 'true' }),
        limit: params?.limit || 10,
      });

      if (response.success && response.data) {
        console.log(`✅ [EXPERIENCES API] Got ${response.data.experiences?.length || 0} experiences`);
      }

      return response;
    } catch (error: any) {
      console.error('❌ [EXPERIENCES API] Error fetching experiences:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch experiences',
        message: error?.message || 'Failed to fetch experiences',
      };
    }
  }

  /**
   * Get experiences for homepage section
   */
  async getHomepageExperiences(limit: number = 4): Promise<ApiResponse<{
    experiences: HomepageExperience[];
    total: number;
  }>> {
    try {
      console.log('🏪 [EXPERIENCES API] Fetching homepage experiences...');

      const response = await apiClient.get<{
        experiences: HomepageExperience[];
        total: number;
      }>('/experiences/homepage', { limit });

      if (response.success && response.data) {
        console.log(`✅ [EXPERIENCES API] Got ${response.data.experiences?.length || 0} homepage experiences`);
      }

      return response;
    } catch (error: any) {
      console.error('❌ [EXPERIENCES API] Error fetching homepage experiences:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch experiences',
        message: error?.message || 'Failed to fetch experiences',
      };
    }
  }

  /**
   * Get experience by ID or slug
   */
  async getExperienceById(experienceId: string): Promise<ApiResponse<StoreExperience>> {
    try {
      console.log(`🏪 [EXPERIENCES API] Fetching experience: ${experienceId}...`);

      const response = await apiClient.get<StoreExperience>(`/experiences/${experienceId}`);

      if (response.success && response.data) {
        console.log(`✅ [EXPERIENCES API] Got experience: ${response.data.title}`);
      }

      return response;
    } catch (error: any) {
      console.error('❌ [EXPERIENCES API] Error fetching experience:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch experience',
        message: error?.message || 'Failed to fetch experience',
      };
    }
  }

  /**
   * Get stores by experience
   */
  async getStoresByExperience(experienceId: string, params?: {
    page?: number;
    limit?: number;
    location?: string;
  }): Promise<ApiResponse<{
    experience: StoreExperience;
    stores: any[];
    pagination: any;
  }>> {
    try {
      console.log(`🏪 [EXPERIENCES API] Fetching stores for experience: ${experienceId}...`);

      const response = await apiClient.get<{
        experience: StoreExperience;
        stores: any[];
        pagination: any;
      }>(`/experiences/${experienceId}/stores`, {
        page: params?.page || 1,
        limit: params?.limit || 20,
        ...(params?.location && { location: params.location }),
      });

      if (response.success && response.data) {
        console.log(`✅ [EXPERIENCES API] Got ${response.data.stores?.length || 0} stores`);
      }

      return response;
    } catch (error: any) {
      console.error('❌ [EXPERIENCES API] Error fetching stores by experience:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch stores',
        message: error?.message || 'Failed to fetch stores',
      };
    }
  }

  /**
   * Get unique finds
   */
  async getUniqueFinds(limit: number = 10, experience?: string): Promise<ApiResponse<any[]>> {
    try {
      console.log('🏪 [EXPERIENCES API] Fetching unique finds...');
      const response = await apiClient.get<any[]>('/experiences/unique-finds', {
        limit,
        ...(experience && { experience }),
      });
      if (response.success && response.data) {
        console.log(`✅ [EXPERIENCES API] Got ${response.data.length} unique items`);
      }
      return response;
    } catch (error: any) {
      console.error('❌ [EXPERIENCES API] Error fetching unique finds:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch unique finds',
        message: error?.message || 'Failed to fetch unique finds',
      };
    }
  }
}

// Create singleton instance
const experiencesService = new ExperiencesService();

// Named export for compatibility
export { experiencesService as experiencesApi };

export default experiencesService;
