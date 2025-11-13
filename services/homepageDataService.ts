import productsService from './productsApi';
import storesService from './storesApi';
import eventsApiService from './eventsApi';
import realOffersApi from './realOffersApi';
import cacheService from './cacheService';
import { ProductItem, RecommendationItem, HomepageSection, EventItem } from '@/types/homepage.types';
import { getSectionById } from '@/data/homepageData';
import {
  getFallbackSectionData,
  getAllFallbackSections
} from '@/data/offlineFallbackData';

/**
 * Homepage Data Service
 * Handles fetching real data from backend with intelligent caching and offline support
 * Features:
 * - Stale-while-revalidate caching
 * - Offline fallback data
 * - TTL-based cache invalidation
 * - Smart cache warming
 */
class HomepageDataService {
  private backendAvailable: boolean | null = null;
  private lastBackendCheck: number = 0;
  private BACKEND_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private CACHE_TTL = 60 * 60 * 1000; // 1 hour cache TTL
  private STALE_TTL = 30 * 60 * 1000; // 30 minutes before considering stale

  /**
   * Check if backend is available (with caching)
   */
  private async checkBackendAvailability(): Promise<boolean> {
    const now = Date.now();

    // TEMPORARILY DISABLE CACHE for debugging - Use cached result if recent
    // if (this.backendAvailable !== null &&
    //     (now - this.lastBackendCheck) < this.BACKEND_CHECK_INTERVAL) {
    //   return this.backendAvailable;
    // }

    try {
      // Check both products and stores availability
      const productsAvailable = await productsService.isBackendAvailable();
      const storesAvailable = await storesService.isBackendAvailable();

      this.backendAvailable = productsAvailable && storesAvailable;
      this.lastBackendCheck = now;

      if (this.backendAvailable) {

      } else {

      }

      return this.backendAvailable;
    } catch (error) {
      console.warn('❌ Backend availability check failed:', error);
      this.backendAvailable = false;
      this.lastBackendCheck = now;
      return false;
    }
  }

