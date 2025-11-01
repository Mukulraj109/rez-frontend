import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import {
  LocationCoordinates,
  LocationAddress,
  UserLocation,
  LocationHistoryEntry,
  AddressSearchResult,
  GeocodeResult,
  LocationStats,
  LocationPermissionResult,
  LocationUpdateOptions,
  LocationServiceConfig,
} from '@/types/location.types';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_LOCATION: 'current_location',
  LOCATION_HISTORY: 'location_history',
  LOCATION_PERMISSION: 'location_permission',
  LOCATION_PREFERENCES: 'location_preferences',
};

// Default configuration
const DEFAULT_CONFIG: LocationServiceConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_LOCATION_API_URL || 'http://localhost:5001/api/location',
  geocodingApiUrl: process.env.EXPO_PUBLIC_GEOCODING_API_URL || 'http://localhost:5001/api/location/geocode',
  storesApiUrl: process.env.EXPO_PUBLIC_STORES_API_URL || 'http://localhost:5001/api/stores',
  defaultLocation: {
    latitude: parseFloat(process.env.EXPO_PUBLIC_DEFAULT_LOCATION_LAT || '12.9716'),
    longitude: parseFloat(process.env.EXPO_PUBLIC_DEFAULT_LOCATION_LNG || '77.5946'),
  },
  defaultLocationName: process.env.EXPO_PUBLIC_DEFAULT_LOCATION_NAME || 'Bangalore, India',
  enableBackgroundLocation: process.env.EXPO_PUBLIC_ENABLE_BACKGROUND_LOCATION === 'true',
  locationUpdateInterval: parseInt(process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL || '300000'),
  maxLocationAge: parseInt(process.env.EXPO_PUBLIC_MAX_LOCATION_AGE || '3600000'),
};

class LocationService {
  private config: LocationServiceConfig;
  private apiClient: any;

  constructor(config?: Partial<LocationServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    // Use the main API client that has authentication
    this.apiClient = apiClient;
  }

  /**
   * Request location permission
   */
  async requestLocationPermission(): Promise<LocationPermissionResult> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      const result: LocationPermissionResult = {
        status: status as any,
        canAskAgain: status !== 'denied',
      };

