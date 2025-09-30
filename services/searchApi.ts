// Search API Service
// Handles search operations for products, stores, and general queries

import apiClient, { ApiResponse } from './apiClient';

// Product search interfaces
export interface ProductSearchParams {
  q: string; // Search query
  category?: string; // Category ID
  store?: string; // Store ID
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  _id: string;
  title: string;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  description: string;
  image: string;
  price: {
    current: number;
    original: number;
    currency: string;
    discount: number;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  rating: {
    value: number;
    count: number;
  };
  availabilityStatus: string;
  tags: string[];
  store: {
    _id: string;
    name: string;
    logo: string;
    location: {
      city: string;
    };
  };
  isRecommended?: boolean;
  isFeatured?: boolean;
}

export interface ProductSearchResponse {
  products: ProductSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

// Store search interfaces
export interface StoreSearchParams {
  q: string; // Search query
  page?: number;
  limit?: number;
}

export interface AdvancedStoreSearchParams {
  search?: string;
  category?: 'fastDelivery' | 'budgetFriendly' | 'premium' | 'organic' | 'alliance' | 'lowestPrice' | 'mall' | 'cashStore';
  deliveryTime?: string; // "15-30" format
  priceRange?: string; // "0-100" format
  rating?: number;
  paymentMethods?: string; // "cash,card,upi" format
  features?: string; // "freeDelivery,walletPayment,verified,featured" format
  sortBy?: 'rating' | 'distance' | 'name' | 'newest' | 'price';
  location?: string; // "lng,lat" format
  radius?: number;
  page?: number;
  limit?: number;
}

export interface StoreSearchResult {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  rating: {
    value: number;
    count: number;
  };
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      type: string;
      coordinates: [number, number];
    };
  };
  categories: string[];
  isOpen: boolean;
  deliveryTime?: number;
  minimumOrder?: number;
  tags: string[];
}

export interface StoreSearchResponse {
  stores: StoreSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters?: {
    categories: Array<{ id: string; name: string; count: number }>;
    deliveryTimes: Array<{ range: string; count: number }>;
  };
}

// Search suggestions interface
export interface SearchSuggestion {
  text: string;
  type: 'product' | 'store' | 'category';
  productId?: string;
  storeId?: string;
  categoryId?: string;
  count?: number;
}

class SearchService {
  // Search products
  async searchProducts(params: ProductSearchParams): Promise<ApiResponse<ProductSearchResponse>> {
    console.log('🔍 [SEARCH API] Searching products:', params);
    return apiClient.get('/products/search', params);
  }

  // Search stores
  async searchStores(params: StoreSearchParams): Promise<ApiResponse<StoreSearchResponse>> {
    console.log('🔍 [SEARCH API] Searching stores:', params);
    return apiClient.get('/stores/search', params);
  }

  // Advanced store search with filters
  async advancedStoreSearch(params: AdvancedStoreSearchParams): Promise<ApiResponse<StoreSearchResponse>> {
    console.log('🔍 [SEARCH API] Advanced store search:', params);
    return apiClient.get('/stores/search/advanced', params);
  }

  // Get search suggestions (not yet implemented in backend, returns empty)
  async getSearchSuggestions(query: string): Promise<ApiResponse<SearchSuggestion[]>> {
    console.log('🔍 [SEARCH API] Getting search suggestions for:', query);

    // TODO: Implement backend endpoint for search suggestions
    // For now, return empty suggestions
    return {
      success: true,
      message: 'Search suggestions (not yet implemented)',
      data: [],
    };
  }

  // Search by category
  async searchByCategory(
    categorySlug: string,
    params?: {
      minPrice?: number;
      maxPrice?: number;
      rating?: number;
      sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest';
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<ProductSearchResponse>> {
    console.log('🔍 [SEARCH API] Searching by category:', categorySlug, params);
    return apiClient.get(`/products/category/${categorySlug}`, params);
  }

  // Search stores by category
  async searchStoresByCategory(
    category: string,
    params?: {
      location?: string;
      radius?: number;
      page?: number;
      limit?: number;
      sortBy?: 'rating' | 'distance' | 'name' | 'newest';
    }
  ): Promise<ApiResponse<StoreSearchResponse>> {
    console.log('🔍 [SEARCH API] Searching stores by category:', category, params);
    return apiClient.get(`/stores/search-by-category/${category}`, params);
  }

  // Search stores by delivery time
  async searchStoresByDeliveryTime(
    params: {
      minTime?: number;
      maxTime?: number;
      location?: string;
      radius?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<StoreSearchResponse>> {
    console.log('🔍 [SEARCH API] Searching stores by delivery time:', params);
    return apiClient.get('/stores/search-by-delivery-time', params);
  }

  // Get nearby stores (useful for location-based search)
  async getNearbyStores(
    params: {
      lng: number;
      lat: number;
      radius?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<StoreSearchResponse>> {
    console.log('🔍 [SEARCH API] Getting nearby stores:', params);
    return apiClient.get('/stores/nearby', params);
  }

  // Search products by store
  async searchProductsByStore(
    storeId: string,
    params?: {
      category?: string;
      search?: string;
      sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular';
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<ProductSearchResponse>> {
    console.log('🔍 [SEARCH API] Searching products by store:', storeId, params);
    return apiClient.get(`/stores/${storeId}/products`, params);
  }

  // Get featured products (useful for search homepage)
  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<{ data: ProductSearchResult[] }>> {
    console.log('🔍 [SEARCH API] Getting featured products');
    return apiClient.get('/products/featured', { limit });
  }

  // Get new arrivals (useful for search homepage)
  async getNewArrivals(limit: number = 10): Promise<ApiResponse<{ data: ProductSearchResult[] }>> {
    console.log('🔍 [SEARCH API] Getting new arrivals');
    return apiClient.get('/products/new-arrivals', { limit });
  }

  // Get featured stores (useful for search homepage)
  async getFeaturedStores(limit: number = 10): Promise<ApiResponse<{ stores: StoreSearchResult[] }>> {
    console.log('🔍 [SEARCH API] Getting featured stores');
    return apiClient.get('/stores/featured', { limit });
  }
}

// Create singleton instance
const searchService = new SearchService();

export default searchService;