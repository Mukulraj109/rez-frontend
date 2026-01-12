import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { NearbyStore } from '@/services/exploreApi';

const { width, height } = Dimensions.get('window');

const categories = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles' },
  { id: 'grocery', label: 'Grocery', icon: 'cart' },
];

// Default location (Hyderabad, India - can be replaced with actual location)
const DEFAULT_LOCATION = {
  latitude: 17.385044,
  longitude: 78.486671,
};

const ExploreMapPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // API state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<NearbyStore[]>([]);

  // Fetch nearby stores from API
  const fetchNearbyStores = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await exploreApi.getNearbyStores({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        radius: 5,
        limit: 20,
      });

      if (response.success && response.data) {
        setStores(response.data);
      } else {
        setError(response.error || 'Failed to fetch nearby stores');
      }
    } catch (err: any) {
      console.error('[MAP PAGE] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNearbyStores();
  }, [fetchNearbyStores]);

  const onRefresh = useCallback(() => {
    fetchNearbyStores(true);
  }, [fetchNearbyStores]);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0B2240" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stores Near You</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#0B2240" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <LinearGradient
          colors={['#E0F2FE', '#DBEAFE', '#E0E7FF']}
          style={styles.mapPlaceholder}
        >
          <View style={styles.mapContent}>
            <Ionicons name="map" size={48} color="#3B82F6" />
            <Text style={styles.mapText}>Interactive Map</Text>
            <Text style={styles.mapSubtext}>
              {stores.length} stores within 5 km
            </Text>

            {/* Store Markers */}
            <View style={styles.markerContainer}>
              {stores.slice(0, 3).map((store, index) => (
                <TouchableOpacity
                  key={store.id}
                  style={[
                    styles.marker,
                    { left: 50 + index * 80, top: 30 + index * 40 },
                  ]}
                  onPress={() => setSelectedStore(store.id)}
                >
                  <View style={styles.markerPin}>
                    <Ionicons name="location" size={24} color="#00C06A" />
                  </View>
                  <Text style={styles.markerLabel}>{store.cashback}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Location */}
            <View style={styles.currentLocation}>
              <View style={styles.currentLocationDot} />
              <Text style={styles.currentLocationText}>You are here</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Store List */}
      <View style={styles.storeListHeader}>
        <Text style={styles.storeListTitle}>Nearby Stores</Text>
        <Text style={styles.storeCount}>{stores.length} stores</Text>
      </View>

      <ScrollView
        style={styles.storeList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storeListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
        }
      >
        {/* Loading State */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C06A" />
            <Text style={styles.loadingText}>Finding nearby stores...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchNearbyStores()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && stores.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No stores nearby</Text>
            <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
          </View>
        )}

        {/* Stores */}
        {!loading && stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.storeCard,
              selectedStore === store.id && styles.storeCardSelected,
            ]}
            onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
          >
            <View style={styles.storeImagePlaceholder}>
              <Ionicons name="storefront" size={28} color="#6B7280" />
            </View>
            <View style={styles.storeInfo}>
              <View style={styles.storeHeader}>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: store.isLive ? '#F0FDF4' : '#FEF2F2' }]}>
                  <View style={[styles.statusDot, { backgroundColor: store.isLive ? '#10B981' : '#EF4444' }]} />
                  <Text style={[styles.statusText, { color: store.isLive ? '#10B981' : '#EF4444' }]}>
                    {store.status}
                  </Text>
                </View>
              </View>
              <View style={styles.storeFooter}>
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={12} color="#6B7280" />
                  <Text style={styles.distanceText}>{store.distance}</Text>
                </View>
                {store.waitTime && (
                  <View style={styles.distanceBadge}>
                    <Ionicons name="time" size={12} color="#6B7280" />
                    <Text style={styles.distanceText}>{store.waitTime}</Text>
                  </View>
                )}
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{store.cashback} Cashback</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.navigateButton}>
              <Ionicons name="navigate" size={20} color="#00C06A" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action */}
      <TouchableOpacity style={styles.listViewButton}>
        <Ionicons name="list" size={20} color="#FFFFFF" />
        <Text style={styles.listViewText}>List View</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#00C06A',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    height: height * 0.3,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  markerContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerPin: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00C06A',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  currentLocation: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  currentLocationText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 4,
  },
  storeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storeListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  storeCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  storeList: {
    flex: 1,
  },
  storeListContent: {
    paddingHorizontal: 16,
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#00C06A',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeCardSelected: {
    borderColor: '#00C06A',
    backgroundColor: '#F0FDF4',
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  storeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  storeCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    color: '#6B7280',
  },
  cashbackBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06A',
  },
  navigateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listViewButton: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B2240',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  listViewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ExploreMapPage;
