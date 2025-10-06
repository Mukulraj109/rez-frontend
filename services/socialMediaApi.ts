// Social Media API Service
// Handles all social media post submission and earnings API calls

import apiClient from './apiClient';

export interface SocialPost {
  _id: string;
  user: string;
  order?: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  postUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'credited';
  cashbackAmount: number;
  cashbackPercentage: number;
  submittedAt: string;
  reviewedAt?: string;
  creditedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  metadata: {
    postId?: string;
    thumbnailUrl?: string;
    orderNumber?: string;
    extractedData?: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EarningsData {
  totalEarned: number;
  pendingAmount: number;
  creditedAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  postsSubmitted: number;
  postsApproved: number;
  postsRejected: number;
  postsCredited: number;
  approvalRate: number;
}

export interface PlatformStats {
  platform: string;
  totalPosts: number;
  totalCashback: number;
  approvedPosts: number;
  creditedPosts: number;
}

export interface SubmitPostRequest {
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
  postUrl: string;
  orderId?: string;
}

export interface SubmitPostResponse {
  post: {
    id: string;
    platform: string;
    status: string;
    cashbackAmount: number;
    submittedAt: string;
    estimatedReview: string;
  };
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'credited';
}

export interface GetPostsResponse {
  posts: SocialPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Submit a new social media post for cashback
 */
export const submitPost = async (data: SubmitPostRequest): Promise<SubmitPostResponse> => {
  try {
    console.log('📤 [API] Submitting social media post:', data);
    const response = await apiClient.post('/social-media/submit', data);
    console.log('✅ [API] Post submitted successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to submit post:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user's earnings summary
 */
export const getUserEarnings = async (): Promise<EarningsData> => {
  try {
    console.log('📤 [API] Fetching user earnings...');
    const response = await apiClient.get('/social-media/earnings');
    console.log('✅ [API] Earnings fetched - Full response:', JSON.stringify(response, null, 2));
    console.log('✅ [API] Earnings data:', response.data);

    // Handle different response formats from backend
    if (response.success && response.data) {
      console.log('✅ [API] Returning response.data');
      return response.data;
    } else if (response.data) {
      console.log('✅ [API] Returning data directly');
      return response.data;
    } else {
      throw new Error('Invalid response format from earnings API');
    }
  } catch (error: any) {
    console.error('❌ [API] Failed to fetch earnings:',  error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user's social media posts
 */
export const getUserPosts = async (params: GetPostsParams = {}): Promise<GetPostsResponse> => {
  try {
    console.log('📤 [API] Fetching user posts:', params);
    const response = await apiClient.get('/social-media/posts', params);
    console.log('✅ [API] Posts fetched - Full response:', JSON.stringify(response, null, 2));
    console.log('✅ [API] Posts count:', response.data?.posts?.length || 0);

    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error('Invalid response format from posts API');
    }
  } catch (error: any) {
    console.error('❌ [API] Failed to fetch posts:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get a single post by ID
 */
export const getPostById = async (postId: string): Promise<SocialPost> => {
  try {
    console.log('📤 [API] Fetching post by ID:', postId);
    const response = await apiClient.get(`/social-media/posts/${postId}`);
    console.log('✅ [API] Post fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to fetch post:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a pending post
 */
export const deletePost = async (postId: string): Promise<void> => {
  try {
    console.log('📤 [API] Deleting post:', postId);
    const response = await apiClient.delete(`/social-media/posts/${postId}`);
    console.log('✅ [API] Post deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to delete post:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async (): Promise<{ stats: PlatformStats[] }> => {
  try {
    console.log('📤 [API] Fetching platform stats...');
    const response = await apiClient.get('/social-media/stats');
    console.log('✅ [API] Platform stats fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to fetch platform stats:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  submitPost,
  getUserEarnings,
  getUserPosts,
  getPostById,
  deletePost,
  getPlatformStats,
};
