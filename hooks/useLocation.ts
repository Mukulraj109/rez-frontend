import { useState, useEffect, useCallback } from 'react';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LocationCoordinates,
  UserLocation,
  LocationHistoryEntry,
  AddressSearchResult,
  LocationAddress,
} from '@/types/location.types';

/**
 * Hook for managing location permission
 */
export function useLocationPermission() {
  const { state, requestLocationPermission } = useLocationContext();
  
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      const granted = await requestLocationPermission();
      return granted;
    } finally {
      setIsRequesting(false);
    }
  }, [requestLocationPermission]);

  return {
    permissionStatus: state.permissionStatus,
    isLocationEnabled: state.isLocationEnabled,
    isRequesting,
    requestPermission,
  };
}

/**
 * Hook for getting and updating current location
 */
export function useCurrentLocation() {
  const { state, getCurrentLocation, updateLocation } = useLocationContext();
  const { state: authState } = useAuth();
  
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshLocation = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return null;
    }

    setIsUpdating(true);
    try {
      const location = await getCurrentLocation();
      return location;
    } finally {
      setIsUpdating(false);
    }
  }, [getCurrentLocation, authState.isAuthenticated]);

  const updateUserLocation = useCallback(async (
    coordinates: LocationCoordinates,
    address?: string,
    source: 'manual' | 'gps' | 'ip' = 'manual'
  ) => {
    if (!authState.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    setIsUpdating(true);
    try {
      await updateLocation(coordinates, address, source);
    } finally {
      setIsUpdating(false);
    }
  }, [updateLocation, authState.isAuthenticated]);

  return {
    currentLocation: state.currentLocation,
    isLoading: state.isLoading || isUpdating,
    error: state.error,
    refreshLocation,
    updateLocation: updateUserLocation,
  };
}

/**
 * Hook for location history
 */
export function useLocationHistory() {
  const { state, getLocationHistory, clearLocationHistory } = useLocationContext();
  const { state: authState } = useAuth();
  
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return [];
    }

    setIsLoadingHistory(true);
    try {
      const history = await getLocationHistory();
      return history;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getLocationHistory, authState.isAuthenticated]);

  const clearHistory = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    try {
      await clearLocationHistory();
    } catch (error) {
      console.error('Clear history error:', error);
    }
  }, [clearLocationHistory, authState.isAuthenticated]);

  // Load history on mount
  useEffect(() => {
    if (authState.isAuthenticated && state.locationHistory.length === 0) {
      loadHistory();
    }
  }, [authState.isAuthenticated, loadHistory, state.locationHistory.length]);

  return {
    locationHistory: state.locationHistory,
    isLoading: isLoadingHistory,
    error: state.error,
    loadHistory,
    clearHistory,
  };
}

/**
 * Hook for address search and geocoding
 */
export function useAddressSearch() {
  const { searchAddresses, reverseGeocode, validateAddress } = useLocationContext();
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    try {
      const results = await searchAddresses(query);
      setSearchResults(results);
      return results;
    } finally {
      setIsSearching(false);
    }
  }, [searchAddresses]);

  const geocode = useCallback(async (coordinates: LocationCoordinates) => {
    try {
      const address = await reverseGeocode(coordinates);
      return address;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }, [reverseGeocode]);

  const validate = useCallback(async (address: string) => {
    setIsValidating(true);
    try {
      const isValid = await validateAddress(address);
      return isValid;
    } finally {
      setIsValidating(false);
    }
  }, [validateAddress]);

  const clearResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    isSearching,
    isValidating,
    search,
    geocode,
    validate,
    clearResults,
  };
}

/**
 * Hook for location-based features
 */
export function useLocationFeatures() {
  const { state } = useLocationContext();
  const { state: authState } = useAuth();
  
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const getNearbyStores = useCallback(async (radius: number = 5, limit: number = 20) => {
    if (!state.currentLocation || !authState.isAuthenticated) {
      return [];
    }

    setIsLoadingStores(true);
    try {
      // This would call the backend API for nearby stores
      // For now, return empty array
      setNearbyStores([]);
      return [];
    } catch (error) {
      console.error('Get nearby stores error:', error);
      return [];
    } finally {
      setIsLoadingStores(false);
    }
  }, [state.currentLocation, authState.isAuthenticated]);

  const isLocationAvailable = state.currentLocation !== null;
  const locationCity = state.currentLocation?.address.city || 'Unknown';
  const locationState = state.currentLocation?.address.state || 'Unknown';

  return {
    isLocationAvailable,
    locationCity,
    locationState,
    nearbyStores,
    isLoadingStores,
    getNearbyStores,
  };
}

/**
 * Hook for location initialization
 */
export function useLocationInit() {
  const { state, requestLocationPermission, getCurrentLocation } = useLocationContext();
  const { state: authState } = useAuth();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStep, setInitStep] = useState<'permission' | 'location' | 'complete'>('permission');

  const initializeLocation = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return false;
    }

    setIsInitializing(true);
    setInitStep('permission');

    try {
      // Step 1: Check/request permission
      if (state.permissionStatus !== 'granted') {
        const granted = await requestLocationPermission();
        if (!granted) {
          return false;
        }
      }

      setInitStep('location');

      // Step 2: Get current location
      if (!state.currentLocation) {
        await getCurrentLocation();
      }

      setInitStep('complete');
      return true;
    } catch (error) {
      console.error('Location initialization error:', error);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [
    authState.isAuthenticated,
    state.permissionStatus,
    state.currentLocation,
    requestLocationPermission,
    getCurrentLocation,
  ]);

  const isLocationReady = state.currentLocation !== null && state.permissionStatus === 'granted';

  return {
    isInitializing,
    initStep,
    isLocationReady,
    initializeLocation,
  };
}
