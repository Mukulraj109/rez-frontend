import { 
  ApiResponse, 
  PaginatedResponse, 
  GetOffersRequest, 
  SearchOffersRequest,
  GetOfferDetailsRequest,
  AddToFavoritesRequest,
  RemoveFromFavoritesRequest,
  GetUserFavoritesRequest,
  TrackOfferViewRequest,
  RedeemOfferRequest,
  OffersApiEndpoints,
  ApiConfig,
  DetailedApiError,
  ApiErrorCode
} from '@/types/api.types';
import { Offer, OfferCategory } from '@/types/offers.types';
import { offersPageData } from '@/data/offersData';

// API Configuration
const API_CONFIG: ApiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  cache: {
    offersCache: {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100
    },
    categoriesCache: {
      ttl: 30 * 60 * 1000, // 30 minutes
      maxSize: 50
    },
    userCache: {
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 10
    }
  },
  endpoints: {
    offers: '/api/offers',
    categories: '/api/categories',
    favorites: '/api/user/favorites',
    search: '/api/offers/search',
    analytics: '/api/analytics',
    recommendations: '/api/recommendations'
  }
};

// Simple in-memory cache implementation
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  set(key: string, data: T, ttl: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache instances
const offersCache = new SimpleCache<any>(API_CONFIG.cache.offersCache.maxSize);
const categoriesCache = new SimpleCache<any>(API_CONFIG.cache.categoriesCache.maxSize);
const userCache = new SimpleCache<any>(API_CONFIG.cache.userCache.maxSize);

// HTTP Client
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle different types of errors
      let errorCode: ApiErrorCode = 'SERVER_ERROR';
      let message = 'An unexpected error occurred';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorCode = 'TIMEOUT';
          message = 'Request timed out';
        } else if (error.message.includes('Network')) {
          errorCode = 'NETWORK_ERROR';
          message = 'Network connection failed';
        } else {
          message = error.message;
        }
      }

      throw {
        success: false,
        error: {
          code: errorCode,
          message,
          details: error
        },
        timestamp: new Date().toISOString()
      } as DetailedApiError;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// API Client instance
const apiClient = new ApiClient(API_CONFIG);

// Mock API implementation (for development)
class MockOffersApi implements OffersApiEndpoints {
  private simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getOffers(params: GetOffersRequest): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    await this.simulateDelay();

    // Check cache first
    const cacheKey = `offers_${JSON.stringify(params)}`;
    const cached = offersCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Simulate filtering and pagination
    let allOffers = offersPageData.sections.flatMap(section => section.offers);

    // Apply filters
    if (params.category) {
      allOffers = allOffers.filter(offer => 
        offer.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    if (params.filters?.minCashBack) {
      allOffers = allOffers.filter(offer => 
        offer.cashBackPercentage >= params.filters!.minCashBack!
      );
    }

    // Apply sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'cashback':
          allOffers.sort((a, b) => b.cashBackPercentage - a.cashBackPercentage);
          break;
        case 'price':
          allOffers.sort((a, b) => {
            const priceA = a.discountedPrice || a.originalPrice || 0;
            const priceB = b.discountedPrice || b.originalPrice || 0;
            return priceA - priceB;
          });
          break;
        case 'newest':
          allOffers.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
      }
    }

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOffers = allOffers.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<Offer>> = {
      success: true,
      data: {
        items: paginatedOffers,
        totalCount: allOffers.length,
        page,
        pageSize,
        hasNext: endIndex < allOffers.length,
        hasPrevious: page > 1,
      },
      timestamp: new Date().toISOString(),
    };

    // Cache the response
    offersCache.set(cacheKey, response, API_CONFIG.cache.offersCache.ttl);