  /**
   * Get cached data or fallback
   */
  private async getWithCacheAndFallback<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    fallbackData: T
  ): Promise<{ data: T; fromCache: boolean; isOffline: boolean }> {
    try {
      console.log(`📦 [HOMEPAGE SERVICE] getWithCacheAndFallback for ${cacheKey}`);

      // Try to get from cache first
      const cachedData = await cacheService.get<T>(cacheKey);

      if (cachedData) {
        console.log(`✅ [HOMEPAGE SERVICE] Found cached data for ${cacheKey}`, {
          isCachedDataArray: Array.isArray(cachedData),
          cachedDataLength: Array.isArray(cachedData) ? (cachedData as any[]).length : 'N/A'
        });

        // Try to refresh in background if backend is available
        const isBackendAvailable = await this.checkBackendAvailability();
        console.log(`🔍 [HOMEPAGE SERVICE] Backend availability for ${cacheKey}:`, isBackendAvailable);

        if (isBackendAvailable) {
          console.log(`🔄 [HOMEPAGE SERVICE] Starting background refresh for ${cacheKey}...`);
          // Background refresh (stale-while-revalidate)
          fetchFn()
            .then(async freshData => {
              console.log(`✅ [HOMEPAGE SERVICE] Background refresh succeeded for ${cacheKey}`);
              await cacheService.set(cacheKey, freshData, {
                ttl: this.CACHE_TTL,
                priority: 'high'
              });
            })
            .catch(error => {
              console.error(`❌ [HOMEPAGE SERVICE] Background refresh failed for ${cacheKey}:`, error);
            });
        } else {
          console.log(`⚠️ [HOMEPAGE SERVICE] Backend unavailable, skipping background refresh for ${cacheKey}`);
        }

        return { data: cachedData, fromCache: true, isOffline: false };
      }

      console.log(`ℹ️ [HOMEPAGE SERVICE] No cached data for ${cacheKey}, fetching from backend...`);

      // No cache, try to fetch from backend
      const isBackendAvailable = await this.checkBackendAvailability();
      console.log(`🔍 [HOMEPAGE SERVICE] Backend availability check for ${cacheKey}:`, isBackendAvailable);

      if (isBackendAvailable) {
        try {
          console.log(`📡 [HOMEPAGE SERVICE] Calling fetchFn for ${cacheKey}...`);
          const freshData = await fetchFn();
          console.log(`✅ [HOMEPAGE SERVICE] Successfully fetched fresh data for ${cacheKey}`, {
            isFreshDataArray: Array.isArray(freshData),
            freshDataLength: Array.isArray(freshData) ? (freshData as any[]).length : 'N/A'
          });

          // Cache the fresh data
          await cacheService.set(cacheKey, freshData, {
            ttl: this.CACHE_TTL,
            priority: 'high'
          });
          console.log(`✅ [HOMEPAGE SERVICE] Cached fresh data for ${cacheKey}`);

          return { data: freshData, fromCache: false, isOffline: false };
        } catch (error) {
          console.error(`❌ [HOMEPAGE SERVICE] Failed to fetch data for ${cacheKey}:`, error);
          console.error(`Error details:`, error instanceof Error ? error.message : String(error));
          console.log(`🔄 [HOMEPAGE SERVICE] Falling back to fallback data for ${cacheKey}`);
          // Fall through to use fallback data
        }
      } else {
        console.log(`⚠️ [HOMEPAGE SERVICE] Backend unavailable for ${cacheKey}, using fallback data`);
      }

      // Backend unavailable or fetch failed, use fallback data
      console.log(`📦 [HOMEPAGE SERVICE] Using fallback data for ${cacheKey}`, {
        isFallbackArray: Array.isArray(fallbackData),
        fallbackLength: Array.isArray(fallbackData) ? (fallbackData as any[]).length : 'N/A'
      });

      return { data: fallbackData, fromCache: false, isOffline: true };

    } catch (error) {
      console.error(`❌ [HOMEPAGE SERVICE] Error in getWithCacheAndFallback for ${cacheKey}:`, error);
      console.log(`📦 [HOMEPAGE SERVICE] Returning fallback data for ${cacheKey} due to exception`);
      return { data: fallbackData, fromCache: false, isOffline: true };
    }
  }

  /**
   * Get "Just for You" section data (Featured Products as Recommendations)
   */
  async getJustForYouSection(): Promise<HomepageSection> {

    const sectionTemplate = getSectionById('just_for_you');
    const fallbackSection = getFallbackSectionData('just_for_you');

    if (!sectionTemplate) {
      console.error('❌ [HOMEPAGE SERVICE] Just for you section template not found');
      // Return fallback if template not found
      return fallbackSection || {
        id: 'just_for_you',
        title: 'Just for you',
        type: 'recommendations',
        showViewAll: false,
        isHorizontalScroll: true,
        items: [],
        loading: false,
        error: 'Section configuration not found',
        lastUpdated: new Date().toISOString(),
        refreshable: true,
        priority: 2
      };
    }

    const cacheKey = 'homepage_just_for_you';

    const { data: recommendations, fromCache, isOffline } = await this.getWithCacheAndFallback(
      cacheKey,
      async () => {
        const items = await productsService.getFeaturedForHomepage(20);
        return items;
      },
      fallbackSection?.items || []
    );
    
    // Use real backend data, no fallbacks (unless offline)
    const result: HomepageSection = {
      ...sectionTemplate,
      items: recommendations,
      lastUpdated: new Date().toISOString(),
      loading: false,
      error: isOffline ? 'Showing offline data' : null
    };

    return result;
  }

  /**
   * Get "New Arrivals" section data
   */
  async getNewArrivalsSection(): Promise<HomepageSection> {

    const sectionTemplate = getSectionById('new_arrivals');
    const fallbackSection = getFallbackSectionData('new_arrivals');

    if (!sectionTemplate) {
      console.error('❌ [HOMEPAGE SERVICE] New arrivals section template not found');
      return fallbackSection || {
        id: 'new_arrivals',
        title: 'New Arrivals',
        type: 'products',
        showViewAll: false,
        isHorizontalScroll: true,
        items: [],
        loading: false,
        error: 'Section configuration not found',
        lastUpdated: new Date().toISOString(),
        refreshable: true,
        priority: 6
      };
    }

    const cacheKey = 'homepage_new_arrivals';

    const { data: newArrivals, fromCache, isOffline } = await this.getWithCacheAndFallback(
      cacheKey,
      async () => {
        const items = await productsService.getNewArrivalsForHomepage(20);
        return items;
      },
      fallbackSection?.items || []
    );
    
    // Use real backend data, no fallbacks (unless offline)
    const result: HomepageSection = {
      ...sectionTemplate,
      items: newArrivals,
      lastUpdated: new Date().toISOString(),
      loading: false,
      error: isOffline ? 'Showing offline data' : null
    };

    return result;
  }

  /**
   * Get product details for StorePage
   */
  async getProductForStorePage(productId: string): Promise<ProductItem | null> {
    try {
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {
        // Check if this is a dummy ID (starts with rec_, product_arrival_, etc.)
        const isDummyId = productId.startsWith('rec_') || 
                         productId.startsWith('product_arrival_') || 
                         productId.length < 24; // MongoDB ObjectIds are 24 characters
        
        if (isDummyId) {

          return null; // Don't attempt to fetch dummy IDs from backend
        }

        const productDetails = await productsService.getProductDetails(productId);
        
        if (productDetails) {
          return productDetails;
        }
      }

      return null;

    } catch (error) {
      console.error(`❌ Error fetching product ${productId}:`, error);
      return null;
    }
  }

  /**
   * Get store products for StorePage
   */
  async getStoreProductsForStorePage(
    storeId: string,
    options?: {
      category?: string;
      sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest';
      limit?: number;
    }
  ): Promise<{ store: any; products: ProductItem[] } | null> {
    try {
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {

        const storeData = await productsService.getStoreProducts(storeId, options);
        
        if (storeData) {
          return storeData;
        }
      }

      return null;

    } catch (error) {
      console.error(`❌ Error fetching store ${storeId} products:`, error);
      return null;
    }
  }

  /**
   * Force refresh backend availability check
   */
  async refreshBackendStatus(): Promise<boolean> {
    this.backendAvailable = null;
    this.lastBackendCheck = 0;
    return await this.checkBackendAvailability();
  }

  /**
   * Get "Trending Stores" section data
   */
  async getTrendingStoresSection(): Promise<HomepageSection> {

    const sectionTemplate = getSectionById('trending_stores');
    const fallbackSection = getFallbackSectionData('trending_stores');

    if (!sectionTemplate) {
      console.error('❌ [HOMEPAGE SERVICE] Trending stores section template not found');
      return fallbackSection || {
        id: 'trending_stores',
        title: 'Trending Stores',
        type: 'stores',
        showViewAll: false,
        isHorizontalScroll: true,
        items: [],
        loading: false,
        error: 'Section configuration not found',
        lastUpdated: new Date().toISOString(),
        refreshable: true,
        priority: 3
      };
    }

    const cacheKey = 'homepage_trending_stores';

    console.log('🏪 [HOMEPAGE SERVICE] Fetching trending stores section...');

    const { data: trendingStores, fromCache, isOffline } = await this.getWithCacheAndFallback(
      cacheKey,
      async () => {
        const items = await storesService.getFeaturedForHomepage(15);
        return items;
      },
      fallbackSection?.items || []
    );

    console.log('📊 [HOMEPAGE SERVICE] Trending stores result:', {
      count: trendingStores.length,
      fromCache,
      isOffline,
      usingFallback: trendingStores === (fallbackSection?.items || []),
      firstStoreId: trendingStores[0]?.id,
      firstStoreName: trendingStores[0]?.name
    });

    if (trendingStores.length > 0) {
      const firstStore = trendingStores[0];
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(firstStore.id);
      console.log(`🔍 [HOMEPAGE SERVICE] First store ID check: "${firstStore.id}" is ${isObjectId ? 'REAL ObjectId ✅' : 'MOCK String ID ❌'}`);

      if (!isObjectId) {
        console.warn('⚠️ [HOMEPAGE SERVICE] WARNING: Using mock data with fake string IDs!');
        console.warn('This means the backend API call failed or returned no data.');
        console.warn('Check the API logs above for errors.');
      } else {
        console.log('✅ [HOMEPAGE SERVICE] Using REAL backend data with ObjectIds!');
      }
    } else {
      console.warn('⚠️ [HOMEPAGE SERVICE] No trending stores returned (empty array)');
    }

    // Use real backend data, no fallbacks (unless offline)
    const result: HomepageSection = {
      ...sectionTemplate,
      items: trendingStores,
      lastUpdated: new Date().toISOString(),
      loading: false,
      error: isOffline ? 'Showing offline data' : null
    };

    return result;
  }

  /**
   * Get "Events" section data
   */
  async getEventsSection(): Promise<HomepageSection> {

    const sectionTemplate = getSectionById('events');
    const fallbackSection = getFallbackSectionData('events');

    if (!sectionTemplate) {
      console.error('❌ [HOMEPAGE SERVICE] Events section template not found');
      return fallbackSection || {
        id: 'events',
        title: 'Events',
        type: 'events',
        showViewAll: false,
        isHorizontalScroll: true,
        items: [],
        loading: false,
        error: 'Section configuration not found',
        lastUpdated: new Date().toISOString(),
        refreshable: true,
        priority: 1
      };
    }

    const cacheKey = 'homepage_events';

    const { data: events, fromCache, isOffline } = await this.getWithCacheAndFallback(
      cacheKey,
      async () => {
        const items = await eventsApiService.getFeaturedEvents(10);
        return items;
      },
      fallbackSection?.items || []
    );
    
    // Use real backend data, no fallbacks (unless offline)
    const result: HomepageSection = {
      ...sectionTemplate,
      items: events,
      lastUpdated: new Date().toISOString(),
      loading: false,
      error: isOffline ? 'Showing offline data' : null
    };

    return result;
  }

  /**
   * Get "Offers" section data
   */
  async getOffersSection(): Promise<HomepageSection> {

    const sectionTemplate = getSectionById('offers');

    // Create default template if doesn't exist
    const defaultTemplate: HomepageSection = {
      id: 'offers',
      title: 'Special Offers',
      type: 'products',
      items: [],
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
      refreshable: true,
      showViewAll: true,
      isHorizontalScroll: true,
      priority: 4
    };

    const template = sectionTemplate || defaultTemplate;

    try {
      const isBackendAvailable = await this.checkBackendAvailability();

      if (isBackendAvailable) {

        try {
          const response = await realOffersApi.getOffers({
            featured: true,
            limit: 10
          });

          if (response.success && response.data) {
            const offers = response.data.items || [];

            // Transform offers to homepage format
            const transformedItems = offers.map(offer => ({
              id: offer._id,
              type: 'product' as const,
              title: offer.title,
              name: offer.title,
              description: offer.description || offer.subtitle,
              image: offer.image,
              price: {
                current: offer.discountedPrice || 0,
                original: offer.originalPrice || 0,
                currency: '₹',
                discount: offer.cashbackPercentage || 0
              },
              store: offer.store,
              category: offer.category,
              validity: offer.validity,
              cashback: offer.cashbackPercentage
            })) as unknown as ProductItem[];

            return {
              ...template,
              items: transformedItems,
              lastUpdated: new Date().toISOString(),
              loading: false,
              error: null
            };
          }
        } catch (error) {
          console.error('❌ [HOMEPAGE SERVICE] Error fetching offers from backend:', error);
          throw error;
        }
      }

      // If backend is not available, return empty with error message

      return {
        ...template,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: 'Unable to connect to server. Please check your connection.'
      };

    } catch (error) {
      console.error('❌ Error fetching Offers section:', error);

      return {
        ...template,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load offers'
      };
    }
  }

  /**
   * Get "Flash Sales" section data
   */
  async getFlashSalesSection(): Promise<HomepageSection> {

    const sectionTemplate = getSectionById('flash_sales');

    // Create default template if doesn't exist
    const defaultTemplate: HomepageSection = {
      id: 'flash_sales',
      title: 'Flash Sales',
      type: 'products',
      items: [],
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
      refreshable: true,
      showViewAll: true,
      isHorizontalScroll: true,
      priority: 5
    };

    const template = sectionTemplate || defaultTemplate;

    try {
      const isBackendAvailable = await this.checkBackendAvailability();

      if (isBackendAvailable) {

        try {
          // Get offers with flash sale metadata
          const response = await realOffersApi.getOffers({
            featured: true,
            limit: 10
          });

          if (response.success && response.data) {
            // Filter for flash sale offers
            const flashSales = response.data.items.filter(offer =>
              offer.metadata?.flashSale?.isActive
            ) || [];

            // Transform flash sales to homepage format
            const transformedItems = flashSales.map(offer => ({
              id: offer._id,
              type: 'product' as const,
              title: offer.title,
              name: offer.title,
              description: offer.description || offer.subtitle,
              image: offer.image,
              price: {
                current: offer.metadata?.flashSale?.salePrice || offer.discountedPrice || 0,
                original: offer.metadata?.flashSale?.originalPrice || offer.originalPrice || 0,
                currency: '₹',
                discount: Math.round(((offer.metadata?.flashSale?.originalPrice || offer.originalPrice || 0) -
                  (offer.metadata?.flashSale?.salePrice || offer.discountedPrice || 0)) /
                  (offer.metadata?.flashSale?.originalPrice || offer.originalPrice || 1) * 100)
              },
              store: offer.store,
              category: offer.category,
              validity: offer.validity,
            })) as unknown as ProductItem[];

            return {
              ...template,
              items: transformedItems,
              lastUpdated: new Date().toISOString(),
              loading: false,
              error: null
            };
          }
        } catch (error) {
          console.error('❌ [HOMEPAGE SERVICE] Error fetching flash sales from backend:', error);
          throw error;
        }
      }

      // If backend is not available, return empty with error message

      return {
        ...template,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: 'Unable to connect to server. Please check your connection.'
      };

    } catch (error) {
      console.error('❌ Error fetching Flash Sales section:', error);

      return {
        ...template,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load flash sales'
      };
    }
  }

  /**
   * Get current backend status
   */
  getBackendStatus(): {
    available: boolean | null;
    lastChecked: Date | null;
    nextCheck: Date | null;
  } {
    return {
      available: this.backendAvailable,
      lastChecked: this.lastBackendCheck > 0 ? new Date(this.lastBackendCheck) : null,
      nextCheck: this.lastBackendCheck > 0
        ? new Date(this.lastBackendCheck + this.BACKEND_CHECK_INTERVAL)
        : null
    };
  }

  /**
   * Warm cache with all homepage sections
   * Call this on app launch or when network becomes available
   */
  async warmCache(): Promise<void> {

    try {
      const sections = ['just_for_you', 'new_arrivals', 'trending_stores', 'events'];

      await Promise.allSettled(
        sections.map(async (sectionId) => {
          switch (sectionId) {
            case 'just_for_you':
              return this.getJustForYouSection();
            case 'new_arrivals':
              return this.getNewArrivalsSection();
            case 'trending_stores':
              return this.getTrendingStoresSection();
            case 'events':
              return this.getEventsSection();
          }
        })
      );
    } catch (error) {
      console.error('❌ [HOMEPAGE SERVICE] Cache warming failed:', error);
    }
  }

  /**
   * Clear all homepage cache
   */
  async clearCache(): Promise<void> {

    try {
      const keys = [
        'homepage_just_for_you',
        'homepage_new_arrivals',
        'homepage_trending_stores',
        'homepage_events',
        'homepage_offers',
        'homepage_flash_sales'
      ];

      await Promise.all(keys.map(key => cacheService.remove(key)));

    } catch (error) {
      console.error('❌ [HOMEPAGE SERVICE] Failed to clear homepage cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await cacheService.getStats();
  }

  /**
   * Force refresh all sections (bypasses cache)
   */
  async forceRefreshAll(): Promise<void> {

    await this.clearCache();
    await this.warmCache();
  }
}

// Create singleton instance
const homepageDataService = new HomepageDataService();

export default homepageDataService;
export { HomepageDataService };