import productsService from './productsApi';
import storesService from './storesApi';
import eventsApiService from './eventsApi';
import realOffersApi from './realOffersApi';
import brandApiService from './brandApi';
import cacheService from './cacheService';
import locationService from './locationService';
import recommendationService from './recommendationApi';
import { ProductItem, RecommendationItem, HomepageSection, EventItem, HomepageBatchResponse } from '@/types/homepage.types';
import { getSectionById } from '@/data/homepageData';
import {
  getFallbackSectionData,
  getAllFallbackSections
} from '@/data/offlineFallbackData';
import HomepageApiService from './homepageApi';

/**
 * Homepage Data Service
 * Handles fetching real data from backend with intelligent caching and offline support
 * Features:
 * - Stale-while-revalidate caching
 * - Offline fallback data
 * - TTL-based cache invalidation
 * - Smart cache warming
 * - NEW: Batch endpoint support with feature flag
 */
class HomepageDataService {
  private backendAvailable: boolean | null = null;
  private lastBackendCheck: number = 0;
  private BACKEND_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private CACHE_TTL = 60 * 60 * 1000; // 1 hour cache TTL
  private STALE_TTL = 30 * 60 * 1000; // 30 minutes before considering stale

  // FEATURE FLAG: Enable/disable batch endpoint
  // OPTIMIZATION: Enable in production to reduce API calls from 6 to 1
  private USE_BATCH_ENDPOINT = true; // Enabled for performance

  // Performance metrics
  private performanceMetrics = {
    batchCalls: 0,
    individualCalls: 0,
    batchSuccesses: 0,
    batchFailures: 0,
    avgBatchTime: 0,
    avgIndividualTime: 0
  };

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
      // Try to get from cache first
      const cachedData = await cacheService.get<T>(cacheKey);

      if (cachedData) {
        // Try to refresh in background if backend is available
        const isBackendAvailable = await this.checkBackendAvailability();

        if (isBackendAvailable) {
          // Background refresh (stale-while-revalidate)
          fetchFn()
            .then(async freshData => {
              await cacheService.set(cacheKey, freshData, {
                ttl: this.CACHE_TTL,
                priority: 'high'
              });
            })
            .catch(error => {
              console.error(`Background refresh failed for ${cacheKey}:`, error);
            });
        }

        return { data: cachedData, fromCache: true, isOffline: false };
      }

      // No cache, try to fetch from backend
      const isBackendAvailable = await this.checkBackendAvailability();

      if (isBackendAvailable) {
        try {
          const freshData = await fetchFn();

          // Cache the fresh data
          await cacheService.set(cacheKey, freshData, {
            ttl: this.CACHE_TTL,
            priority: 'high'
          });

          return { data: freshData, fromCache: false, isOffline: false };
        } catch (error) {
          console.error(`Failed to fetch ${cacheKey}:`, error);
          // Fall through to use fallback data
        }
      }

