import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useRegion } from '@/contexts/RegionContext';
import { useCurrentLocation } from '@/hooks/useLocation';

const { width, height } = Dimensions.get('window');

const categories = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles' },
  { id: 'grocery', label: 'Grocery', icon: 'cart' },
];

// Store marker colors based on index
const markerColors = [
  { bg: '#00C06A', shadow: 'rgba(0, 192, 106, 0.4)' },
  { bg: '#3B82F6', shadow: 'rgba(59, 130, 246, 0.4)' },
  { bg: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.4)' },
  { bg: '#EC4899', shadow: 'rgba(236, 72, 153, 0.4)' },
  { bg: '#8B5CF6', shadow: 'rgba(139, 92, 246, 0.4)' },
  { bg: '#EF4444', shadow: 'rgba(239, 68, 68, 0.4)' },
];

const ExploreMapPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Region context for coordinates and region name
  const { state: regionState } = useRegion();
  const regionName = regionState.regionConfig?.name || 'your area';
  const currentRegion = regionState.currentRegion;

  // Location context for GPS coordinates (optional)
  const { currentLocation } = useCurrentLocation();

  // Get effective coordinates: GPS first, then region fallback
  const effectiveCoordinates = useMemo(() => {
    if (currentLocation?.coordinates?.latitude && currentLocation?.coordinates?.longitude) {
      return {
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
        source: 'gps' as const,
      };
    }
    if (regionState.regionConfig?.defaultCoordinates) {
      return {
        latitude: regionState.regionConfig.defaultCoordinates.latitude,
        longitude: regionState.regionConfig.defaultCoordinates.longitude,
        source: 'region' as const,
      };
    }
    return { latitude: 12.9716, longitude: 77.5946, source: 'default' as const };
  }, [currentLocation?.coordinates, regionState.regionConfig?.defaultCoordinates]);

  // API state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<NearbyStore[]>([]);

  // Fetch nearby stores from API using region-aware coordinates
  const fetchNearbyStores = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await exploreApi.getNearbyStores({
        latitude: effectiveCoordinates.latitude,
        longitude: effectiveCoordinates.longitude,
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
  }, [effectiveCoordinates.latitude, effectiveCoordinates.longitude]);

  useEffect(() => {
    fetchNearbyStores();
  }, [fetchNearbyStores]);

  useEffect(() => {
    if (currentRegion) {
      fetchNearbyStores();
    }
  }, [currentRegion]);

  const onRefresh = useCallback(() => {
    fetchNearbyStores(true);
  }, [fetchNearbyStores]);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  // Better marker positions that don't overlap
  const markerPositions = [
    { left: 15, top: 20 },
    { left: 70, top: 15 },
    { left: 45, top: 45 },
    { left: 20, top: 65 },
    { left: 75, top: 55 },
    { left: 55, top: 25 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0B2240" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stores in {regionName}</Text>
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

      {/* Interactive Map Preview */}
      <View style={styles.mapContainer}>
        {/* Map Background with realistic styling */}
        <View style={styles.mapBackground}>
          {/* Base gradient */}
          <LinearGradient
            colors={['#E8F4F8', '#D1E7DD', '#E2E8F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Decorative map elements - roads */}
          <View style={styles.roadHorizontal1} />
          <View style={styles.roadHorizontal2} />
          <View style={styles.roadVertical1} />
          <View style={styles.roadVertical2} />
          <View style={styles.roadDiagonal} />

          {/* Decorative areas (parks, water) */}
          <View style={styles.parkArea1} />
          <View style={styles.parkArea2} />
          <View style={styles.waterArea} />

          {/* Buildings/Blocks */}
          <View style={styles.block1} />
          <View style={styles.block2} />
          <View style={styles.block3} />
          <View style={styles.block4} />

          {/* Store Markers */}
          {stores.slice(0, 6).map((store, index) => {
            const pos = markerPositions[index];
            const color = markerColors[index % markerColors.length];
            const isSelected = selectedStore === store.id;

            return (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.storeMarker,
                  { left: `${pos.left}%`, top: `${pos.top}%` },
                  isSelected && styles.storeMarkerSelected,
                ]}
                onPress={() => {
                  setSelectedStore(store.id);
                  navigateTo(`/MainStorePage?storeId=${store.id}`);
                }}
                activeOpacity={0.8}
              >
                {/* Pulse effect */}
                <View style={[styles.markerPulse, { backgroundColor: color.shadow }]} />

                {/* Pin shape */}
                <View style={[styles.markerPin, { backgroundColor: color.bg }]}>
                  <Text style={styles.markerInitial}>
                    {store.name?.charAt(0)?.toUpperCase() || 'S'}
                  </Text>
                </View>
                <View style={[styles.markerTail, { borderTopColor: color.bg }]} />

                {/* Label */}
                <View style={styles.markerLabelContainer}>
                  <Text style={styles.markerLabel} numberOfLines={1}>
                    {store.name?.split(' ')[0]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Current Location Marker */}
          <View style={styles.currentLocation}>
            <View style={styles.currentLocationOuter} />
            <View style={styles.currentLocationMiddle} />
            <View style={styles.currentLocationInner} />
          </View>

          {/* Floating Info Card */}
          <View style={styles.infoCardContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.infoCard}
            >
              <View style={styles.infoCardLeft}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="navigate" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.infoCardTitle}>{regionName}</Text>
                  <Text style={styles.infoCardSubtitle}>Your location</Text>
                </View>
              </View>
              <View style={styles.infoCardRight}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stores.length}</Text>
                  <Text style={styles.statLabel}>Stores</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>5km</Text>
                  <Text style={styles.statLabel}>Radius</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomBtn}>
              <Ionicons name="add" size={20} color="#374151" />
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomBtn}>
              <Ionicons name="remove" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Compass */}
          <View style={styles.compass}>
            <Text style={styles.compassText}>N</Text>
            <Ionicons name="navigate" size={14} color="#EF4444" style={{ transform: [{ rotate: '-45deg' }] }} />
          </View>
        </View>
      </View>

      {/* Store List */}
      <View style={styles.storeListHeader}>
        <Text style={styles.storeListTitle}>Nearby Stores</Text>
        <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigateTo('/explore/stores')}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C06A" />
        </TouchableOpacity>
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
            <Text style={styles.loadingText}>Finding stores in {regionName}...</Text>
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
            <Text style={styles.emptyText}>No stores in {regionName}</Text>
            <Text style={styles.emptySubtext}>We're expanding to {regionName} soon!</Text>
          </View>
        )}

        {/* Store Cards */}
        {!loading && stores.map((store, index) => {
          const color = markerColors[index % markerColors.length];
          const isOpen = store.isLive === true || store.status === 'Open';

          return (
            <TouchableOpacity
              key={store.id}
              style={[
                styles.storeCard,
                selectedStore === store.id && styles.storeCardSelected,
              ]}
              onPress={() => navigateTo(`/MainStorePage?storeId=${store.id}`)}
              activeOpacity={0.7}
            >
              {/* Store Icon */}
              <View style={[styles.storeIcon, { backgroundColor: color.bg }]}>
                <Text style={styles.storeIconText}>{store.name?.charAt(0)?.toUpperCase()}</Text>
              </View>

              {/* Store Info */}
              <View style={styles.storeInfo}>
                <View style={styles.storeNameRow}>
                  <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                  <View style={[styles.statusDot, { backgroundColor: isOpen ? '#10B981' : '#EF4444' }]} />
                </View>
                <View style={styles.storeMetaRow}>
                  {store.distance && (
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={12} color="#6B7280" />
                      <Text style={styles.metaText}>{store.distance}</Text>
                    </View>
                  )}
                  {store.waitTime && (
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={12} color="#6B7280" />
                      <Text style={styles.metaText}>{store.waitTime}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Cashback Badge */}
              {store.cashback && (
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{store.cashback}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.listViewButton}
        onPress={() => navigateTo('/explore/stores')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#0B2240', '#1E3A5F']}
          style={styles.listViewGradient}
        >
          <Ionicons name="list" size={18} color="#FFFFFF" />
          <Text style={styles.listViewText}>List View</Text>
        </LinearGradient>
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
    borderRadius: 12,
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
    borderRadius: 12,
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

  // Map Container
  mapContainer: {
    height: height * 0.32,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8F4F8',
  },

  // Roads
  roadHorizontal1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '35%',
    height: 8,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  roadHorizontal2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '70%',
    height: 6,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  roadVertical1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    width: 6,
    backgroundColor: '#FFFFFF',
    opacity: 0.7,
  },
  roadVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '65%',
    width: 8,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  roadDiagonal: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    width: 100,
    height: 5,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
    transform: [{ rotate: '45deg' }],
  },

  // Decorative areas
  parkArea1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#86EFAC',
    opacity: 0.5,
  },
  parkArea2: {
    position: 'absolute',
    bottom: '25%',
    right: '10%',
    width: 50,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#86EFAC',
    opacity: 0.4,
  },
  waterArea: {
    position: 'absolute',
    top: '50%',
    right: '5%',
    width: 30,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#7DD3FC',
    opacity: 0.4,
  },

  // Building blocks
  block1: {
    position: 'absolute',
    top: '15%',
    left: '40%',
    width: 25,
    height: 20,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    opacity: 0.6,
  },
  block2: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    width: 30,
    height: 25,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    opacity: 0.5,
  },
  block3: {
    position: 'absolute',
    bottom: '35%',
    left: '50%',
    width: 20,
    height: 30,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    opacity: 0.6,
  },
  block4: {
    position: 'absolute',
    top: '25%',
    right: '15%',
    width: 25,
    height: 18,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    opacity: 0.5,
  },

  // Store Markers
  storeMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  storeMarkerSelected: {
    zIndex: 20,
    transform: [{ scale: 1.1 }],
  },
  markerPulse: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  markerInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  markerLabelContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    maxWidth: 60,
    textAlign: 'center',
  },

  // Current Location
  currentLocation: {
    position: 'absolute',
    left: '48%',
    top: '42%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  currentLocationOuter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  currentLocationMiddle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  currentLocationInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },

  // Info Card
  infoCardContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  infoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00C06A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2240',
  },
  infoCardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  infoCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00C06A',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },

  // Zoom Controls
  zoomControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Compass
  compass: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  compassText: {
    position: 'absolute',
    top: 4,
    fontSize: 8,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Store List
  storeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storeListTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2240',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
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

  // Store Card
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  storeCardSelected: {
    borderColor: '#00C06A',
    backgroundColor: '#F0FDF4',
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2240',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cashbackBadge: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Floating Button
  listViewButton: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0B2240',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  listViewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  listViewText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ExploreMapPage;
