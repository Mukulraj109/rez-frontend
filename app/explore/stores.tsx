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
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { ExploreStore } from '@/services/exploreApi';
import { useRegion } from '@/contexts/RegionContext';
import { useCurrentLocation } from '@/hooks/useLocation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const categories = [
  { id: 'all', label: 'All', icon: 'grid', gradient: ['#6366F1', '#8B5CF6'] },
  { id: 'food', label: 'Food', icon: 'restaurant', gradient: ['#F97316', '#FB923C'] },
  { id: 'fashion', label: 'Fashion', icon: 'shirt', gradient: ['#EC4899', '#F472B6'] },
  { id: 'beauty', label: 'Beauty', icon: 'sparkles', gradient: ['#8B5CF6', '#A78BFA'] },
  { id: 'electronics', label: 'Tech', icon: 'phone-portrait', gradient: ['#3B82F6', '#60A5FA'] },
  { id: 'grocery', label: 'Grocery', icon: 'cart', gradient: ['#10B981', '#34D399'] },
];

// Generate gradient colors based on store name
const getStoreGradient = (name: string): [string, string] => {
  const gradients: [string, string][] = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
    ['#667eea', '#764ba2'],
    ['#6a11cb', '#2575fc'],
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

// Format rating to 1 decimal place
const formatRating = (rating: number | string | undefined): string => {
  if (!rating) return '';
  const num = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(num)) return '';
  return num.toFixed(1);
};

const ExploreStoresPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<ExploreStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Region context for coordinates and region name
  const { state: regionState } = useRegion();
  const regionName = regionState.regionConfig?.name || 'your area';
  const currentRegion = regionState.currentRegion;

  // Location context for GPS coordinates
  const { currentLocation } = useCurrentLocation();

  // Get effective coordinates
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

  // Fetch stores from API
  const fetchStores = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let response;
      if (searchQuery.trim()) {
        response = await exploreApi.searchStores(searchQuery);
      } else {
        response = await exploreApi.getStores({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 30,
        });
      }

      if (response.success && response.data) {
        setStores(response.data.stores || []);
      } else {
        setError(response.error || 'Failed to fetch stores');
      }
    } catch (err: any) {
      console.error('[STORES PAGE] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Refetch when region changes
  useEffect(() => {
    if (currentRegion) {
      fetchStores();
    }
  }, [currentRegion]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchStores();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    fetchStores(true);
  }, [fetchStores]);

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  // Filter stores based on category
  const filteredStores = stores.filter((store) => {
    if (selectedCategory !== 'all') {
      return store.category?.toLowerCase().includes(selectedCategory);
    }
    return true;
  });

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Render store card in list mode
  const renderListCard = (store: ExploreStore) => {
    const rating = formatRating(store.rating);
    const isOpen = store.isOpen !== false;
    const cashback = store.cashback || (store.cashbackRate ? `${store.cashbackRate}%` : null);
    const gradient = getStoreGradient(store.name || 'S');

    return (
      <TouchableOpacity
        key={store.id}
        style={styles.listCard}
        onPress={() => navigateTo(`/MainStorePage?storeId=${store.id}`)}
        activeOpacity={0.7}
      >
        {/* Store Image/Logo */}
        <View style={styles.listCardLeft}>
          {store.image ? (
            <Image source={{ uri: store.image }} style={styles.listCardImage} />
          ) : (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.listCardImagePlaceholder}
            >
              <Text style={styles.listCardInitial}>{store.name?.charAt(0) || 'S'}</Text>
            </LinearGradient>
          )}
          {/* Status Indicator */}
          <View style={[styles.statusDot, { backgroundColor: isOpen ? '#10B981' : '#EF4444' }]} />
        </View>

        {/* Store Info */}
        <View style={styles.listCardContent}>
          <View style={styles.listCardHeader}>
            <Text style={styles.listCardName} numberOfLines={1}>{store.name}</Text>
            {rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            )}
          </View>

          {store.category && (
            <Text style={styles.listCardCategory} numberOfLines={1}>{store.category}</Text>
          )}

          <View style={styles.listCardMeta}>
            {/* Status */}
            <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#ECFDF5' : '#FEF2F2' }]}>
              <Text style={[styles.statusText, { color: isOpen ? '#059669' : '#DC2626' }]}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>

            {/* Cashback */}
            {cashback && (
              <View style={styles.cashbackBadge}>
                <Ionicons name="gift" size={10} color="#FFFFFF" />
                <Text style={styles.cashbackText}>{cashback}</Text>
              </View>
            )}

            {/* Distance */}
            {store.distance && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={10} color="#3B82F6" />
                <Text style={styles.distanceText}>{store.distance}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.listCardArrow}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  // Render store card in grid mode
  const renderGridCard = (store: ExploreStore) => {
    const rating = formatRating(store.rating);
    const isOpen = store.isOpen !== false;
    const cashback = store.cashback || (store.cashbackRate ? `${store.cashbackRate}%` : null);
    const gradient = getStoreGradient(store.name || 'S');

    return (
      <TouchableOpacity
        key={store.id}
        style={styles.gridCard}
        onPress={() => navigateTo(`/MainStorePage?storeId=${store.id}`)}
        activeOpacity={0.7}
      >
        {/* Store Image */}
        <View style={styles.gridImageContainer}>
          {store.image ? (
            <Image source={{ uri: store.image }} style={styles.gridImage} />
          ) : (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gridImagePlaceholder}
            >
              <Text style={styles.gridInitial}>{store.name?.charAt(0) || 'S'}</Text>
            </LinearGradient>
          )}

          {/* Status Badge */}
          <View style={[styles.gridStatusBadge, { backgroundColor: isOpen ? '#10B981' : '#EF4444' }]}>
            <Text style={styles.gridStatusText}>{isOpen ? 'Open' : 'Closed'}</Text>
          </View>

          {/* Cashback Badge */}
          {cashback && (
            <View style={styles.gridCashbackBadge}>
              <Text style={styles.gridCashbackText}>{cashback}</Text>
            </View>
          )}
        </View>

        {/* Store Info */}
        <View style={styles.gridContent}>
          <Text style={styles.gridName} numberOfLines={1}>{store.name}</Text>

          <View style={styles.gridMeta}>
            {rating && (
              <View style={styles.gridRating}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.gridRatingText}>{rating}</Text>
              </View>
            )}
            {store.category && (
              <Text style={styles.gridCategory} numberOfLines={1}>{store.category}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Explore Stores</Text>
            <View style={styles.headerLocation}>
              <Ionicons name="location" size={12} color="#00C06A" />
              <Text style={styles.headerLocationText}>{regionName}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.mapIconButton}
            onPress={() => navigateTo('/explore/map')}
          >
            <Ionicons name="map" size={22} color="#0B2240" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stores, brands..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color="#0B2240" />
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
              onPress={() => handleCategoryChange(cat.id)}
            >
              {selectedCategory === cat.id ? (
                <LinearGradient
                  colors={cat.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryGradient}
                >
                  <Ionicons name={cat.icon as any} size={14} color="#FFFFFF" />
                  <Text style={styles.categoryLabelActive}>{cat.label}</Text>
                </LinearGradient>
              ) : (
                <>
                  <Ionicons name={cat.icon as any} size={14} color="#6B7280" />
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            <Text style={styles.statsCount}>{filteredStores.length}</Text> stores in {regionName}
          </Text>
          <View style={styles.statsRight}>
            {/* View Toggle */}
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons name="list" size={16} color={viewMode === 'list' ? '#00C06A' : '#9CA3AF'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggleBtn, viewMode === 'grid' && styles.viewToggleBtnActive]}
                onPress={() => setViewMode('grid')}
              >
                <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#00C06A' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>
            {/* Sort */}
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={14} color="#6B7280" />
              <Text style={styles.sortText}>Sort</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stores List/Grid */}
        <ScrollView
          style={styles.storesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.storesContainer,
            viewMode === 'grid' && styles.storesContainerGrid,
          ]}
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
              <View style={styles.errorIconContainer}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
              </View>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchStores()}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && filteredStores.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No stores found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? `No results for "${searchQuery}"` : `Try adjusting your filters`}
              </Text>
              {searchQuery && (
                <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Store Cards */}
          {!loading && !error && (
            viewMode === 'grid' ? (
              <View style={styles.gridContainer}>
                {filteredStores.map((store) => renderGridCard(store))}
              </View>
            ) : (
              filteredStores.map((store) => renderListCard(store))
            )
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Map Button */}
        <TouchableOpacity
          style={styles.floatingMapButton}
          onPress={() => navigateTo('/explore/map')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#00C06A', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.floatingMapGradient}
          >
            <Ionicons name="map" size={18} color="#FFFFFF" />
            <Text style={styles.floatingMapText}>Map View</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  headerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  headerLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  mapIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0B2240',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    maxHeight: 56,
    backgroundColor: '#FFFFFF',
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
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryLabelActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsCount: {
    fontWeight: '700',
    color: '#0B2240',
  },
  statsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleBtn: {
    width: 32,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  storesList: {
    flex: 1,
  },
  storesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    minHeight: 200,
  },
  storesContainerGrid: {
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#00C06A',
    borderRadius: 12,
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
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0B2240',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  clearSearchBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0B2240',
  },

  // List Card Styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  listCardLeft: {
    position: 'relative',
  },
  listCardImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  listCardImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  listCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  listCardCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  listCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Grid Card Styles
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gridImageContainer: {
    position: 'relative',
    height: 100,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridStatusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gridStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridCashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gridCashbackText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00C06A',
  },
  gridContent: {
    padding: 12,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B2240',
  },
  gridMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  gridCategory: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },

  // Floating Button
  floatingMapButton: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingMapGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  floatingMapText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ExploreStoresPage;
