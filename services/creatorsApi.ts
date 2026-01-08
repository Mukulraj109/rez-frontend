// Creators API Service
// Handles featured creators and creator picks API calls

import apiClient, { ApiResponse } from './apiClient';

// ============================================
// TYPES
// ============================================

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  verified: boolean;
  rating: number;
  totalPicks: number;
  totalViews: number;
  totalLikes?: number;
  followers: number;
}

export interface CreatorProfile extends Creator {
  joinedAt: string;
  stats: {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    followers: number;
  };
}

export interface CreatorPick {
  id: string;
  title: string;
  productImage: string;
  productPrice: number;
  productBrand: string;
  tag: string;
  views: number;
  purchases: number;
  creator?: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
}

export interface CreatorStats {
  videos: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  followers: number;
  following: number;
}

// ============================================
// CREATORS API SERVICE
// ============================================

class CreatorsApiService {
  /**
   * Get featured creators for homepage/Play & Earn sections
   * @param limit Number of creators to fetch (default: 6)
   */
  async getFeaturedCreators(limit: number = 6): Promise<ApiResponse<{
    creators: Creator[];
    total: number;
  }>> {
    try {
      const response = await apiClient.get<any>('/creators/featured', { limit });

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            creators: (data.creators || []).map((creator: any) => ({
              id: creator.id || creator._id,
              name: creator.name || 'ReZ Creator',
              avatar: creator.avatar || 'https://i.pravatar.cc/150?img=1',
              bio: creator.bio || '',
              verified: creator.verified ?? false,
              rating: creator.rating || 4.5,
              totalPicks: creator.totalPicks || 0,
              totalViews: creator.totalViews || 0,
              totalLikes: creator.totalLikes || 0,
              followers: creator.followers || 0,
            })),
            total: data.total || data.creators?.length || 0,
          },
        };
      }

      // Return empty array if API fails (graceful degradation)
      return {
        success: true,
        data: { creators: [], total: 0 },
      };
    } catch (error: any) {
      console.error('[CREATORS API] Error fetching featured creators:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get creator profile by ID
   * @param id Creator's user ID
   */
  async getCreatorById(id: string): Promise<ApiResponse<CreatorProfile>> {
    try {
      const response = await apiClient.get<any>(`/creators/${id}`);

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            id: data.id || data._id,
            name: data.name || 'ReZ Creator',
            avatar: data.avatar || 'https://i.pravatar.cc/150?img=1',
            bio: data.bio || '',
            verified: data.verified ?? false,
            rating: data.rating || 4.5,
            totalPicks: data.stats?.totalVideos || 0,
            totalViews: data.stats?.totalViews || 0,
            totalLikes: data.stats?.totalLikes || 0,
            followers: data.stats?.followers || 0,
            joinedAt: data.joinedAt || '',
            stats: {
              totalVideos: data.stats?.totalVideos || 0,
              totalViews: data.stats?.totalViews || 0,
              totalLikes: data.stats?.totalLikes || 0,
              totalShares: data.stats?.totalShares || 0,
              followers: data.stats?.followers || 0,
            },
          },
        };
      }

      return {
        success: false,
        error: response.error || 'Creator not found',
      };
    } catch (error: any) {
      console.error('[CREATORS API] Error fetching creator:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a creator's product picks/videos
   * @param creatorId Creator's user ID
   * @param limit Number of picks to fetch (default: 10)
   */
  async getCreatorPicks(creatorId: string, limit: number = 10): Promise<ApiResponse<{
    picks: CreatorPick[];
    total: number;
  }>> {
    try {
      const response = await apiClient.get<any>(`/creators/${creatorId}/picks`, { limit });

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            picks: (data.picks || []).map((pick: any) => ({
              id: pick.id || pick._id,
              title: pick.title || 'Product Pick',
              productImage: pick.productImage || '',
              productPrice: pick.productPrice || 0,
              productBrand: pick.productBrand || '',
              tag: pick.tag || '#picks',
              views: pick.views || 0,
              purchases: pick.purchases || 0,
            })),
            total: data.total || data.picks?.length || 0,
          },
        };
      }

      return {
        success: true,
        data: { picks: [], total: 0 },
      };
    } catch (error: any) {
      console.error('[CREATORS API] Error fetching creator picks:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get trending picks from all creators
   * @param limit Number of picks to fetch (default: 10)
   * @param category Optional category filter
   */
  async getTrendingPicks(limit: number = 10, category?: string): Promise<ApiResponse<{
    picks: CreatorPick[];
    total: number;
  }>> {
    try {
      const params: any = { limit };
      if (category) params.category = category;

      const response = await apiClient.get<any>('/creators/trending-picks', params);

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            picks: (data.picks || []).map((pick: any) => ({
              id: pick.id || pick._id,
              title: pick.title || 'Trending Pick',
              productImage: pick.productImage || '',
              productPrice: pick.productPrice || 0,
              productBrand: pick.productBrand || '',
              tag: pick.tag || '#trending',
              views: pick.views || 0,
              purchases: pick.purchases || 0,
              creator: pick.creator ? {
                id: pick.creator.id || pick.creator._id,
                name: pick.creator.name || '',
                avatar: pick.creator.avatar,
                verified: pick.creator.verified ?? false,
              } : undefined,
            })),
            total: data.total || data.picks?.length || 0,
          },
        };
      }

      return {
        success: true,
        data: { picks: [], total: 0 },
      };
    } catch (error: any) {
      console.error('[CREATORS API] Error fetching trending picks:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get creator's stats
   * @param creatorId Creator's user ID
   */
  async getCreatorStats(creatorId: string): Promise<ApiResponse<CreatorStats>> {
    try {
      const response = await apiClient.get<any>(`/creators/${creatorId}/stats`);

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            videos: data.videos || 0,
            views: data.views || 0,
            likes: data.likes || 0,
            shares: data.shares || 0,
            comments: data.comments || 0,
            engagementRate: data.engagementRate || 0,
            followers: data.followers || 0,
            following: data.following || 0,
          },
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to fetch stats',
      };
    } catch (error: any) {
      console.error('[CREATORS API] Error fetching creator stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const creatorsApi = new CreatorsApiService();

export default creatorsApi;
export { creatorsApi };
