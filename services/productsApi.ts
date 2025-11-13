// Products API Service
// Handles product catalog, search, and recommendations

import apiClient, { ApiResponse } from './apiClient';
import { ProductItem, RecommendationItem } from '@/types/homepage.types';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    comparePrice?: number;
    inventory: {
      quantity: number;
      trackQuantity: boolean;
      allowBackorder: boolean;
    };
    attributes: Record<string, any>;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    isMain: boolean;
  }>;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  seo: {
    title: string;
    description: string;
    slug: string;
  };
  visibility: 'public' | 'private' | 'hidden';
  pricing: {
    basePrice: number;
    salePrice?: number;
    cost?: number;
    taxable: boolean;
  };
  ratings: {
    average: number;
    count: number;
    breakdown: Record<number, number>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  store?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  sort?: 'name' | 'price' | 'rating' | 'popularity' | 'newest' | 'oldest';
  order?: 'asc' | 'desc';
  status?: 'active' | 'draft' | 'archived';
  visibility?: 'public' | 'private' | 'hidden';
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    stores: Array<{ id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
    tags: Array<{ name: string; count: number }>;
  };
}

export interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
  category?: string;
  store?: string;
  filters?: Record<string, any>;
}

export interface SearchResponse {
  products: Product[];
  suggestions: string[];
  filters: Array<{
    name: string;
    type: 'category' | 'brand' | 'price' | 'rating';
    options: Array<{ value: string; label: string; count: number }>;
  }>;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  query: string;
  searchTime: number;
}

class ProductsService {
  // Get products with filtering and pagination
  async getProducts(query: ProductsQuery = {}): Promise<ApiResponse<ProductsResponse>> {
    return apiClient.get('/products', query);
  }

