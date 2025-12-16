/**
 * Mall API Service
 *
 * API integration layer for ReZ Mall feature
 */

import { apiClient } from '../config/api';
import {
  MallBrand,
  MallCategory,
  MallCollection,
  MallOffer,
  MallBanner,
  MallHomepageData,
  MallApiResponse,
  MallBrandFilters
} from '../types/mall.types';

// API endpoints
const MALL_ENDPOINTS = {
  HOMEPAGE: '/mall/homepage',
  BRANDS: '/mall/brands',
  BRANDS_FEATURED: '/mall/brands/featured',
  BRANDS_NEW: '/mall/brands/new',
  BRANDS_TOP_RATED: '/mall/brands/top-rated',
  BRANDS_LUXURY: '/mall/brands/luxury',
  BRANDS_SEARCH: '/mall/brands/search',
  CATEGORIES: '/mall/categories',
  COLLECTIONS: '/mall/collections',
  OFFERS: '/mall/offers',
  OFFERS_EXCLUSIVE: '/mall/offers/exclusive',
  BANNERS: '/mall/banners',
  BANNERS_HERO: '/mall/banners/hero',
  // Affiliate tracking endpoints (legacy - use Cash Store instead)
  AFFILIATE_CLICK: '/mall/affiliate/click',
  AFFILIATE_CLICKS: '/mall/affiliate/clicks',
  AFFILIATE_PURCHASES: '/mall/affiliate/purchases',
  AFFILIATE_SUMMARY: '/mall/affiliate/summary',
  // Store-based mall endpoints (in-app delivery marketplace)
  STORES_HOMEPAGE: '/mall/stores/homepage',
  STORES: '/mall/stores',
  STORES_FEATURED: '/mall/stores/featured',
  STORES_NEW: '/mall/stores/new',
  STORES_TOP_RATED: '/mall/stores/top-rated',
  STORES_PREMIUM: '/mall/stores/premium',
  STORES_SEARCH: '/mall/stores/search',
  STORES_CATEGORIES: '/mall/stores/categories',
};

class MallApiService {
  /**
   * Get aggregated mall homepage data
   */
  async getMallHomepage(): Promise<MallHomepageData> {
    try {
      const response = await apiClient.get<MallApiResponse<MallHomepageData>>(
        MALL_ENDPOINTS.HOMEPAGE
      );
      return response.data.data || {
        banners: [],
        featuredBrands: [],
        collections: [],
        categories: [],
        exclusiveOffers: [],
        newArrivals: [],
        topRatedBrands: [],
        luxuryBrands: []
      };
    } catch (error) {
      console.error('Error fetching mall homepage:', error);
      throw error;
    }
  }

  /**
   * Get all brands with filters
   */
  async getBrands(filters?: MallBrandFilters): Promise<{
    brands: MallBrand[];
    total: number;
    pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.tier) params.append('tier', filters.tier);
      if (filters?.collection) params.append('collection', filters.collection);
      if (filters?.minCashback) params.append('minCashback', filters.minCashback.toString());
      if (filters?.badges) params.append('badges', filters.badges.join(','));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<MallApiResponse<MallBrand[]>>(
        `${MALL_ENDPOINTS.BRANDS}?${params.toString()}`
      );

