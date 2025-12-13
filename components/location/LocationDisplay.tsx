import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useCurrentLocation, useLocationPermission } from '@/hooks/useLocation';
import { UserLocation } from '@/types/location.types';
import { webLocationService } from '@/services/webLocationService';
import { showAlert } from '@/components/common/CrossPlatformAlert';

interface LocationDisplayProps {
  showCoordinates?: boolean;
  showLastUpdated?: boolean;
  showRefreshButton?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onRefresh?: () => void;
  style?: any;
  textStyle?: any;
  buttonStyle?: any;
}

// Shared web location state (singleton pattern for web)
let sharedWebLocation: any = null;
let sharedWebLocationPromise: Promise<any> | null = null;
let isInitializing = false;
const locationListeners = new Set<(location: any) => void>();

// Helper to notify all instances when location changes
const notifyLocationChange = (location: any) => {
  sharedWebLocation = location;
  locationListeners.forEach(listener => listener(location));
};

export default function LocationDisplay({
  showCoordinates = false,
  showLastUpdated = true,
  showRefreshButton = true,
  compact = false,
  onPress,
  onRefresh,
  style,
  textStyle,
  buttonStyle,
}: LocationDisplayProps) {
  const { currentLocation, isLoading, error, refreshLocation } = useCurrentLocation();
  const { permissionStatus, requestPermission } = useLocationPermission();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Web-specific location state
  const [webLocation, setWebLocation] = useState<any>(sharedWebLocation);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState<string | null>(null);

  // Initialize web location on mount and subscribe to changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Subscribe to location changes
      const handleLocationChange = (location: any) => {
        setWebLocation(location);
      };

      locationListeners.add(handleLocationChange);

      // If we already have shared location, use it immediately
      if (sharedWebLocation) {
        setWebLocation(sharedWebLocation);
      } else if (sharedWebLocationPromise) {
        // If another instance is already fetching, wait for it
        setWebLoading(true);
        sharedWebLocationPromise.then(location => {
          if (location) {
            setWebLocation(location);
          }
          setWebLoading(false);
        }).catch(() => {
          setWebLoading(false);
        });
      } else {
        // First instance - initialize location
        initializeWebLocation();
      }

      // Cleanup: unsubscribe on unmount
      return () => {
        locationListeners.delete(handleLocationChange);
      };
    }
  }, []);

  const initializeWebLocation = async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializing) {
      return;
    }

    isInitializing = true;
    setWebLoading(true);
    setWebError(null);

    // Create promise that other instances can await
    sharedWebLocationPromise = (async () => {
      try {
        // Check if permission is already granted
        const permissionStatus = await webLocationService.checkLocationPermission();

        let location: any = null;

        if (permissionStatus === 'granted') {
          // Permission already granted - get current location
          location = await webLocationService.getCurrentLocation();
        } else if (permissionStatus === 'prompt') {
          // Permission not yet requested - automatically request it
          try {
            const granted = await webLocationService.requestLocationPermission();

            if (granted) {
              location = await webLocationService.getCurrentLocation();
            }
          } catch (requestError) {
            // Permission request failed, silently continue
          }
        }

        if (location) {
          // Notify all instances of location change
          notifyLocationChange(location);
        } else {
          setWebError('Failed to get location data');
        }

        return location;
      } catch (error) {
        setWebError(`Location error: ${error.message || 'Unknown error'}`);
        return null;
      } finally {
        setWebLoading(false);
        isInitializing = false;
      }
    })();

    await sharedWebLocationPromise;
  };


  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }

    if (Platform.OS === 'web') {
      // Web platform: use web location service
      setIsRefreshing(true);
      setWebError(null);

      try {
        // Check permission status first
        const permissionStatus = await webLocationService.checkLocationPermission();
        
        if (permissionStatus === 'denied') {
          // Permission was denied - show helpful message
          showAlert(
            'Location Permission Denied',
            'Location permission has been denied. To enable location:\n\n1. Click the lock/info icon in your browser\'s address bar\n2. Find "Location" in the permissions list\n3. Change it to "Allow"\n4. Refresh this page',
            [{ text: 'OK' }],
            'warning'
          );
          setWebError('Permission denied');
          setIsRefreshing(false);
          return;
        }

        // Request permission (will show prompt if status is 'prompt')
        const granted = await webLocationService.requestLocationPermission();
        if (!granted) {
          // Check if it's still in prompt state (user dismissed)
          const currentStatus = await webLocationService.checkLocationPermission();
          if (currentStatus === 'denied') {
            showAlert(
              'Location Permission Denied',
              'Location permission has been denied. To enable location:\n\n1. Click the lock/info icon in your browser\'s address bar\n2. Find "Location" in the permissions list\n3. Change it to "Allow"\n4. Refresh this page',
              [{ text: 'OK' }],
              'warning'
            );
          } else {
            showAlert(
              'Permission Required',
              'Location permission is required to show your current location. Please allow location access when prompted.',
              [{ text: 'OK' }],
              'info'
            );
          }
          setIsRefreshing(false);
          return;
        }

        // Get current location
        const location = await webLocationService.getCurrentLocation();
        if (location) {
          // Update shared state and notify all instances
          notifyLocationChange(location);
        } else {
          setWebError('Failed to get location');
          showAlert(
            'Location Error',
            'Failed to get your current location. Please try again.',
            [{ text: 'OK' }],
            'error'
          );
        }
      } catch (error: any) {
        setWebError('Location not available');
        // Check if it's a permission error
        if (error?.code === 1 || error?.message?.includes('denied')) {
          showAlert(
            'Location Permission Denied',
            'Location permission has been denied. To enable location:\n\n1. Click the lock/info icon in your browser\'s address bar\n2. Find "Location" in the permissions list\n3. Change it to "Allow"\n4. Refresh this page',
            [{ text: 'OK' }],
            'warning'
          );
        } else {
          showAlert(
            'Location Error',
            'Failed to get your current location. Please try again.',
            [{ text: 'OK' }],
            'error'
          );
        }
      } finally {
        setIsRefreshing(false);
      }
    } else {
      // Mobile platform: use existing logic
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          showAlert(
            'Permission Required',
            'Location permission is required to show your current location.',
            [{ text: 'OK' }],
            'info'
          );
          return;
        }
      }

      setIsRefreshing(true);
      try {
        await refreshLocation();
      } catch (error) {
        showAlert(
          'Location Error',
          'Failed to get your current location. Please try again.',
          [{ text: 'OK' }],
          'error'
        );
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getWebLocationText = (webLocation: any) => {
    if (!webLocation || !webLocation.address) {
      return 'Location not available';
    }

    const address = webLocation.address;

    if (compact) {
      // For compact mode, show only city name
      if (address.city) {
        return address.city;
      } else {
        // Extract city from formatted address (usually first meaningful part)
        const parts = address.formattedAddress?.split(',') || [];
        // Find the first part that looks like a city name
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed && !trimmed.match(/^\d/) && trimmed.length > 2) {
            return trimmed;
          }
        }
        return 'Your Location';
      }
    } else {
      // For full mode, show formatted address
      return address.formattedAddress || 'Your Location';
    }
  };

  const getLocationText = (location: UserLocation) => {
    if (typeof location.address === 'string') {
      if (compact) {
        // Extract only city name for compact mode
        // Example: "675/A, 6th A Cross Road, Koramangala, Bengaluru - 560034, Karnataka, India"
        // We want: "Bengaluru"
        const addressParts = location.address.split(',');

        // Find the city (usually contains "Bengaluru", "Bangalore", etc.)
        for (let i = 0; i < addressParts.length; i++) {
          const part = addressParts[i].trim();
          // Remove pincode from city name if present
          const cleanPart = part.replace(/\s*-?\s*\d{6}\s*/, '').trim();

          // Find city (common Indian cities)
          if (cleanPart.includes('Bengaluru') || cleanPart.includes('Bangalore')) {
            return 'Bengaluru';
          } else if (cleanPart.includes('Mumbai')) {
            return 'Mumbai';
          } else if (cleanPart.includes('Delhi')) {
            return 'Delhi';
          } else if (cleanPart.includes('Chennai')) {
            return 'Chennai';
          } else if (cleanPart.includes('Hyderabad')) {
            return 'Hyderabad';
          } else if (cleanPart.includes('Kolkata')) {
            return 'Kolkata';
          } else if (cleanPart.includes('Pune')) {
            return 'Pune';
          }
        }

        // Fallback: find first meaningful part that's not a road/number
        for (const part of addressParts) {
          const trimmed = part.trim();
          if (trimmed && !trimmed.match(/^\d/) && !trimmed.includes('Road') && !trimmed.includes('Cross') && trimmed.length > 3) {
            return trimmed;
          }
        }

        return 'Your Location';
      } else {
        // Show full address when not in compact mode
        return location.address;
      }
    }

    // For object format, use only city name in compact mode
    if (compact && location.address.city) {
      return location.address.city;
    }

    // For full mode, show city and state
    const parts = [];
    if (location.address.city) parts.push(location.address.city);
    if (location.address.state) parts.push(location.address.state);

    return parts.join(', ') || location.address.formattedAddress || 'Unknown Location';
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Location enabled';
      case 'denied':
        return 'Location disabled';
      case 'restricted':
        return 'Location restricted';
      default:
        return 'Location permission needed';
    }
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return '#34C759';
      case 'denied':
        return '#FF3B30';
      case 'restricted':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  // Handle loading states
  const isLocationLoading = Platform.OS === 'web' ? (webLoading || isRefreshing) : (isLoading || isRefreshing);

  // Determine current location and error based on platform
  const effectiveLocation = Platform.OS === 'web' ? webLocation : currentLocation;
  const effectiveError = Platform.OS === 'web' ? webError : error;

  if (isLocationLoading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer, style]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={[styles.loadingText, textStyle]}>Getting location...</Text>
      </View>
    );
  }

  // Show default location if no location is available and not loading
  if (!effectiveLocation && !isLocationLoading && !effectiveError) {
    return (
      <TouchableOpacity
        style={[styles.container, compact && styles.compactContainer, style]}
        onPress={onPress || handleRefresh}
        activeOpacity={0.7}
      >
        <Text style={[styles.locationText, textStyle]}>Select Location</Text>
        {showRefreshButton && Platform.OS === 'web' && (
          <TouchableOpacity
            style={[styles.refreshButton, buttonStyle]}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  if (effectiveError) {
    return (
      <TouchableOpacity
        style={[styles.container, compact && styles.compactContainer, style]}
        onPress={onPress || handleRefresh}
        activeOpacity={0.7}
      >
        <Text style={[styles.errorText, textStyle]}>Location unavailable</Text>
        {showRefreshButton && (
          <TouchableOpacity
            style={[styles.refreshButton, buttonStyle]}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  if (!effectiveLocation) {
    return (
      <View style={[styles.container, compact && styles.compactContainer, style]}>
        <Text style={[styles.noLocationText, textStyle]}>No location set</Text>
        {showRefreshButton && (
          <TouchableOpacity
            style={[styles.refreshButton, buttonStyle]}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Get Location</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        compact ? styles.compactContainer : styles.expandedContainer, 
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Location Text */}
        <View style={styles.locationContainer}>
          <View style={styles.locationTextContainer}>
            <Text
              style={[styles.locationText, textStyle]}
              numberOfLines={0}
            >
              {Platform.OS === 'web' && webLocation
                ? getWebLocationText(webLocation)
                : effectiveLocation
                ? getLocationText(effectiveLocation)
                : 'Location not available'
              }
            </Text>
          </View>
        </View>

        {/* Coordinates (if enabled) */}
        {showCoordinates && effectiveLocation && (
          <Text style={[styles.coordinatesText, textStyle]}>
            {Platform.OS === 'web' && webLocation
              ? `${webLocation.coordinates.latitude.toFixed(4)}, ${webLocation.coordinates.longitude.toFixed(4)}`
              : `${effectiveLocation.coordinates.latitude.toFixed(4)}, ${effectiveLocation.coordinates.longitude.toFixed(4)}`
            }
          </Text>
        )}

        {/* Last Updated */}
        {showLastUpdated && effectiveLocation && (
          <Text style={[styles.lastUpdatedText, textStyle]}>
            Updated {Platform.OS === 'web' && webLocation
              ? formatLastUpdated(new Date(webLocation.timestamp))
              : formatLastUpdated(effectiveLocation.lastUpdated)
            }
          </Text>
        )}
      </View>

      {/* Refresh Button */}
      {showRefreshButton && (
        <TouchableOpacity
          style={[styles.refreshButton, buttonStyle]}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
    minWidth: 0, // This allows the container to shrink properly
  },
  compactContainer: {
    padding: 8,
  },
  expandedContainer: {
    padding: 12,
    minHeight: 60,
  },
  content: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 0,
  },
  locationTextContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // This allows the text to shrink properly
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 18,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#666666',
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  noLocationText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

// Compact version for small spaces
export function CompactLocationDisplay(props: LocationDisplayProps) {
  return (
    <LocationDisplay
      {...props}
      compact={true}
      showCoordinates={false}
      showLastUpdated={false}
      showRefreshButton={false}
    />
  );
}

// Full version with all details
export function FullLocationDisplay(props: LocationDisplayProps) {
  return (
    <LocationDisplay
      {...props}
      showCoordinates={true}
      showLastUpdated={true}
      showRefreshButton={true}
    />
  );
}
