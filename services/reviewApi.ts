// Review API Service
// Handles store reviews and ratings

import apiClient, { ApiResponse } from './apiClient';
import {
  Review,
  ReviewsResponse,
  CreateReviewData,
  UpdateReviewData,
  ReviewFilters,
  UserReview,
  CanReviewResponse
} from '@/types/review.types';

class ReviewService {
  /**
   * Get reviews for a store
   */
  async getStoreReviews(
    storeId: string,
    filters: ReviewFilters = {}
  ): Promise<ApiResponse<ReviewsResponse>> {
    try {
      console.log('üìù [REVIEW API] Fetching reviews for store:', storeId, filters);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const queryString = params.toString();
      const endpoint = `/reviews/store/${storeId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ReviewsResponse>(endpoint);

      console.log(' [REVIEW API] Reviews fetched successfully:', {
        reviewCount: response.data?.reviews?.length,
        avgRating: response.data?.ratingStats?.average,
        totalReviews: response.data?.pagination?.totalReviews
      });

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error fetching store reviews:', error);
      throw error;
    }
  }

  /**
   * Create a new review for a store
   */
  async createReview(
    storeId: string,
    reviewData: CreateReviewData
  ): Promise<ApiResponse<{ review: Review }>> {
    try {
      console.log('=› [REVIEW API] Creating review for store:', storeId, reviewData);

      const response = await apiClient.post<{ review: Review }>(
        `/reviews/store/${storeId}`,
        reviewData
      );

      console.log(' [REVIEW API] Review created successfully:', response.data?.review?._id);

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error creating review:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(
    reviewId: string,
    updates: UpdateReviewData
  ): Promise<ApiResponse<{ review: Review }>> {
    try {
      console.log(' [REVIEW API] Updating review:', reviewId, updates);

      const response = await apiClient.put<{ review: Review }>(
        `/reviews/${reviewId}`,
        updates
      );

      console.log(' [REVIEW API] Review updated successfully');

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<ApiResponse<null>> {
    try {
      console.log('=— [REVIEW API] Deleting review:', reviewId);

      const response = await apiClient.delete<null>(`/reviews/${reviewId}`);

      console.log(' [REVIEW API] Review deleted successfully');

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<ApiResponse<{ helpful: number }>> {
    try {
      console.log('=M [REVIEW API] Marking review as helpful:', reviewId);

      const response = await apiClient.post<{ helpful: number }>(
        `/reviews/${reviewId}/helpful`
      );

      console.log(' [REVIEW API] Review marked as helpful');

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error marking review as helpful:', error);
      throw error;
    }
  }

  /**
   * Get user's own reviews
   */
  async getUserReviews(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    reviews: UserReview[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    try {
      console.log('=d [REVIEW API] Fetching user reviews:', { page, limit });

      const response = await apiClient.get(
        `/reviews/user/my-reviews?page=${page}&limit=${limit}`
      );

      console.log(' [REVIEW API] User reviews fetched:', response.data?.reviews?.length);

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error fetching user reviews:', error);
      throw error;
    }
  }

  /**
   * Check if user can review a store
   */
  async canUserReviewStore(storeId: string): Promise<ApiResponse<CanReviewResponse>> {
    try {
      console.log('= [REVIEW API] Checking if user can review store:', storeId);

      const response = await apiClient.get<CanReviewResponse>(
        `/reviews/store/${storeId}/can-review`
      );

      console.log(' [REVIEW API] Review eligibility checked:', response.data);

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error checking review eligibility:', error);
      throw error;
    }
  }

  /**
   * Report a review (future functionality)
   */
  async reportReview(
    reviewId: string,
    reason: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('=© [REVIEW API] Reporting review:', reviewId, reason);

      // This endpoint doesn't exist in backend yet, but we're creating it for future use
      const response = await apiClient.post<{ message: string }>(
        `/reviews/${reviewId}/report`,
        { reason }
      );

      console.log(' [REVIEW API] Review reported successfully');

      return response;
    } catch (error) {
      console.error('L [REVIEW API] Error reporting review:', error);
      throw error;
    }
  }
}

// Create singleton instance
const reviewService = new ReviewService();

export default reviewService;
