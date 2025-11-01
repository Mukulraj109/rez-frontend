import apiClient, { ApiResponse } from './apiClient';

// Types for the new offers API
export interface Offer {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  category: 'mega' | 'student' | 'new_arrival' | 'trending' | 'food' | 'fashion' | 'electronics' | 'general';
  type: 'cashback' | 'discount' | 'voucher' | 'combo' | 'special';
  cashbackPercentage: number;
  originalPrice?: number;
  discountedPrice?: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  distance?: number;
  store: {
    id: string;
    name: string;
    logo?: string;
    rating?: number;
    verified?: boolean;
  };
  validity: {
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  engagement: {
    likesCount: number;
    sharesCount: number;
    viewsCount: number;
    isLikedByUser?: boolean;
  };
  restrictions: {
    minOrderValue?: number;
    maxDiscountAmount?: number;
    applicableOn?: string[];
    excludedProducts?: string[];
    ageRestriction?: {
      minAge?: number;
      maxAge?: number;
    };
    userTypeRestriction?: 'student' | 'new_user' | 'premium' | 'all';
  };
  metadata: {
    isNew?: boolean;
    isTrending?: boolean;
    isBestSeller?: boolean;
    isSpecial?: boolean;
    priority: number;
    tags: string[];
    featured?: boolean;
    flashSale?: {
      isActive: boolean;
      endTime?: string;
      originalPrice?: number;
      salePrice?: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface OfferCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  backgroundColor?: string;
  isActive: boolean;
  priority: number;
  offers: string[];
  metadata: {
    displayOrder: number;
    isFeatured: boolean;
    parentCategory?: string;
    subcategories?: string[];
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface HeroBanner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  ctaText: string;
  ctaAction: string;
  ctaUrl?: string;
  backgroundColor: string;
  textColor?: string;
  isActive: boolean;
  priority: number;
  validFrom: string;
  validUntil: string;
  targetAudience: {
    userTypes?: ('student' | 'new_user' | 'premium' | 'all')[];
    ageRange?: {
      min?: number;
      max?: number;
    };
    locations?: string[];
    categories?: string[];
  };
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
  };
  metadata: {
    page: 'offers' | 'home' | 'category' | 'product' | 'all';
    position: 'top' | 'middle' | 'bottom';
    size: 'small' | 'medium' | 'large' | 'full';
    animation?: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface OfferSection {
  id: string;
  title: string;
  offers: Offer[];
  viewAllEnabled?: boolean;
}

export interface OffersPageData {
  heroBanner: HeroBanner | null;
  sections: {
    mega: {
      title: string;
      offers: Offer[];
    };
    students: {
      title: string;
      offers: Offer[];
    };
    newArrivals: {
      title: string;
      offers: Offer[];
    };
    trending: {
      title: string;
      offers: Offer[];
    };
  };
  userEngagement: {
    likedOffers: string[];
    userPoints: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

class RealOffersApi {
  /**
   * Get complete offers page data
   */
  async getOffersPageData(params?: {
    lat?: number;
    lng?: number;
  }): Promise<ApiResponse<OffersPageData>> {
    try {
      const response = await apiClient.get<OffersPageData>('/offers/page-data', params);
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching offers page data:', error);
      throw error;
    }
  }

  /**
   * Get all offers with filters
   */
  async getOffers(params?: {
    category?: string;
    store?: string;
    featured?: boolean;
    trending?: boolean;
    isNew?: boolean;
    minCashback?: number;
    maxCashback?: number;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Offer>>('/offers', params);
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching offers:', error);
      throw error;
    }
  }

  /**
   * Get mega offers
   */
  async getMegaOffers(limit?: number): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await apiClient.get<Offer[]>('/offers/mega', { limit });
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching mega offers:', error);
      throw error;
    }
  }

  /**
   * Get student offers
   */
  async getStudentOffers(limit?: number): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await apiClient.get<Offer[]>('/offers/students', { limit });
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching student offers:', error);
      throw error;
    }
  }

  /**
   * Get new arrival offers
   */
  async getNewArrivalOffers(limit?: number): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await apiClient.get<Offer[]>('/offers/new-arrivals', { limit });
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching new arrival offers:', error);
      throw error;
    }
  }

  /**
   * Get trending offers
   */
  async getTrendingOffers(limit?: number): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await apiClient.get<Offer[]>('/offers/trending', { limit });
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching trending offers:', error);
      throw error;
    }
  }

  /**
   * Get nearby offers
   */
  async getNearbyOffers(params: {
    lat: number;
    lng: number;
    maxDistance?: number;
    limit?: number;
  }): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await apiClient.get<Offer[]>('/offers/nearby', params);
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching nearby offers:', error);
      throw error;
    }
  }

  /**
   * Get single offer by ID
   */
  async getOfferById(id: string): Promise<ApiResponse<Offer>> {
    try {
      const response = await apiClient.get<Offer>(`/offers/${id}`);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error fetching offer ${id}:`, error);
      throw error;
    }
  }

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
  }): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Offer>>('/offers/search', params);
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error searching offers:', error);
      throw error;
    }
  }

  /**
   * Like/unlike an offer
   */
  async toggleOfferLike(id: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> {
    try {
      const response = await apiClient.post<{ isLiked: boolean; likesCount: number }>(`/offers/${id}/like`);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error toggling like for offer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Share an offer
   */
  async shareOffer(id: string, params?: {
    platform?: string;
    message?: string;
  }): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/offers/${id}/share`, params);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error sharing offer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Track offer view
   */
  async trackOfferView(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/offers/${id}/view`);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error tracking view for offer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Track offer click
   */
  async trackOfferClick(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/offers/${id}/click`);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error tracking click for offer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get offer categories
   */
  async getOfferCategories(): Promise<ApiResponse<OfferCategory[]>> {
    try {
      const response = await apiClient.get<OfferCategory[]>('/offer-categories');
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching offer categories:', error);
      throw error;
    }
  }

  /**
   * Get offer category by slug
   */
  async getOfferCategoryBySlug(slug: string): Promise<ApiResponse<OfferCategory>> {
    try {
      const response = await apiClient.get<OfferCategory>(`/offer-categories/${slug}`);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error fetching category ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get offers by category slug
   */
  async getOffersByCategorySlug(slug: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
    lat?: number;
    lng?: number;
  }): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Offer>>(`/offer-categories/${slug}/offers`, params);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error fetching offers for category ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get hero banners
   */
  async getHeroBanners(params?: {
    page?: string;
    position?: string;
  }): Promise<ApiResponse<HeroBanner[]>> {
    try {
      const response = await apiClient.get<HeroBanner[]>('/hero-banners', params);
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching hero banners:', error);
      throw error;
    }
  }

  /**
   * Track hero banner view
   */
  async trackHeroBannerView(id: string, params?: {
    source?: string;
    device?: string;
      location?: {
        type: 'Point';
        coordinates: [number, number];
      };
  }): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/hero-banners/${id}/view`, params);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error tracking hero banner view ${id}:`, error);
      throw error;
    }
  }

  /**
   * Track hero banner click
   */
  async trackHeroBannerClick(id: string, params?: {
    source?: string;
    device?: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  }): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/hero-banners/${id}/click`, params);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error tracking hero banner click ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get user's favorite offers
   */
  async getUserFavoriteOffers(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Offer>>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Offer>>('/offers/user/favorites', params);
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching user favorite offers:', error);
      throw error;
    }
  }

  /**
   * Add offer to favorites
   */
  async addOfferToFavorites(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/offers/${id}/favorite`);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error adding offer ${id} to favorites:`, error);
      throw error;
    }
  }

  /**
   * Remove offer from favorites
   */
  async removeOfferFromFavorites(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/offers/${id}/favorite`);
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error removing offer ${id} from favorites:`, error);
      throw error;
    }
  }

  /**
   * Get recommended offers
   */
  async getRecommendedOffers(limit?: number): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await apiClient.get<Offer[]>('/offers/user/recommendations', { limit });
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching recommended offers:', error);
      throw error;
    }
  }

  /**
   * Redeem an offer - generates a voucher for the user
   */
  async redeemOffer(id: string, redemptionType: 'online' | 'instore' = 'online'): Promise<ApiResponse<{
    offer: Offer;
    voucher: {
      voucherCode: string;
      cashbackAmount: number;
      expiresAt: string;
    };
  }>> {
    try {
      const response = await apiClient.post<{
        offer: Offer;
        voucher: {
          voucherCode: string;
          cashbackAmount: number;
          expiresAt: string;
        };
      }>(`/offers/${id}/redeem`, { redemptionType });
      return response;
    } catch (error) {
      console.error(`[OFFERS API] Error redeeming offer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get user's offer redemptions
   */
  async getUserRedemptions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>('/offers/user/redemptions', params);
      return response;
    } catch (error) {
      console.error('[OFFERS API] Error fetching user redemptions:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const realOffersApi = new RealOffersApi();
export default realOffersApi;