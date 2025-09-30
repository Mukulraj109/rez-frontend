// Real API implementation for Videos (Phase 5 - Social Features)
import apiClient from './apiClient';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  creator: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  videoUrl: string;
  thumbnail: string;
  preview?: string;
  category: 'trending_me' | 'trending_her' | 'waist' | 'article' | 'featured' | 'challenge' | 'tutorial' | 'review';
  tags: string[];
  hashtags: string[];
  products: any[];
  stores: any[];
  engagement: {
    views: number;
    likes: string[];
    shares: number;
    comments: number;
    saves: number;
  };
  metadata: {
    duration: number;
    resolution?: string;
    fileSize?: number;
    format?: string;
    aspectRatio?: string;
    fps?: number;
  };
  isPublished: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const realVideosApi = {
  /**
   * Get all videos with filtering and pagination
   */
  async getVideos(params?: {
    category?: string;
    creator?: string;
    hasProducts?: boolean;
    search?: string;
    sortBy?: 'newest' | 'popular' | 'trending' | 'likes';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ videos: Video[]; pagination: any }>> {
    const queryParams = new URLSearchParams();

    if (params?.category) queryParams.append('category', params.category);
    if (params?.creator) queryParams.append('creator', params.creator);
    if (params?.hasProducts !== undefined) queryParams.append('hasProducts', String(params.hasProducts));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    return apiClient.get(`/videos?${queryParams.toString()}`);
  },

  /**
   * Get trending videos
   */
  async getTrendingVideos(params?: {
    limit?: number;
    timeframe?: '1d' | '7d' | '30d';
  }): Promise<ApiResponse<Video[]>> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.timeframe) queryParams.append('timeframe', params.timeframe);

    return apiClient.get(`/videos/trending?${queryParams.toString()}`);
  },

  /**
   * Get videos by category
   */
  async getVideosByCategory(
    category: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: 'newest' | 'popular' | 'trending';
    }
  ): Promise<ApiResponse<{ videos: Video[]; pagination: any }>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    return apiClient.get(`/videos/category/${category}?${queryParams.toString()}`);
  },

  /**
   * Get videos by creator
   */
  async getVideosByCreator(
    creatorId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{ videos: Video[]; pagination: any }>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    return apiClient.get(`/videos/creator/${creatorId}?${queryParams.toString()}`);
  },

  /**
   * Get single video by ID
   */
  async getVideoById(videoId: string): Promise<ApiResponse<Video>> {
    return apiClient.get(`/videos/${videoId}`);
  },

  /**
   * Like/Unlike a video (requires authentication)
   */
  async toggleVideoLike(videoId: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    return apiClient.post(`/videos/${videoId}/like`);
  },

  /**
   * Add comment to video (requires authentication)
   */
  async addVideoComment(videoId: string, comment: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/videos/${videoId}/comments`, { comment });
  },

  /**
   * Get video comments
   */
  async getVideoComments(
    videoId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{ comments: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    return apiClient.get(`/videos/${videoId}/comments?${queryParams.toString()}`);
  },

  /**
   * Search videos
   */
  async searchVideos(params: {
    q: string;
    category?: string;
    creator?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ videos: Video[]; pagination: any }>> {
    const queryParams = new URLSearchParams();

    queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.creator) queryParams.append('creator', params.creator);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    return apiClient.get(`/videos/search?${queryParams.toString()}`);
  },
};

export default realVideosApi;