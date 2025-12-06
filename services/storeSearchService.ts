import { UserLocation } from '@/types/location.types';
import apiClient from './apiClient';

export interface StoreProduct {
  _id: string;
  name: string;
  title?: string;
  image?: string;
  price?: {
    current: number;
    original: number;
    currency: string;
    discount: number;
  };
  rating?: {
    value: number | string;
    count: number;
  };
  inventory?: {
    stock: number;
    isAvailable: boolean;
  };
  tags?: string[];
}

export interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: [number, number];
    deliveryRadius: number;
  };
  ratings: {
    average: number;
    count: number;
    distribution?: { [key: string]: number };
  };
  operationalInfo: {
    deliveryTime?: string;
    minimumOrder?: number;
    deliveryFee?: number;
    freeDeliveryAbove?: number;
    acceptsWalletPayment: boolean;
    paymentMethods: string[];
  };
  deliveryCategories: {
    fastDelivery: boolean;
    budgetFriendly: boolean;
    premium: boolean;
    organic: boolean;
    alliance: boolean;
    lowestPrice: boolean;
    mall: boolean;
    cashStore: boolean;
  };
  products?: StoreProduct[]; // Added products field from backend
  distance?: number;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSearchParams {
  category: string;
  location?: string; // "lng,lat" format
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'distance' | 'name' | 'newest';
}

