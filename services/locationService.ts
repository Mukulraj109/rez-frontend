import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface UserLocation {
  coords: LocationCoords;
  timestamp: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

export interface LocationServiceOptions {
  accuracy?: Location.LocationAccuracy;
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
  distanceInterval?: number;
}

// Storage keys
const STORAGE_KEYS = {
  LAST_LOCATION: 'last_known_location',
  LOCATION_SETTINGS: 'location_settings',
  PERMISSION_STATUS: 'location_permission_status',
};

// Default options
const DEFAULT_OPTIONS: Required<LocationServiceOptions> = {
  accuracy: Location.LocationAccuracy.Balanced,
  timeout: 10000, // 10 seconds
  maximumAge: 300000, // 5 minutes
  enableHighAccuracy: true,
  distanceInterval: 10, // 10 meters
};

class LocationService {
  private lastKnownLocation: UserLocation | null = null;
  private isWatchingLocation = false;
  private watchSubscription: Location.LocationSubscription | null = null;
  private permissionStatus: LocationPermissionStatus | null = null;

  // Initialize location service
  async initialize(): Promise<void> {
    try {
      // Load cached location and settings
      await this.loadCachedLocation();
      await this.checkPermissionStatus();
    } catch (error) {
      console.error('Failed to initialize location service:', error);
    }
  }

  // Request location permissions
  async requestPermissions(): Promise<LocationPermissionStatus> {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        return {
          granted: false,
          canAskAgain: false,
          status: Location.PermissionStatus.DENIED,
        };
      }

      // Get current permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== Location.PermissionStatus.GRANTED) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      const permissionResult: LocationPermissionStatus = {
        granted: finalStatus === Location.PermissionStatus.GRANTED,
        canAskAgain: finalStatus !== Location.PermissionStatus.DENIED,
        status: finalStatus,
      };

      this.permissionStatus = permissionResult;
      await this.savePermissionStatus(permissionResult);

      return permissionResult;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: Location.PermissionStatus.DENIED,
      };
    }
  }

  // Get current location
  async getCurrentLocation(options?: LocationServiceOptions): Promise<UserLocation | null> {
    try {
      // Check permissions first
      if (!this.permissionStatus?.granted) {
        const permissionResult = await this.requestPermissions();
        if (!permissionResult.granted) {
          throw new Error('Location permission denied');
        }
      }

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: mergedOptions.accuracy,
        timeInterval: mergedOptions.timeout,
        distanceInterval: mergedOptions.distanceInterval,
      });

      // Create user location object
      const userLocation: UserLocation = {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
      };

      // Try to get address
      try {
        const address = await this.reverseGeocode(userLocation.coords);
        if (address) {
          userLocation.address = address.address;
          userLocation.city = address.city;
          userLocation.region = address.region;
          userLocation.country = address.country;
          userLocation.postalCode = address.postalCode;
        }
      } catch (geocodeError) {
        console.warn('Failed to get address for location:', geocodeError);
      }

      // Cache the location
      this.lastKnownLocation = userLocation;
      await this.saveLocation(userLocation);

      return userLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Return cached location if available
      if (this.lastKnownLocation) {
        console.log('Returning cached location');
        return this.lastKnownLocation;
      }
      
      return null;
    }
  }

  // Start watching location changes
  async startWatchingLocation(
    callback: (location: UserLocation) => void,
    options?: LocationServiceOptions
  ): Promise<boolean> {
    try {
      if (this.isWatchingLocation) {
        console.warn('Already watching location');
        return true;
      }

      // Check permissions
      if (!this.permissionStatus?.granted) {
        const permissionResult = await this.requestPermissions();
        if (!permissionResult.granted) {
          throw new Error('Location permission denied');
        }
      }

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // Start watching location
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: mergedOptions.accuracy,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: mergedOptions.distanceInterval,
        },
        async (location) => {
          const userLocation: UserLocation = {
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              altitude: location.coords.altitude,
              accuracy: location.coords.accuracy,
              altitudeAccuracy: location.coords.altitudeAccuracy,
              heading: location.coords.heading,
              speed: location.coords.speed,
            },
            timestamp: location.timestamp,
          };

          // Update cached location
          this.lastKnownLocation = userLocation;
          await this.saveLocation(userLocation);

          // Call callback
          callback(userLocation);
        }
      );

      this.isWatchingLocation = true;
      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      return false;
    }
  }

  // Stop watching location
  async stopWatchingLocation(): Promise<void> {
    try {
      if (this.watchSubscription) {
        this.watchSubscription.remove();
        this.watchSubscription = null;
      }
      this.isWatchingLocation = false;
    } catch (error) {
      console.error('Error stopping location watch:', error);
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(coords: LocationCoords): Promise<{
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  } | null> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (result.length > 0) {
        const location = result[0];
        return {
          address: [location.streetNumber, location.street].filter(Boolean).join(' '),
          city: location.city || undefined,
          region: location.region || undefined,
          country: location.country || undefined,
          postalCode: location.postalCode || undefined,
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  // Forward geocode address to coordinates
  async forwardGeocode(address: string): Promise<LocationCoords[]> {
    try {
      const result = await Location.geocodeAsync(address);
      return result.map(location => ({
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    } catch (error) {
      console.error('Error forward geocoding:', error);
      return [];
    }
  }

  // Calculate distance between two points
  calculateDistance(
    point1: LocationCoords,
    point2: LocationCoords
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  // Get last known location
  getLastKnownLocation(): UserLocation | null {
    return this.lastKnownLocation;
  }

  // Check if location services are available
  async isLocationAvailable(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location availability:', error);
      return false;
    }
  }

  // Get permission status
  getPermissionStatus(): LocationPermissionStatus | null {
    return this.permissionStatus;
  }

  // Private methods
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async loadCachedLocation(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
      if (cached) {
        this.lastKnownLocation = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error loading cached location:', error);
    }
  }

  private async saveLocation(location: UserLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error('Error saving location:', error);
    }
  }

  private async checkPermissionStatus(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION_STATUS);
      if (cached) {
        this.permissionStatus = JSON.parse(cached);
      }

      // Also check current status
      const { status } = await Location.getForegroundPermissionsAsync();
      if (this.permissionStatus) {
        this.permissionStatus.status = status;
        this.permissionStatus.granted = status === Location.PermissionStatus.GRANTED;
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  }

  private async savePermissionStatus(status: LocationPermissionStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  }
}

// Create and export singleton instance
export const locationService = new LocationService();

// Utility functions
export const LocationUtils = {
  // Format coordinates for display
  formatCoordinates: (coords: LocationCoords): string => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  },

  // Format distance for display
  formatDistance: (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },

  // Check if location is within radius
  isWithinRadius: (
    center: LocationCoords,
    point: LocationCoords,
    radiusKm: number
  ): boolean => {
    const distance = locationService.calculateDistance(center, point);
    return distance <= radiusKm;
  },

  // Get location accuracy description
  getAccuracyDescription: (accuracy: number | null): string => {
    if (!accuracy) return 'Unknown';
    if (accuracy < 5) return 'High';
    if (accuracy < 20) return 'Good';
    if (accuracy < 100) return 'Fair';
    return 'Low';
  },
};

export default locationService;