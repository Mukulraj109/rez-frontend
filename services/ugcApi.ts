// User Generated Content (UGC) API Service
// Handles user photos, videos, and content sharing

import apiClient, { ApiResponse } from './apiClient';

export interface UGCMedia {
  _id: string;
  userId: string;
  user: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  tags: string[];
  relatedProduct?: {
    _id: string;
    name: string;
    image: string;
  };
  relatedStore?: {
    _id: string;
    name: string;
    logo: string;
  };
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UGCComment {
  _id: string;
  userId: string;
  user: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  comment: string;
  likes: number;
  isLiked: boolean;
  replies: UGCComment[];
  createdAt: string;
}

export interface CreateUGCRequest {
  type: 'photo' | 'video';
  caption?: string;
  tags?: string[];
  relatedProductId?: string;
  relatedStoreId?: string;
}

export interface UGCFilters {
  type?: 'photo' | 'video';
  userId?: string;
  productId?: string;
  storeId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

class UGCApiService {
  private baseUrl = '/ugc';

  /**
   * Get UGC feed
   */
  async getFeed(filters?: UGCFilters): Promise<ApiResponse<{
    content: UGCMedia[];
    total: number;
    hasMore: boolean;
  }>> {

    return apiClient.get(this.baseUrl, filters);
  }

  /**
   * Get UGC by ID
   */
  async getById(id: string): Promise<ApiResponse<{ content: UGCMedia }>> {

    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new UGC (upload)
   */
  async create(data: CreateUGCRequest, file: FormData): Promise<ApiResponse<{
    content: UGCMedia;
    message: string;
  }>> {

    // Add metadata to FormData
    for (const key in data) {
      if (data[key as keyof CreateUGCRequest] !== undefined) {
        file.append(key, String(data[key as keyof CreateUGCRequest]));
      }
    }

    return apiClient.uploadFile(this.baseUrl, file);
  }

  /**
   * Update UGC
   */
  async update(id: string, data: {
    caption?: string;
    tags?: string[];
  }): Promise<ApiResponse<{ content: UGCMedia }>> {

    return apiClient.put(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete UGC
   */
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {

    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Like/Unlike UGC
   */
  async toggleLike(id: string): Promise<ApiResponse<{
    isLiked: boolean;
    likes: number;
  }>> {

    return apiClient.post(`${this.baseUrl}/${id}/like`);
  }

  /**
   * Bookmark/Unbookmark UGC
   */
  async toggleBookmark(id: string): Promise<ApiResponse<{
    isBookmarked: boolean;
  }>> {

    return apiClient.post(`${this.baseUrl}/${id}/bookmark`);
  }

  /**
   * Share UGC
   */
  async share(id: string): Promise<ApiResponse<{ shares: number }>> {

    return apiClient.post(`${this.baseUrl}/${id}/share`);
  }

  /**
   * Get comments for UGC
   */
  async getComments(id: string, limit = 20, offset = 0): Promise<ApiResponse<{
    comments: UGCComment[];
    total: number;
    hasMore: boolean;
  }>> {

    return apiClient.get(`${this.baseUrl}/${id}/comments`, { limit, offset });
  }

  /**
   * Add comment to UGC
   */
  async addComment(id: string, comment: string, parentId?: string): Promise<ApiResponse<{
    comment: UGCComment;
  }>> {

    return apiClient.post(`${this.baseUrl}/${id}/comments`, { comment, parentId });
  }

  /**
   * Like/Unlike comment
   */
  async toggleCommentLike(ugcId: string, commentId: string): Promise<ApiResponse<{
    isLiked: boolean;
    likes: number;
  }>> {

    return apiClient.post(`${this.baseUrl}/${ugcId}/comments/${commentId}/like`);
  }

  /**
   * Delete comment
   */
  async deleteComment(ugcId: string, commentId: string): Promise<ApiResponse<{ message: string }>> {

    return apiClient.delete(`${this.baseUrl}/${ugcId}/comments/${commentId}`);
  }

  /**
   * Get user's UGC
   */
  async getUserContent(userId?: string, type?: 'photo' | 'video'): Promise<ApiResponse<{
    content: UGCMedia[];
    total: number;
  }>> {

    return apiClient.get(`${this.baseUrl}/user/${userId || 'me'}`, type ? { type } : undefined);
  }

  /**
   * Get UGC for product
   */
  async getProductContent(productId: string): Promise<ApiResponse<{
    content: UGCMedia[];
    total: number;
  }>> {

    return apiClient.get(`${this.baseUrl}/product/${productId}`);
  }

  /**
   * Get UGC for store
   */
  async getStoreContent(storeId: string): Promise<ApiResponse<{
    content: UGCMedia[];
    total: number;
  }>> {

    return apiClient.get(`${this.baseUrl}/store/${storeId}`);
  }

  /**
   * Get bookmarked UGC
   */
  async getBookmarked(type?: 'photo' | 'video'): Promise<ApiResponse<{
    content: UGCMedia[];
    total: number;
  }>> {

    return apiClient.get(`${this.baseUrl}/bookmarked`, type ? { type } : undefined);
  }

  /**
   * Report UGC
   */
  async report(id: string, reason: string, description?: string): Promise<ApiResponse<{
    message: string;
  }>> {

    return apiClient.post(`${this.baseUrl}/${id}/report`, { reason, description });
  }
}

// Export singleton instance
const ugcApi = new UGCApiService();
export default ugcApi;
