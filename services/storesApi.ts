// Stores API Service
// Handles store listings, details, and management

import apiClient, { ApiResponse } from './apiClient';

export interface Store {
  id: string;
  name: string;
  description: string;
  slug: string;
  logo?: string;
  banner?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: [number, number];
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  settings: {
    isActive: boolean;
    acceptsOrders: boolean;
    minOrderAmount?: number;
    deliveryRadius?: number;
    processingTime: string;
  };
  ratings: {
    average: number;
    count: number;
    breakdown: Record<number, number>;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    totalOrders: number;
    joinedDate: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  policies: {
    returnPolicy?: string;
    shippingPolicy?: string;
    privacyPolicy?: string;
  };
  hours?: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  tags: string[];
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
    badges: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoresQuery {
  page?: number;
  limit?: number;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  search?: string;
  rating?: number;
  verified?: boolean;
  tags?: string[];
  sort?: 'name' | 'rating' | 'distance' | 'popularity' | 'newest';
  order?: 'asc' | 'desc';
  status?: Store['status'];
}

export interface StoresResponse {
  stores: Store[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    locations: Array<{ city: string; state: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    ratings: Record<number, number>;
  };
}

export interface StoreAnalytics {
  overview: {
    totalViews: number;
    totalFollowers: number;
    totalProducts: number;
    totalSales: number;
    averageRating: number;
  };
  sales: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
    growth: {
      monthly: number;
      yearly: number;
    };
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

export interface StoreFollow {
  storeId: string;
  store: {
    id: string;
    name: string;
    logo?: string;
    slug: string;
  };
  followedAt: string;
}

class StoresService {
  // Get stores with filtering and pagination
  async getStores(query: StoresQuery = {}): Promise<ApiResponse<StoresResponse>> {
    return apiClient.get('/stores', query);
  }

  // Get single store by ID
  async getStoreById(storeId: string): Promise<ApiResponse<Store>> {
    return apiClient.get(`/stores/${storeId}`);
  }

  // Get store by slug
  async getStoreBySlug(slug: string): Promise<ApiResponse<Store>> {
    return apiClient.get(`/stores/slug/${slug}`);
  }

  // Get featured stores
  async getFeaturedStores(limit: number = 10): Promise<ApiResponse<Store[]>> {
    return apiClient.get('/stores/featured', { limit });
  }

  // Get stores near location
  async getNearbyStores(
    latitude: number,
    longitude: number,
    radius: number = 10,
    limit: number = 20
  ): Promise<ApiResponse<Store[]>> {
    return apiClient.get('/stores/nearby', {
      latitude,
      longitude,
      radius,
      limit
    });
  }

  // Search stores
  async searchStores(
    query: string,
    filters?: Omit<StoresQuery, 'search'>
  ): Promise<ApiResponse<StoresResponse>> {
    return apiClient.get('/stores/search', {
      search: query,
      ...filters
    });
  }

  // Get store categories
  async getStoreCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    storeCount: number;
  }>>> {
    return apiClient.get('/stores/categories');
  }

  // Follow a store
  async followStore(storeId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/stores/${storeId}/follow`);
  }

  // Unfollow a store
  async unfollowStore(storeId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/stores/${storeId}/follow`);
  }

  // Get user's followed stores
  async getFollowedStores(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    stores: StoreFollow[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }>> {
    return apiClient.get('/stores/following', { page, limit });
  }

  // Check if user follows a store
  async checkFollowStatus(storeId: string): Promise<ApiResponse<{
    following: boolean;
    followedAt?: string;
  }>> {
    return apiClient.get(`/stores/${storeId}/follow-status`);
  }

  // Get store products
  async getStoreProducts(
    storeId: string,
    query: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      sort?: string;
    } = {}
  ): Promise<ApiResponse<{
    products: Array<{
      id: string;
      name: string;
      description: string;
      images: Array<{ url: string; alt: string }>;
      pricing: { basePrice: number; salePrice?: number };
      ratings: { average: number; count: number };
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }>> {
    return apiClient.get(`/stores/${storeId}/products`, query);
  }

  // Get store reviews
  async getStoreReviews(
    storeId: string,
    query: {
      page?: number;
      limit?: number;
      rating?: number;
      sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low';
    } = {}
  ): Promise<ApiResponse<{
    reviews: Array<{
      id: string;
      user: {
        id: string;
        name: string;
        avatar?: string;
      };
      rating: number;
      title: string;
      comment: string;
      helpful: number;
      createdAt: string;
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
    summary: {
      averageRating: number;
      totalReviews: number;
      ratingBreakdown: Record<number, number>;
    };
  }>> {
    return apiClient.get(`/stores/${storeId}/reviews`, query);
  }

  // Add store review
  async addStoreReview(
    storeId: string,
    review: {
      rating: number;
      title: string;
      comment: string;
    }
  ): Promise<ApiResponse<{
    id: string;
    message: string;
  }>> {
    return apiClient.post(`/stores/${storeId}/reviews`, review);
  }

  // Get store analytics (store owner only)
  async getStoreAnalytics(
    storeId: string,
    dateRange?: {
      from: string;
      to: string;
    }
  ): Promise<ApiResponse<StoreAnalytics>> {
    return apiClient.get(`/stores/${storeId}/analytics`, dateRange);
  }

  // Update store information (store owner only)
  async updateStore(
    storeId: string,
    updates: Partial<{
      name: string;
      description: string;
      contact: Store['contact'];
      address: Store['address'];
      settings: Store['settings'];
      hours: Store['hours'];
      policies: Store['policies'];
      socialMedia: Store['socialMedia'];
    }>
  ): Promise<ApiResponse<Store>> {
    return apiClient.patch(`/stores/${storeId}`, updates);
  }

  // Upload store logo
  async uploadStoreLogo(
    storeId: string,
    logoFile: File
  ): Promise<ApiResponse<{ logoUrl: string }>> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return apiClient.uploadFile(`/stores/${storeId}/logo`, formData);
  }

  // Upload store banner
  async uploadStoreBanner(
    storeId: string,
    bannerFile: File
  ): Promise<ApiResponse<{ bannerUrl: string }>> {
    const formData = new FormData();
    formData.append('banner', bannerFile);
    return apiClient.uploadFile(`/stores/${storeId}/banner`, formData);
  }

  // Get store performance metrics
  async getStoreMetrics(
    storeId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<ApiResponse<{
    views: number;
    followers: number;
    orders: number;
    revenue: number;
    conversion: number;
    growth: {
      views: number;
      followers: number;
      orders: number;
      revenue: number;
    };
  }>> {
    return apiClient.get(`/stores/${storeId}/metrics`, { period });
  }

  // Get store followers list
  async getFollowers(
    storeId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    followers: Array<{
      id: string;
      name: string;
      avatar?: string;
      followedAt: string;
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }>> {
    return apiClient.get(`/stores/${storeId}/followers`, { page, limit });
  }

  // Get follower count for a store
  async getFollowerCount(storeId: string): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get(`/stores/${storeId}/followers/count`);
  }

  // ===== FRONTEND HOMEPAGE INTEGRATION METHODS =====

  /**
   * Get featured stores for homepage sections - Returns formatted StoreItems
   */
  async getFeaturedForHomepage(limit: number = 10): Promise<any[]> {
    try {
      console.log(`🏪 [STORES API] Fetching ${limit} featured stores for homepage...`);
      console.log(`🌐 [STORES API] API URL: ${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'}/stores/featured`);

      const response = await apiClient.get('/stores/featured', { limit });

      console.log('📊 [STORES API] Featured stores response:', {
        success: response.success,
        hasData: !!response.data,
        isArray: Array.isArray(response.data),
        count: response.data?.length || 0,
        message: response.message,
        error: response.error
      });

      if (response.success && response.data && Array.isArray(response.data)) {
        console.log(`✅ [STORES API] Successfully fetched ${response.data.length} featured stores from backend`);

        // Transform backend store data to frontend StoreItem format
        const stores = response.data.map((store: any) => {
          console.log(`   📍 Store: ${store.name} (ID: ${store._id})`);
          return {
            id: store._id,
            type: 'store',
            title: store.name,
            name: store.name,
            image: store.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
            description: store.description,
            logo: store.logo || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
            rating: {
              value: store.ratings?.average || 4.5,
              count: store.ratings?.count || 0,
              maxValue: 5
            },
            cashback: {
              percentage: store.offers?.cashback || 10,
              maxAmount: store.offers?.maxCashback || 500
            },
            category: this.determineCategory(store.deliveryCategories),
            location: {
              address: store.location?.address || 'Location',
              city: store.location?.city || 'City',
              distance: this.calculateDisplayDistance(store.location?.coordinates)
            },
            isTrending: true, // Featured stores are considered trending
            deliveryTime: store.operationalInfo?.deliveryTime || '30-45 mins',
            minimumOrder: store.operationalInfo?.minimumOrder || 299
          };
        });

        console.log(`✅ [STORES API] Transformed ${stores.length} stores with real ObjectIds`);
        return stores;
      }

      console.error('❌ [STORES API] Invalid response structure or no data returned');
      console.error('Response details:', JSON.stringify(response, null, 2));

      // Throw error to trigger fallback mechanism
      throw new Error(response.error || response.message || 'Failed to fetch featured stores - API returned no data');
    } catch (error) {
      console.error('❌ [STORES API] Error fetching homepage featured stores:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));

      // Re-throw error to trigger fallback mechanism instead of returning empty array
      throw error;
    }
  }

  /**
   * Check if backend API is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {

      // Try to make a simple API call to check connectivity
      const response = await apiClient.get('/stores/featured', { limit: 1 });

      if (response.success) {

        return true;
      } else {
        console.warn('⚠️ [STORES API] Backend responded but with error:', response.message);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ [STORES API] Backend not available, falling back to dummy data:', error);
      return false;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Determine category based on delivery categories
   */
  private determineCategory(deliveryCategories: any): string {
    if (deliveryCategories?.premium) return 'Premium';
    if (deliveryCategories?.organic) return 'Organic';
    if (deliveryCategories?.fastDelivery) return 'Fast Food';
    if (deliveryCategories?.budgetFriendly) return 'Budget';
    if (deliveryCategories?.alliance) return 'Alliance';
    return 'General';
  }

  /**
   * Calculate display distance (placeholder - would use actual user location)
   */
  private calculateDisplayDistance(coordinates?: [number, number]): string {
    // Placeholder distance calculation
    const distances = ['1.2 km', '2.3 km', '3.5 km', '4.1 km', '5.7 km'];
    return distances[Math.floor(Math.random() * distances.length)];
  }
}

// Create singleton instance
const storesService = new StoresService();

export default storesService;