export interface StoreSearchResponse {
  success: boolean;
  data: {
    stores: Store[];
    category: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

export interface StoreCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

export interface StoreCategoriesResponse {
  success: boolean;
  data: {
    categories: StoreCategory[];
  };
  message: string;
}

export interface Review {
  _id: string;
  store: string;
  user: {
    _id: string;
    profile: {
      name: string;
      avatar?: string;
    };
  };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: { [key: string]: number };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    ratingStats: ReviewStats;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

export interface Favorite {
  _id: string;
  user: string;
  store: Store;
  createdAt: string;
  updatedAt: string;
}

export interface FavoritesResponse {
  success: boolean;
  data: {
    favorites: Favorite[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalFavorites: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

export interface StoreComparison {
  _id: string;
  user: string;
  stores: Store[];
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonResponse {
  success: boolean;
  data: {
    comparison: StoreComparison;
  };
  message: string;
}

export interface ComparisonsResponse {
  success: boolean;
  data: {
    comparisons: StoreComparison[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalComparisons: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message: string;
}

class StoreSearchService {
  private baseUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
    this.baseUrl = `${this.apiBaseUrl}/stores`;
  }

  /**
   * Check if a string is a MongoDB ObjectId (24 hex characters)
   */
  private isMongoObjectId(str: string): boolean {
    return /^[a-fA-F0-9]{24}$/.test(str);
  }

  /**
   * Search stores by delivery category type (e.g., 'fastDelivery', 'premium', etc.)
   */
  async searchStoresByCategory(params: StoreSearchParams): Promise<StoreSearchResponse> {
    const {
      category,
      location,
      radius = 10,
      page = 1,
      limit = 20,
      sortBy = 'rating'
    } = params;

    // If category is a MongoDB ObjectId, use the category endpoint
    if (this.isMongoObjectId(category)) {
      return this.getStoresByCategoryId({
        categoryId: category,
        page,
        limit,
        sortBy
      });
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      ...(location && { location, radius: radius.toString() }),
    });

    const response = await fetch(
      `${this.baseUrl}/search-by-category/${category}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get stores by category ObjectId (for actual product categories from database)
   */
  async getStoresByCategoryId(params: {
    categoryId: string;
    page?: number;
    limit?: number;
    sortBy?: 'rating' | 'name' | 'newest';
  }): Promise<StoreSearchResponse> {
    const {
      categoryId,
      page = 1,
      limit = 20,
      sortBy = 'rating'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
    });

    const response = await fetch(
      `${this.baseUrl}/category/${categoryId}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Search stores by delivery time range
   */
  async searchStoresByDeliveryTime(params: {
    minTime?: number;
    maxTime?: number;
    location?: string;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<StoreSearchResponse> {
    const {
      minTime = 15,
      maxTime = 60,
      location,
      radius = 10,
      page = 1,
      limit = 20
    } = params;

    const queryParams = new URLSearchParams({
      minTime: minTime.toString(),
      maxTime: maxTime.toString(),
      page: page.toString(),
      limit: limit.toString(),
      ...(location && { location, radius: radius.toString() }),
    });

    const response = await fetch(
      `${this.baseUrl}/search-by-delivery-time?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get available store categories
   */
  async getStoreCategories(): Promise<StoreCategoriesResponse> {
    const response = await fetch(`${this.baseUrl}/categories/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get store by ID
   */
  async getStoreById(storeId: string): Promise<{ success: boolean; data: Store; message: string }> {
    const response = await fetch(`${this.baseUrl}/${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get nearby stores
   */
  async getNearbyStores(params: {
    location: string; // "lng,lat" format
    radius?: number;
    limit?: number;
  }): Promise<StoreSearchResponse> {
    const { location, radius = 10, limit = 20 } = params;

    const queryParams = new URLSearchParams({
      location,
      radius: radius.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${this.baseUrl}/nearby?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get featured stores
   */
  async getFeaturedStores(params?: {
    location?: string;
    radius?: number;
    limit?: number;
  }): Promise<StoreSearchResponse> {
    const { location, radius = 10, limit = 20 } = params || {};

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      ...(location && { location, radius: radius.toString() }),
    });

    const response = await fetch(
      `${this.baseUrl}/featured?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Advanced store search with filters
   */
  async advancedStoreSearch(params: {
    search?: string;
    category?: string;
    deliveryTime?: { min: number; max: number };
    priceRange?: { min: number; max: number };
    rating?: number;
    paymentMethods?: string[];
    features?: {
      freeDelivery?: boolean;
      walletPayment?: boolean;
      verified?: boolean;
      featured?: boolean;
    };
    sortBy?: 'rating' | 'distance' | 'name' | 'newest' | 'price';
    location?: string;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<StoreSearchResponse> {
    const {
      search,
      category,
      deliveryTime,
      priceRange,
      rating,
      paymentMethods,
      features,
      sortBy = 'rating',
      location,
      radius = 10,
      page = 1,
      limit = 20
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      ...(location && { location, radius: radius.toString() }),
    });

    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (deliveryTime) {
      queryParams.append('deliveryTime', `${deliveryTime.min}-${deliveryTime.max}`);
    }
    if (priceRange) {
      queryParams.append('priceRange', `${priceRange.min}-${priceRange.max}`);
    }
    if (rating !== undefined) queryParams.append('rating', rating.toString());
    if (paymentMethods && paymentMethods.length > 0) {
      queryParams.append('paymentMethods', paymentMethods.join(','));
    }
    if (features) {
      const featuresList = [];
      if (features.freeDelivery) featuresList.push('freeDelivery');
      if (features.walletPayment) featuresList.push('walletPayment');
      if (features.verified) featuresList.push('verified');
      if (features.featured) featuresList.push('featured');
      if (featuresList.length > 0) {
        queryParams.append('features', featuresList.join(','));
      }
    }

    const response = await fetch(
      `${this.baseUrl}/search/advanced?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Helper method to format location for API calls
   */
  formatLocationForAPI(location: UserLocation): string {
    if (!location?.coordinates) {
      throw new Error('Location coordinates are required');
    }
    return `${location.coordinates.longitude},${location.coordinates.latitude}`;
  }

  /**
   * Get reviews for a store
   */
  async getStoreReviews(params: {
    storeId: string;
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  }): Promise<ReviewsResponse> {
    const {
      storeId,
      page = 1,
      limit = 20,
      rating,
      sortBy = 'newest'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      ...(rating && { rating: rating.toString() }),
    });

    const response = await fetch(
      `${this.apiBaseUrl}/reviews/store/${storeId}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Create a new review
   */
  async createReview(params: {
    storeId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
  }): Promise<{ success: boolean; data: { review: Review }; message: string }> {
    const { storeId, rating, title, comment, images } = params;

    const response = await fetch(
      `${this.apiBaseUrl}/reviews/store/${storeId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
        body: JSON.stringify({
          rating,
          title,
          comment,
          images: images || [],
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Check if user can review a store
   */
  async canUserReviewStore(storeId: string): Promise<{ success: boolean; data: { canReview: boolean; hasReviewed: boolean } }> {
    const response = await fetch(
      `${this.apiBaseUrl}/reviews/store/${storeId}/can-review`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<{ success: boolean; data: { helpful: number }; message: string }> {
    const response = await fetch(
      `${this.apiBaseUrl}/reviews/${reviewId}/helpful`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Add store to favorites
   */
  async addToFavorites(storeId: string): Promise<{ success: boolean; data: { favorite: Favorite }; message: string }> {
    const response = await fetch(
      `${this.apiBaseUrl}/favorites/store/${storeId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Remove store from favorites
   */
  async removeFromFavorites(storeId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.apiBaseUrl}/favorites/store/${storeId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(storeId: string): Promise<{ success: boolean; data: { isFavorited: boolean; favorite?: Favorite }; message: string }> {
    const response = await fetch(
      `${this.apiBaseUrl}/favorites/store/${storeId}/toggle`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Check if store is favorited
   */
  async isStoreFavorited(storeId: string): Promise<{ success: boolean; data: { isFavorited: boolean } }> {
    const response = await fetch(
      `${this.apiBaseUrl}/favorites/store/${storeId}/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get user's favorite stores
   */
  async getUserFavorites(params?: {
    page?: number;
    limit?: number;
  }): Promise<FavoritesResponse> {
    const { page = 1, limit = 20 } = params || {};

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<FavoritesResponse>(`/favorites/user/my-favorites?${queryParams}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch favorites');
    }

    return response.data as FavoritesResponse;
  }

  /**
   * Get favorite statuses for multiple stores
   */
  async getFavoriteStatuses(storeIds: string[]): Promise<{ success: boolean; data: { statuses: { [key: string]: boolean } } }> {
    const response = await apiClient.post<{ success: boolean; data: { statuses: { [key: string]: boolean } } }>('/favorites/statuses', { storeIds });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch favorite statuses');
    }

    return response.data as { success: boolean; data: { statuses: { [key: string]: boolean } } };
  }

  /**
   * Clear all favorites
   */
  async clearAllFavorites(): Promise<{ success: boolean; data: { deletedCount: number }; message: string }> {
    const response = await fetch(
      `${this.apiBaseUrl}/favorites/clear-all`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Create a new store comparison
   */
  async createComparison(params: {
    storeIds: string[];
    name?: string;
  }): Promise<ComparisonResponse> {
    const { storeIds, name } = params;

    const response = await fetch(
      `${this.apiBaseUrl}/comparisons`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
        body: JSON.stringify({
          storeIds,
          name,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get user's store comparisons
   */
  async getUserComparisons(params?: {
    page?: number;
    limit?: number;
  }): Promise<ComparisonsResponse> {
    const { page = 1, limit = 20 } = params || {};

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<ComparisonsResponse>(`/comparisons/user/my-comparisons?${queryParams}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch comparisons');
    }

    return response.data as ComparisonsResponse;
  }

  /**
   * Get specific comparison by ID
   */
  async getComparisonById(comparisonId: string): Promise<ComparisonResponse> {
    const response = await fetch(
      `${this.apiBaseUrl}/comparisons/${comparisonId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Update comparison
   */
  async updateComparison(params: {
    comparisonId: string;
    storeIds?: string[];
    name?: string;
  }): Promise<ComparisonResponse> {
    const { comparisonId, storeIds, name } = params;

    const response = await fetch(
      `${this.apiBaseUrl}/comparisons/${comparisonId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
        body: JSON.stringify({
          storeIds,
          name,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Delete comparison
   */
  async deleteComparison(comparisonId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.apiBaseUrl}/comparisons/${comparisonId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Add store to comparison
   */
  async addStoreToComparison(params: {
    comparisonId: string;
    storeId: string;
  }): Promise<ComparisonResponse> {
    const { comparisonId, storeId } = params;

    const response = await fetch(
      `${this.apiBaseUrl}/comparisons/${comparisonId}/stores`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
        body: JSON.stringify({
          storeId,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Remove store from comparison
   */
  async removeStoreFromComparison(params: {
    comparisonId: string;
    storeId: string;
  }): Promise<ComparisonResponse> {
    const { comparisonId, storeId } = params;

    const response = await fetch(
      `${this.apiBaseUrl}/comparisons/${comparisonId}/stores/${storeId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Clear all comparisons
   */
  async clearAllComparisons(): Promise<{ success: boolean; data: { deletedCount: number }; message: string }> {
    const response = await fetch(
      `${this.apiBaseUrl}/comparisons/user/clear-all`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Track analytics event
   */
  async trackEvent(params: {
    storeId: string;
    eventType: 'view' | 'search' | 'favorite' | 'unfavorite' | 'compare' | 'review' | 'click' | 'share';
    eventData?: {
      searchQuery?: string;
      category?: string;
      source?: string;
      location?: {
        coordinates: [number, number];
        address?: string;
      };
      metadata?: any;
    };
  }): Promise<{ success: boolean; data: { analyticsId: string }; message: string }> {
    const { storeId, eventType, eventData } = params;

    const response = await fetch(
      `${this.apiBaseUrl}/analytics/track`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
        body: JSON.stringify({
          storeId,
          eventType,
          eventData,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get store analytics
   */
  async getStoreAnalytics(params: {
    storeId: string;
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<{ success: boolean; data: any }> {
    const { storeId, startDate, endDate, eventType, groupBy = 'day' } = params;

    const queryParams = new URLSearchParams({
      groupBy,
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      ...(eventType && { eventType }),
    });

    const response = await fetch(
      `${this.apiBaseUrl}/analytics/store/${storeId}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get popular stores
   */
  async getPopularStores(params?: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    limit?: number;
  }): Promise<{ success: boolean; data: any }> {
    const { startDate, endDate, eventType, limit = 10 } = params || {};

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      ...(eventType && { eventType }),
    });

    const response = await fetch(
      `${this.apiBaseUrl}/analytics/popular?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(params?: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
  }): Promise<{ success: boolean; data: any }> {
    const { startDate, endDate, eventType } = params || {};

    const queryParams = new URLSearchParams({
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      ...(eventType && { eventType }),
    });

    const response = await fetch(
      `${this.apiBaseUrl}/analytics/user/my-analytics?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Helper method to get category display info
   */
  getCategoryDisplayInfo(categoryId: string): { name: string; icon: string; color: string } {
    const categoryInfo: { [key: string]: { name: string; icon: string; color: string } } = {
      fastDelivery: { name: '30 min delivery', icon: '🚀', color: '#7B61FF' },
      budgetFriendly: { name: '1 rupees store', icon: '💰', color: '#6E56CF' },
      premium: { name: 'Luxury store', icon: '👑', color: '#A78BFA' },
      organic: { name: 'Organic Store', icon: '🌱', color: '#34D399' },
      alliance: { name: 'Alliance Store', icon: '🤝', color: '#9F7AEA' },
      lowestPrice: { name: 'Lowest Price', icon: '💸', color: '#22D3EE' },
      mall: { name: 'Rez Mall', icon: '🏬', color: '#60A5FA' },
      cashStore: { name: 'Cash Store', icon: '💵', color: '#8B5CF6' },
    };

    return categoryInfo[categoryId] || { name: 'Store', icon: '🏪', color: '#666' };
  }
}

export const storeSearchService = new StoreSearchService();
export default storeSearchService;
