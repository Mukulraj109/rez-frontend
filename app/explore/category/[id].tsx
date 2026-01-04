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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import exploreApi, { ExploreStore, Category } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

// Category data mapping
const categoryData: { [key: string]: any } = {
  food: {
    name: 'Food & Dining',
    emoji: '🍔',
    color: '#F97316',
    stores: 234,
    avgCashback: '12%',
  },
  fashion: {
    name: 'Fashion',
    emoji: '🛍️',
    color: '#EC4899',
    stores: 156,
    avgCashback: '15%',
  },
  electronics: {
    name: 'Electronics',
    emoji: '📱',
    color: '#3B82F6',
    stores: 89,
    avgCashback: '8%',
  },
  beauty: {
    name: 'Beauty & Wellness',
    emoji: '💄',
    color: '#A855F7',
    stores: 178,
    avgCashback: '18%',
  },
  grocery: {
    name: 'Grocery',
    emoji: '🛒',
    color: '#10B981',
    stores: 312,
    avgCashback: '5%',
  },
  fitness: {
    name: 'Fitness',
    emoji: '🏋️',
    color: '#EF4444',
    stores: 67,
    avgCashback: '20%',
  },
};

// Mock stores data
const storesData = [
  {
    id: 1,
    name: 'Paradise Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    rating: 4.5,
    reviews: 567,
    distance: '0.8 km',
    cashback: '20%',
    offer: 'Flat 20% Cashback',
    isOpen: true,
    deliveryTime: '30 min',
  },
  {
    id: 2,
    name: 'Starbucks',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    rating: 4.3,
    reviews: 345,
    distance: '0.5 km',
    cashback: '10%',
    offer: 'Buy 1 Get 1 Free',
    isOpen: true,
    deliveryTime: '20 min',
  },
  {
    id: 3,
    name: 'Cafe Noir',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    rating: 4.6,
    reviews: 234,
    distance: '1.2 km',
    cashback: '15%',
    offer: '15% Cashback',
    isOpen: true,
    deliveryTime: '25 min',
  },
  {
    id: 4,
    name: 'Fresh Mart',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    rating: 4.2,
    reviews: 189,
    distance: '0.3 km',
    cashback: '5%',
    offer: '5% on All Items',
    isOpen: true,
    deliveryTime: '40 min',
  },
  {
    id: 5,
    name: 'Pizza Palace',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    rating: 4.4,
    reviews: 456,
    distance: '1.5 km',
    cashback: '12%',
    offer: 'Flat ₹100 Off',
    isOpen: true,
    deliveryTime: '35 min',
  },
];

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

  // Get fallback category data
  const fallbackCategory = categoryData[id as string] || categoryData.food;

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

        // Apply local filtering based on selected filter
        if (selectedFilter === 'topRated') {
          fetchedStores = [...fetchedStores].sort((a, b) => b.rating - a.rating);
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

  // Get display category info (from API or fallback)
  const category = {
    name: categoryInfo?.name || fallbackCategory.name,
    emoji: fallbackCategory.emoji, // Fallback always has emoji
    color: fallbackCategory.color,
    stores: categoryInfo?.storeCount || stores.length || fallbackCategory.stores,
    avgCashback: fallbackCategory.avgCashback,
  };

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
        <View style={styles.headerCenter}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.headerTitle}>{category.name}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={22} color="#0B2240" />
        </TouchableOpacity>
      </View>

      {/* Category Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{category.stores}</Text>
          <Text style={styles.statLabel}>Stores</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#00C06A' }]}>
            Up to {category.avgCashback}
          </Text>
          <Text style={styles.statLabel}>Cashback</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statLabel}>Offers Live</Text>
        </View>
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
            onPress={() => navigateTo(`/MainStorePage?id=${store.id}`)}
          >
            <Image source={{ uri: store.image }} style={styles.storeImage} />

            <View style={styles.storeContent}>
              <View style={styles.storeHeader}>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{store.rating}</Text>
                </View>
              </View>

              <View style={styles.offerRow}>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerText}>{store.offer || `${store.cashback} Cashback`}</Text>
                </View>
              </View>

              <View style={styles.storeFooter}>
                {store.distance && (
                  <View style={styles.infoItem}>
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>{store.distance}</Text>
                  </View>
                )}
                <View style={styles.infoItem}>
                  <Ionicons name={store.isOpen ? 'checkmark-circle' : 'close-circle'} size={14} color={store.isOpen ? '#10B981' : '#EF4444'} />
                  <Text style={styles.infoText}>{store.isOpen ? 'Open' : 'Closed'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="chatbubble" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{store.reviews}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.visitButton}>
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
