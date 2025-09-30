import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { webLocationService } from '@/services/webLocationService';

interface LocationOption {
  id: string;
  title: string;
  subtitle?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  type: 'current' | 'recent' | 'suggested' | 'search';
}

interface LocationDropdownProps {
  isVisible: boolean;
  onLocationSelect: (location: LocationOption) => void;
  onClose: () => void;
  currentLocation?: any;
  style?: any;
}

export default function LocationDropdown({
  isVisible,
  onLocationSelect,
  onClose,
  currentLocation,
  style,
}: LocationDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Default location options
  const defaultLocations: LocationOption[] = [
    {
      id: 'bangalore-koramangala',
      title: 'Koramangala',
      subtitle: 'Bangalore, Karnataka',
      coordinates: { latitude: 12.9352, longitude: 77.6245 },
      type: 'suggested',
    },
    {
      id: 'bangalore-mg-road',
      title: 'MG Road',
      subtitle: 'Bangalore, Karnataka',
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      type: 'suggested',
    },
    {
      id: 'bangalore-indiranagar',
      title: 'Indiranagar',
      subtitle: 'Bangalore, Karnataka',
      coordinates: { latitude: 12.9719, longitude: 77.6412 },
      type: 'suggested',
    },
    {
      id: 'bangalore-whitefield',
      title: 'Whitefield',
      subtitle: 'Bangalore, Karnataka',
      coordinates: { latitude: 12.9698, longitude: 77.7500 },
      type: 'suggested',
    },
    {
      id: 'mumbai-bandra',
      title: 'Bandra',
      subtitle: 'Mumbai, Maharashtra',
      coordinates: { latitude: 19.0596, longitude: 72.8295 },
      type: 'suggested',
    },
    {
      id: 'delhi-cp',
      title: 'Connaught Place',
      subtitle: 'New Delhi, Delhi',
      coordinates: { latitude: 28.6315, longitude: 77.2167 },
      type: 'suggested',
    },
  ];

  const handleCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      try {
        setIsSearching(true);
        const location = await webLocationService.getCurrentLocation();
        if (location) {
          const currentLocationOption: LocationOption = {
            id: 'current-location',
            title: 'Current Location',
            subtitle: location.address.formattedAddress || 'Your current location',
            coordinates: location.coordinates,
            type: 'current',
          };
          onLocationSelect(currentLocationOption);
        }
      } catch (error) {
        console.error('Failed to get current location:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleLocationSelect = (location: LocationOption) => {
    onLocationSelect(location);
    onClose();
  };

  const renderLocationItem = (item: LocationOption) => {
    const getIcon = () => {
      switch (item.type) {
        case 'current':
          return 'locate';
        case 'recent':
          return 'time';
        case 'search':
          return 'search';
        default:
          return 'location';
      }
    };

    const getIconColor = () => {
      switch (item.type) {
        case 'current':
          return '#007AFF';
        case 'recent':
          return '#8E8E93';
        default:
          return '#666666';
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.locationItem}
        onPress={() => handleLocationSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.locationIconContainer}>
          <Ionicons name={getIcon()} size={20} color={getIconColor()} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.locationSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dropdown}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8B5CF6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for area, city..."
            placeholderTextColor="#8B5CF6"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Location Options */}
        <ScrollView
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          bounces={false}
        >
          {/* Current Location Option */}
          <TouchableOpacity
            style={[styles.locationItem, styles.currentLocationItem]}
            onPress={handleCurrentLocation}
            activeOpacity={0.7}
            disabled={isSearching}
          >
            <View style={styles.locationIconContainer}>
              {isSearching ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="locate" size={20} color="#007AFF" />
              )}
            </View>
            <View style={styles.locationInfo}>
              <Text style={[styles.locationTitle, styles.currentLocationTitle]}>
                {isSearching ? 'Getting location...' : 'Use current location'}
              </Text>
              {!isSearching && (
                <Text style={styles.locationSubtitle}>
                  {Platform.OS === 'web' ? 'Allow location access' : 'GPS location'}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Default Locations */}
          <Text style={styles.sectionTitle}>Popular locations</Text>
          {defaultLocations.map(renderLocationItem)}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 8,
  },
  dropdown: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    maxHeight: Platform.OS === 'web' ? '60vh' : 280, // Responsive height for mobile
    marginHorizontal: 16,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    margin: Platform.OS === 'web' ? 16 : 12, // Smaller margin on mobile
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  searchIcon: {
    marginRight: 12,
    color: '#8B5CF6',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
    fontWeight: '500',
  },
  optionsList: {
    maxHeight: Platform.OS === 'web' ? 240 : 180, // Smaller for mobile
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16, // Smaller padding on mobile
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  currentLocationItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  locationIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  currentLocationTitle: {
    color: '#007AFF',
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
    marginVertical: 8,
  },
});