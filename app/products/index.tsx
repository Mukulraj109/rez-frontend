/**
 * Products Listing Page
 * Shows all products filtered by category with search and filtering capabilities
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
import productsApi from '@/services/productsApi';

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
  red500: '#EF4444',
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
    title: 'Beauty Products',
    color: '#EC4899',
    tags: ['beauty', 'cosmetics', 'skincare', 'makeup'],
    icon: '💄',
  },
  'fashion': {
    title: 'Fashion',
    color: '#8B5CF6',
    tags: ['fashion', 'clothing', 'apparel', 'accessories'],
    icon: '👗',
  },
  'grocery-essentials': {
    title: 'Grocery & Essentials',
    color: '#22C55E',
    tags: ['grocery', 'food', 'essentials'],
    icon: '🛒',
  },
  'healthcare': {
    title: 'Healthcare Products',
    color: '#EF4444',
    tags: ['healthcare', 'medicine', 'supplements'],
    icon: '💊',
  },
  'default': {
    title: 'All Products',
    color: '#00C06A',
    tags: [],
    icon: '🛍️',
  },
};

interface DisplayProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice: number;
  discount: number;
  cashback: string;
  image: string;
  inStock: boolean;
}

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const categorySlug = (params.category as string) || 'default';
  const filterParam = params.filter as string;

  const config = categoryConfigs[categorySlug] || categoryConfigs['default'];

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DisplayProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(filterParam || 'all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating' | 'discount'>('relevance');

  const filters = [
    { id: 'all', label: 'All', icon: 'grid-outline' },
    { id: 'trending', label: 'Trending', icon: 'trending-up-outline' },
    { id: 'best-sellers', label: 'Best Sellers', icon: 'flame-outline' },
    { id: 'new-arrivals', label: 'New', icon: 'sparkles-outline' },
    { id: 'on-sale', label: 'On Sale', icon: 'pricetag-outline' },
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Top Rated' },
    { id: 'discount', label: 'Biggest Discount' },
  ];

  // Transform product data
  const transformProduct = (product: any): DisplayProduct => {
    const basePrice = product.pricing?.basePrice || product.price || 0;
    const salePrice = product.pricing?.salePrice || basePrice;
    const discount = basePrice > salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;

    return {
      id: product._id || product.id,
      name: product.name,
      brand: product.brand?.name || 'Brand',
      category: product.category?.name || 'Product',
      rating: product.ratings?.average || 4.5,
      reviewCount: product.ratings?.count || 0,
      price: salePrice,
      originalPrice: basePrice,
      discount,
      cashback: product.cashback?.percentage
        ? `${product.cashback.percentage}%`
        : '10%',
      image: product.images?.[0]?.url || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      inStock: product.inventory?.quantity > 0 || product.inStock !== false,
    };
  };

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);

      const response = await productsApi.getProducts({
        tags: config.tags.length > 0 ? config.tags : undefined,
        limit: 50,
      });

      if (response.success && response.data?.products) {
        const transformedProducts = response.data.products.map(transformProduct);
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err: any) {
      console.error('[ProductsPage] Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [config.tags]);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...products];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Apply filter
    if (selectedFilter === 'trending') {
      result = result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (selectedFilter === 'best-sellers') {
      result = result.sort((a, b) => b.rating - a.rating);
    } else if (selectedFilter === 'new-arrivals') {
      // In a real app, sort by date added
      result = result.slice().reverse();
    } else if (selectedFilter === 'on-sale') {
      result = result.filter(product => product.discount > 0);
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      result = result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      result = result.sort((a, b) => b.discount - a.discount);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedFilter, sortBy]);

  // Handle product press
  const handleProductPress = (product: DisplayProduct) => {
    router.push(`/ProductPage?productId=${product.id}` as any);
  };

  // Handle add to cart
  const handleAddToCart = (product: DisplayProduct) => {
    router.push(`/ProductPage?productId=${product.id}&action=buy` as any);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.color} />
        <Text style={styles.loadingText}>Loading products...</Text>
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
            <Text style={styles.headerSubtitle}>{filteredProducts.length} products available</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/CartPage' as any)} style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray600} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
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

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultCount}>{filteredProducts.length} Results</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSortBy(option.id as any)}
              style={[
                styles.sortChip,
                sortBy === option.id && styles.sortChipActive
              ]}
            >
              <Text style={[
                styles.sortChipText,
                sortBy === option.id && styles.sortChipTextActive
              ]}>
                {option.label}
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
        {!error && filteredProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search term' : 'We\'re adding more products soon!'}
            </Text>
          </View>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 && (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleProductPress(product)}
                activeOpacity={0.8}
              >
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{product.discount}% OFF</Text>
                    </View>
                  )}

                  {/* Cashback Badge */}
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{product.cashback}</Text>
                  </View>

                  {/* Out of Stock Overlay */}
                  {!product.inStock && (
                    <View style={styles.outOfStockOverlay}>
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color={COLORS.amber500} />
                    <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                    <Text style={styles.reviewCount}>({product.reviewCount})</Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
                    {product.discount > 0 && (
                      <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addToCartButton,
                      { backgroundColor: product.inStock ? config.color : COLORS.gray200 }
                    ]}
                    onPress={() => product.inStock && handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    <Text style={[
                      styles.addToCartText,
                      !product.inStock && { color: COLORS.gray600 }
                    ]}>
                      {product.inStock ? 'Add to Cart' : 'Notify Me'}
                    </Text>
                  </TouchableOpacity>
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
  cartButton: {
    padding: 8,
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
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 12,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.gray50,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: COLORS.navy,
  },
  sortChipText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  sortChipTextActive: {
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
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  productCard: {
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
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.red500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
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
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 6,
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  reviewCount: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.gray600,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default ProductsPage;
