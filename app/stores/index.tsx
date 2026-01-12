/**
 * Stores Listing Page
 * Shows all stores filtered by category with search and filtering capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import storesApi from '@/services/storesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  primaryGreen: '#00C06A',
  amber500: '#F59E0B',
  background: '#F5F5F5',
};

// Category configurations
const categoryConfigs: Record<string, {
  title: string;
  color: string;
  tags: string[];
  icon: string;
}> = {
  'beauty-wellness': {
    title: 'Beauty & Wellness',
    color: '#EC4899',
    tags: ['beauty', 'salon', 'spa', 'wellness'],
    icon: '💄',
  },
  'food-dining': {
    title: 'Food & Dining',
    color: '#F97316',
    tags: ['food', 'restaurant', 'cafe', 'dining'],
    icon: '🍔',
  },
  'fashion': {
    title: 'Fashion',
    color: '#8B5CF6',
    tags: ['fashion', 'clothing', 'apparel'],
    icon: '👗',
  },
  'grocery-essentials': {
    title: 'Grocery & Essentials',
    color: '#22C55E',
    tags: ['grocery', 'supermarket', 'essentials'],
    icon: '🛒',
  },
  'healthcare': {
    title: 'Healthcare',
    color: '#EF4444',
    tags: ['healthcare', 'pharmacy', 'medical', 'clinic'],
    icon: '🏥',
  },
  'default': {
    title: 'All Stores',
    color: '#00C06A',
    tags: [],
    icon: '🏪',
  },
};

interface DisplayStore {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string;
  cashback: string;
  image: string;
  isVerified: boolean;
  is60Min: boolean;
  tags: string[];
}

const StoresPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const categorySlug = (params.category as string) || 'default';
  const filterParam = params.filter as string;

  const config = categoryConfigs[categorySlug] || categoryConfigs['default'];

  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<DisplayStore[]>([]);
  const [filteredStores, setFilteredStores] = useState<DisplayStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(filterParam || 'all');

  const filters = [
    { id: 'all', label: 'All', icon: 'grid-outline' },
    { id: 'verified', label: 'Verified', icon: 'shield-checkmark-outline' },
    { id: 'nearby', label: 'Nearby', icon: 'location-outline' },
    { id: 'top-rated', label: 'Top Rated', icon: 'star-outline' },
    { id: 'try-buy', label: '60 Min', icon: 'time-outline' },
  ];

  // Transform store data
  const transformStore = (store: any): DisplayStore => ({
    id: store._id || store.id,
    name: store.name,
    category: store.category?.name || store.tags?.[0] || 'Store',
    rating: store.ratings?.average || 4.5,
    reviewCount: store.ratings?.count || 0,
    distance: store.distance ? `${store.distance.toFixed(1)} km` : '1.0 km',
    cashback: store.offers?.cashback?.percentage
      ? `${store.offers.cashback.percentage}%`
      : store.cashback?.maxPercentage
        ? `${store.cashback.maxPercentage}%`
        : '15%',
    image: store.logo || store.banner || store.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    isVerified: store.isVerified || store.verification?.isVerified || false,
    is60Min: store.operationalInfo?.deliveryTime ? parseInt(store.operationalInfo.deliveryTime) <= 60 : false,
    tags: store.tags || [],
  });

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    try {
      setError(null);

      const response = await storesApi.getStores({
        tags: config.tags.length > 0 ? config.tags : undefined,
        limit: 50,
      });

      if (response.success && response.data?.stores) {
        const transformedStores = response.data.stores.map(transformStore);
        setStores(transformedStores);
        setFilteredStores(transformedStores);
      } else {
        setStores([]);
        setFilteredStores([]);
      }
    } catch (err: any) {
      console.error('[StoresPage] Error fetching stores:', err);
      setError(err.message || 'Failed to load stores');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [config.tags]);

  useEffect(() => {
    setIsLoading(true);
    fetchStores();
  }, [fetchStores]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchStores();
  }, [fetchStores]);

  // Apply filters and search
  useEffect(() => {
    let result = [...stores];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        store =>
          store.name.toLowerCase().includes(query) ||
          store.category.toLowerCase().includes(query) ||
          store.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filter
    if (selectedFilter === 'verified') {
      result = result.filter(store => store.isVerified);
    } else if (selectedFilter === 'nearby') {
      result = result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } else if (selectedFilter === 'top-rated') {
      result = result.sort((a, b) => b.rating - a.rating);
    } else if (selectedFilter === 'try-buy') {
      result = result.filter(store => store.is60Min);
    }

    setFilteredStores(result);
  }, [stores, searchQuery, selectedFilter]);

  // Handle store press
  const handleStorePress = (store: DisplayStore) => {
    router.push(`/MainStorePage?storeId=${store.id}` as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.color} />
        <Text style={styles.loadingText}>Loading stores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[config.color, config.color + 'DD']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{config.icon} {config.title}</Text>
            <Text style={styles.headerSubtitle}>{filteredStores.length} stores near you</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray600} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor={COLORS.gray600}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setSelectedFilter(filter.id)}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && { backgroundColor: config.color }
              ]}
            >
              <Ionicons
                name={filter.icon as any}
                size={14}
                color={selectedFilter === filter.id ? COLORS.white : COLORS.gray600}
              />
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[config.color]}
          />
        }
      >
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray600} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: config.color }]} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!error && filteredStores.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>No Stores Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'We\'re adding more stores soon!'}
            </Text>
          </View>
        )}

        {/* Stores Grid */}
        {filteredStores.length > 0 && (
          <View style={styles.storesGrid}>
            {filteredStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.storeCard}
                onPress={() => handleStorePress(store)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: store.image }} style={styles.storeImage} />

                {/* Badges */}
                <View style={styles.badgesContainer}>
                  {store.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={10} color={COLORS.white} />
                    </View>
                  )}
                  {store.is60Min && (
                    <View style={styles.fastBadge}>
                      <Ionicons name="flash" size={10} color={COLORS.white} />
                      <Text style={styles.fastBadgeText}>60m</Text>
                    </View>
                  )}
                </View>

                {/* Cashback Badge */}
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{store.cashback}</Text>
                </View>

                <View style={styles.storeInfo}>
                  <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                  <Text style={styles.storeCategory} numberOfLines={1}>{store.category}</Text>
                  <View style={styles.storeMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.distanceText}>{store.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.navy,
  },
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  storesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  storeCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeImage: {
    width: '100%',
    height: 120,
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: COLORS.primaryGreen,
    padding: 4,
    borderRadius: 8,
  },
  fastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.amber500,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  fastBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  storeInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  storeCategory: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  storeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  distanceText: {
    fontSize: 11,
    color: COLORS.gray600,
  },
});

export default StoresPage;
