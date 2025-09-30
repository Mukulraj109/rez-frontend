// Web-specific location service using browser Geolocation API and Google Maps
import { Platform } from 'react-native';

interface WebLocationCoordinates {
  latitude: number;
  longitude: number;
}

interface WebLocationAddress {
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface WebLocationResult {
  coordinates: WebLocationCoordinates;
  address: WebLocationAddress;
  timestamp: number;
}

class WebLocationService {
  private googleMapsApiKey: string;
  private opencageApiKey: string;

  constructor() {
    this.googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    this.opencageApiKey = process.env.EXPO_PUBLIC_OPENCAGE_API_KEY || '';
  }

  /**
   * Request location permission using browser's geolocation API
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      return false;
    }

    if (!navigator.geolocation) {
      console.warn('[WebLocation] Geolocation is not supported by this browser');
      return false;
    }

    try {
      // Test permission by attempting to get position
      await this.getBrowserLocation();
      return true;
    } catch (error) {
      console.error('[WebLocation] Permission denied or error:', error);
      return false;
    }
  }

  /**
   * Get current location using browser's geolocation API
   */
  private getBrowserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[WebLocation] Browser location obtained:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          resolve(position);
        },
        (error) => {
          console.error('[WebLocation] Browser location error:', error);
          reject(error);
        },
        options
      );
    });
  }

  /**
   * Reverse geocode coordinates using OpenCage API (more generous free tier)
   */
  private async reverseGeocodeOpenCage(lat: number, lng: number): Promise<WebLocationAddress> {
    if (!this.opencageApiKey) {
      throw new Error('OpenCage API key not configured');
    }

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${this.opencageApiKey}&limit=1&no_annotations=1`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status.code !== 200 || !data.results || data.results.length === 0) {
        console.warn('[WebLocation] OpenCage geocoding failed:', data.status);
        throw new Error(`OpenCage geocoding failed: ${data.status.message}`);
      }

      const result = data.results[0];
      const components = result.components || {};

      // Extract address components from OpenCage response
      const city = components.city || components.town || components.village || components.suburb || '';
      const state = components.state || components.region || '';
      const country = components.country || '';
      const postalCode = components.postcode || '';

      const address: WebLocationAddress = {
        formattedAddress: result.formatted,
        city,
        state,
        country,
        postalCode,
      };

      console.log('[WebLocation] OpenCage API response:', {
        status: data.status,
        results_count: data.results?.length,
        components: result.components
      });
      console.log('[WebLocation] Extracted address:', address);
      return address;

    } catch (error) {
      console.error('[WebLocation] OpenCage reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address using Google Maps API (fallback)
   */
  private async reverseGeocodeGoogleMaps(lat: number, lng: number): Promise<WebLocationAddress> {
    if (!this.googleMapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.googleMapsApiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.warn('[WebLocation] Google Maps geocoding failed:', data.status, data);
        throw new Error(`Google Maps geocoding failed: ${data.status}`);
      }

      const result = data.results[0];
      const addressComponents = result.address_components || [];

      // Extract address components with multiple fallbacks
      let city = '';
      let state = '';
      let country = '';
      let postalCode = '';

      addressComponents.forEach((component: any) => {
        const types = component.types;

        // City extraction with fallbacks
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (!city && types.includes('sublocality_level_1')) {
          city = component.long_name;
        } else if (!city && types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }

        // State extraction
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }

        // Country extraction
        if (types.includes('country')) {
          country = component.long_name;
        }

        // Postal code extraction
        if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      });

      const address: WebLocationAddress = {
        formattedAddress: result.formatted_address,
        city,
        state,
        country,
        postalCode,
      };

      console.log('[WebLocation] Google Maps API response:', {
        status: data.status,
        results_count: data.results?.length,
        address_components: addressComponents
      });
      console.log('[WebLocation] Extracted address:', address);
      return address;

    } catch (error) {
      console.error('[WebLocation] Google Maps reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode with multiple service fallbacks
   */
  private async reverseGeocode(lat: number, lng: number): Promise<WebLocationAddress> {
    // Try OpenCage first (it was working for you previously)
    if (this.opencageApiKey) {
      try {
        console.log('[WebLocation] Trying OpenCage API first...');
        return await this.reverseGeocodeOpenCage(lat, lng);
      } catch (opencageError) {
        console.warn('[WebLocation] OpenCage failed, trying Google Maps...', opencageError.message);
      }
    }

    // Fallback to Google Maps
    if (this.googleMapsApiKey) {
      try {
        console.log('[WebLocation] Trying Google Maps API...');
        return await this.reverseGeocodeGoogleMaps(lat, lng);
      } catch (googleError) {
        console.warn('[WebLocation] Google Maps failed, using coordinate-based fallback...', googleError.message);
      }
    }

    // If both APIs fail, throw error to trigger coordinate-based fallback
    throw new Error('All geocoding services failed');
  }

  /**
   * Get current location with address
   */
  async getCurrentLocation(): Promise<WebLocationResult | null> {
    if (Platform.OS !== 'web') {
      return null;
    }

    try {
      console.log('[WebLocation] Getting current location...');

      // Get coordinates from browser
      const position = await this.getBrowserLocation();
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      let address: WebLocationAddress;

      try {
        // Try to get address from Google Maps
        address = await this.reverseGeocode(coords.latitude, coords.longitude);
      } catch (geocodingError) {
        console.warn('[WebLocation] Geocoding failed (billing may not be enabled), using coordinate-based location:', geocodingError.message);

        // Fallback: Create a reasonable location name based on coordinates
        const { city, region } = this.getLocationFromCoordinates(coords.latitude, coords.longitude);
        address = {
          formattedAddress: `${city}, ${region}`,
          city,
          state: region,
          country: 'India', // Most likely based on your app context
        };
      }

      const result: WebLocationResult = {
        coordinates: coords,
        address,
        timestamp: Date.now(),
      };

      console.log('[WebLocation] Location result:', result);
      return result;

    } catch (error) {
      console.error('[WebLocation] Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Approximate location based on coordinates (fallback when geocoding fails)
   */
  private getLocationFromCoordinates(lat: number, lng: number): { city: string; region: string } {
    // India coordinate ranges (approximate)
    const indiaRegions = [
      // Bangalore area
      { minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8, city: 'Bangalore', region: 'Karnataka' },
      // Mumbai area
      { minLat: 18.9, maxLat: 19.3, minLng: 72.7, maxLng: 73.1, city: 'Mumbai', region: 'Maharashtra' },
      // Delhi area
      { minLat: 28.4, maxLat: 28.9, minLng: 76.8, maxLng: 77.3, city: 'New Delhi', region: 'Delhi' },
      // Chennai area
      { minLat: 12.9, maxLat: 13.2, minLng: 80.1, maxLng: 80.3, city: 'Chennai', region: 'Tamil Nadu' },
      // Hyderabad area
      { minLat: 17.3, maxLat: 17.5, minLng: 78.3, maxLng: 78.6, city: 'Hyderabad', region: 'Telangana' },
      // Pune area
      { minLat: 18.4, maxLat: 18.6, minLng: 73.7, maxLng: 73.9, city: 'Pune', region: 'Maharashtra' },
    ];

    // Find matching region
    const matchedRegion = indiaRegions.find(region =>
      lat >= region.minLat && lat <= region.maxLat &&
      lng >= region.minLng && lng <= region.maxLng
    );

    if (matchedRegion) {
      return { city: matchedRegion.city, region: matchedRegion.region };
    }

    // Default fallback based on general India regions
    if (lat >= 12.0 && lat <= 15.0 && lng >= 77.0 && lng <= 78.0) {
      return { city: 'Bangalore Area', region: 'Karnataka' };
    }

    // Default fallback
    return { city: 'Your Location', region: 'India' };
  }

  /**
   * Check if location permission is granted
   */
  async checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (Platform.OS !== 'web' || !navigator.permissions) {
      return 'denied';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state as 'granted' | 'denied' | 'prompt';
    } catch (error) {
      console.error('[WebLocation] Permission check error:', error);
      return 'prompt';
    }
  }
}

// Create singleton instance
export const webLocationService = new WebLocationService();
export default webLocationService;