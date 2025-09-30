// Real Offers API - Connects to actual backend
import apiClient from './apiClient';
import { Offer } from '@/types/offers.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp: string;
  };
}

export const realOffersApi = {
  /**
   * Get all offers with filters
   */
  async getOffers(params?: {
    category?: string;
    store?: string;
    featured?: boolean;
    trending?: boolean;
    bestSeller?: boolean;
    special?: boolean;
    isNew?: boolean;
    minCashback?: number;
    maxCashback?: number;
    sortBy?: 'cashback' | 'createdAt' | 'redemptionCount' | 'endDate';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Offer[]>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return apiClient.get(`/offers?${queryParams.toString()}`);
  },

  /**
   * Get featured offers
   */
  async getFeaturedOffers(limit: number = 10): Promise<ApiResponse<Offer[]>> {
    return apiClient.get(`/offers/featured?limit=${limit}`);
  },

  /**
   * Get trending offers
   */
  async getTrendingOffers(limit: number = 10): Promise<ApiResponse<Offer[]>> {
    return apiClient.get(`/offers/trending?limit=${limit}`);
  },

  /**
   * Search offers
   */
  async searchOffers(params: {
    q: string;
    category?: string;
    store?: string;
    minCashback?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Offer[]>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return apiClient.get(`/offers/search?${queryParams.toString()}`);
  },

  /**
   * Get offers by category
   */
  async getOffersByCategory(
    categoryId: string,
    params?: {
      featured?: boolean;
      trending?: boolean;
      sortBy?: string;
      order?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<Offer[]>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return apiClient.get(`/offers/category/${categoryId}?${queryParams.toString()}`);
  },

  /**
   * Get offers by store
   */
  async getOffersByStore(
    storeId: string,
    params?: {
      category?: string;
      active?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<Offer[]>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return apiClient.get(`/offers/store/${storeId}?${queryParams.toString()}`);
  },

  /**
   * Get single offer by ID
   */
  async getOfferById(id: string): Promise<ApiResponse<Offer>> {
    return apiClient.get(`/offers/${id}`);
  },

  /**
   * Get recommended offers (requires authentication)
   */
  async getRecommendedOffers(limit: number = 10): Promise<ApiResponse<Offer[]>> {
    return apiClient.get(`/offers/user/recommendations?limit=${limit}`);
  },

  /**
   * Redeem an offer (requires authentication)
   */
  async redeemOffer(
    id: string,
    data: {
      redemptionType: 'online' | 'instore';
      location?: {
        type: 'Point';
        coordinates: [number, number];
      };
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.post(`/offers/${id}/redeem`, data);
  },

  /**
   * Get user's redemptions (requires authentication)
   */
  async getUserRedemptions(params?: {
    status?: 'pending' | 'active' | 'used' | 'expired' | 'cancelled';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return apiClient.get(`/offers/user/redemptions?${queryParams.toString()}`);
  },

  /**
   * Get user's favorite offers (requires authentication)
   */
  async getUserFavoriteOffers(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Offer[]>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    return apiClient.get(`/offers/user/favorites?${queryParams.toString()}`);
  },

  /**
   * Add offer to favorites (requires authentication)
   */
  async addOfferToFavorites(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/offers/${id}/favorite`);
  },

  /**
   * Remove offer from favorites (requires authentication)
   */
  async removeOfferFromFavorites(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/offers/${id}/favorite`);
  },

  /**
   * Track offer view (analytics)
   */
  async trackOfferView(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/offers/${id}/view`);
  },

  /**
   * Track offer click (analytics)
   */
  async trackOfferClick(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/offers/${id}/click`);
  },
};

export default realOffersApi;