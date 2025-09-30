import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useCurrentLocation, useLocationPermission } from '@/hooks/useLocation';
import { UserLocation } from '@/types/location.types';
import { webLocationService } from '@/services/webLocationService';

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
  const [webLocation, setWebLocation] = useState<any>(null);
  const [webLoading, setWebLoading] = useState(false);
  const [webError, setWebError] = useState<string | null>(null);

  // Initialize web location on mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      initializeWebLocation();
    }
  }, []);

  const initializeWebLocation = async () => {
    console.log('[LocationDisplay] Initializing web location...');
    setWebLoading(true);
    setWebError(null);

    try {
      // Check if permission is already granted
      const permissionStatus = await webLocationService.checkLocationPermission();
      console.log('[LocationDisplay] Web permission status:', permissionStatus);

      if (permissionStatus === 'granted') {
        // Get current location
        console.log('[LocationDisplay] Permission granted, getting location...');
        const location = await webLocationService.getCurrentLocation();
        if (location) {
          setWebLocation(location);
          console.log('[LocationDisplay] Web location set successfully:', location);
        } else {
          console.warn('[LocationDisplay] getCurrentLocation returned null');
          setWebError('Failed to get location data');
        }
      } else {
        // Permission not granted, don't set error - just wait for user action
        console.log('[LocationDisplay] Permission not granted, showing default state');
        // Don't set error, just leave location empty for user to click refresh
      }
    } catch (error) {
      console.error('[LocationDisplay] Web location initialization error:', error);
      setWebError(`Location error: ${error.message || 'Unknown error'}`);
    } finally {
      setWebLoading(false);
    }
  };

  // Debug logging (commented out for production)
  // console.log('📍 LocationDisplay: Render state:', {
  //   currentLocation,
  //   isLoading,
  //   error,
  //   permissionStatus,
  //   isRefreshing,
  //   compact
  // });

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
        // Request permission first
        const granted = await webLocationService.requestLocationPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Location permission is required to show your current location.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Get current location
        const location = await webLocationService.getCurrentLocation();
        if (location) {
          setWebLocation(location);
        } else {
          setWebError('Failed to get location');
          Alert.alert(
            'Location Error',
            'Failed to get your current location. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        setWebError('Location not available');
        Alert.alert(
          'Location Error',
          'Failed to get your current location. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsRefreshing(false);
      }
    } else {
      // Mobile platform: use existing logic
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Location permission is required to show your current location.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      setIsRefreshing(true);
      try {
        await refreshLocation();
      } catch (error) {
        Alert.alert(
          'Location Error',
          'Failed to get your current location. Please try again.',
          [{ text: 'OK' }]
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
      // For compact mode, show city and state
      if (address.city && address.state) {
        return `${address.city}, ${address.state}`;
      } else if (address.city) {
        return address.city;
      } else {
        // Extract from formatted address
        const parts = address.formattedAddress?.split(',') || [];
        return parts.slice(0, 2).join(',').trim() || 'Your Location';
      }
    } else {
      // For full mode, show formatted address
      return address.formattedAddress || 'Your Location';
    }
  };

  const getLocationText = (location: UserLocation) => {
    // console.log('📍 LocationDisplay: getLocationText called with:', {
    //   location,
    //   compact,
    //   addressType: typeof location.address,
    //   addressValue: location.address
    // });

    if (typeof location.address === 'string') {
      if (compact) {
        // Extract locality from the full address string for compact mode
        // Example: "675/A, 6th A Cross Road, Koramangala, Bengaluru - 560034, Karnataka, India"
        // We want: "Koramangala, Bengaluru"
        const addressParts = location.address.split(',');

        // Find the locality (usually the 3rd part) and city (usually the 4th part)
        let locality = '';
        let city = '';

        // Look for common locality patterns
        for (let i = 0; i < addressParts.length; i++) {
          const part = addressParts[i].trim();

          // Skip house numbers, road names, and pincodes
          if (part.match(/^\d+/) || part.includes('Cross Road') || part.includes('Main Road') || part.match(/^\d{6}$/)) {
            continue;
          }

          // Find locality (area name)
          if (!locality && part.length > 3 && !part.includes('Karnataka') && !part.includes('India')) {
            locality = part;
          }
          // Find city (usually contains "Bengaluru", "Bangalore", etc.)
          else if (!city && (part.includes('Bengaluru') || part.includes('Bangalore') || part.includes('Mumbai') || part.includes('Delhi'))) {
            city = part;
          }
        }

        const result = locality && city ? `${locality}, ${city}` : locality || city || 'Unknown Location';
        // console.log('📍 LocationDisplay: Extracted locality result:', result);
        return result;
      } else {
        // Show full address when not in compact mode
        // console.log('📍 LocationDisplay: Full address result:', location.address);
        return location.address;
      }
    }

    // For object format, use city and state
    const parts = [];
    if (location.address.city) parts.push(location.address.city);
    if (location.address.state) parts.push(location.address.state);

    const result = parts.join(', ') || location.address.formattedAddress || 'Unknown Location';
    // console.log('📍 LocationDisplay: Object address result:', result);
    return result;
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

  if (isLocationLoading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer, style]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={[styles.loadingText, textStyle]}>Getting location...</Text>
      </View>
    );
  }

  // Determine current location and error based on platform
  const effectiveLocation = Platform.OS === 'web' ? webLocation : currentLocation;
  const effectiveError = Platform.OS === 'web' ? webError : error;

  // Show default location if no location is available and not loading
  if (!effectiveLocation && !isLocationLoading && !effectiveError) {
    return (
      <View style={[styles.container, compact && styles.compactContainer, style]}>
        <Text style={[styles.locationText, textStyle]}>📍 Select Location</Text>
        {showRefreshButton && Platform.OS === 'web' && (
          <TouchableOpacity
            style={[styles.refreshButton, buttonStyle]}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (effectiveError) {
    console.log('[LocationDisplay] Error state:', effectiveError);
    return (
      <View style={[styles.container, compact && styles.compactContainer, style]}>
        <Text style={[styles.errorText, textStyle]}>Location unavailable</Text>
        {showRefreshButton && (
          <TouchableOpacity
            style={[styles.refreshButton, buttonStyle]}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
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
          <Text style={styles.locationIcon}>📍</Text>
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
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
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
