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
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { ExploreStore, Category } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

// Map Ionicon names to emojis for category display
const iconToEmojiMap: { [key: string]: string } = {
  'restaurant-outline': '🍔', 'restaurant': '🍔', 'fast-food-outline': '🍔', 'fast-food': '🍔',
  'shirt-outline': '👔', 'shirt': '👔', 'bag-outline': '👜', 'bag': '👜',
  'phone-portrait-outline': '📱', 'phone-portrait': '📱', 'laptop-outline': '💻',
  'color-palette-outline': '💄', 'sparkles-outline': '💄',
  'cart-outline': '🛒', 'cart': '🛒', 'basket-outline': '🧺',
  'barbell-outline': '🏋️', 'barbell': '🏋️', 'fitness-outline': '🏋️',
  'home-outline': '🏠', 'home': '🏠',
  'construct-outline': '🔧', 'construct': '🔧',
  'snow-outline': '❄️', 'snow': '❄️',
  'receipt-outline': '🧾', 'receipt': '🧾',
  'book-outline': '📚', 'book': '📚',
  'medical-outline': '🏥', 'medkit-outline': '💊',
  'airplane-outline': '✈️', 'car-outline': '🚗',
  'paw-outline': '🐾',
};

// Get emoji from icon name or category name
const getEmojiForCategory = (icon?: string, name?: string): string => {
  if (icon && iconToEmojiMap[icon]) return iconToEmojiMap[icon];
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('food') || lowerName.includes('dining') || lowerName.includes('restaurant')) return '🍔';
  if (lowerName.includes('fashion') || lowerName.includes('cloth')) return '👜';
  if (lowerName.includes('electronic') || lowerName.includes('mobile')) return '📱';
  if (lowerName.includes('beauty') || lowerName.includes('salon')) return '💄';
  if (lowerName.includes('grocery') || lowerName.includes('supermarket')) return '🛒';
  if (lowerName.includes('fitness') || lowerName.includes('gym')) return '🏋️';
  if (lowerName.includes('home') || lowerName.includes('delivery')) return '🏠';
  if (lowerName.includes('service') || lowerName.includes('repair')) return '🔧';
  if (lowerName.includes('ac') || lowerName.includes('cooling')) return '❄️';
  if (lowerName.includes('bill') || lowerName.includes('payment')) return '🧾';
  if (lowerName.includes('coach') || lowerName.includes('education')) return '📚';
  return '🏷️';
};

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'highCashback', label: 'High Cashback' },
  { id: 'topRated', label: 'Top Rated' },
  { id: 'delivery', label: '60 Min Delivery' },
];

const CategoryDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // API state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<ExploreStore[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [maxCashback, setMaxCashback] = useState<string | null>(null);
  const [offersCount, setOffersCount] = useState<number | null>(null);

  // Fetch category data and stores
  const fetchCategoryData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const categorySlug = id as string;

      // Fetch category details and stores in parallel
      const [categoryResponse, storesResponse] = await Promise.all([
        exploreApi.getCategoryBySlug(categorySlug),
        exploreApi.getStoresByCategory(categorySlug, { limit: 20 }),
      ]);

      if (categoryResponse.success && categoryResponse.data) {
        setCategoryInfo(categoryResponse.data);
      }

      if (storesResponse.success && storesResponse.data) {
        let fetchedStores = storesResponse.data.stores || [];

        // Calculate max cashback from stores
        let maxCb = 0;
        let offersLive = 0;
        fetchedStores.forEach((store: any) => {
          const cbValue = parseInt(store.cashback?.replace('%', '') || '0');
          if (cbValue > maxCb) maxCb = cbValue;
          if (store.offer) offersLive++;
        });
        if (maxCb > 0) setMaxCashback(`${maxCb}%`);
        if (offersLive > 0) setOffersCount(offersLive);

        // Apply local filtering based on selected filter
        if (selectedFilter === 'topRated') {
          fetchedStores = [...fetchedStores].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (selectedFilter === 'highCashback') {
          fetchedStores = [...fetchedStores].sort((a, b) => {
            const aRate = parseInt(a.cashback?.replace('%', '') || '0');
            const bRate = parseInt(b.cashback?.replace('%', '') || '0');
            return bRate - aRate;
          });
        }

        setStores(fetchedStores);
      } else {
        setError(storesResponse.error || 'Failed to fetch stores');
      }
    } catch (err: any) {
      console.error('[CATEGORY PAGE] Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, selectedFilter]);

  // Initial fetch
  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const onRefresh = useCallback(() => {
    fetchCategoryData(true);
  }, [fetchCategoryData]);

  // Get display category info from API
  const categoryName = categoryInfo?.name || (id as string)?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Category';
  const categoryEmoji = getEmojiForCategory(categoryInfo?.icon, categoryInfo?.name);

  const navigateTo = (path: string) => {
    router.push(path as any);
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
            <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
            <Text style={styles.headerTitle}>{categoryName}</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={22} color="#0B2240" />
          </TouchableOpacity>
        </View>

        {/* Category Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{categoryInfo?.storeCount || stores.length || 0}</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
          {maxCashback && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#00C06A' }]}>
                  Up to {maxCashback}
                </Text>
                <Text style={styles.statLabel}>Cashback</Text>
              </View>
            </>
          )}
          {offersCount && offersCount > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{offersCount}</Text>
                <Text style={styles.statLabel}>Offers Live</Text>
              </View>
            </>
          )}
        </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {filterChips.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterLabel,
                selectedFilter === filter.id && styles.filterLabelActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stores List */}
      <ScrollView
        style={styles.storesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00C06A']} />
        }
      >
        {/* Loading State */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C06A" />
            <Text style={styles.loadingText}>Loading stores...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchCategoryData()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && stores.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No stores found</Text>
            <Text style={styles.emptySubtext}>Try a different filter or come back later</Text>
          </View>
        )}

        {/* Stores */}
        {!loading && !error && stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeCard}
            onPress={() => navigateTo(`/MainStorePage?storeId=${store.id}`)}
          >
            {store.image ? (
              <Image source={{ uri: store.image }} style={styles.storeImage} />
            ) : (
              <View style={[styles.storeImage, styles.storeImagePlaceholder]}>
                <Text style={styles.storeInitial}>{store.name?.charAt(0) || 'S'}</Text>
              </View>
            )}

            <View style={styles.storeContent}>
              <View style={styles.storeHeader}>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                {store.rating && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{store.rating}</Text>
                  </View>
                )}
              </View>

              {(store.offer || store.cashback) && (
                <View style={styles.offerRow}>
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>{store.offer || `${store.cashback} Cashback`}</Text>
                  </View>
                </View>
              )}

              <View style={styles.storeFooter}>
                {store.distance && (
                  <View style={styles.infoItem}>
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>{store.distance}</Text>
                  </View>
                )}
                {store.isOpen !== null && store.isOpen !== undefined && (
                  <View style={styles.infoItem}>
                    <Ionicons name={store.isOpen ? 'checkmark-circle' : 'close-circle'} size={14} color={store.isOpen ? '#10B981' : '#EF4444'} />
                    <Text style={styles.infoText}>{store.isOpen ? 'Open' : 'Closed'}</Text>
                  </View>
                )}
                {store.reviews && store.reviews > 0 && (
                  <View style={styles.infoItem}>
                    <Ionicons name="chatbubble" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>{store.reviews}</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.visitButton}
              onPress={() => navigateTo(`/MainStorePage?storeId=${store.id}`)}
            >
              <Text style={styles.visitText}>Visit</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Map Button */}
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => navigateTo('/explore/map')}
      >
        <LinearGradient
          colors={['#00C06A', '#10B981']}
          style={styles.mapButtonGradient}
        >
          <Ionicons name="map" size={20} color="#FFFFFF" />
          <Text style={styles.mapButtonText}>Map View</Text>
        </LinearGradient>
      </TouchableOpacity>
      </SafeAreaView>
    </>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 24,
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00C06A',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  storesList: {
    flex: 1,
  },
  storesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingVertical: 60,
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
    paddingVertical: 60,
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
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  storeImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00C06A',
  },
  storeInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeContent: {
    flex: 1,
    marginLeft: 12,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2240',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  offerRow: {
    marginTop: 6,
  },
  offerBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  visitButton: {
    backgroundColor: '#0B2240',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  visitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapButton: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CategoryDetailPage;
