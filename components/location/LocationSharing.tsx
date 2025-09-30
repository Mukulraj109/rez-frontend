import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '@/hooks/useLocation';
import { LocationCoordinates } from '@/types/location.types';

interface LocationSharingProps {
  onShare?: (location: LocationCoordinates) => void;
  onCopy?: (location: LocationCoordinates) => void;
  style?: any;
}

export default function LocationSharing({
  onShare,
  onCopy,
  style,
}: LocationSharingProps) {
  const { currentLocation } = useCurrentLocation();
  const [isSharing, setIsSharing] = useState(false);

  const formatLocationForSharing = (coordinates: LocationCoordinates) => {
    return `📍 My Location: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}\n\nShared via Rez App`;
  };

  const formatLocationForMap = (coordinates: LocationCoordinates) => {
    return `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
  };

  const handleShareLocation = async () => {
    if (!currentLocation) {
      Alert.alert('No Location', 'Please enable location access to share your location.');
      return;
    }

    setIsSharing(true);
    try {
      const shareText = formatLocationForSharing(currentLocation.coordinates);
      const mapUrl = formatLocationForMap(currentLocation.coordinates);
      
      const result = await Share.share({
        message: `${shareText}\n\nView on map: ${mapUrl}`,
        title: 'My Location',
        url: mapUrl,
      });

      if (result.action === Share.sharedAction) {
        onShare?.(currentLocation.coordinates);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share location');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLocation = async () => {
    if (!currentLocation) {
      Alert.alert('No Location', 'Please enable location access to copy your location.');
      return;
    }

    try {
      const locationText = `${currentLocation.coordinates.latitude.toFixed(6)}, ${currentLocation.coordinates.longitude.toFixed(6)}`;
      await Clipboard.setString(locationText);
      
      Alert.alert('Copied', 'Location coordinates copied to clipboard');
      onCopy?.(currentLocation.coordinates);
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy location');
    }
  };

  const handleOpenInMaps = () => {
    if (!currentLocation) {
      Alert.alert('No Location', 'Please enable location access to open in maps.');
      return;
    }

    const mapUrl = formatLocationForMap(currentLocation.coordinates);
    // In a real app, you would use Linking.openURL(mapUrl)
    Alert.alert('Open in Maps', `Would open: ${mapUrl}`);
  };

  const handleShareWithFriends = () => {
    if (!currentLocation) {
      Alert.alert('No Location', 'Please enable location access to share with friends.');
      return;
    }

    Alert.alert(
      'Share with Friends',
      'This feature would allow you to share your location with specific friends in the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => onShare?.(currentLocation!.coordinates) },
      ]
    );
  };

  const renderActionButton = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void,
    disabled = false
  ) => (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.actionContent}>
        <View style={[styles.actionIcon, disabled && styles.disabledIcon]}>
          <Ionicons
            name={icon as any}
            size={24}
            color={disabled ? '#C7C7CC' : '#007AFF'}
          />
        </View>
        <View style={styles.actionText}>
          <Text style={[styles.actionTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.actionSubtitle, disabled && styles.disabledText]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={disabled ? '#C7C7CC' : '#C7C7CC'}
      />
    </TouchableOpacity>
  );

  if (!currentLocation) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.noLocationContainer}>
          <Ionicons name="location-outline" size={48} color="#C7C7CC" />
          <Text style={styles.noLocationTitle}>Location Required</Text>
          <Text style={styles.noLocationSubtitle}>
            Enable location access to share your location
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Share Location</Text>
        <Text style={styles.subtitle}>
          Share your current location with others
        </Text>
      </View>

      {/* Current Location Display */}
      <View style={styles.locationCard}>
        <View style={styles.locationContent}>
          <Ionicons name="location" size={24} color="#34C759" />
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>
              {currentLocation.address.city}, {currentLocation.address.state}
            </Text>
            <Text style={styles.locationSubtitle}>
              {currentLocation.coordinates.latitude.toFixed(6)}, {currentLocation.coordinates.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      </View>

      {/* Sharing Options */}
      <View style={styles.actionsContainer}>
        {renderActionButton(
          'Share Location',
          'Share via message, email, or social media',
          'share',
          handleShareLocation,
          isSharing
        )}

        {renderActionButton(
          'Copy Coordinates',
          'Copy location coordinates to clipboard',
          'copy',
          handleCopyLocation
        )}

        {renderActionButton(
          'Open in Maps',
          'View location in Google Maps or Apple Maps',
          'map',
          handleOpenInMaps
        )}

        {renderActionButton(
          'Share with Friends',
          'Share location with friends in the app',
          'people',
          handleShareWithFriends
        )}
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Ionicons name="shield-checkmark" size={16} color="#34C759" />
        <Text style={styles.privacyText}>
          Your location is only shared when you choose to share it
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  noLocationContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
  },
  noLocationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  noLocationSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    marginRight: 12,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  disabledText: {
    color: '#C7C7CC',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0F2FF',
  },
  privacyText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
});

// Compact version for small spaces
export function CompactLocationSharing(props: LocationSharingProps) {
  return (
    <LocationSharing
      {...props}
      style={[props.style, { padding: 12 }]}
    />
  );
}