      // Backend unavailable or fetch failed, use fallback data
      return { data: fallbackData, fromCache: false, isOffline: true };

    } catch (error) {
      console.error(`Error in getWithCacheAndFallback for ${cacheKey}:`, error);
      return { data: fallbackData, fromCache: false, isOffline: true };
    }
  }

  /**
   * Get "Just for You" section data (Location-Aware Personalized Recommendations)
   * Uses hybrid approach: mix of nearby products + general recommendations
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

    // Try to get user location for location-aware recommendations
    let userLocation: { latitude: number; longitude: number } | undefined;
    try {
      const cachedLocation = await locationService.getCachedLocation();
      if (cachedLocation?.coordinates) {
        userLocation = cachedLocation.coordinates;
      }
    } catch (error) {
      // Location not available, will use general recommendations
    }

    const { data: recommendations, fromCache, isOffline } = await this.getWithCacheAndFallback(
      cacheKey,
      async () => {
        // Try location-aware recommendations first
        if (userLocation) {
          try {
            const pickedForYouResponse = await recommendationService.getPickedForYou(20, userLocation);
            if (pickedForYouResponse.success && pickedForYouResponse.data?.recommendations?.length > 0) {
              // Transform recommendations to ProductItem format
              return pickedForYouResponse.data.recommendations.map((rec: any) => ({
                ...rec,
                recommendationReason: rec.recommendationReason || 'Recommended for you',
                recommendationScore: rec.recommendationScore || 0.85,
              }));
            }
          } catch (error) {
            // Fall through to featured products
          }
        }

        // Fallback: Get featured products without location
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

    if (!sectionTemplate) {
      return {
        id: 'new_arrivals',
        title: 'New Arrivals',
        type: 'products',
        showViewAll: false,
        isHorizontalScroll: true,
        items: [],
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
        refreshable: true,
        priority: 6
      };
    }

    const cacheKey = 'homepage_new_arrivals';

    try {
      // Try to get from cache first
      const cachedData = await cacheService.get<ProductItem[]>(cacheKey);
      
      if (cachedData && cachedData.length > 0) {
        // Try to refresh in background if backend is available
        const isBackendAvailable = await this.checkBackendAvailability();
        
        if (isBackendAvailable) {
          // Background refresh (stale-while-revalidate)
          productsService.getNewArrivalsForHomepage(20)
            .then(async freshData => {
              if (freshData && freshData.length > 0) {
                await cacheService.set(cacheKey, freshData, {
                  ttl: this.CACHE_TTL,
                  priority: 'high'
                });
              }
            })
            .catch(() => {
              // Silently fail background refresh
            });
        }
        
        return {
          ...sectionTemplate,
          items: cachedData,
          lastUpdated: new Date().toISOString(),
          loading: false,
          error: null
        };
      }

      // No cache, try to fetch from backend
      const isBackendAvailable = await this.checkBackendAvailability();
      
      if (isBackendAvailable) {
        try {
          const freshData = await productsService.getNewArrivalsForHomepage(20);
          
          // Only cache and return if we have real data
          if (freshData && freshData.length > 0) {
            await cacheService.set(cacheKey, freshData, {
              ttl: this.CACHE_TTL,
              priority: 'high'
            });
            
            return {
              ...sectionTemplate,
              items: freshData,
              lastUpdated: new Date().toISOString(),
              loading: false,
              error: null
            };
          }
        } catch (error) {
          // Silently fail - return empty section
        }
      }
      
      // No data available - return empty section (will be filtered out)
      return {
        ...sectionTemplate,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null
      };
    } catch (error) {
      // Return empty section on error (will be filtered out)
      return {
        ...sectionTemplate,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null
      };
    }
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

    const { data: trendingStores, fromCache, isOffline } = await this.getWithCacheAndFallback(
      cacheKey,
      async () => {
        const items = await storesService.getFeaturedForHomepage(15);
        return items;
      },
      fallbackSection?.items || []
    );

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
        // Get events from today onwards (includes today's events even if time passed)
        const result = await eventsApiService.getEvents({ todayAndFuture: true }, 10, 0);
        return result.events;
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

          if (response.success && response.data && response.data.items) {
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

          if (response.success && response.data && response.data.items) {
            // Filter for flash sale offers
            const flashSales = response.data.items.filter(offer =>
              offer.metadata?.flashSale?.isActive
            );

            // Transform flash sales to homepage format
            const transformedItems = (flashSales || []).map(offer => ({
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
   * Get "Brand Partnerships" section data
   */
  async getBrandPartnershipsSection(): Promise<HomepageSection> {
    const sectionTemplate = getSectionById('brand_partnerships') || {
      id: 'brand_partnerships',
      title: 'Brand Partnerships',
      type: 'brands',
      showViewAll: false,
      isHorizontalScroll: false,
      priority: 7
    };

    const cacheKey = 'homepage_brand_partnerships';

    try {
      const isBackendAvailable = await this.checkBackendAvailability();

      if (isBackendAvailable) {
        try {
          const brands = await brandApiService.getFeaturedBrands(6);

          if (brands && brands.length > 0) {
            // Cache the data
            await cacheService.set(cacheKey, brands, {
              ttl: this.CACHE_TTL,
              priority: 'high'
            });

            return {
              ...sectionTemplate,
              items: brands as any,
              lastUpdated: new Date().toISOString(),
              loading: false,
              error: null
            };
          }
        } catch (error) {
          console.error('[HOMEPAGE SERVICE] Error fetching brand partnerships:', error);
        }
      }

      // Try to get from cache
      const cachedData = await cacheService.get<any[]>(cacheKey);
      if (cachedData && cachedData.length > 0) {
        return {
          ...sectionTemplate,
          items: cachedData,
          lastUpdated: new Date().toISOString(),
          loading: false,
          error: null
        };
      }

      // No data available - return empty section (will be hidden)
      return {
        ...sectionTemplate,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null
      };

    } catch (error) {
      console.error('[HOMEPAGE SERVICE] Error in getBrandPartnershipsSection:', error);
      return {
        ...sectionTemplate,
        items: [],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null
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
        'homepage_flash_sales',
        'homepage_brand_partnerships'
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

  /**
   * NEW: Fetch all sections using batch endpoint
   * Returns all sections in a single API call
   */
  async fetchAllSectionsBatch(userId?: string): Promise<{
    justForYou: HomepageSection;
    newArrivals: HomepageSection;
    trendingStores: HomepageSection;
    events: HomepageSection;
    offers: HomepageSection;
    flashSales: HomepageSection;
  }> {
    const startTime = Date.now();

    try {
      this.performanceMetrics.batchCalls++;

      const response = await HomepageApiService.fetchHomepageBatch(userId);

      if (!response.success || !response.data) {
        throw new Error('Batch endpoint returned unsuccessful response');
      }


      const batchTime = Date.now() - startTime;
      this.performanceMetrics.avgBatchTime =
        (this.performanceMetrics.avgBatchTime * (this.performanceMetrics.batchSuccesses) + batchTime) /
        (this.performanceMetrics.batchSuccesses + 1);
      this.performanceMetrics.batchSuccesses++;

      // Transform batch response to individual sections
      // Note: response is { success: true, data: apiResponse }
      // apiResponse is HomepageBatchResponse which has { data: { sections: {...} } }
      // So we need to pass response.data (the apiResponse) to transform
      const transformed = this.transformBatchResponseToSections(response.data);
      return transformed;

    } catch (error) {
      this.performanceMetrics.batchFailures++;
      console.error('Batch endpoint failed:', error);
      throw error;
    }
  }

  /**
   * Transform batch response to individual HomepageSection objects
   * Handles both legacy (data.sections) and current (data.{sectionName}) formats
   */
  private transformBatchResponseToSections(response: HomepageBatchResponse): {
    justForYou: HomepageSection;
    newArrivals: HomepageSection;
    trendingStores: HomepageSection;
    events: HomepageSection;
    offers: HomepageSection;
    flashSales: HomepageSection;
  } {
    // response is HomepageBatchResponse which has { data: { sections: {...} } }
    const data = response.data;
    const sections = data.sections || {
      justForYou: data.featuredProducts || [],
      newArrivals: data.newArrivals || [],
      trendingStores: data.trendingStores || data.featuredStores || [],
      events: data.upcomingEvents || [],
      offers: data.megaOffers || data.studentOffers || [],
      flashSales: data.flashSales || [],
    };
    const metadata = data.metadata;
    const timestamp = new Date().toISOString();

    // Get section templates
    const justForYouTemplate = getSectionById('just_for_you');
    const newArrivalsTemplate = getSectionById('new_arrivals');
    const trendingStoresTemplate = getSectionById('trending_stores');
    const eventsTemplate = getSectionById('events');
    const offersTemplate = getSectionById('offers');
    const flashSalesTemplate = getSectionById('flash_sales');

    return {
      justForYou: {
        ...(justForYouTemplate || {}),
        id: 'just_for_you',
        title: 'Just for you',
        type: 'recommendations',
        items: sections.justForYou || [],
        lastUpdated: timestamp,
        loading: false,
        error: null,
        showViewAll: false,
        isHorizontalScroll: true,
        refreshable: true,
        priority: 2
      } as HomepageSection,

      newArrivals: (() => {
        const apiItems = sections.newArrivals || [];
        
        // Only return section if there's real data (no fallback)
        if (apiItems.length === 0) {
          return {
            ...(newArrivalsTemplate || {}),
            id: 'new_arrivals',
            title: 'New Arrivals',
            type: 'products',
            items: [],
            lastUpdated: timestamp,
            loading: false, // Set to false when no data
            error: null,
            showViewAll: false,
            isHorizontalScroll: true,
            refreshable: true,
            priority: 6
          } as HomepageSection;
        }
        
        return {
          ...(newArrivalsTemplate || {}),
          id: 'new_arrivals',
          title: 'New Arrivals',
          type: 'products',
          items: apiItems,
          lastUpdated: timestamp,
          loading: false, // Set to false when data is loaded
          error: null,
          showViewAll: false,
          isHorizontalScroll: true,
          refreshable: true,
          priority: 6
        } as HomepageSection;
      })(),

      trendingStores: {
        ...(trendingStoresTemplate || {}),
        id: 'trending_stores',
        title: 'Trending Stores',
        type: 'stores',
        items: sections.trendingStores || [],
        lastUpdated: timestamp,
        loading: false,
        error: null,
        showViewAll: false,
        isHorizontalScroll: true,
        refreshable: true,
        priority: 3
      } as HomepageSection,

      events: {
        ...(eventsTemplate || {}),
        id: 'events',
        title: 'Events',
        type: 'events',
        items: sections.events || [],
        lastUpdated: timestamp,
        loading: false,
        error: null,
        showViewAll: false,
        isHorizontalScroll: true,
        refreshable: true,
        priority: 1
      } as HomepageSection,

      offers: {
        ...(offersTemplate || {}),
        id: 'offers',
        title: 'Special Offers',
        type: 'products',
        items: sections.offers || [],
        lastUpdated: timestamp,
        loading: false,
        error: null,
        showViewAll: true,
        isHorizontalScroll: true,
        refreshable: true,
        priority: 4
      } as HomepageSection,

      flashSales: {
        ...(flashSalesTemplate || {}),
        id: 'flash_sales',
        title: 'Flash Sales',
        type: 'products',
        items: sections.flashSales || [],
        lastUpdated: timestamp,
        loading: false,
        error: null,
        showViewAll: true,
        isHorizontalScroll: true,
        refreshable: true,
        priority: 5
      } as HomepageSection
    };
  }

  /**
   * NEW: Fetch all sections with batch endpoint (with fallback)
   * Uses batch endpoint if enabled, falls back to individual calls
   */
  async fetchAllSectionsWithBatch(userId?: string): Promise<{
    justForYou: HomepageSection;
    newArrivals: HomepageSection;
    trendingStores: HomepageSection;
    events: HomepageSection;
    offers: HomepageSection;
    flashSales: HomepageSection;
  }> {
    // Check feature flag
    if (this.USE_BATCH_ENDPOINT) {
      try {
        return await this.fetchAllSectionsBatch(userId);
      } catch (error) {
        console.warn('Batch endpoint failed, using individual calls');
        // Fall through to individual calls
      }
    }

    // Fallback: Individual calls (original behavior)
    const startTime = Date.now();
    this.performanceMetrics.individualCalls++;

    const [justForYou, newArrivals, trendingStores, events, offers, flashSales] = await Promise.all([
      this.getJustForYouSection(),
      this.getNewArrivalsSection(),
      this.getTrendingStoresSection(),
      this.getEventsSection(),
      this.getOffersSection(),
      this.getFlashSalesSection()
    ]);


    const individualTime = Date.now() - startTime;
    this.performanceMetrics.avgIndividualTime =
      (this.performanceMetrics.avgIndividualTime * (this.performanceMetrics.individualCalls - 1) + individualTime) /
      this.performanceMetrics.individualCalls;

    return {
      justForYou,
      newArrivals,
      trendingStores,
      events,
      offers,
      flashSales
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      featureFlagEnabled: this.USE_BATCH_ENDPOINT,
      batchSuccessRate: this.performanceMetrics.batchCalls > 0
        ? (this.performanceMetrics.batchSuccesses / this.performanceMetrics.batchCalls * 100).toFixed(2) + '%'
        : 'N/A',
      avgTimeSaved: this.performanceMetrics.avgIndividualTime - this.performanceMetrics.avgBatchTime
    };
  }

  /**
   * Toggle feature flag (for testing)
   */
  toggleBatchEndpoint(enabled: boolean) {
    this.USE_BATCH_ENDPOINT = enabled;
  }
}

// Create singleton instance
const homepageDataService = new HomepageDataService();

export default homepageDataService;
export { HomepageDataService };