import { useState, useEffect, useCallback } from 'react';
import { useCurrentLocation, useLocationPermission } from './useLocation';
import storesService from '@/services/storesApi';

// Interface for nearby store data from API
export interface NearbyStore {
  id: string;
  name: string;
  distance: string;
  isLive: boolean;
  status: string;
  waitTime: string;
  cashback: string;
  closingSoon?: boolean;
}

interface UseNearbyStoresOptions {
  radius?: number; // km, default 2
  limit?: number; // max stores, default 5
  autoFetch?: boolean; // auto fetch when location available, default true
}

interface UseNearbyStoresReturn {
  stores: NearbyStore[];
  isLoading: boolean;
  error: string | null;
  hasLocationPermission: boolean;
  refetch: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
}

/**
 * Hook for fetching nearby stores for the homepage "Stores Near You" section
 * Uses the user's current location to fetch stores with computed fields like
 * wait time, status, cashback, and distance.
 */
export function useNearbyStores(options: UseNearbyStoresOptions = {}): UseNearbyStoresReturn {
  const { radius = 2, limit = 5, autoFetch = true } = options;

  // Location hooks
  const { currentLocation, isLoading: isLocationLoading, error: locationError } = useCurrentLocation();
  const { permissionStatus, requestPermission } = useLocationPermission();

  // State
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have location permission
  const hasLocationPermission = permissionStatus === 'granted';

  // Fetch nearby stores
  const fetchNearbyStores = useCallback(async () => {
    // Check if we have location coordinates
    if (!currentLocation?.coordinates?.latitude || !currentLocation?.coordinates?.longitude) {
      setIsLoading(false);
      setError(null); // Not an error - just no location yet
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await storesService.getNearbyStoresForHomepage(
        currentLocation.coordinates.latitude,
        currentLocation.coordinates.longitude,
        radius,
        limit
      );

      if (response.success && response.data?.stores) {
        setStores(response.data.stores);
        setError(null);
      } else {
        setError(response.error || response.message || 'Failed to fetch nearby stores');
        setStores([]);
      }
    } catch (err: any) {
      console.error('[useNearbyStores] Error fetching stores:', err);
      setError(err?.message || 'Failed to fetch nearby stores');
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation?.coordinates?.latitude, currentLocation?.coordinates?.longitude, radius, limit]);

  // Auto-fetch when location becomes available
  useEffect(() => {
    if (autoFetch && !isLocationLoading && currentLocation?.coordinates) {
      fetchNearbyStores();
    }
  }, [autoFetch, isLocationLoading, currentLocation?.coordinates, fetchNearbyStores]);

  // Update loading state based on location loading
  useEffect(() => {
    if (isLocationLoading) {
      setIsLoading(true);
    }
  }, [isLocationLoading]);

  // Handle location error
  useEffect(() => {
    if (locationError && !currentLocation?.coordinates) {
      setError(locationError);
      setIsLoading(false);
    }
  }, [locationError, currentLocation?.coordinates]);

  // Request location permission
  const handleRequestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermission();
    return granted;
  }, [requestPermission]);

  return {
    stores,
    isLoading: isLoading || isLocationLoading,
    error,
    hasLocationPermission,
    refetch: fetchNearbyStores,
    requestLocationPermission: handleRequestPermission,
  };
}

export default useNearbyStores;
