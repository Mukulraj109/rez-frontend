import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { locationService } from '@/services/locationService';
import {
  LocationState,
  LocationContextType,
  LocationCoordinates,
  UserLocation,
  LocationHistoryEntry,
  AddressSearchResult,
  LocationAddress,
  LocationPermissionResult,
} from '@/types/location.types';

// Action types
type LocationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_LOCATION'; payload: UserLocation | null }
  | { type: 'SET_LOCATION_HISTORY'; payload: LocationHistoryEntry[] }
  | { type: 'SET_PERMISSION_STATUS'; payload: LocationPermissionResult }
  | { type: 'SET_LOCATION_ENABLED'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: LocationState = {
  currentLocation: null,
  locationHistory: [],
  isLoading: false,
  error: null,
  permissionStatus: 'undetermined',
  isLocationEnabled: false,
};

// Reducer
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload, isLoading: false };
    
    case 'SET_LOCATION_HISTORY':
      return { ...state, locationHistory: action.payload };
    
    case 'SET_PERMISSION_STATUS':
      return { 
        ...state, 
        permissionStatus: action.payload.status,
        isLocationEnabled: action.payload.status === 'granted'
      };
    
    case 'SET_LOCATION_ENABLED':
      return { ...state, isLocationEnabled: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Create context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider component
interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  // Initialize location context
  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Location initialization timeout')), 10000)
      );
      const initPromise = async () => {
        // Check permission status
        const permission = await locationService.getLocationPermissionStatus();
        dispatch({ type: 'SET_PERMISSION_STATUS', payload: permission });
        // Try to get cached location
        const cachedLocation = await locationService.getCachedLocation();
        if (cachedLocation && locationService.isLocationFresh(cachedLocation)) {
          dispatch({ type: 'SET_CURRENT_LOCATION', payload: cachedLocation });
        } else if (permission.status === 'granted') {
          try {
            // Try to get current location from server first
            const serverLocation = await locationService.getCurrentUserLocation();
            if (serverLocation) {
              dispatch({ type: 'SET_CURRENT_LOCATION', payload: serverLocation });
            }
          } catch (serverError) {
            try {
              // Fallback to GPS location
              const coordinates = await locationService.getCurrentLocation();
              const geocodedLocation = await locationService.reverseGeocode(coordinates);
              const userLocation: UserLocation = {
                coordinates,
                address: geocodedLocation,
                lastUpdated: new Date(),
                source: 'gps' as const,
              };
              await locationService.cacheLocation(userLocation);
              dispatch({ type: 'SET_CURRENT_LOCATION', payload: userLocation });
            } catch (gpsError) {
            }
          }
        } else {
        }
      };
      
      // Race between initialization and timeout
      await Promise.race([initPromise(), timeoutPromise]);
      
    } catch (error) {
      console.error('❌ LocationContext: Location initialization error:', error);
      // Set a default location if initialization fails
      const defaultLocation: UserLocation = {
        coordinates: {
          latitude: 12.9716,
          longitude: 77.5946,
        },
        address: {
          address: 'Bangalore, Karnataka, India',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          pincode: '560001',
          formattedAddress: 'Bangalore, Karnataka 560001, India',
        },
        lastUpdated: new Date(),
        source: 'gps' as const,
      };
      dispatch({ type: 'SET_CURRENT_LOCATION', payload: defaultLocation });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  };

  const updateLocation = async (
    coordinates: LocationCoordinates,
    address?: string,
    source: 'manual' | 'gps' | 'ip' = 'gps',
    extraData?: { city?: string; state?: string; pincode?: string }
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const userLocation = await locationService.updateUserLocation(coordinates, address, source, extraData);
      dispatch({ type: 'SET_CURRENT_LOCATION', payload: userLocation });
    } catch (error) {
      console.error('Update location error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update location' });
      throw error;
    }
  };

  // Set manual location - works for both authenticated and unauthenticated users
  // This caches locally and updates state without requiring server authentication
  const setManualLocation = async (location: UserLocation): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Cache the location locally
      await locationService.cacheLocation(location);

      // Update the context state
      dispatch({ type: 'SET_CURRENT_LOCATION', payload: location });
    } catch (error) {
      console.error('Set manual location error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to set location' });
      throw error;
    }
  };

  const getCurrentLocation = async (): Promise<UserLocation | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Check permission first
      const permission = await locationService.getLocationPermissionStatus();
      if (permission.status !== 'granted') {
        dispatch({ type: 'SET_ERROR', payload: 'Location permission not granted' });
        return null;
      }

      // Get current location
      const coordinates = await locationService.getCurrentLocation();
      
      // Update location on server
      const userLocation = await locationService.updateUserLocation(coordinates, undefined, 'gps');
      dispatch({ type: 'SET_CURRENT_LOCATION', payload: userLocation });
      
      return userLocation;
    } catch (error) {
      console.error('Get current location error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get current location' });
      return null;
    }
  };

  const getLocationHistory = async (): Promise<LocationHistoryEntry[]> => {
    try {
      const history = await locationService.getLocationHistory();
      dispatch({ type: 'SET_LOCATION_HISTORY', payload: history });
      return history;
    } catch (error) {
      console.error('Get location history error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get location history' });
      return [];
    }
  };

  const clearLocationHistory = async (): Promise<void> => {
    try {
      // This would need to be implemented in the backend
      dispatch({ type: 'SET_LOCATION_HISTORY', payload: [] });
    } catch (error) {
      console.error('Clear location history error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear location history' });
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const permission = await locationService.requestLocationPermission();
      dispatch({ type: 'SET_PERMISSION_STATUS', payload: permission });
      
      if (permission.status === 'granted') {
        // Try to get current location after permission is granted
        try {
          const coordinates = await locationService.getCurrentLocation();
          // Try to get address from coordinates using geocoding
          const geocodedLocation = await locationService.reverseGeocode(coordinates);
          // Create user location object
          const userLocation: UserLocation = {
            coordinates,
            address: geocodedLocation,
            lastUpdated: new Date(),
            source: 'gps' as const,
          };
          
          // Try to update on server if authenticated, otherwise just store locally
          try {
            await locationService.updateUserLocation(coordinates, geocodedLocation.formattedAddress, 'gps');
          } catch (serverError) {
            // Store locally if server update fails
            await locationService.cacheLocation(userLocation);
          }
          
          dispatch({ type: 'SET_CURRENT_LOCATION', payload: userLocation });
        } catch (locationError) {
          console.error('❌ LocationContext: Get location after permission error:', locationError);
          // Don't throw error here, permission was granted successfully
        }
      }
      
      return permission.status === 'granted';
    } catch (error) {
      console.error('Request location permission error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to request location permission' });
      return false;
    }
  };

  const searchAddresses = async (query: string): Promise<AddressSearchResult[]> => {
    try {
      return await locationService.searchAddresses(query);
    } catch (error) {
      console.error('Search addresses error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search addresses' });
      return [];
    }
  };

  const reverseGeocode = async (coordinates: LocationCoordinates): Promise<LocationAddress> => {
    try {
      return await locationService.reverseGeocode(coordinates);
    } catch (error) {
      console.error('Reverse geocode error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get address from coordinates' });
      throw error;
    }
  };

  const validateAddress = async (address: string): Promise<boolean> => {
    try {
      return await locationService.validateAddress(address);
    } catch (error) {
      console.error('Validate address error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to validate address' });
      return false;
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: LocationContextType = {
    state,
    updateLocation,
    setManualLocation,
    getCurrentLocation,
    getLocationHistory,
    clearLocationHistory,
    requestLocationPermission,
    searchAddresses,
    reverseGeocode,
    validateAddress,
    clearError,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

// Custom hook to use location context
export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

// Custom hook for location permission
export function useLocationPermission() {
  const { state, requestLocationPermission } = useLocation();
  
  return {
    permissionStatus: state.permissionStatus,
    isLocationEnabled: state.isLocationEnabled,
    requestPermission: requestLocationPermission,
  };
}

// Custom hook for current location
export function useCurrentLocation() {
  const { state, getCurrentLocation, updateLocation } = useLocation();
  
  return {
    currentLocation: state.currentLocation,
    isLoading: state.isLoading,
    error: state.error,
    getCurrentLocation,
    updateLocation,
  };
}

// Custom hook for location history
export function useLocationHistory() {
  const { state, getLocationHistory, clearLocationHistory } = useLocation();
  
  return {
    locationHistory: state.locationHistory,
    isLoading: state.isLoading,
    error: state.error,
    getLocationHistory,
    clearLocationHistory,
  };
}
