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
    console.log('🚀 LocationContext: Starting location initialization...');
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Location initialization timeout')), 10000)
      );
      
      const initPromise = async () => {
        console.log('📍 LocationContext: Checking permission status...');
        // Check permission status
        const permission = await locationService.getLocationPermissionStatus();
        console.log('📍 LocationContext: Permission status:', permission);
        dispatch({ type: 'SET_PERMISSION_STATUS', payload: permission });
        
        console.log('📍 LocationContext: Checking cached location...');
        // Try to get cached location
        const cachedLocation = await locationService.getCachedLocation();
        console.log('📍 LocationContext: Cached location:', cachedLocation);
        
        if (cachedLocation && locationService.isLocationFresh(cachedLocation)) {
          console.log('📍 LocationContext: Using cached location');
          dispatch({ type: 'SET_CURRENT_LOCATION', payload: cachedLocation });
        } else if (permission.status === 'granted') {
          console.log('📍 LocationContext: Permission granted, trying to get location...');
          try {
            // Try to get current location from server first
            const serverLocation = await locationService.getCurrentUserLocation();
            console.log('📍 LocationContext: Server location:', serverLocation);
            if (serverLocation) {
              dispatch({ type: 'SET_CURRENT_LOCATION', payload: serverLocation });
            }
          } catch (serverError) {
            console.log('📍 LocationContext: Server location failed (user might not be authenticated), trying GPS...');
            try {
              // Fallback to GPS location
              const coordinates = await locationService.getCurrentLocation();
              const geocodedLocation = await locationService.reverseGeocode(coordinates);
              const userLocation = {
                coordinates,
                address: geocodedLocation.address,
                timezone: geocodedLocation.timezone,
                lastUpdated: new Date(),
                source: 'gps' as const,
              };
              await locationService.cacheLocation(userLocation);
              dispatch({ type: 'SET_CURRENT_LOCATION', payload: userLocation });
            } catch (gpsError) {
              console.log('📍 LocationContext: GPS location also failed, will use default location');
            }
          }
        } else {
          console.log('📍 LocationContext: Permission not granted, will use default location');
        }
      };
      
      // Race between initialization and timeout
      await Promise.race([initPromise(), timeoutPromise]);
      
    } catch (error) {
      console.error('❌ LocationContext: Location initialization error:', error);
      // Set a default location if initialization fails
      const defaultLocation = {
        coordinates: {
          latitude: 12.9716,
          longitude: 77.5946,
        },
        address: {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          pincode: '560001',
        },
        lastUpdated: new Date(),
        source: 'default' as const,
      };
      console.log('📍 LocationContext: Setting default location:', defaultLocation);
      dispatch({ type: 'SET_CURRENT_LOCATION', payload: defaultLocation });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  };

  const updateLocation = async (
    coordinates: LocationCoordinates,
    address?: string,
    source: 'manual' | 'gps' | 'ip' = 'gps'
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const userLocation = await locationService.updateUserLocation(coordinates, address, source);
      dispatch({ type: 'SET_CURRENT_LOCATION', payload: userLocation });
    } catch (error) {
      console.error('Update location error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update location' });
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
          console.log('📍 LocationContext: Getting current location after permission granted...');
          const coordinates = await locationService.getCurrentLocation();
          console.log('📍 LocationContext: Got coordinates:', coordinates);
          
          // Try to get address from coordinates using geocoding
          const geocodedLocation = await locationService.reverseGeocode(coordinates);
          console.log('📍 LocationContext: Geocoded location:', geocodedLocation);
          
          // Create user location object
          const userLocation = {
            coordinates,
            address: geocodedLocation.address,
            timezone: geocodedLocation.timezone,
            lastUpdated: new Date(),
            source: 'gps' as const,
          };
          
          // Try to update on server if authenticated, otherwise just store locally
          try {
            await locationService.updateUserLocation(coordinates, geocodedLocation.formattedAddress, 'gps');
            console.log('📍 LocationContext: Location updated on server');
          } catch (serverError) {
            console.log('📍 LocationContext: Server update failed (user might not be authenticated), storing locally');
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
