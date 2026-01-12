/**
 * Grocery Category Page - Dynamic route with API Integration
 * Handles all grocery subcategories: fruits, veggies, dairy, snacks, etc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GroceryProductCard, ProductsGridSkeleton } from '@/components/grocery';
import { productsApi } from '@/services/productsApi';
import { cartApi } from '@/services/cartApi';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  green500: '#22C55E',
  green600: '#16A34A',
  amber500: '#F59E0B',
  red500: '#EF4444',
};

// Category configuration with metadata
const categoryConfig: Record<string, {
  title: string;
  icon: string;
  gradientColors: [string, string];
  description: string;
  tags: string[];
}> = {
  // Main categories from homepage
  fruits: {
    title: 'Fruits',
    icon: '🍎',
    gradientColors: ['#FF6B6B', '#EE5A5A'],
    description: 'Fresh fruits delivered to your doorstep',
    tags: ['fruits', 'fresh', 'organic'],
  },
  veggies: {
    title: 'Vegetables',
    icon: '🥕',
    gradientColors: ['#4CAF50', '#43A047'],
    description: 'Farm-fresh vegetables',
    tags: ['vegetables', 'veggies', 'fresh', 'organic'],
  },
  dairy: {
    title: 'Dairy & Eggs',
    icon: '🥛',
    gradientColors: ['#2196F3', '#1E88E5'],
    description: 'Milk, curd, cheese, eggs and more',
    tags: ['dairy', 'milk', 'eggs', 'cheese'],
  },
  snacks: {
    title: 'Snacks & Munchies',
    icon: '🍪',
    gradientColors: ['#FF9800', '#FB8C00'],
    description: 'Chips, namkeen, biscuits and more',
    tags: ['snacks', 'chips', 'biscuits', 'namkeen'],
  },
  // Additional categories
  beverages: {
    title: 'Beverages',
    icon: '🥤',
    gradientColors: ['#00BCD4', '#00ACC1'],
    description: 'Cold drinks, juices, tea, coffee',
    tags: ['beverages', 'drinks', 'juice', 'tea', 'coffee'],
  },
  staples: {
    title: 'Staples & Grains',
    icon: '🌾',
    gradientColors: ['#795548', '#6D4C41'],
    description: 'Rice, dal, atta, oil, sugar',
    tags: ['staples', 'rice', 'dal', 'atta', 'grains'],
  },
  essentials: {
    title: 'Essentials',
    icon: '🧴',
    gradientColors: ['#22C55E', '#16A34A'],
    description: 'Cleaning & personal care',
    tags: ['essentials', 'personal-care', 'cleaning'],
  },
  daily: {
    title: 'Daily Needs',
    icon: '🥛',
    gradientColors: ['#3B82F6', '#2563EB'],
    description: 'Dairy & bread',
    tags: ['daily', 'dairy', 'bread', 'bakery'],
  },
  supermarket: {
    title: 'Supermarket',
    icon: '🛒',
    gradientColors: ['#F97316', '#EA580C'],
    description: 'BigBasket, DMart',
    tags: ['supermarket', 'grocery', 'bigbasket', 'dmart'],
  },
  organic: {
    title: 'Organic',
    icon: '🌿',
    gradientColors: ['#10B981', '#059669'],
    description: 'Organic vegetables & fruits',
    tags: ['organic', 'natural', 'farm', 'fresh'],
  },
  deals: {
    title: 'Hot Deals',
    icon: '🏷️',
    gradientColors: ['#EF4444', '#DC2626'],
    description: 'Best deals & offers',
    tags: ['deals', 'offers', 'discount', 'sale'],
  },
  fresh: {
    title: 'Fresh Produce',
    icon: '🥬',
    gradientColors: ['#84CC16', '#65A30D'],
    description: 'Vegetables & Fruits',
    tags: ['fresh', 'vegetables', 'fruits', 'produce'],
  },
  'personal-care': {
    title: 'Personal Care',
    icon: '🧴',
    gradientColors: ['#E91E63', '#D81B60'],
    description: 'Skincare, haircare, hygiene',
    tags: ['personal-care', 'hygiene', 'skincare', 'haircare'],
  },
  household: {
    title: 'Household',
    icon: '🧹',
    gradientColors: ['#9C27B0', '#8E24AA'],
    description: 'Cleaning supplies, detergents',
    tags: ['household', 'cleaning', 'detergent'],
  },
};

// Filter options
const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'price_low', label: 'Price: Low', sort: 'price', order: 'asc' },
  { key: 'price_high', label: 'Price: High', sort: 'price', order: 'desc' },
  { key: 'rating', label: 'Rating', sort: 'rating', order: 'desc' },
  { key: 'cashback', label: 'Cashback', sort: 'cashback', order: 'desc' },
];

interface Product {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  images?: Array<{ url: string; alt?: string }>;
  pricing?: { basePrice?: number; salePrice?: number };
  unit?: string;
  rating?: { average?: number; count?: number };
  cashback?: { percentage?: number };
  store?: { id?: string; name?: string };
  inStock?: boolean;
  tags?: string[];
}

const GroceryCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  // Get category config
  const categorySlug = category || 'essentials';
  const config = categoryConfig[categorySlug] || {
    title: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    icon: '🛒',
    gradientColors: ['#22C55E', '#16A34A'] as [string, string],
    description: 'Grocery items',
    tags: [categorySlug],
  };

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Build query params
      const queryParams: any = {
        page,
        limit: 20,
        status: 'active',
      };

      // Add category filter based on tags or category slug
      if (categorySlug && categorySlug !== 'all') {
        queryParams.category = categorySlug;
        // Also search by tags for better results
        queryParams.tags = config.tags;
      }

      // Add search query
      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }

      // Add sorting
      const filter = filterOptions.find(f => f.key === selectedFilter);
      if (filter && filter.sort) {
        queryParams.sort = filter.sort;
        queryParams.order = filter.order;
      }

      const response = await productsApi.getProducts(queryParams);

      if (response.success && response.data) {
        const newProducts = response.data.products || [];
        if (append) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        setPagination({
          current: response.data.pagination?.current || page,
          pages: response.data.pagination?.pages || 1,
          total: response.data.pagination?.total || newProducts.length,
        });
      } else {
        // If API fails, use fallback data
        if (page === 1) {
          setProducts(getFallbackProducts(categorySlug));
          setPagination({ current: 1, pages: 1, total: 10 });
        }
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      if (page === 1) {
        setProducts(getFallbackProducts(categorySlug));
        setPagination({ current: 1, pages: 1, total: 10 });
      }
      setError('Unable to load products. Showing cached data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [categorySlug, searchQuery, selectedFilter, config.tags]);

  // Initial load
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && pagination.current < pagination.pages) {
      fetchProducts(pagination.current + 1, true);
    }
  }, [loadingMore, pagination, fetchProducts]);

  // Handle filter change
  const handleFilterChange = (filterKey: string) => {
    setSelectedFilter(filterKey);
    setProducts([]);
    fetchProducts(1);
  };

  // Handle search
  const handleSearch = () => {
    setProducts([]);
    fetchProducts(1);
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    try {
      const productId = product.id || product._id || '';
      await cartApi.addToCart(productId, 1);
      // Could show a toast here
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // Render search bar
  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${config.title}...`}
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{config.icon}</Text>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `No results for "${searchQuery}"`
          : `No ${config.title.toLowerCase()} available right now`}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onRefresh}>
        <Text style={styles.emptyButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error state
  const renderErrorBanner = () => {
    if (!error) return null;

    return (
      <View style={styles.errorBanner}>
        <Ionicons name="warning-outline" size={16} color={COLORS.amber500} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{config.icon} {config.title}</Text>
            <Text style={styles.headerSubtitle}>
              {pagination.total > 0 ? `${pagination.total} items` : config.description}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search'}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Error Banner */}
      {renderErrorBanner()}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => handleFilterChange(filter.key)}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products */}
      {loading ? (
        <ProductsGridSkeleton count={6} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[config.gradientColors[0]]}
              tintColor={config.gradientColors[0]}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            if (isCloseToBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {products.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <GroceryProductCard
                  key={product.id || product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  showStore
                />
              ))}
            </View>
          )}

          {/* Load More Indicator */}
          {loadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={config.gradientColors[0]} />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          )}

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
};

// Fallback data when API fails
function getFallbackProducts(category: string): Product[] {
  const fallbackImages: Record<string, string> = {
    fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
    veggies: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
    beverages: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400',
    staples: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
  };

  const image = fallbackImages[category] || fallbackImages.default;
  const config = categoryConfig[category];
  const title = config?.title || 'Product';

  return Array.from({ length: 6 }, (_, i) => ({
    id: `fallback-${category}-${i}`,
    name: `${title} Item ${i + 1}`,
    description: 'Fresh quality product',
    images: [{ url: image, alt: title }],
    pricing: { basePrice: 50 + i * 20, salePrice: 45 + i * 18 },
    unit: '1 kg',
    rating: { average: 4.2 + Math.random() * 0.6, count: 50 + i * 10 },
    cashback: { percentage: 8 + i },
    store: { id: 'store-1', name: 'Local Store' },
    inStock: true,
    tags: config?.tags || [category],
  }));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.navy,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.amber500,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.amber500,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.green500,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.green500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
});

export default GroceryCategoryPage;