      return {
        brands: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0,
        pages: response.data.meta?.pagination?.pages || 0
      };
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Get brand by ID
   */
  async getBrandById(brandId: string): Promise<MallBrand | null> {
    try {
      const response = await apiClient.get<MallApiResponse<MallBrand>>(
        `${MALL_ENDPOINTS.BRANDS}/${brandId}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching brand:', error);
      throw error;
    }
  }

  /**
   * Get featured brands
   */
  async getFeaturedBrands(limit: number = 10): Promise<MallBrand[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallBrand[]>>(
        `${MALL_ENDPOINTS.BRANDS_FEATURED}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching featured brands:', error);
      throw error;
    }
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 10): Promise<MallBrand[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallBrand[]>>(
        `${MALL_ENDPOINTS.BRANDS_NEW}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  }

  /**
   * Get top rated brands
   */
  async getTopRatedBrands(limit: number = 10): Promise<MallBrand[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallBrand[]>>(
        `${MALL_ENDPOINTS.BRANDS_TOP_RATED}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching top rated brands:', error);
      throw error;
    }
  }

  /**
   * Get luxury brands
   */
  async getLuxuryBrands(limit: number = 10): Promise<MallBrand[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallBrand[]>>(
        `${MALL_ENDPOINTS.BRANDS_LUXURY}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching luxury brands:', error);
      throw error;
    }
  }

  /**
   * Search brands
   */
  async searchBrands(query: string, limit: number = 20): Promise<MallBrand[]> {
    try {
      if (!query || query.length < 2) return [];

      const response = await apiClient.get<MallApiResponse<MallBrand[]>>(
        `${MALL_ENDPOINTS.BRANDS_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<MallCategory[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallCategory[]>>(
        MALL_ENDPOINTS.CATEGORIES
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get brands by category
   */
  async getBrandsByCategory(
    categorySlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    category: MallCategory | null;
    brands: MallBrand[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<{
        category: MallCategory;
        brands: MallBrand[];
      }>>(
        `${MALL_ENDPOINTS.CATEGORIES}/${categorySlug}/brands?page=${page}&limit=${limit}`
      );

      return {
        category: response.data.data?.category || null,
        brands: response.data.data?.brands || [],
        total: response.data.meta?.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching brands by category:', error);
      throw error;
    }
  }

  /**
   * Get all collections
   */
  async getCollections(limit: number = 10): Promise<MallCollection[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallCollection[]>>(
        `${MALL_ENDPOINTS.COLLECTIONS}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  }

  /**
   * Get brands by collection
   */
  async getBrandsByCollection(
    collectionSlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    collection: MallCollection | null;
    brands: MallBrand[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<{
        collection: MallCollection;
        brands: MallBrand[];
      }>>(
        `${MALL_ENDPOINTS.COLLECTIONS}/${collectionSlug}/brands?page=${page}&limit=${limit}`
      );

      return {
        collection: response.data.data?.collection || null,
        brands: response.data.data?.brands || [],
        total: response.data.meta?.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching brands by collection:', error);
      throw error;
    }
  }

  /**
   * Get exclusive offers
   */
  async getExclusiveOffers(limit: number = 10): Promise<MallOffer[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallOffer[]>>(
        `${MALL_ENDPOINTS.OFFERS_EXCLUSIVE}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching exclusive offers:', error);
      throw error;
    }
  }

  /**
   * Get all offers
   */
  async getOffers(page: number = 1, limit: number = 20): Promise<{
    offers: MallOffer[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<MallOffer[]>>(
        `${MALL_ENDPOINTS.OFFERS}?page=${page}&limit=${limit}`
      );

      return {
        offers: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  }

  /**
   * Get hero banners
   */
  async getHeroBanners(limit: number = 5): Promise<MallBanner[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallBanner[]>>(
        `${MALL_ENDPOINTS.BANNERS_HERO}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching hero banners:', error);
      throw error;
    }
  }

  /**
   * Get all banners
   */
  async getBanners(): Promise<MallBanner[]> {
    try {
      const response = await apiClient.get<MallApiResponse<MallBanner[]>>(
        MALL_ENDPOINTS.BANNERS
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }

  /**
   * Track brand click for affiliate cashback tracking
   * Returns tracking URL to redirect user through
   */
  async trackAffiliateClick(brandId: string): Promise<{
    clickId: string;
    trackingUrl: string;
    brand: { name: string; cashback: number };
  } | null> {
    try {
      const response = await apiClient.post<MallApiResponse<{
        clickId: string;
        trackingUrl: string;
        brand: { name: string; cashback: number };
      }>>(MALL_ENDPOINTS.AFFILIATE_CLICK, { brandId });
      return response.data.data || null;
    } catch (error) {
      console.warn('Failed to track affiliate click:', error);
      return null;
    }
  }

  /**
   * Track brand click (legacy - for view tracking only)
   */
  async trackBrandClick(brandId: string): Promise<void> {
    try {
      await apiClient.post(`${MALL_ENDPOINTS.BRANDS}/${brandId}/click`);
    } catch (error) {
      // Silently fail for analytics tracking
      console.warn('Failed to track brand click:', error);
    }
  }

  /**
   * Track brand purchase
   */
  async trackBrandPurchase(brandId: string, cashbackAmount: number = 0): Promise<void> {
    try {
      await apiClient.post(`${MALL_ENDPOINTS.BRANDS}/${brandId}/purchase`, {
        cashbackAmount
      });
    } catch (error) {
      console.warn('Failed to track brand purchase:', error);
    }
  }

  /**
   * Get user's click history
   */
  async getUserClicks(page: number = 1, limit: number = 20): Promise<{
    clicks: any[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.AFFILIATE_CLICKS}?page=${page}&limit=${limit}`
      );
      return {
        clicks: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0,
        pages: response.data.meta?.pagination?.pages || 0
      };
    } catch (error) {
      console.error('Error fetching user clicks:', error);
      throw error;
    }
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchases(page: number = 1, limit: number = 20): Promise<{
    purchases: any[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.AFFILIATE_PURCHASES}?page=${page}&limit=${limit}`
      );
      return {
        purchases: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0,
        pages: response.data.meta?.pagination?.pages || 0
      };
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      throw error;
    }
  }

  /**
   * Get user's cashback summary
   */
  async getCashbackSummary(): Promise<{
    totalEarned: number;
    pending: number;
    credited: number;
    totalClicks: number;
    totalPurchases: number;
    conversionRate: number;
    recentActivity: any[];
  } | null> {
    try {
      const response = await apiClient.get<MallApiResponse<{
        totalEarned: number;
        pending: number;
        credited: number;
        totalClicks: number;
        totalPurchases: number;
        conversionRate: number;
        recentActivity: any[];
      }>>(MALL_ENDPOINTS.AFFILIATE_SUMMARY);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching cashback summary:', error);
      return null;
    }
  }

  // ==================== STORE-BASED MALL METHODS ====================
  // These methods fetch from Store model where deliveryCategories.mall === true
  // For the in-app delivery marketplace (users earn ReZ Coins)

  /**
   * Get mall stores homepage data
   * Returns featured, new, top-rated, and premium stores
   */
  async getMallStoresHomepage(): Promise<{
    featuredStores: any[];
    newStores: any[];
    topRatedStores: any[];
    premiumStores: any[];
    categories: any[];
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<{
        featuredStores: any[];
        newStores: any[];
        topRatedStores: any[];
        premiumStores: any[];
        categories: any[];
      }>>(MALL_ENDPOINTS.STORES_HOMEPAGE);
      return response.data.data || {
        featuredStores: [],
        newStores: [],
        topRatedStores: [],
        premiumStores: [],
        categories: [],
      };
    } catch (error) {
      console.error('Error fetching mall stores homepage:', error);
      throw error;
    }
  }

  /**
   * Get all mall stores with filters
   */
  async getMallStores(filters?: {
    category?: string;
    premium?: boolean;
    minCoinReward?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    stores: any[];
    total: number;
    pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.premium) params.append('premium', 'true');
      if (filters?.minCoinReward) params.append('minCoinReward', filters.minCoinReward.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.STORES}?${params.toString()}`
      );

      return {
        stores: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0,
        pages: response.data.meta?.pagination?.pages || 0,
      };
    } catch (error) {
      console.error('Error fetching mall stores:', error);
      throw error;
    }
  }

  /**
   * Get featured mall stores
   */
  async getFeaturedMallStores(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.STORES_FEATURED}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching featured mall stores:', error);
      throw error;
    }
  }

  /**
   * Get new mall stores
   */
  async getNewMallStores(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.STORES_NEW}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching new mall stores:', error);
      throw error;
    }
  }

  /**
   * Get top rated mall stores
   */
  async getTopRatedMallStores(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.STORES_TOP_RATED}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching top rated mall stores:', error);
      throw error;
    }
  }

  /**
   * Get premium mall stores
   */
  async getPremiumMallStores(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.STORES_PREMIUM}?limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching premium mall stores:', error);
      throw error;
    }
  }

  /**
   * Search mall stores
   */
  async searchMallStores(query: string, limit: number = 20): Promise<any[]> {
    try {
      if (!query || query.length < 2) return [];

      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.STORES_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching mall stores:', error);
      throw error;
    }
  }

  /**
   * Get mall store categories
   */
  async getMallStoreCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        MALL_ENDPOINTS.STORES_CATEGORIES
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching mall store categories:', error);
      throw error;
    }
  }

  /**
   * Get mall store by ID
   */
  async getMallStoreById(storeId: string): Promise<any | null> {
    try {
      const response = await apiClient.get<MallApiResponse<any>>(
        `${MALL_ENDPOINTS.STORES}/${storeId}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching mall store:', error);
      throw error;
    }
  }

  /**
   * Get mall stores by category
   */
  async getMallStoresByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    stores: any[];
    total: number;
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<any[]>>(
        `${MALL_ENDPOINTS.STORES}/category/${categoryId}?page=${page}&limit=${limit}`
      );

      return {
        stores: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0,
      };
    } catch (error) {
      console.error('Error fetching mall stores by category:', error);
      throw error;
    }
  }

  /**
   * Get mall stores by category slug
   * Used by frontend category pages that use slug in URL
   */
  async getMallStoresByCategorySlug(
    categorySlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    category: any;
    stores: any[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await apiClient.get<MallApiResponse<{
        category: any;
        stores: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>>(`${MALL_ENDPOINTS.STORES}/category-slug/${categorySlug}?page=${page}&limit=${limit}`);

      const data = response.data.data;
      return {
        category: data?.category || null,
        stores: data?.stores || [],
        total: data?.pagination?.total || 0,
        pages: data?.pagination?.pages || 0,
      };
    } catch (error) {
      console.error('Error fetching mall stores by category slug:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mallApi = new MallApiService();
export default mallApi;
