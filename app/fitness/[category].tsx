/**
 * Fitness Category Page - Dynamic route
 * Connected to real API with functional filters, search, and location
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Keyboard,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import apiClient from '@/services/apiClient';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  orange500: '#F97316',
  amber500: '#F59E0B',
};

// Category configuration for UI
const categoryConfig: Record<string, { title: string; icon: string; gradientColors: [string, string] }> = {
  gyms: { title: 'Gyms', icon: '🏋️', gradientColors: ['#F97316', '#EA580C'] },
  studios: { title: 'Fitness Studios', icon: '🧘', gradientColors: ['#8B5CF6', '#7C3AED'] },
  trainers: { title: 'Personal Trainers', icon: '💪', gradientColors: ['#10B981', '#059669'] },
  store: { title: 'Sports Store', icon: '🛒', gradientColors: ['#3B82F6', '#2563EB'] },
  challenges: { title: 'Fitness Challenges', icon: '🏆', gradientColors: ['#EAB308', '#CA8A04'] },
  nutrition: { title: 'Nutrition Plans', icon: '🥗', gradientColors: ['#22C55E', '#16A34A'] },
};

interface StoreItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ratings: { average: number; count: number };
  location: {
    address: string;
    city: string;
    coordinates: number[];
  };
  offers: { cashback: number };
  logo: string;
  banner: string[];
  tags: string[];
  serviceTypes?: string[];
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

type FilterType = 'all' | 'nearby' | 'top-rated' | 'best-cashback';

const FitnessCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoreItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Search state
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StoreItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const config = categoryConfig[category || 'gyms'] || categoryConfig['gyms'];
  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'nearby', label: 'Nearby', icon: 'location' },
    { id: 'top-rated', label: 'Top Rated', icon: 'star' },
    { id: 'best-cashback', label: 'Best Cashback', icon: 'gift' },
  ];

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user location
  const getUserLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        setLocationLoading(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);
      setLocationLoading(false);
      return coords;
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get location');
      setLocationLoading(false);
      return null;
    }
  };

  const fetchStores = useCallback(async () => {
    try {
      const response = await apiClient.get(`/stores/by-category-slug/${category}`, {
        params: {
          page: 1,
          limit: 50,
          sortBy: 'rating',
        },
      });

      let storesData = (response.data as any)?.stores || [];
      const total = (response.data as any)?.total || storesData.length;

      // Add distance calculation if user location is available
      if (userLocation) {
        storesData = storesData.map((store: StoreItem) => {
          if (store.location?.coordinates) {
            const [lng, lat] = store.location.coordinates;
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lng
            );
            return { ...store, distance };
          }
          return store;
        });
      }

      setItems(storesData);
      setTotalCount(total);
      applyFilter(storesData, selectedFilter);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setItems([]);
      setFilteredItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, userLocation]);

  const applyFilter = (storesData: StoreItem[], filter: FilterType) => {
    let sorted = [...storesData];

    switch (filter) {
      case 'nearby':
        if (userLocation) {
          sorted = sorted
            .filter(s => s.distance !== undefined)
            .sort((a, b) => (a.distance || 999) - (b.distance || 999));
        }
        break;
      case 'top-rated':
        sorted = sorted.sort((a, b) =>
          (b.ratings?.average || 0) - (a.ratings?.average || 0)
        );
        break;
      case 'best-cashback':
        sorted = sorted.sort((a, b) =>
          (b.offers?.cashback || 0) - (a.offers?.cashback || 0)
        );
        break;
      default:
        // Keep default order (by rating from API)
        break;
    }

    setFilteredItems(sorted);
  };

  useEffect(() => {
    setLoading(true);
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (items.length > 0) {
      applyFilter(items, selectedFilter);
    }
  }, [selectedFilter, items]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStores();
  };

  const handleFilterChange = async (filterId: FilterType) => {
    // If selecting nearby and no location yet, get it first
    if (filterId === 'nearby' && !userLocation) {
      const location = await getUserLocation();
      if (location) {
        // Re-fetch with location to calculate distances
        setLoading(true);
        fetchStores();
      }
    }
    setSelectedFilter(filterId);
  };

  const handleItemPress = (item: StoreItem) => {
    router.push(`/store/${item.slug || item._id}` as any);
  };

  const handleBookPress = (item: StoreItem) => {
    router.push({
      pathname: '/fitness/book/[storeId]',
      params: {
        storeId: item._id,
        storeName: item.name,
        cashback: item.offers?.cashback?.toString() || '15',
      },
    } as any);
  };

  // Search functions
  const handleSearchOpen = () => {
    setSearchModalVisible(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleSearchClose = () => {
    setSearchModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.get('/stores/search', {
        params: { q: query, limit: 20 },
      });

      // Filter results to only show fitness-related stores
      const results = ((response.data as any)?.stores || []).filter((store: StoreItem) =>
        store.tags?.some(tag =>
          ['gym', 'fitness', 'yoga', 'studio', 'trainer', 'sports', 'pilates', 'crossfit'].includes(tag.toLowerCase())
        )
      );

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultPress = (item: StoreItem) => {
    handleSearchClose();
    router.push(`/store/${item.slug || item._id}` as any);
  };

  const getItemTypeLabel = (item: StoreItem): string => {
    if (item.serviceTypes && item.serviceTypes.length > 0) {
      return item.serviceTypes[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    if (item.tags && item.tags.length > 0) {
      return item.tags[0].charAt(0).toUpperCase() + item.tags[0].slice(1);
    }
    return category === 'gyms' ? 'Gym' :
           category === 'studios' ? 'Studio' :
           category === 'trainers' ? 'Trainer' :
           category === 'store' ? 'Store' : 'Fitness';
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)} km`;
  };

  const getPriceLabel = (item: StoreItem): string => {
    if (category === 'gyms') return '₹2,000+/mo';
    if (category === 'studios') return '₹500+/class';
    if (category === 'trainers') return '₹1,000+/session';
    if (category === 'store') return '₹499+';
    return 'View Details';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.gradientColors[0]} />
        <Text style={styles.loadingText}>Loading {config.title.toLowerCase()}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{config.icon} {config.title}</Text>
            <Text style={styles.headerSubtitle}>{totalCount} options available</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchOpen}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleFilterChange(filter.id)}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={selectedFilter === filter.id ? COLORS.white : COLORS.gray600}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
              {filter.id === 'nearby' && locationLoading && (
                <ActivityIndicator size="small" color={COLORS.white} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Location status */}
      {selectedFilter === 'nearby' && !userLocation && !locationLoading && (
        <TouchableOpacity style={styles.locationBanner} onPress={getUserLocation}>
          <Ionicons name="location-outline" size={20} color={COLORS.orange500} />
          <Text style={styles.locationBannerText}>
            {locationError || 'Tap to enable location for nearby results'}
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={config.gradientColors[0]}
          />
        }
      >
        <View style={styles.itemsList}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: item.banner?.[0] || item.logo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
                  }}
                  style={styles.itemImage}
                />
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{item.offers?.cashback || 15}%</Text>
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{getItemTypeLabel(item)}</Text>
                    </View>
                  </View>
                  <View style={styles.itemMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>
                        {item.ratings?.average?.toFixed(1) || '4.5'}
                      </Text>
                      <Text style={styles.reviewCount}>
                        ({item.ratings?.count || 0})
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={COLORS.gray600} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.distance ? formatDistance(item.distance) : item.location?.city || 'Bangalore'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemFooter}>
                    <Text style={styles.priceText}>{getPriceLabel(item)}</Text>
                    <TouchableOpacity
                      style={[styles.bookButton, { backgroundColor: config.gradientColors[0] }]}
                      onPress={() => category === 'store' ? handleItemPress(item) : handleBookPress(item)}
                    >
                      <Text style={styles.bookButtonText}>
                        {category === 'store' ? 'Shop' : category === 'trainers' ? 'Book' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={64} color={COLORS.gray200} />
              <Text style={styles.emptyTitle}>No {config.title.toLowerCase()} found</Text>
              <Text style={styles.emptyDescription}>
                Try a different filter or check back later
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: config.gradientColors[0] }]}
                onPress={handleRefresh}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleSearchClose}
      >
        <View style={styles.searchModal}>
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={handleSearchClose} style={styles.searchCloseButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
            </TouchableOpacity>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={COLORS.gray400} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder={`Search ${config.title.toLowerCase()}...`}
                placeholderTextColor={COLORS.gray400}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isSearching ? (
            <View style={styles.searchLoading}>
              <ActivityIndicator size="large" color={config.gradientColors[0]} />
            </View>
          ) : searchResults.length > 0 ? (
            <ScrollView style={styles.searchResults}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultPress(item)}
                >
                  <Image
                    source={{ uri: item.logo || item.banner?.[0] }}
                    style={styles.searchResultImage}
                  />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <View style={styles.searchResultMeta}>
                      <Ionicons name="star" size={12} color={COLORS.amber500} />
                      <Text style={styles.searchResultRating}>
                        {item.ratings?.average?.toFixed(1) || '4.5'}
                      </Text>
                      <Text style={styles.searchResultCashback}>
                        {item.offers?.cashback || 15}% Cashback
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : searchQuery.length >= 2 ? (
            <View style={styles.searchEmpty}>
              <Ionicons name="search-outline" size={48} color={COLORS.gray200} />
              <Text style={styles.searchEmptyText}>No results found</Text>
            </View>
          ) : (
            <View style={styles.searchHint}>
              <Text style={styles.searchHintText}>
                Start typing to search for {config.title.toLowerCase()}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray600 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchButton: { padding: 8 },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: COLORS.orange500 },
  filterChipText: { fontSize: 14, color: COLORS.gray600 },
  filterChipTextActive: { color: COLORS.white, fontWeight: '600' },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFF7ED',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  locationBannerText: { fontSize: 13, color: COLORS.orange500 },
  itemsList: { padding: 16, gap: 16 },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 16,
  },
  itemImage: { width: '100%', height: 160 },
  cashbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  itemInfo: { padding: 16 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: { fontSize: 18, fontWeight: '700', color: COLORS.navy, flex: 1, marginRight: 8 },
  typeBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  itemMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  reviewCount: { fontSize: 12, color: COLORS.gray600 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 13, color: COLORS.gray600 },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: { fontSize: 15, fontWeight: '600', color: COLORS.navy },
  bookButton: {
    backgroundColor: COLORS.orange500,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginTop: 16 },
  emptyDescription: { fontSize: 14, color: COLORS.gray600, marginTop: 8, textAlign: 'center' },
  refreshButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  // Search Modal Styles
  searchModal: { flex: 1, backgroundColor: COLORS.white },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchCloseButton: { padding: 8, marginRight: 8 },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.navy },
  searchLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchResults: { flex: 1 },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  searchResultImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.gray100 },
  searchResultInfo: { flex: 1, marginLeft: 12 },
  searchResultName: { fontSize: 16, fontWeight: '600', color: COLORS.navy },
  searchResultMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  searchResultRating: { fontSize: 13, color: COLORS.gray600 },
  searchResultCashback: { fontSize: 12, color: COLORS.green500, fontWeight: '600' },
  searchEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchEmptyText: { fontSize: 16, color: COLORS.gray600, marginTop: 12 },
  searchHint: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchHintText: { fontSize: 14, color: COLORS.gray400 },
});

export default FitnessCategoryPage;
