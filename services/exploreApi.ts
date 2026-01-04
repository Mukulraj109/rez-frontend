// Explore API Service
// Handles all explore page related API calls

import apiClient, { ApiResponse } from './apiClient';

// ============================================
// TYPES
// ============================================

export interface ExploreStore {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  distance?: string;
  cashback: string;
  offer?: string;
  isOpen: boolean;
  activity?: string;
  badge?: string;
  badgeColor?: string;
  location?: {
    coordinates: [number, number];
  };
}

export interface HotProduct {
  id: string;
  name: string;
  store: string;
  storeId?: string;
  image: string;
  offer: string;
  distance?: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  buyers?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  storeCount?: number;
  productCount?: number;
}

export interface NearbyStore {
  id: string;
  name: string;
  distance: string;
  isLive: boolean;
  status: string;
  waitTime?: string;
  cashback: string;
  closingSoon?: boolean;
  location: {
    coordinates: [number, number];
  };
}

// ============================================
// EXPLORE API SERVICE
// ============================================

class ExploreApiService {
  /**
   * Get all stores with optional filters
   */
  async getStores(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'rating' | 'distance' | 'name' | 'newest';
  }): Promise<ApiResponse<{ stores: ExploreStore[]; pagination: any }>> {
    try {
      const response = await apiClient.get<any>('/stores', params);

      if (response.success && response.data) {
        // Transform backend data to frontend format
        const stores = (response.data.stores || response.data || []).map((store: any) => ({
          id: store._id || store.id,
          name: store.name,
          category: store.category?.name || store.deliveryCategories?.premium ? 'Premium' : 'General',
          image: store.banner?.[0] || store.image || store.logo || 'https://via.placeholder.com/400',
          rating: store.rating?.average || store.ratings?.average || 4.0,
          reviews: store.rating?.count || store.ratings?.count || 0,
          distance: store.distance ? `${store.distance.toFixed(1)} km` : undefined,
          cashback: store.cashbackRate ? `${store.cashbackRate}%` : store.offers?.[0]?.discount ? `${store.offers[0].discount}%` : '10%',
          offer: store.offers?.[0]?.title || `Up to ${store.cashbackRate || 10}% Cashback`,
          isOpen: store.isOpen ?? store.operationalInfo?.isOpen ?? true,
          activity: `${Math.floor(Math.random() * 20) + 5} people visited`,
          badge: store.isFeatured ? 'Featured' : store.isTrending ? 'Trending' : undefined,
          badgeColor: store.isFeatured ? '#F59E0B' : '#EF4444',
        }));

        return {
          success: true,
          data: {
            stores,
            pagination: response.data.pagination || response.meta?.pagination,
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching stores:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch stores',
      };
    }
  }

  /**
   * Search stores
   */
  async searchStores(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ stores: ExploreStore[]; pagination: any }>> {
    try {
      const response = await apiClient.get<any>('/stores/search', { q: query, ...params });

      if (response.success && response.data) {
        const stores = (response.data.stores || response.data || []).map((store: any) => ({
          id: store._id || store.id,
          name: store.name,
          category: store.category?.name || 'General',
          image: store.banner?.[0] || store.image || store.logo,
          rating: store.rating?.average || 4.0,
          reviews: store.rating?.count || 0,
          cashback: `${store.cashbackRate || 10}%`,
          isOpen: store.isOpen ?? true,
        }));

        return {
          success: true,
          data: { stores, pagination: response.data.pagination },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error searching stores:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get hot deals/trending products
   */
  async getHotDeals(params?: {
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ products: HotProduct[]; pagination: any }>> {
    try {
      const response = await apiClient.get<any>('/products/hot-deals', params);

      if (response.success && response.data) {
        const products = (response.data.products || response.data || []).map((product: any) => {
          // Determine the offer text
          let offer = 'Special Offer';
          if (product.cashbackPercentage && product.cashbackPercentage > 0) {
            offer = `${product.cashbackPercentage}% Cashback`;
          } else if (product.cashback?.percentage && product.cashback.percentage > 0) {
            offer = `${product.cashback.percentage}% Cashback`;
          } else if (product.discount && product.discount > 0) {
            offer = `${product.discount}% Off`;
          } else if (product.pricing?.discount && product.pricing.discount > 0) {
            offer = `Flat ${product.pricing.discount}% Off`;
          }

          return {
            id: product._id || product.id,
            name: product.name,
            store: product.store?.name || 'Unknown Store',
            storeId: product.store?._id || product.store?.id || product.storeId,
            image: product.image || product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/400',
            offer,
            distance: product.store?.city || '1.0 km',
            price: product.price || product.pricing?.selling || product.pricing?.salePrice || 0,
            originalPrice: product.originalPrice || product.pricing?.original || product.pricing?.basePrice || product.price || 0,
            rating: product.rating || product.ratings?.average || 4.0,
            reviews: product.reviewCount || product.ratings?.count || 0,
            buyers: product.soldCount || Math.floor(Math.random() * 100) + 10,
          };
        });

        return {
          success: true,
          data: {
            products,
            pagination: response.data.pagination || response.meta?.pagination,
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching hot deals:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(params?: {
    limit?: number;
    page?: number;
    days?: number;
  }): Promise<ApiResponse<{ products: HotProduct[]; pagination: any }>> {
    try {
      const response = await apiClient.get<any>('/products/trending', params);

      if (response.success && response.data) {
        const products = (response.data.products || response.data || []).map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          store: product.store?.name || 'Unknown Store',
          storeId: product.store?._id || product.storeId,
          image: product.images?.[0]?.url || product.image,
          offer: product.discount ? `${product.discount}% Off` : 'Trending',
          price: product.pricing?.salePrice || product.price || 0,
          originalPrice: product.pricing?.basePrice || product.originalPrice || 0,
          rating: product.ratings?.average || 4.0,
          reviews: product.ratings?.count || 0,
          buyers: product.soldCount || 0,
        }));

        return {
          success: true,
          data: { products, pagination: response.data.pagination },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching trending products:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all categories
   */
  async getCategories(params?: {
    type?: string;
    featured?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    try {
      const response = await apiClient.get<any>('/categories', params);

      if (response.success && response.data) {
        const categories = (response.data.categories || response.data || []).map((cat: any) => ({
          id: cat._id || cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          image: cat.image,
          storeCount: cat.storeCount,
          productCount: cat.productCount,
        }));

        return { success: true, data: categories };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching categories:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get category details by slug
   */
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category & { stores?: ExploreStore[] }>> {
    try {
      const response = await apiClient.get<any>(`/categories/${slug}`);

      if (response.success && response.data) {
        const category = response.data.category || response.data;
        return {
          success: true,
          data: {
            id: category._id || category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            image: category.image,
            storeCount: category.storeCount,
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching category:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get stores by category slug
   */
  async getStoresByCategory(slug: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<ApiResponse<{ stores: ExploreStore[]; pagination: any }>> {
    try {
      const response = await apiClient.get<any>(`/stores/by-category-slug/${slug}`, params);

      if (response.success && response.data) {
        const stores = (response.data.stores || response.data || []).map((store: any) => ({
          id: store._id || store.id,
          name: store.name,
          category: store.category?.name || 'General',
          image: store.banner?.[0] || store.image || store.logo,
          rating: store.rating?.average || 4.0,
          reviews: store.rating?.count || 0,
          cashback: `${store.cashbackRate || 10}%`,
          isOpen: store.isOpen ?? true,
        }));

        return {
          success: true,
          data: { stores, pagination: response.data.pagination },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching stores by category:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get nearby stores for map view
   */
  async getNearbyStores(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }): Promise<ApiResponse<NearbyStore[]>> {
    try {
      const response = await apiClient.get<any>('/stores/nearby', {
        lat: params.latitude,
        lng: params.longitude,
        radius: params.radius || 5,
        limit: params.limit || 20,
      });

      if (response.success && response.data) {
        const stores = (response.data.stores || response.data || []).map((store: any) => ({
          id: store._id || store.id,
          name: store.name,
          distance: store.distance ? `${store.distance.toFixed(1)} km` : 'Nearby',
          isLive: store.isOpen ?? true,
          status: store.isOpen ? 'Open' : 'Closed',
          waitTime: store.waitTime || '5-10 min',
          cashback: `${store.cashbackRate || 10}%`,
          closingSoon: store.closingSoon,
          location: {
            coordinates: store.location?.coordinates || [0, 0],
          },
        }));

        return { success: true, data: stores };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching nearby stores:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get trending stores
   */
  async getTrendingStores(params?: {
    limit?: number;
    page?: number;
    days?: number;
  }): Promise<ApiResponse<{ stores: ExploreStore[]; pagination: any }>> {
    try {
      const response = await apiClient.get<any>('/stores/trending', params);

      if (response.success && response.data) {
        const stores = (response.data.stores || response.data || []).map((store: any) => ({
          id: store._id || store.id,
          name: store.name,
          category: store.category?.name || 'General',
          image: store.banner?.[0] || store.image || store.logo,
          rating: store.rating?.average || 4.0,
          reviews: store.rating?.count || 0,
          cashback: `${store.cashbackRate || 10}%`,
          isOpen: store.isOpen ?? true,
          badge: 'Trending',
          badgeColor: '#EF4444',
        }));

        return {
          success: true,
          data: { stores, pagination: response.data.pagination },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching trending stores:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get personalized recommendations (Smart Picks)
   */
  async getSmartPicks(params?: {
    limit?: number;
    location?: string;
  }): Promise<ApiResponse<{ stores: ExploreStore[]; products: HotProduct[] }>> {
    try {
      const response = await apiClient.get<any>('/recommendations/personalized', params);

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            stores: response.data.stores || [],
            products: response.data.products || [],
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[EXPLORE API] Error fetching smart picks:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const exploreApi = new ExploreApiService();

export default exploreApi;
export { exploreApi };
