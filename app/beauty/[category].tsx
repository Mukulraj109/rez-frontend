/**
 * Beauty Category Page - Dynamic route with API Integration
 * salon, spa, products, wellness, skincare, haircare
 * Production-ready with real data, filters, and booking flow
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import storesApi from '@/services/storesApi';
import productsApi from '@/services/productsApi';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  pink500: '#EC4899',
  amber500: '#F59E0B',
  background: '#F5F5F5',
};

// Category configuration with API tags
const categoryConfig: Record<string, {
  title: string;
  icon: string;
  gradientColors: [string, string];
  tags: string[];
  type: 'store' | 'product';
  subtitle: string;
}> = {
  salon: {
    title: 'Salons',
    icon: '💇‍♀️',
    gradientColors: ['#EC4899', '#F43F5E'],
    tags: ['salon', 'beauty', 'hair'],
    type: 'store',
    subtitle: 'Book hair, beauty & grooming services',
  },
  spa: {
    title: 'Spa & Massage',
    icon: '💆‍♀️',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    tags: ['spa', 'massage', 'wellness'],
    type: 'store',
    subtitle: 'Relax and rejuvenate',
  },
  products: {
    title: 'Beauty Products',
    icon: '💄',
    gradientColors: ['#F43F5E', '#E11D48'],
    tags: ['beauty', 'cosmetics', 'makeup'],
    type: 'product',
    subtitle: 'Shop makeup, skincare & more',
  },
  wellness: {
    title: 'Wellness Centers',
    icon: '🧘‍♀️',
    gradientColors: ['#10B981', '#059669'],
    tags: ['wellness', 'yoga', 'meditation', 'fitness'],
    type: 'store',
    subtitle: 'Yoga, meditation & holistic health',
  },
  skincare: {
    title: 'Skincare',
    icon: '✨',
    gradientColors: ['#F59E0B', '#D97706'],
    tags: ['skincare', 'beauty', 'cosmetics'],
    type: 'product',
    subtitle: 'Serums, moisturizers & treatments',
  },
  haircare: {
    title: 'Hair Care',
    icon: '💇',
    gradientColors: ['#3B82F6', '#2563EB'],
    tags: ['haircare', 'hair', 'beauty'],
    type: 'product',
    subtitle: 'Shampoos, treatments & styling',
  },
};

interface DisplayItem {
  id: string;
  name: string;
  type: string;
  rating: number;
  distance: string;
  cashback: string;
  price: string;
  image: string;
  isVerified?: boolean;
  reviewCount?: number;
}

const BeautyCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = categoryConfig[category || 'salon'] || categoryConfig['salon'];
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'nearby', label: 'Nearby', icon: 'location-outline' },
    { id: 'top-rated', label: 'Top Rated', icon: 'star' },
    { id: 'best-cashback', label: 'Best Cashback', icon: 'wallet-outline' },
  ];

  // Transform store data to display item
  const transformStoreToItem = (store: any): DisplayItem => ({
    id: store._id || store.id,
    name: store.name,
    type: store.category?.name || store.tags?.[0] || 'Service',
    rating: store.ratings?.average || 4.5,
    distance: store.distance ? `${store.distance.toFixed(1)} km` : '1.0 km',
    cashback: store.offers?.cashback?.percentage
      ? `${store.offers.cashback.percentage}%`
      : store.cashback?.maxPercentage
        ? `${store.cashback.maxPercentage}%`
        : '15%',
    price: store.priceRange || '₹500+',
    image: store.logo || store.banner || store.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    isVerified: store.isVerified || store.verification?.isVerified || false,
    reviewCount: store.ratings?.count || 0,
  });

  // Transform product data to display item
  const transformProductToItem = (product: any): DisplayItem => ({
    id: product._id || product.id,
    name: product.name,
    type: product.brand?.name || product.category?.name || 'Product',
    rating: product.ratings?.average || 4.5,
    distance: 'Online',
    cashback: product.cashback?.percentage
      ? `${product.cashback.percentage}%`
      : '10%',
    price: product.pricing?.salePrice
      ? `₹${product.pricing.salePrice.toLocaleString()}`
      : product.pricing?.basePrice
        ? `₹${product.pricing.basePrice.toLocaleString()}`
        : product.price
          ? `₹${product.price.toLocaleString()}`
          : '₹499+',
    image: product.images?.[0]?.url || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    isVerified: product.isVerified || false,
    reviewCount: product.ratings?.count || 0,
  });

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      if (config.type === 'store') {
        // Fetch stores (isActive is automatically applied by backend)
        const response = await storesApi.getStores({
          tags: config.tags,
          limit: 20,
        });

        if (response.success && response.data?.stores && response.data.stores.length > 0) {
          const transformedItems = response.data.stores.map(transformStoreToItem);
          setItems(transformedItems);
          setFilteredItems(transformedItems);
        } else {
          // No data found
          setItems([]);
          setFilteredItems([]);
        }
      } else {
        // Fetch products
        const response = await productsApi.getProducts({
          tags: config.tags,
          limit: 20,
        });

        if (response.success && response.data?.products && response.data.products.length > 0) {
          const transformedItems = response.data.products.map(transformProductToItem);
          setItems(transformedItems);
          setFilteredItems(transformedItems);
        } else {
          setItems([]);
          setFilteredItems([]);
        }
      }
    } catch (err: any) {
      console.error(`[BeautyCategory] Error fetching ${config.type}s:`, err);
      setError(err.message || 'Failed to load data');
      setItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [category, config]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Apply filters
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredItems(items);
    } else if (selectedFilter === 'nearby') {
      // Sort by distance (parse km value)
      const sorted = [...items].sort((a, b) => {
        const distA = parseFloat(a.distance) || 999;
        const distB = parseFloat(b.distance) || 999;
        return distA - distB;
      });
      setFilteredItems(sorted);
    } else if (selectedFilter === 'top-rated') {
      // Sort by rating
      const sorted = [...items].sort((a, b) => b.rating - a.rating);
      setFilteredItems(sorted);
    } else if (selectedFilter === 'best-cashback') {
      // Sort by cashback percentage
      const sorted = [...items].sort((a, b) => {
        const cashA = parseFloat(a.cashback) || 0;
        const cashB = parseFloat(b.cashback) || 0;
        return cashB - cashA;
      });
      setFilteredItems(sorted);
    }
  }, [selectedFilter, items]);

  // Handle item press - navigate to store or product page
  const handleItemPress = (item: DisplayItem) => {
    if (config.type === 'store') {
      router.push(`/MainStorePage?storeId=${item.id}` as any);
    } else {
      router.push(`/ProductPage?productId=${item.id}` as any);
    }
  };

  // Handle book/buy button press
  const handleBookPress = (item: DisplayItem) => {
    if (config.type === 'store') {
      // Navigate to store page with booking intent
      router.push(`/MainStorePage?storeId=${item.id}&action=book` as any);
    } else {
      // Navigate to product page with add to cart intent
      router.push(`/ProductPage?productId=${item.id}&action=buy` as any);
    }
  };

  // Handle search
  const handleSearch = () => {
    router.push(`/search?category=beauty&subcategory=${category}` as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.gradientColors[0]} />
        <Text style={styles.loadingText}>Loading {config.title.toLowerCase()}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
            <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredItems.length}</Text>
            <Text style={styles.statLabel}>{config.type === 'store' ? 'Places' : 'Products'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>30%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2X</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
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
                selectedFilter === filter.id && { backgroundColor: config.gradientColors[0] }
              ]}
            >
              {filter.icon && (
                <Ionicons
                  name={filter.icon as any}
                  size={14}
                  color={selectedFilter === filter.id ? COLORS.white : COLORS.gray600}
                />
              )}
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
            colors={[config.gradientColors[0]]}
          />
        }
      >
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray600} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!error && filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{config.icon}</Text>
            <Text style={styles.emptyTitle}>No {config.title} Found</Text>
            <Text style={styles.emptySubtitle}>
              We're working on adding more {config.title.toLowerCase()} in your area.
            </Text>
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: config.gradientColors[0] }]}
              onPress={() => router.push('/beauty' as any)}
            >
              <Text style={styles.exploreButtonText}>Explore Other Categories</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Items List */}
        {filteredItems.length > 0 && (
          <View style={styles.itemsList}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                {/* Cashback Badge */}
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{item.cashback}</Text>
                </View>

                {/* Verified Badge */}
                {item.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                  </View>

                  <View style={styles.itemMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                      {item.reviewCount > 0 && (
                        <Text style={styles.reviewCount}>({item.reviewCount})</Text>
                      )}
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={COLORS.gray600} />
                      <Text style={styles.metaText}>{item.distance}</Text>
                    </View>
                  </View>

                  <View style={styles.itemFooter}>
                    <View>
                      <Text style={styles.priceLabel}>
                        {config.type === 'store' ? 'Starting from' : 'Price'}
                      </Text>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.bookButton, { backgroundColor: config.gradientColors[0] }]}
                      onPress={() => handleBookPress(item)}
                    >
                      <Text style={styles.bookButtonText}>
                        {config.type === 'store' ? 'Book' : 'Buy'}
                      </Text>
                    </TouchableOpacity>
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
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
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
  searchButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
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
    backgroundColor: COLORS.pink500,
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
    flex: 1,
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
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  itemsList: {
    padding: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    height: 180,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  itemInfo: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  bookButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default BeautyCategoryPage;
