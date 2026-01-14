// Travel Services API Service
// Handles travel services specific endpoints (flights, hotels, trains, bus, cab, packages)

import apiClient, { ApiResponse } from './apiClient';

// ===== TYPE DEFINITIONS =====

export interface TravelServiceCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: string;
  cashback: number;
}

export interface TravelService {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  pricing: {
    original: number;
    selling: number;
    discount?: number;
    currency: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  cashback?: {
    percentage: number;
    isActive: boolean;
  };
  serviceDetails?: {
    duration: number;
    serviceType: 'home' | 'store' | 'online';
    maxBookingsPerSlot: number;
    requiresAddress: boolean;
    requiresPaymentUpfront: boolean;
    serviceArea?: {
      radius: number;
      cities?: string[];
    };
  };
  serviceCategory?: {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    cashbackPercentage: number;
  };
  store?: {
    _id: string;
    name: string;
    logo?: string;
    location?: {
      address: string;
      city: string;
      coordinates?: [number, number];
    };
  };
  isFeatured?: boolean;
  isActive: boolean;
}

export interface TravelServicesByCategoryResponse {
  services: TravelService[];
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description?: string;
    cashbackPercentage: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TravelServicesStats {
  hotels: number;
  maxCashback: number;
  serviceCount: number;
}

export interface TravelServicesQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular';
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

// ===== SERVICE CLASS =====

class TravelServicesService {
  /**
   * Get travel service categories for homepage
   */
  async getCategories(): Promise<ApiResponse<TravelServiceCategory[]>> {
    try {
      const response = await apiClient.get<TravelServiceCategory[]>('/travel-services/categories');
      return response;
    } catch (error) {
      console.error('❌ [TRAVEL API] Error fetching categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch travel service categories'
      };
    }
  }

  /**
   * Get featured travel services for homepage
   */
  async getFeatured(limit: number = 6): Promise<ApiResponse<TravelService[]>> {
    try {
      const response = await apiClient.get<TravelService[]>(`/travel-services/featured?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('❌ [TRAVEL API] Error fetching featured services:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch featured travel services'
      };
    }
  }

  /**
   * Get popular travel services
   */
  async getPopular(limit: number = 10): Promise<ApiResponse<TravelService[]>> {
    try {
      const response = await apiClient.get<TravelService[]>(`/travel-services/popular?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('❌ [TRAVEL API] Error fetching popular services:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch popular travel services'
      };
    }
  }

  /**
   * Get travel services statistics
   */
  async getStats(): Promise<ApiResponse<TravelServicesStats>> {
    try {
      const response = await apiClient.get<TravelServicesStats>('/travel-services/stats');
      return response;
    } catch (error) {
      console.error('❌ [TRAVEL API] Error fetching stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch travel services stats'
      };
    }
  }

  /**
   * Get travel services by category slug
   */
  async getByCategory(
    slug: string,
    params?: TravelServicesQueryParams
  ): Promise<ApiResponse<TravelServicesByCategoryResponse>> {
    try {
      const queryParams: any = {
        page: params?.page || 1,
        limit: params?.limit || 20,
        sortBy: params?.sortBy || 'rating'
      };

      if (params?.minPrice) queryParams.minPrice = params.minPrice;
      if (params?.maxPrice) queryParams.maxPrice = params.maxPrice;
      if (params?.rating) queryParams.rating = params.rating;

      // Filter out undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== undefined)
      );

      const response = await apiClient.get<TravelServicesByCategoryResponse>(
        `/travel-services/category/${slug}`,
        cleanParams
      );

      return response;
    } catch (error) {
      console.error('❌ [TRAVEL API] Error fetching services by category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch travel services by category'
      };
    }
  }
}

// Export singleton instance
const travelApi = new TravelServicesService();
export default travelApi;
