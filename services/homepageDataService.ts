import productsService from './productsApi';
import storesService from './storesApi';
import { ProductItem, RecommendationItem, HomepageSection } from '@/types/homepage.types';
import { getSectionById } from '@/data/homepageData';

/**
 * Homepage Data Service
 * Handles fetching real data from backend with fallback to dummy data
 */
class HomepageDataService {
  private backendAvailable: boolean | null = null;
  private lastBackendCheck: number = 0;
  private BACKEND_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
    console.log('🔍 [HOMEPAGE SERVICE] Checking backend availability (cache disabled for debugging)...');

    try {
      // Check both products and stores availability
      const productsAvailable = await productsService.isBackendAvailable();
      const storesAvailable = await storesService.isBackendAvailable();

      this.backendAvailable = productsAvailable && storesAvailable;
      this.lastBackendCheck = now;

      if (this.backendAvailable) {
        console.log('✅ Backend API is available - using real data');
      } else {
        console.log('⚠️ Backend API unavailable - using dummy data');
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
   * Get "Just for You" section data (Featured Products as Recommendations)
   */
  async getJustForYouSection(): Promise<HomepageSection> {
    console.log('🔄 [HOMEPAGE SERVICE] getJustForYouSection called');
    const sectionTemplate = getSectionById('just_for_you');
    if (!sectionTemplate) {
      console.error('❌ [HOMEPAGE SERVICE] Just for you section template not found');
      throw new Error('Just for you section template not found');
    }

    console.log('✅ [HOMEPAGE SERVICE] Section template found:', sectionTemplate.id);

    try {
      const isBackendAvailable = await this.checkBackendAvailability();
      console.log('🔍 [HOMEPAGE SERVICE] Backend available:', isBackendAvailable);
      
      if (isBackendAvailable) {
        console.log('📡 [HOMEPAGE SERVICE] Fetching "Just for You" from backend API...');
        try {
          const recommendations = await productsService.getFeaturedForHomepage(10);
          console.log('✅ [HOMEPAGE SERVICE] Fetched recommendations:', recommendations.length, 'items');
          console.log('📦 [HOMEPAGE SERVICE] Sample recommendation:', recommendations[0]);
          
          if (recommendations.length > 0) {
            const result = {
              ...sectionTemplate,
              items: recommendations,
              lastUpdated: new Date().toISOString(),
              loading: false,
              error: null
            };
            console.log('🎯 [HOMEPAGE SERVICE] Returning successful result with', result.items.length, 'items');
            return result;
          } else {
            console.log('⚠️ [HOMEPAGE SERVICE] Backend returned empty recommendations array');
          }
        } catch (error) {
          console.error('❌ [HOMEPAGE SERVICE] Error fetching recommendations from backend:', error);
          // Continue to fallback below
        }
      }

      // Temporary fallback - return minimal data to prevent component disappearing
      console.log('⚠️ [HOMEPAGE SERVICE] Backend unavailable, using minimal fallback for "Just for You" section');
      return {
        ...sectionTemplate,
        items: [
          {
            id: 'temp_001',
            type: 'product',
            title: 'Loading recommendations...',
            name: 'Loading recommendations...',
            brand: 'Backend',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=200&fit=crop',
            description: 'Fetching personalized recommendations from server...',
            price: { current: 999, original: 1299, currency: '₹', discount: 23 },
            category: 'Loading',
            rating: { value: 4.5, count: 100 },
            availabilityStatus: 'in_stock' as const,
            tags: ['loading'],
            isRecommended: true,
            recommendationReason: 'Connecting to recommendation engine...',
            recommendationScore: 0.5,
            personalizedFor: 'general'
          }
        ],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null // Remove error to allow section to show
      };

    } catch (error) {
      console.error('❌ Error fetching Just for You section:', error);
      
      // Return empty data on error
      return {
        ...sectionTemplate,
        items: [], // Empty array instead of dummy data
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: 'Failed to load recommendations - please try again'
      };
    }
  }

  /**
   * Get "New Arrivals" section data
   */
  async getNewArrivalsSection(): Promise<HomepageSection> {
    console.log('🔄 [HOMEPAGE SERVICE] getNewArrivalsSection called');
    const sectionTemplate = getSectionById('new_arrivals');
    if (!sectionTemplate) {
      console.error('❌ [HOMEPAGE SERVICE] New arrivals section template not found');
      throw new Error('New arrivals section template not found');
    }

    console.log('✅ [HOMEPAGE SERVICE] New arrivals template found:', sectionTemplate.id);

    try {
      const isBackendAvailable = await this.checkBackendAvailability();
      console.log('🔍 [HOMEPAGE SERVICE] Backend available for new arrivals:', isBackendAvailable);
      
      if (isBackendAvailable) {
        console.log('📡 [HOMEPAGE SERVICE] Fetching "New Arrivals" from backend API...');
        const newArrivals = await productsService.getNewArrivalsForHomepage(10);
        console.log('✅ [HOMEPAGE SERVICE] Fetched new arrivals:', newArrivals.length, 'items');
        console.log('📦 [HOMEPAGE SERVICE] Sample new arrival:', newArrivals[0]);
        
        if (newArrivals.length > 0) {
          const result = {
            ...sectionTemplate,
            items: newArrivals,
            lastUpdated: new Date().toISOString(),
            loading: false,
            error: null
          };
          console.log('🎯 [HOMEPAGE SERVICE] Returning new arrivals result with', result.items.length, 'items');
          return result;
        }
      }

      // Temporary fallback - return minimal data to prevent component disappearing
      console.log('⚠️ [HOMEPAGE SERVICE] Backend unavailable, using minimal fallback for "New Arrivals" section');
      return {
        ...sectionTemplate,
        items: [
          {
            id: 'temp_002',
            type: 'product',
            title: 'Loading new arrivals...',
            name: 'Loading new arrivals...',
            brand: 'Backend',
            image: 'https://images.unsplash.com/photo-1602522049634-6271b3a0b1a3?w=400&h=200&fit=crop',
            description: 'Fetching latest products from server...',
            price: { current: 799, original: 999, currency: '₹', discount: 20 },
            category: 'Loading',
            rating: { value: 4.3, count: 87 },
            availabilityStatus: 'in_stock' as const,
            tags: ['loading'],
            isNewArrival: true,
            arrivalDate: new Date().toISOString().split('T')[0]
          }
        ],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null // Remove error to allow section to show
      };

    } catch (error) {
      console.error('❌ Error fetching New Arrivals section:', error);
      
      // Return empty data on error
      return {
        ...sectionTemplate,
        items: [], // Empty array instead of dummy data
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: 'Failed to load new arrivals - please try again'
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
          console.log(`⚠️ [STOREPAGE] Dummy ID detected (${productId}), skipping backend fetch`);
          return null; // Don't attempt to fetch dummy IDs from backend
        }
        
        console.log(`📡 Fetching product ${productId} from backend API...`);
        const productDetails = await productsService.getProductDetails(productId);
        
        if (productDetails) {
          return productDetails;
        }
      }

      console.log(`⚠️ Could not fetch product ${productId} from backend`);
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
        console.log(`📡 Fetching store ${storeId} products from backend API...`);
        const storeData = await productsService.getStoreProducts(storeId, options);
        
        if (storeData) {
          return storeData;
        }
      }

      console.log(`⚠️ Could not fetch store ${storeId} from backend`);
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
    console.log('🔄 [HOMEPAGE SERVICE] getTrendingStoresSection called');
    const sectionTemplate = getSectionById('trending_stores');
    if (!sectionTemplate) {
      console.error('❌ [HOMEPAGE SERVICE] Trending stores section template not found');
      throw new Error('Trending stores section template not found');
    }

    console.log('✅ [HOMEPAGE SERVICE] Trending stores template found:', sectionTemplate.id);

    try {
      const isBackendAvailable = await this.checkBackendAvailability();
      console.log('🔍 [HOMEPAGE SERVICE] Backend available for trending stores:', isBackendAvailable);

      if (isBackendAvailable) {
        console.log('📡 [HOMEPAGE SERVICE] Fetching "Trending Stores" from backend API...');
        const trendingStores = await storesService.getFeaturedForHomepage(10);
        console.log('✅ [HOMEPAGE SERVICE] Fetched trending stores:', trendingStores.length, 'items');
        console.log('📦 [HOMEPAGE SERVICE] Sample trending store:', trendingStores[0]);

        if (trendingStores.length > 0) {
          const result = {
            ...sectionTemplate,
            items: trendingStores,
            lastUpdated: new Date().toISOString(),
            loading: false,
            error: null
          };
          console.log('🎯 [HOMEPAGE SERVICE] Returning trending stores result with', result.items.length, 'items');
          return result;
        }
      }

      // Temporary fallback - return minimal data to prevent component disappearing
      console.log('⚠️ [HOMEPAGE SERVICE] Backend unavailable, using minimal fallback for "Trending Stores" section');
      return {
        ...sectionTemplate,
        items: [
          {
            id: 'temp_store_001',
            type: 'store',
            title: 'Loading stores...',
            name: 'Loading stores...',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
            description: 'Fetching trending stores from server...',
            logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
            rating: { value: 4.5, count: 100, maxValue: 5 },
            cashback: { percentage: 10, maxAmount: 500 },
            category: 'Loading',
            location: { address: 'Loading...', city: 'Loading...', distance: '0 km' },
            isTrending: true,
            deliveryTime: '30-45 mins',
            minimumOrder: 299
          }
        ],
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: null // Remove error to allow section to show
      };

    } catch (error) {
      console.error('❌ Error fetching Trending Stores section:', error);

      // Return empty data on error
      return {
        ...sectionTemplate,
        items: [], // Empty array instead of dummy data
        lastUpdated: new Date().toISOString(),
        loading: false,
        error: 'Failed to load trending stores - please try again'
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
}

// Create singleton instance
const homepageDataService = new HomepageDataService();

export default homepageDataService;
export { HomepageDataService };