      // Save permission status
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_PERMISSION, JSON.stringify(result));
      
      return result;
    } catch (error) {
      console.error('Location permission error:', error);
      return {
        status: 'denied',
        canAskAgain: false,
        message: 'Failed to request location permission',
      };
    }
  }

  /**
   * Get current location permission status
   */
  async getLocationPermissionStatus(): Promise<LocationPermissionResult> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
        return {
        status: status as any,
        canAskAgain: status !== 'denied',
      };
    } catch (error) {
      console.error('Get permission status error:', error);
      return {
        status: 'undetermined',
        canAskAgain: true,
      };
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(options?: LocationUpdateOptions): Promise<LocationCoordinates> {
    try {
      const permission = await this.getLocationPermissionStatus();
      if (permission.status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const locationOptions: Location.LocationOptions = {
        accuracy: this.mapAccuracy(options?.accuracy || 'balanced'),
      };

      const location = await Location.getCurrentPositionAsync(locationOptions);
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Get current location error:', error);
      throw new Error('Failed to get current location');
    }
  }

  /**
   * Update user location on server
   */
  async updateUserLocation(
    coordinates: LocationCoordinates,
    address?: string,
    source: 'manual' | 'gps' | 'ip' = 'gps'
  ): Promise<UserLocation> {
    try {
      const response = await this.apiClient.post('/location/update', {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address,
        source,
      });

      const locationData = response.data.data.location;
      
      const userLocation: UserLocation = {
        coordinates: {
          latitude: locationData.coordinates[1],
          longitude: locationData.coordinates[0],
        },
        address: {
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          country: 'India', // Default for now
          pincode: locationData.pincode,
          formattedAddress: locationData.address,
        },
        timezone: locationData.timezone,
        lastUpdated: new Date(),
        source,
      };

      // Save to local storage
      await this.saveCurrentLocation(userLocation);

      return userLocation;
    } catch (error) {
      console.error('Update location error:', error);
      throw new Error('Failed to update location');
    }
  }

  /**
   * Get current user location from server
   */
  async getCurrentUserLocation(): Promise<UserLocation | null> {

    try {
      const response = await this.apiClient.get('/location/current');

      const locationData = response.data.data.location;
      
      return {
        coordinates: {
          latitude: locationData.coordinates[1],
          longitude: locationData.coordinates[0],
        },
        address: {
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          country: 'India',
          pincode: locationData.pincode,
          formattedAddress: locationData.address,
        },
        timezone: locationData.timezone,
        lastUpdated: new Date(),
        source: 'gps',
      };
    } catch (error) {
      console.error('❌ LocationService: Get current user location error:', error);
      return null;
    }
  }

  /**
   * Get location history
   */
  async getLocationHistory(page: number = 1, limit: number = 10): Promise<LocationHistoryEntry[]> {
    try {
      const response = await this.apiClient.get('/location/history', {
        params: { page, limit },
      });
      
      return response.data.data.history.map((entry: any) => ({
        coordinates: {
          latitude: entry.coordinates[1],
          longitude: entry.coordinates[0],
        },
        address: entry.address,
        city: entry.city,
        timestamp: new Date(entry.timestamp),
        source: entry.source,
      }));
    } catch (error) {
      console.error('Get location history error:', error);
      return [];
    }
  }

  /**
   * Reverse geocoding - Convert coordinates to address
   */
  async reverseGeocode(coordinates: LocationCoordinates): Promise<LocationAddress> {
    try {
      const response = await this.apiClient.post('/location/geocode', {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      
      const data = response.data.data;
        return {
        address: data.formattedAddress,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        formattedAddress: data.formattedAddress,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to get address from coordinates');
    }
  }

  /**
   * Search addresses
   */
  async searchAddresses(query: string, limit: number = 5): Promise<AddressSearchResult[]> {
    try {
      const response = await this.apiClient.post('/location/search', {
        query,
        limit,
      });
      
      return response.data.data.results.map((result: any) => ({
        address: result.address,
        coordinates: {
          latitude: result.coordinates[1],
          longitude: result.coordinates[0],
        },
        formattedAddress: result.formattedAddress,
        placeId: result.placeId,
      }));
    } catch (error) {
      console.error('Address search error:', error);
      return [];
    }
  }

  /**
   * Validate address
   */
  async validateAddress(address: string): Promise<boolean> {
    try {
      const response = await this.apiClient.post('/location/validate', { address });
      return response.data.data.isValid;
    } catch (error) {
      console.error('Address validation error:', error);
      return false;
    }
  }

  /**
   * Get timezone for coordinates
   */
  async getTimezone(coordinates: LocationCoordinates): Promise<string> {
    try {
      const response = await this.apiClient.get('/location/timezone', {
        params: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      });
      
      return response.data.data.timezone;
    } catch (error) {
      console.error('Get timezone error:', error);
      return 'Asia/Kolkata'; // Default timezone
    }
  }

  /**
   * Get nearby stores
   */
  async getNearbyStores(
    coordinates: LocationCoordinates,
    radius: number = 5,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/nearby-stores', {
        params: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radius,
          limit,
        },
      });
      
      return response.data.data.stores;
    } catch (error) {
      console.error('Get nearby stores error:', error);
      return [];
    }
  }

  /**
   * Get location statistics
   */
  async getLocationStats(): Promise<LocationStats> {
    try {
      const response = await this.apiClient.get('/stats');
      const data = response.data.data.stats;
      
      return {
        totalLocations: data.totalLocations,
        uniqueCities: data.uniqueCities,
        mostVisitedCity: data.mostVisitedCity,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null,
        currentLocation: data.currentLocation ? {
          city: data.currentLocation.city,
          state: data.currentLocation.state,
          coordinates: {
            latitude: data.currentLocation.coordinates[1],
            longitude: data.currentLocation.coordinates[0],
          },
        } : null,
      };
    } catch (error) {
      console.error('Get location stats error:', error);
      throw new Error('Failed to get location statistics');
    }
  }

  /**
   * Save current location to local storage
   */
  private async saveCurrentLocation(location: UserLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error('Save location error:', error);
    }
  }

  /**
   * Get current location from local storage
   */
  async getCachedLocation(): Promise<UserLocation | null> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
      if (cached) {
        const location = JSON.parse(cached);
        location.lastUpdated = new Date(location.lastUpdated);
        return location;
      }
      return null;
    } catch (error) {
      console.error('Get cached location error:', error);
      return null;
    }
  }

  /**
   * Clear location data
   */
  async clearLocationData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CURRENT_LOCATION,
        STORAGE_KEYS.LOCATION_HISTORY,
        STORAGE_KEYS.LOCATION_PERMISSION,
      ]);
    } catch (error) {
      console.error('Clear location data error:', error);
    }
  }

  /**
   * Map accuracy string to Location.Accuracy
   */
  private mapAccuracy(accuracy: string): Location.Accuracy {
    switch (accuracy) {
      case 'lowest':
        return Location.Accuracy.Lowest;
      case 'low':
        return Location.Accuracy.Low;
      case 'balanced':
        return Location.Accuracy.Balanced;
      case 'high':
        return Location.Accuracy.High;
      case 'highest':
        return Location.Accuracy.Highest;
      default:
        return Location.Accuracy.Balanced;
    }
  }

  /**
   * Check if location is fresh (not too old)
   */
  isLocationFresh(location: UserLocation): boolean {
    const now = new Date();
    const age = now.getTime() - location.lastUpdated.getTime();
    return age < this.config.maxLocationAge;
  }

  /**
   * Get default location
   */
  getDefaultLocation(): UserLocation {
    return {
      coordinates: this.config.defaultLocation,
      address: {
        address: this.config.defaultLocationName,
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        formattedAddress: this.config.defaultLocationName,
      },
      timezone: 'Asia/Kolkata',
      lastUpdated: new Date(),
      source: 'manual',
    };
  }

  /**
   * Cache location locally
   */
  async cacheLocation(location: UserLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(location));

    } catch (error) {
      console.error('❌ LocationService: Failed to cache location:', error);
    }
  }
}

export const locationService = new LocationService();