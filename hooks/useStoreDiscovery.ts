import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentLocation } from './useLocation';
import storesService from '@/services/storesApi';
import apiClient from '@/services/apiClient';

export interface DiscoveryStore {
  id: string;
  name: string;
  image?: string;
  banner?: string | string[];
  logo?: string;
  rating: {
    value: number;
    count?: number;
  };
  distance?: string;
  cashback?: {
    percentage: number;
    maxAmount?: number;
  };
  category?: string;
  location?: {
    coordinates?: [number, number];
    address?: string;
    city?: string;
  };
}

interface UseStoreDiscoveryState {
  topStores: DiscoveryStore[];
  popularStores: DiscoveryStore[];
  isLoadingTop: boolean;
  isLoadingPopular: boolean;
  errorTop: string | null;
  errorPopular: string | null;
}

interface UseStoreDiscoveryReturn extends UseStoreDiscoveryState {
  refreshTopStores: () => Promise<void>;
  refreshPopularStores: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Transform backend store data to DiscoveryStore format
 */
function transformStore(
  store: any,
  userCoordinates?: { latitude: number; longitude: number }
): DiscoveryStore {
  // Calculate distance if user coordinates and store coordinates are available
  let distance: string | undefined;
  if (userCoordinates && store.location?.coordinates) {
    const coords = store.location.coordinates;
    // MongoDB stores as [lng, lat]
    const [lng, lat] = Array.isArray(coords) ? coords : [coords.lng || coords.longitude, coords.lat || coords.latitude];
    if (typeof lat === 'number' && typeof lng === 'number') {
      distance = calculateDistance(
        userCoordinates.latitude,
        userCoordinates.longitude,
        lat,
        lng
      );
    }
  }

  // Use existing distance from store if available
  if (!distance && store.location?.distance) {
    distance = store.location.distance;
  }

  // Get image from various fields
  const image = (() => {
    if (store.banner) {
      if (Array.isArray(store.banner) && store.banner.length > 0) {
        return store.banner[0];
      }
      if (typeof store.banner === 'string') {
        return store.banner;
      }
    }
    return store.image || store.logo || '';
  })();

  return {
    id: store._id || store.id,
    name: store.name || 'Unknown Store',
    image,
    banner: store.banner,
    logo: store.logo,
    rating: {
      value: store.ratings?.average || store.rating?.value || 0,
      count: store.ratings?.count || store.rating?.count || 0,
    },
    distance,
    cashback: {
      percentage: store.offers?.cashback?.percentage || store.cashback?.percentage || 10,
      maxAmount: store.offers?.cashback?.maxAmount || store.cashback?.maxAmount,
    },
    category: store.category?.name || store.category || 'General',
    location: store.location,
  };
}

/**
 * Hook for Store Discovery section data
 * Provides trending stores and nearby stores with fallback logic
 */
export function useStoreDiscovery(limit: number = 10): UseStoreDiscoveryReturn {
  const { currentLocation } = useCurrentLocation();

  const [state, setState] = useState<UseStoreDiscoveryState>({
    topStores: [],
    popularStores: [],
    isLoadingTop: true,
    isLoadingPopular: true,
    errorTop: null,
    errorPopular: null,
  });

  // Get user coordinates from current location
  const userCoordinates = useMemo(() => {
    if (currentLocation?.coordinates) {
      return {
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
      };
    }
    return undefined;
  }, [currentLocation]);

  /**
   * Fetch trending stores with fallback chain:
   * 1. Trending stores API
   * 2. High-rated stores (4.5+)
   * 3. Featured stores
   */
  const fetchTopStores = useCallback(async (): Promise<DiscoveryStore[]> => {
    try {
      // Try trending stores first
      console.log('📊 [StoreDiscovery] Fetching trending stores...');
      const trendingResponse = await apiClient.get<any>('/stores/trending', { limit });

      if (trendingResponse.success && trendingResponse.data?.stores?.length > 0) {
        console.log(`✅ [StoreDiscovery] Got ${trendingResponse.data.stores.length} trending stores`);
        return trendingResponse.data.stores.map((store: any) =>
          transformStore(store, userCoordinates)
        );
      }

      // Fallback: High-rated stores (4.5+)
      console.log('📊 [StoreDiscovery] Trying high-rated stores fallback...');
      const highRatedResponse = await storesService.getStores({
        rating: 4.5,
        limit,
        sort: 'rating',
        order: 'desc',
      });

      if (highRatedResponse.success && highRatedResponse.data?.stores?.length > 0) {
        console.log(`✅ [StoreDiscovery] Got ${highRatedResponse.data.stores.length} high-rated stores`);
        return highRatedResponse.data.stores.map((store: any) =>
          transformStore(store, userCoordinates)
        );
      }

      // Final fallback: Featured stores
      console.log('📊 [StoreDiscovery] Trying featured stores fallback...');
      const featuredResponse = await storesService.getFeaturedStores(limit);

      if (featuredResponse.success && featuredResponse.data?.length > 0) {
        console.log(`✅ [StoreDiscovery] Got ${featuredResponse.data.length} featured stores`);
        return featuredResponse.data.map((store: any) =>
          transformStore(store, userCoordinates)
        );
      }

      return [];
    } catch (error) {
      console.error('❌ [StoreDiscovery] Error fetching top stores:', error);
      throw error;
    }
  }, [limit, userCoordinates]);

  /**
   * Fetch nearby stores using GPS location
   */
  const fetchPopularStores = useCallback(async (): Promise<DiscoveryStore[]> => {
    try {
      if (!userCoordinates) {
        console.log('⚠️ [StoreDiscovery] No user location available for nearby stores');
        // Fall back to featured stores if no location
        const featuredResponse = await storesService.getFeaturedStores(limit);
        if (featuredResponse.success && featuredResponse.data?.length > 0) {
          return featuredResponse.data.map((store: any) =>
            transformStore(store, undefined)
          );
        }
        return [];
      }

      console.log('📍 [StoreDiscovery] Fetching nearby stores...', userCoordinates);
      const nearbyResponse = await storesService.getNearbyStores(
        userCoordinates.latitude,
        userCoordinates.longitude,
        10, // 10km radius
        limit
      );

      if (nearbyResponse.success && nearbyResponse.data?.length > 0) {
        console.log(`✅ [StoreDiscovery] Got ${nearbyResponse.data.length} nearby stores`);
        return nearbyResponse.data.map((store: any) =>
          transformStore(store, userCoordinates)
        );
      }

      // Fallback to featured if no nearby stores
      console.log('📊 [StoreDiscovery] No nearby stores, falling back to featured...');
      const featuredResponse = await storesService.getFeaturedStores(limit);
      if (featuredResponse.success && featuredResponse.data?.length > 0) {
        return featuredResponse.data.map((store: any) =>
          transformStore(store, userCoordinates)
        );
      }

      return [];
    } catch (error) {
      console.error('❌ [StoreDiscovery] Error fetching popular stores:', error);
      throw error;
    }
  }, [limit, userCoordinates]);

  /**
   * Refresh top stores
   */
  const refreshTopStores = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingTop: true, errorTop: null }));
    try {
      const stores = await fetchTopStores();
      setState(prev => ({ ...prev, topStores: stores, isLoadingTop: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoadingTop: false,
        errorTop: error?.message || 'Failed to load top stores',
      }));
    }
  }, [fetchTopStores]);

  /**
   * Refresh popular stores
   */
  const refreshPopularStores = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingPopular: true, errorPopular: null }));
    try {
      const stores = await fetchPopularStores();
      setState(prev => ({ ...prev, popularStores: stores, isLoadingPopular: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoadingPopular: false,
        errorPopular: error?.message || 'Failed to load popular stores',
      }));
    }
  }, [fetchPopularStores]);

  /**
   * Refresh all stores
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshTopStores(), refreshPopularStores()]);
  }, [refreshTopStores, refreshPopularStores]);

  // Initial data fetch
  useEffect(() => {
    refreshTopStores();
  }, [refreshTopStores]);

  // Fetch popular stores when location becomes available
  useEffect(() => {
    refreshPopularStores();
  }, [refreshPopularStores]);

  return {
    ...state,
    refreshTopStores,
    refreshPopularStores,
    refreshAll,
  };
}

export default useStoreDiscovery;