    return response;
  }

  async getOfferDetails(params: GetOfferDetailsRequest): Promise<ApiResponse<Offer>> {
    await this.simulateDelay();

    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    const offer = allOffers.find(o => o.id === params.offerId);

    if (!offer) {
      throw {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Offer not found',
        },
        timestamp: new Date().toISOString(),
      } as DetailedApiError;
    }

    return {
      success: true,
      data: offer,
      timestamp: new Date().toISOString(),
    };
  }

  async searchOffers(params: SearchOffersRequest): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    await this.simulateDelay();

    const allOffers = offersPageData.sections.flatMap(section => section.offers);
    const query = params.query.toLowerCase();

    const filteredOffers = allOffers.filter(offer =>
      offer.title.toLowerCase().includes(query) ||
      offer.category.toLowerCase().includes(query) ||
      offer.store.name.toLowerCase().includes(query)
    );

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOffers = filteredOffers.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        items: paginatedOffers,
        totalCount: filteredOffers.length,
        page,
        pageSize,
        hasNext: endIndex < filteredOffers.length,
        hasPrevious: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getCategories(): Promise<ApiResponse<OfferCategory[]>> {
    await this.simulateDelay();

    // Check cache first
    const cached = categoriesCache.get('categories');
    if (cached) {
      return cached;
    }

    const response: ApiResponse<OfferCategory[]> = {
      success: true,
      data: offersPageData.categories,
      timestamp: new Date().toISOString(),
    };

    // Cache the response
    categoriesCache.set('categories', response, API_CONFIG.cache.categoriesCache.ttl);

    return response;
  }

  async getOffersByCategory(categoryId: string, params?: GetOffersRequest): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    const categoryParams = { ...params, category: categoryId };
    return this.getOffers(categoryParams);
  }

  async getUserFavorites(params: GetUserFavoritesRequest): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    await this.simulateDelay();

    // In a real app, this would fetch from user's favorites
    // For now, return empty favorites
    return {
      success: true,
      data: {
        items: [],
        totalCount: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        hasNext: false,
        hasPrevious: false,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async addToFavorites(params: AddToFavoritesRequest): Promise<ApiResponse<{ success: boolean }>> {
    await this.simulateDelay();

    return {
      success: true,
      data: { success: true },
      timestamp: new Date().toISOString(),
    };
  }

  async removeFromFavorites(params: RemoveFromFavoritesRequest): Promise<ApiResponse<{ success: boolean }>> {
    await this.simulateDelay();

    return {
      success: true,
      data: { success: true },
      timestamp: new Date().toISOString(),
    };
  }

  async trackOfferView(params: TrackOfferViewRequest): Promise<ApiResponse<{ success: boolean }>> {
    // Fire and forget analytics
    return {
      success: true,
      data: { success: true },
      timestamp: new Date().toISOString(),
    };
  }

  async redeemOffer(params: RedeemOfferRequest): Promise<ApiResponse<{ success: boolean; redemptionId: string }>> {
    await this.simulateDelay();

    return {
      success: true,
      data: { 
        success: true, 
        redemptionId: `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getRecommendedOffers(userId: string, location?: { latitude: number; longitude: number }): Promise<ApiResponse<Offer[]>> {
    await this.simulateDelay();

    // Return trending offers as recommendations
    const trendingOffers = offersPageData.sections
      .flatMap(section => section.offers)
      .filter(offer => offer.isTrending)
      .slice(0, 10);

    return {
      success: true,
      data: trendingOffers,
      timestamp: new Date().toISOString(),
    };
  }

  async getTrendingOffers(location?: { latitude: number; longitude: number }): Promise<ApiResponse<Offer[]>> {
    await this.simulateDelay();

    const trendingOffers = offersPageData.sections
      .flatMap(section => section.offers)
      .filter(offer => offer.isTrending);

    return {
      success: true,
      data: trendingOffers,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export the API instance
export const offersApi = new MockOffersApi();

// Export utilities
export { API_CONFIG, offersCache, categoriesCache, userCache };

// Export for real API implementation
export { ApiClient };