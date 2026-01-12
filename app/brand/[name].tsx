/**
 * Brand Detail Page
 * Shows brand information and products
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import storesApi from '@/services/storesApi';
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
  pink500: '#EC4899',
  background: '#F5F5F5',
};

// Brand configurations
const brandConfigs: Record<string, {
  name: string;
  logo: string;
  description: string;
  color: string;
  category: string;
  tags: string[];
}> = {
  nykaa: {
    name: 'Nykaa',
    logo: '💅',
    description: 'India\'s leading beauty and wellness destination',
    color: '#EC4899',
    category: 'Beauty',
    tags: ['beauty', 'cosmetics', 'skincare', 'nykaa'],
  },
  sephora: {
    name: 'Sephora',
    logo: '💄',
    description: 'Premium beauty retailer with top brands',
    color: '#000000',
    category: 'Beauty',
    tags: ['beauty', 'cosmetics', 'sephora'],
  },
  mac: {
    name: 'MAC',
    logo: '💋',
    description: 'Professional quality makeup for all',
    color: '#1C1C1C',
    category: 'Makeup',
    tags: ['makeup', 'cosmetics', 'mac'],
  },
  'forest essentials': {
    name: 'Forest Essentials',
    logo: '🌿',
    description: 'Luxurious Ayurveda skincare',
    color: '#22C55E',
    category: 'Skincare',
    tags: ['skincare', 'ayurveda', 'organic'],
  },
};

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  image: string;
  cashback: string;
}

const BrandPage: React.FC = () => {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  const brandKey = name?.toLowerCase() || 'nykaa';
  const brandConfig = brandConfigs[brandKey] || {
    name: name?.charAt(0).toUpperCase() + name?.slice(1) || 'Brand',
    logo: '🏪',
    description: 'Discover amazing products',
    color: COLORS.primaryGreen,
    category: 'Products',
    tags: [brandKey],
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform product data
  const transformProduct = (product: any): Product => {
    const basePrice = product.pricing?.basePrice || product.price || 0;
    const salePrice = product.pricing?.salePrice || basePrice;
    const discount = basePrice > salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;

    return {
      id: product._id || product.id,
      name: product.name,
      price: salePrice,
      originalPrice: basePrice,
      discount,
      rating: product.ratings?.average || 4.5,
      image: product.images?.[0]?.url || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      cashback: product.cashback?.percentage ? `${product.cashback.percentage}%` : '10%',
    };
  };

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const response = await productsApi.getProducts({
        tags: brandConfig.tags,
        limit: 20,
      });

      if (response.success && response.data?.products) {
        setProducts(response.data.products.map(transformProduct));
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error('[BrandPage] Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [brandConfig.tags]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = (product: Product) => {
    router.push(`/ProductPage?productId=${product.id}` as any);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brandConfig.color} />
        <Text style={styles.loadingText}>Loading {brandConfig.name}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[brandConfig.color, brandConfig.color + 'CC']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/search' as any)} style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.brandInfo}>
          <View style={styles.brandLogoContainer}>
            <Text style={styles.brandLogo}>{brandConfig.logo}</Text>
          </View>
          <Text style={styles.brandName}>{brandConfig.name}</Text>
          <Text style={styles.brandDescription}>{brandConfig.description}</Text>
          <View style={styles.brandStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{products.length}+</Text>
              <Text style={styles.statLabel}>Products</Text>
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
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[brandConfig.color]}
          />
        }
      >
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray600} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: brandConfig.color }]} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!error && products.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{brandConfig.logo}</Text>
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtitle}>
              We're adding more {brandConfig.name} products soon!
            </Text>
          </View>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <View style={styles.productsContainer}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.8}
                >
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    {product.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{product.discount}% OFF</Text>
                      </View>
                    )}
                    <View style={styles.cashbackBadge}>
                      <Text style={styles.cashbackText}>{product.cashback}</Text>
                    </View>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
                      {product.discount > 0 && (
                        <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  searchButton: {
    padding: 8,
  },
  brandInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  brandLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLogo: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  brandDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  brandStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
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
    marginTop: 40,
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
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  productsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: (SCREEN_WIDTH - 44) / 2,
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
    height: 150,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
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
  productInfo: {
    padding: 12,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
});

export default BrandPage;
