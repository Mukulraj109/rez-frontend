import { useState, useEffect, useCallback } from 'react';
import { useCurrentLocation } from './useLocation';
import loyaltyApi, {
  HomepageLoyaltySummary,
  LoyaltyHubStats,
  FeaturedProduct,
} from '@/services/loyaltyApi';

interface UseLoyaltySectionOptions {
  autoFetch?: boolean; // Auto fetch when location available, default true
}

interface UseLoyaltySectionReturn {
  data: HomepageLoyaltySummary | null;
  loyaltyHub: LoyaltyHubStats | null;
  featuredLockProduct: FeaturedProduct | null;
  trendingService: FeaturedProduct | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching homepage loyalty section data
 * Includes loyalty hub stats, featured lock product, and trending service
 * Uses user's current location for nearby products/services
 */
export function useLoyaltySection(options: UseLoyaltySectionOptions = {}): UseLoyaltySectionReturn {
  const { autoFetch = true } = options;

  // Location hook
  const { currentLocation, isLoading: isLocationLoading } = useCurrentLocation();

  // State
  const [data, setData] = useState<HomepageLoyaltySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch loyalty section data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const latitude = currentLocation?.coordinates?.latitude;
      const longitude = currentLocation?.coordinates?.longitude;

      const response = await loyaltyApi.getHomepageSummary(latitude, longitude);

      if (response.success && response.data) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.error || response.message || 'Failed to fetch loyalty data');
        // Set default data on error
        setData({
          loyaltyHub: null,
          featuredLockProduct: null,
          trendingService: null,
        });
      }
    } catch (err: any) {
      console.error('[useLoyaltySection] Error fetching data:', err);
      setError(err?.message || 'Failed to fetch loyalty data');
      // Set default data on error
      setData({
        loyaltyHub: null,
        featuredLockProduct: null,
        trendingService: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation?.coordinates?.latitude, currentLocation?.coordinates?.longitude]);

  // Auto-fetch when location becomes available or changes
  useEffect(() => {
    if (autoFetch && !isLocationLoading) {
      fetchData();
    }
  }, [autoFetch, isLocationLoading, fetchData]);

  // Initial fetch even without location (will use default Bangalore coordinates)
  useEffect(() => {
    if (autoFetch && isLocationLoading) {
      // Start with loading state, will auto-fetch when location resolves
      setIsLoading(true);
    }
  }, [autoFetch, isLocationLoading]);

  return {
    data,
    loyaltyHub: data?.loyaltyHub || null,
    featuredLockProduct: data?.featuredLockProduct || null,
    trendingService: data?.trendingService || null,
    isLoading: isLoading || isLocationLoading,
    error,
    refetch: fetchData,
  };
}

export default useLoyaltySection;
