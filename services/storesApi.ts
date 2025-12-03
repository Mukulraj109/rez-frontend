// Stores API Service
// Handles store listings, details, and management

import apiClient, { ApiResponse } from './apiClient';
import { validateStore, validateStoreArray } from '@/utils/responseValidators';
import {
  Store as UnifiedStore,
  toStore,
  validateStore as validateUnifiedStore,
  isStoreOpen,
  isStoreVerified
} from '@/types/unified';

// Keep the old Store interface for backwards compatibility during migration
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
  // Action buttons configuration for ProductPage
  actionButtons?: {
    enabled: boolean;
    buttons: Array<{
      id: 'call' | 'product' | 'location' | 'custom';
      enabled: boolean;
      label?: string;
      destination?: {
        type: 'phone' | 'url' | 'maps' | 'internal';
        value: string;
      };
      order?: number;
    }>;
  };
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
    badges: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Export unified Store type for new code
export { UnifiedStore };

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
    try {
      const response = await apiClient.get<any>(`/stores/${storeId}`);

      // Validate and normalize store data using unified types
      if (response.success && response.data) {
        // Extract store from nested structure (API returns { store: {...}, products: [...], productsCount: ... })
        const storeData = (response.data as any).store || response.data;
        
        if (!storeData) {
          return {
            success: false,
            error: 'Store not found',
            message: 'Store data not found in response',
          };
        }

        // Debug: Log raw store data from API
        console.log('📦 [STORES API] Raw store data from backend:', {
          hasDescription: !!storeData.description,
          hasContact: !!storeData.contact,
          hasOperationalInfo: !!storeData.operationalInfo,
          hasBanner: !!storeData.banner,
          hasLogo: !!storeData.logo,
          hasImage: !!storeData.image,
          banner: storeData.banner,
          logo: storeData.logo,
          image: storeData.image,
          contact: storeData.contact,
          operationalInfo: storeData.operationalInfo,
          description: storeData.description,
        });

        try {
          // Convert to unified Store format
          const unifiedStore = toStore(storeData);
          
          // Debug: Log after conversion
          console.log('🔄 [STORES API] After toStore conversion:', {
            hasDescription: !!unifiedStore.description,
            hasContact: !!unifiedStore.contact,
            hasOperationalInfo: !!unifiedStore.operationalInfo,
            hasBanner: !!(unifiedStore as any).banner,
            hasLogo: !!(unifiedStore as any).logo,
            hasImage: !!(unifiedStore as any).image,
            banner: (unifiedStore as any).banner,
            logo: (unifiedStore as any).logo,
            image: (unifiedStore as any).image,
            contact: unifiedStore.contact,
            operationalInfo: unifiedStore.operationalInfo,
            description: unifiedStore.description,
          });

          // Validate using unified validator
          const validation = validateUnifiedStore(unifiedStore);
          if (validation.valid) {
            // Preserve all original fields that might be lost in conversion
            // The toStore() function converts some fields but we need to keep the original structure
            const finalStoreData = {
              ...unifiedStore,
              // Preserve original fields that toStore() might not handle correctly
              description: storeData.description || unifiedStore.description || '',
              contact: storeData.contact || unifiedStore.contact,
              operationalInfo: storeData.operationalInfo || undefined, // Keep original operationalInfo structure
              // Preserve the raw location object with all fields (state, pincode, etc.)
              location: storeData.location || unifiedStore.location,
              // Preserve banner and logo fields explicitly
              banner: storeData.banner || (unifiedStore as any).banner || '',
              logo: storeData.logo || (unifiedStore as any).logo || '',
              image: storeData.image || storeData.banner || (unifiedStore as any).image || (unifiedStore as any).banner || '',
              // Also preserve any other fields that might be useful
              tags: storeData.tags || unifiedStore.tags || [],
              deliveryCategories: storeData.deliveryCategories,
              offers: storeData.offers,
              createdAt: storeData.createdAt,
              updatedAt: storeData.updatedAt,
            };
            
            // Debug: Log final store data
            console.log('✅ [STORES API] Final store data with preserved fields:', {
              hasBanner: !!finalStoreData.banner,
              hasLogo: !!finalStoreData.logo,
              hasImage: !!finalStoreData.image,
              banner: finalStoreData.banner,
              logo: finalStoreData.logo,
              image: finalStoreData.image,
            });
            
            return {
              ...response,
              data: finalStoreData as any, // Cast to Store for backwards compatibility
            };
          } else {
            console.warn('⚠️ [STORES API] Store validation failed for ID:', storeId, validation.errors);
            // Return raw data with preserved fields if validation fails but data exists
            const fallbackData = {
              ...storeData,
              // Ensure we have at least the basic structure
              description: storeData.description || '',
              contact: storeData.contact || undefined,
              operationalInfo: storeData.operationalInfo || undefined,
            };
            return {
              ...response,
              data: fallbackData as any,
            };
          }
        } catch (conversionError: any) {
          console.warn('⚠️ [STORES API] Store conversion failed for ID:', storeId, conversionError);
          // Fallback to old validation or return raw data
          const validatedStore = validateStore(storeData);
          if (validatedStore) {
            return {
              ...response,
              data: validatedStore as Store,
            };
          } else {
            // Return raw data as fallback
            return {
              ...response,
              data: storeData as any,
            };
          }
        }
      }

      return {
        success: false,
        error: 'Store not found',
        message: 'No store data in response',
      };
    } catch (error: any) {
      console.error('❌ [STORES API] Error fetching store by ID:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch store',
        message: error?.message || 'Failed to fetch store',
      };
    }
  }

  // Get store by slug
  async getStoreBySlug(slug: string): Promise<ApiResponse<Store>> {
    try {
      const response = await apiClient.get<Store>(`/stores/slug/${slug}`);

      // Validate and normalize store data
      if (response.success && response.data) {
        const validatedStore = validateStore(response.data);
        if (validatedStore) {
          return {
            ...response,
            data: validatedStore as Store,
          };
        } else {
          console.warn('⚠️ [STORES API] Store validation failed for slug:', slug);
          return {
            success: false,
            error: 'Store validation failed',
            message: 'Invalid store data received from server',
          };
        }
      }

      return response;
    } catch (error: any) {
      console.error('❌ [STORES API] Error fetching store by slug:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch store',
        message: error?.message || 'Failed to fetch store',
      };
    }
  }

  // Get featured stores
  async getFeaturedStores(limit: number = 10): Promise<ApiResponse<Store[]>> {
    try {
      const response = await apiClient.get<Store[]>('/stores/featured', { limit });

      // Validate and normalize store array
      if (response.success && response.data && Array.isArray(response.data)) {
        const validatedStores = validateStoreArray(response.data);
        return {
          ...response,
          data: validatedStores as Store[],
        };
      }

      return response;
    } catch (error: any) {
      console.error('❌ [STORES API] Error fetching featured stores:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch featured stores',
        message: error?.message || 'Failed to fetch featured stores',
      };
    }
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
    console.log('🌐 [storesApi] Fetching store reviews');
    console.log('  📌 Store ID:', storeId);
    console.log('  🔍 Query Params:', JSON.stringify(query, null, 2));
    
    const response = await apiClient.get(`/stores/${storeId}/reviews`, query);
    
    console.log('🌐 [storesApi] API Response Received:');
    console.log('  ✅ Success:', response.success);
    console.log('  📦 Full Response:', JSON.stringify(response, null, 2));
    
    if (response.success && response.data) {
      console.log('  📝 Reviews Count:', response.data.reviews?.length || 0);
      console.log('  📊 Summary:', JSON.stringify(response.data.summary, null, 2));
      console.log('  📄 Pagination:', JSON.stringify(response.data.pagination, null, 2));
      
      // Log each review's user data
      if (response.data.reviews && response.data.reviews.length > 0) {
        response.data.reviews.forEach((review: any, index: number) => {
          console.log(`  👤 Review ${index + 1} User Data:`, {
            userId: review.user?.id,
            userName: review.user?.name,
            userAvatar: review.user?.avatar,
            fullUserObject: JSON.stringify(review.user, null, 2),
          });
        });
      }
    }
    
    return response;
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
      const response = await apiClient.get('/stores/featured', { limit });

      if (response.success && response.data && Array.isArray(response.data)) {

        // Validate and normalize stores first
        const validatedStores = validateStoreArray(response.data);

        // Transform backend store data to frontend StoreItem format
        const stores = validatedStores.map((store: any) => {
          // Handle banner field - can be array or string
          let imageField: string | string[] = '';
          const bannerData = store.banner;
          
          if (bannerData) {
            // If banner is an array, use the first image for the image field
            // but also preserve the banner array for the StoreCard component
            if (Array.isArray(bannerData) && bannerData.length > 0) {
              imageField = bannerData[0]; // First banner for image field
            } else if (typeof bannerData === 'string') {
              imageField = bannerData;
            }
          } else if (store.image) {
            imageField = store.image;
          }
          
          return {
            ...store,
            // Ensure ID is set (handle both _id and id)
            id: store.id || store._id,
            // Map banner to image field for HomepageSectionItem interface
            image: imageField,
            // CRITICAL: Explicitly preserve banner array for StoreCard component
            // Don't overwrite if it's already an array
            banner: bannerData || (Array.isArray(store.image) ? store.image : (store.image || '')),
            // Add any additional transformations needed for homepage display
            isTrending: true, // Featured stores are considered trending
          };
        });

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

// Named export for compatibility
export { storesService as storesApi };

export default storesService;