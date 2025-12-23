import apiClient from './apiClient';

interface NearbyActivity {
  id: string;
  firstName: string;
  savings: number;
  savingsType: 'cashback' | 'discount';
  storeName: string;
  storeId?: string;
  storeLogo?: string;
  timeAgo: string;
  distance?: string;
}

interface StoreAggregate {
  storeId: string;
  storeName: string;
  storeLogo?: string;
  todayRedemptions: number;
  message: string;
}

interface CityWideStats {
  totalPeopleToday: number;
  totalSavingsToday: number;
  avgSavings?: number;
  city: string;
  message: string;
}

interface NearbyActivityResponse {
  success: boolean;
  data: {
    activities: NearbyActivity[];
    storeAggregates: StoreAggregate[];
    cityWideStats: CityWideStats | null;
    meta: {
      totalNearbyToday: number;
      radiusKm: number;
      coordinates: {
        latitude: number;
        longitude: number;
      };
      cachedAt: string;
    };
  };
  message?: string;
}

interface GetNearbyActivityParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  city?: string;
}

interface CityStatsResponse {
  success: boolean;
  data: CityWideStats;
  message?: string;
}

// Category page social proof stats
export interface RecentBuyer {
  name: string;
  avatar: string;
  item: string;
  timeAgo: string;
}

export interface CategorySocialProofStats {
  _id: string | null;
  category: string | null;
  shoppedToday: number;
  totalEarned: number;
  topHashtags: string[];
  recentBuyers: RecentBuyer[];
  lastUpdated: string;
}

interface CategoryStatsResponse {
  success: boolean;
  data: { stats: CategorySocialProofStats };
  message?: string;
}

class SocialProofApi {
  /**
   * Get nearby user activity for social proof display
   * Shows real savings from nearby delivered orders
   */
  async getNearbyActivity(
    params: GetNearbyActivityParams
  ): Promise<NearbyActivityResponse> {
    try {
      const queryParams = new URLSearchParams({
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
        ...(params.radius && { radius: params.radius.toString() }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.city && { city: params.city }),
      });

      const response = await apiClient.get<NearbyActivityResponse>(
        `/social-proof/nearby-activity?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error('Error fetching nearby activity:', error);
      // Return empty data on error
      return {
        success: false,
        data: {
          activities: [],
          storeAggregates: [],
          cityWideStats: null,
          meta: {
            totalNearbyToday: 0,
            radiusKm: params.radius || 5,
            coordinates: {
              latitude: params.latitude,
              longitude: params.longitude,
            },
            cachedAt: new Date().toISOString(),
          },
        },
      };
    }
  }

  /**
   * Get city-wide statistics when no nearby activity is available
   */
  async getCityStats(city: string): Promise<CityStatsResponse> {
    try {
      const response = await apiClient.get<CityStatsResponse>(
        `/social-proof/city-stats?city=${encodeURIComponent(city)}`
      );

      return response;
    } catch (error) {
      console.error('Error fetching city stats:', error);
      return {
        success: false,
        data: {
          totalPeopleToday: 0,
          totalSavingsToday: 0,
          city,
          message: 'Be the first to save in your city today!',
        },
      };
    }
  }

  /**
   * Get social proof stats for a category page
   * @param categorySlug - Optional category slug to filter stats
   */
  async getCategoryStats(categorySlug?: string): Promise<CategoryStatsResponse> {
    try {
      const params = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : '';
      const response = await apiClient.get<CategoryStatsResponse>(
        `/stats/social${params}`
      );

      return response;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return {
        success: false,
        data: {
          stats: {
            _id: null,
            category: categorySlug || null,
            shoppedToday: 0,
            totalEarned: 0,
            topHashtags: [],
            recentBuyers: [],
            lastUpdated: new Date().toISOString(),
          }
        },
      };
    }
  }
}

// Singleton pattern using globalThis to persist across SSR module re-evaluations
const SOCIAL_PROOF_API_KEY = '__rezSocialProofApi__';

function getSocialProofApi(): SocialProofApi {
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any)[SOCIAL_PROOF_API_KEY]) {
      (globalThis as any)[SOCIAL_PROOF_API_KEY] = new SocialProofApi();
    }
    return (globalThis as any)[SOCIAL_PROOF_API_KEY];
  }
  return new SocialProofApi();
}

export default getSocialProofApi();