  // Get single product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get(`/products/${id}`);
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return apiClient.get('/products/featured', { limit });
  }

  // Search products
  async searchProducts(query: SearchQuery): Promise<ApiResponse<SearchResponse>> {
    return apiClient.get('/products/search', query);
  }

  // Get products by category
  async getProductsByCategory(
    categorySlug: string, 
    query: Omit<ProductsQuery, 'category'> = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    return apiClient.get(`/products/category/${categorySlug}`, query);
  }

  // Get products by store
  async getProductsByStore(
    storeId: string, 
    query: Omit<ProductsQuery, 'store'> = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    return apiClient.get(`/products/store/${storeId}`, query);
  }

  // Get product recommendations
  async getRecommendations(
    productId: string, 
    limit: number = 5
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get(`/products/${productId}/recommendations`, { limit });
  }

  // Get related products
  async getRelatedProducts(
    productId: string,
    limit: number = 10
  ): Promise<ApiResponse<ProductItem[]>> {
    try {
      // Try to fetch from real API first
      const response = await apiClient.get<ProductItem[]>(`/products/${productId}/related`, { limit });

      if (response.success && response.data && Array.isArray(response.data)) {
        return response;
      }

      // If API fails, return mock data for development
      console.warn('⚠️ Using mock related products data');
      return {
        success: true,
        data: this.getMockRelatedProducts(productId, limit),
        message: 'Mock related products loaded',
      };
    } catch (error) {
      console.warn('⚠️ API unavailable, using mock related products:', error);
      return {
        success: true,
        data: this.getMockRelatedProducts(productId, limit),
        message: 'Mock related products loaded',
      };
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return apiClient.get('/products/suggestions', { q: query });
  }

  // Get popular search terms
  async getPopularSearches(limit: number = 10): Promise<ApiResponse<string[]>> {
    return apiClient.get('/products/popular-searches', { limit });
  }

  // Track product view (updated endpoint)
  async trackProductView(productId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/products/${productId}/track-view`);
  }

  // Get product analytics
  async getProductAnalytics(productId: string, location?: any): Promise<ApiResponse<any>> {
    const params = location ? { location: JSON.stringify(location) } : {};
    return apiClient.get(`/products/${productId}/analytics`, params);
  }

  // Get frequently bought together products
  async getFrequentlyBoughtTogether(productId: string, limit: number = 4): Promise<ApiResponse<Product[]>> {
    return apiClient.get(`/products/${productId}/frequently-bought`, { limit });
  }

  // Get bundle products
  async getBundleProducts(productId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/products/${productId}/bundles`);
  }

  // Get product availability
  async checkAvailability(
    productId: string, 
    variantId?: string, 
    quantity: number = 1
  ): Promise<ApiResponse<{ available: boolean; maxQuantity: number }>> {
    return apiClient.get(`/products/${productId}/availability`, {
      variantId,
      quantity
    });
  }

  // ===== FRONTEND HOMEPAGE INTEGRATION METHODS =====

  /**
   * Get featured products for "Just for You" section - Returns formatted RecommendationItems
   */
  async getFeaturedForHomepage(limit: number = 10): Promise<RecommendationItem[]> {
    try {

      const response = await apiClient.get('/products/featured', { limit });

      if (response.success && response.data && Array.isArray(response.data)) {

        const recommendations = response.data.map((product: any) => ({
          ...product,
          recommendationReason: this.generateRecommendationReason(product),
          recommendationScore: Math.random() * 0.5 + 0.5, // Generate score between 0.5-1.0
          personalizedFor: this.determinePersonalization(product)
        }));

        return recommendations;
      }

      console.warn('⚠️ [PRODUCTS API] Invalid response structure:', response);
      throw new Error(response.message || 'Failed to fetch featured products');
    } catch (error) {
      console.error('❌ [PRODUCTS API] Error fetching homepage featured products:', error);
      // Return empty array on error to prevent homepage crash
      return [];
    }
  }

  /**
   * Get new arrival products for "New Arrivals" section - Returns formatted ProductItems
   */
  async getNewArrivalsForHomepage(limit: number = 10): Promise<ProductItem[]> {
    try {

      const response = await apiClient.get('/products/new-arrivals', { limit });

      if (response.success && response.data && Array.isArray(response.data)) {

        return response.data;
      }

      console.warn('⚠️ [PRODUCTS API] Invalid new arrivals response structure:', response);
      throw new Error(response.message || 'Failed to fetch new arrivals');
    } catch (error) {
      console.error('❌ [PRODUCTS API] Error fetching homepage new arrivals:', error);
      // Return empty array on error to prevent homepage crash
      return [];
    }
  }

  /**
   * Get products by store for StorePage - Returns store and products data
   */
  async getStoreProducts(
    storeId: string, 
    options?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest';
      page?: number;
      limit?: number;
    }
  ): Promise<{ store: any; products: ProductItem[] } | null> {
    try {
      const queryParams = {
        category: options?.category,
        minPrice: options?.minPrice,
        maxPrice: options?.maxPrice,
        sortBy: options?.sortBy || 'newest',
        page: options?.page || 1,
        limit: options?.limit || 20
      };

      // Filter out undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== undefined)
      );
      
      const response = await apiClient.get(`/products/store/${storeId}`, cleanParams);
      
      if (response.success && response.data) {
        // API returns paginated response, extract the first item which contains store and products
        const result = Array.isArray(response.data) ? response.data[0] : response.data;
        return result;
      }

      throw new Error(response.message || 'Failed to fetch store products');
    } catch (error) {
      console.error('❌ Error fetching store products:', error);
      return null;
    }
  }

  /**
   * Get single product details for StorePage dynamic content
   */
  async getProductDetails(productId: string): Promise<(ProductItem & { similarProducts?: ProductItem[] }) | null> {
    try {
      // Validate productId format (MongoDB ObjectIds are 24 hex characters)
      if (!productId || productId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(productId)) {
        console.warn(`⚠️ Invalid MongoDB ObjectId format: ${productId}`);
        return null;
      }
      
      const response = await apiClient.get<ProductItem & { similarProducts?: ProductItem[] }>(`/products/${productId}`);
      
      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch product details');
    } catch (error) {
      // Don't log errors for invalid IDs to avoid spam
      if ((error as any).message?.includes('Invalid MongoDB ObjectId')) {
        console.warn(`⚠️ Skipping invalid product ID: ${productId}`);
      } else {
        console.error('❌ Error fetching product details:', error);
      }
      return null;
    }
  }

  /**
   * Check if backend API is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {

      // Try to make a simple API call to check connectivity
      const response = await apiClient.get('/products/featured', { limit: 1 });

      if (response.success) {

        return true;
      } else {
        console.warn('⚠️ [PRODUCTS API] Backend responded but with error:', response.message);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ [PRODUCTS API] Backend not available, falling back to dummy data:', error);
      return false;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Generate recommendation reason based on product data
   */
  private generateRecommendationReason(product: ProductItem): string {
    const reasons = [
      'Based on your recent purchases',
      'Popular in your area',
      'Trending in your interests',
      'Recommended for you',
      'Perfect for your preferences',
      'Others like you also bought this',
      'Based on your browsing history'
    ];

    // Use product category to generate contextual reasons
    const category = product.category?.toLowerCase() || '';
    if (category.includes('home') || category.includes('furniture')) {
      return 'Based on your home office setup';
    }
    if (category.includes('sports') || category.includes('fitness')) {
      return 'Perfect for your fitness goals';
    }
    if (category.includes('beauty')) {
      return 'Matches your beauty routine';
    }
    if (category.includes('candle') || category.includes('decor')) {
      return 'Based on your home decor interest';
    }

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * Determine personalization category
   */
  private determinePersonalization(product: ProductItem): string {
    const category = product.category?.toLowerCase() || '';

    if (category.includes('home') || category.includes('furniture')) return 'home_office';
    if (category.includes('sports') || category.includes('fitness')) return 'fitness';
    if (category.includes('beauty') || category.includes('personal')) return 'beauty';
    if (category.includes('book') || category.includes('education')) return 'books';
    if (category.includes('health') || category.includes('wellness')) return 'wellness';
    if (category.includes('candle') || category.includes('decor')) return 'home_decor';

    return 'general';
  }

  /**
   * Get mock related products for development
   */
  private getMockRelatedProducts(productId: string, limit: number): ProductItem[] {
    const mockProducts: ProductItem[] = [
      {
        id: 'rel-prod-1',
        type: 'product',
        name: 'Premium Wireless Headphones',
        title: 'Premium Wireless Headphones',
        brand: 'AudioTech',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        images: [{ id: '1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Headphones', isMain: true }],
        price: {
          current: 4999,
          original: 6999,
          currency: 'INR',
          discount: 29,
        },
        category: 'Electronics',
        subcategory: 'Audio',
        rating: { value: 4.5, count: 342 },
        cashback: { percentage: 10, maxAmount: 500 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 50 },
        tags: ['wireless', 'bluetooth', 'noise-cancelling'],
        description: 'High-quality wireless headphones with noise cancellation',
      },
      {
        id: 'rel-prod-2',
        type: 'product',
        name: 'Smart Fitness Watch',
        title: 'Smart Fitness Watch',
        brand: 'FitTrack',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        images: [{ id: '2', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', alt: 'Watch', isMain: true }],
        price: {
          current: 2499,
          original: 3999,
          currency: 'INR',
          discount: 38,
        },
        category: 'Electronics',
        subcategory: 'Wearables',
        rating: { value: 4.2, count: 189 },
        cashback: { percentage: 8, maxAmount: 200 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 75 },
        tags: ['fitness', 'smartwatch', 'health'],
        description: 'Track your fitness goals with this smart watch',
      },
      {
        id: 'rel-prod-3',
        type: 'product',
        name: 'Portable Bluetooth Speaker',
        title: 'Portable Bluetooth Speaker',
        brand: 'SoundWave',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
        images: [{ id: '3', url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', alt: 'Speaker', isMain: true }],
        price: {
          current: 1999,
          original: 2999,
          currency: 'INR',
          discount: 33,
        },
        category: 'Electronics',
        subcategory: 'Audio',
        rating: { value: 4.6, count: 521 },
        cashback: { percentage: 5, maxAmount: 100 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 120 },
        tags: ['bluetooth', 'portable', 'waterproof'],
        description: 'Waterproof portable speaker with amazing sound quality',
      },
      {
        id: 'rel-prod-4',
        type: 'product',
        name: 'Ergonomic Desk Chair',
        title: 'Ergonomic Desk Chair',
        brand: 'ComfortPlus',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        images: [{ id: '4', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', alt: 'Chair', isMain: true }],
        price: {
          current: 8999,
          original: 14999,
          currency: 'INR',
          discount: 40,
        },
        category: 'Furniture',
        subcategory: 'Office',
        rating: { value: 4.7, count: 234 },
        cashback: { percentage: 12, maxAmount: 1000 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 30 },
        tags: ['ergonomic', 'office', 'comfort'],
        description: 'Ergonomic chair designed for long hours of work',
      },
      {
        id: 'rel-prod-5',
        type: 'product',
        name: 'LED Desk Lamp',
        title: 'LED Desk Lamp',
        brand: 'BrightLight',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
        images: [{ id: '5', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', alt: 'Lamp', isMain: true }],
        price: {
          current: 1499,
          original: 2499,
          currency: 'INR',
          discount: 40,
        },
        category: 'Home & Living',
        subcategory: 'Lighting',
        rating: { value: 4.4, count: 167 },
        cashback: { percentage: 6, maxAmount: 90 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 85 },
        tags: ['led', 'desk', 'adjustable'],
        description: 'Adjustable LED lamp perfect for your workspace',
      },
      {
        id: 'rel-prod-6',
        type: 'product',
        name: 'Wireless Mouse & Keyboard Combo',
        title: 'Wireless Mouse & Keyboard Combo',
        brand: 'TechPro',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        images: [{ id: '6', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', alt: 'Keyboard', isMain: true }],
        price: {
          current: 2999,
          original: 4999,
          currency: 'INR',
          discount: 40,
        },
        category: 'Electronics',
        subcategory: 'Accessories',
        rating: { value: 4.3, count: 412 },
        cashback: { percentage: 8, maxAmount: 240 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 95 },
        tags: ['wireless', 'keyboard', 'mouse'],
        description: 'Wireless keyboard and mouse combo for productivity',
      },
      {
        id: 'rel-prod-7',
        type: 'product',
        name: 'USB-C Charging Cable',
        title: 'USB-C Charging Cable',
        brand: 'FastCharge',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
        images: [{ id: '7', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500', alt: 'Cable', isMain: true }],
        price: {
          current: 399,
          original: 799,
          currency: 'INR',
          discount: 50,
        },
        category: 'Electronics',
        subcategory: 'Accessories',
        rating: { value: 4.5, count: 892 },
        cashback: { percentage: 5, maxAmount: 20 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 200 },
        tags: ['usb-c', 'charging', 'cable'],
        description: 'Durable USB-C charging cable with fast charging support',
      },
      {
        id: 'rel-prod-8',
        type: 'product',
        name: 'Phone Stand Holder',
        title: 'Phone Stand Holder',
        brand: 'StandPro',
        image: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=500',
        images: [{ id: '8', url: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=500', alt: 'Stand', isMain: true }],
        price: {
          current: 599,
          original: 999,
          currency: 'INR',
          discount: 40,
        },
        category: 'Accessories',
        subcategory: 'Phone Accessories',
        rating: { value: 4.6, count: 345 },
        cashback: { percentage: 5, maxAmount: 30 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 150 },
        tags: ['phone', 'stand', 'holder'],
        description: 'Adjustable phone stand for hands-free viewing',
      },
      {
        id: 'rel-prod-9',
        type: 'product',
        name: 'Laptop Cooling Pad',
        title: 'Laptop Cooling Pad',
        brand: 'CoolTech',
        image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
        images: [{ id: '9', url: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500', alt: 'Cooling Pad', isMain: true }],
        price: {
          current: 1299,
          original: 1999,
          currency: 'INR',
          discount: 35,
        },
        category: 'Electronics',
        subcategory: 'Laptop Accessories',
        rating: { value: 4.4, count: 278 },
        cashback: { percentage: 7, maxAmount: 90 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 65 },
        tags: ['laptop', 'cooling', 'fan'],
        description: 'Keep your laptop cool with this efficient cooling pad',
      },
      {
        id: 'rel-prod-10',
        type: 'product',
        name: 'Webcam HD 1080p',
        title: 'Webcam HD 1080p',
        brand: 'CamPro',
        image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=500',
        images: [{ id: '10', url: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=500', alt: 'Webcam', isMain: true }],
        price: {
          current: 2499,
          original: 3999,
          currency: 'INR',
          discount: 38,
        },
        category: 'Electronics',
        subcategory: 'Video',
        rating: { value: 4.5, count: 198 },
        cashback: { percentage: 8, maxAmount: 200 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 45 },
        tags: ['webcam', '1080p', 'video'],
        description: 'Crystal clear HD webcam for video calls and streaming',
      },
      {
        id: 'rel-prod-11',
        type: 'product',
        name: 'Mechanical Gaming Keyboard',
        title: 'Mechanical Gaming Keyboard',
        brand: 'GameKey',
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
        images: [{ id: '11', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', alt: 'Gaming Keyboard', isMain: true }],
        price: {
          current: 3999,
          original: 6999,
          currency: 'INR',
          discount: 43,
        },
        category: 'Gaming',
        subcategory: 'Peripherals',
        rating: { value: 4.7, count: 567 },
        cashback: { percentage: 10, maxAmount: 400 },
        availabilityStatus: 'low_stock',
        inventory: { stock: 15, lowStockThreshold: 20 },
        tags: ['gaming', 'mechanical', 'rgb'],
        description: 'RGB mechanical keyboard designed for gamers',
      },
      {
        id: 'rel-prod-12',
        type: 'product',
        name: 'Monitor Screen Guard',
        title: 'Monitor Screen Guard',
        brand: 'ScreenSafe',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
        images: [{ id: '12', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', alt: 'Screen Guard', isMain: true }],
        price: {
          current: 799,
          original: 1299,
          currency: 'INR',
          discount: 38,
        },
        category: 'Accessories',
        subcategory: 'Screen Protection',
        rating: { value: 4.3, count: 145 },
        cashback: { percentage: 5, maxAmount: 40 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 110 },
        tags: ['screen', 'protection', 'monitor'],
        description: 'Protect your monitor screen from scratches and dust',
      },
      {
        id: 'rel-prod-13',
        type: 'product',
        name: 'Backpack with USB Charging Port',
        title: 'Backpack with USB Charging Port',
        brand: 'TravelSmart',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        images: [{ id: '13', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', alt: 'Backpack', isMain: true }],
        price: {
          current: 1899,
          original: 2999,
          currency: 'INR',
          discount: 37,
        },
        category: 'Bags',
        subcategory: 'Backpacks',
        rating: { value: 4.6, count: 423 },
        cashback: { percentage: 8, maxAmount: 150 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 80 },
        tags: ['backpack', 'usb', 'travel'],
        description: 'Smart backpack with built-in USB charging port',
      },
      {
        id: 'rel-prod-14',
        type: 'product',
        name: 'Power Bank 20000mAh',
        title: 'Power Bank 20000mAh',
        brand: 'PowerMax',
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
        images: [{ id: '14', url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', alt: 'Power Bank', isMain: true }],
        price: {
          current: 1499,
          original: 2499,
          currency: 'INR',
          discount: 40,
        },
        category: 'Electronics',
        subcategory: 'Power',
        rating: { value: 4.5, count: 678 },
        cashback: { percentage: 7, maxAmount: 105 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 140 },
        tags: ['power-bank', 'charging', 'portable'],
        description: 'High-capacity power bank for all your devices',
      },
      {
        id: 'rel-prod-15',
        type: 'product',
        name: 'Cable Organizer Set',
        title: 'Cable Organizer Set',
        brand: 'OrganizePro',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        images: [{ id: '15', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', alt: 'Cable Organizer', isMain: true }],
        price: {
          current: 299,
          original: 599,
          currency: 'INR',
          discount: 50,
        },
        category: 'Accessories',
        subcategory: 'Organization',
        rating: { value: 4.4, count: 234 },
        cashback: { percentage: 5, maxAmount: 15 },
        availabilityStatus: 'in_stock',
        inventory: { stock: 250 },
        tags: ['organizer', 'cable', 'management'],
        description: 'Keep your cables neat and organized',
      },
    ];

    // Shuffle and return limited number of products
    const shuffled = mockProducts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
}

// Create singleton instance
const productsService = new ProductsService();

export default productsService;