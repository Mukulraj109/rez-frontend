/**
 * Beauty & Wellness Hub Page - Production Ready
 * Main hub for all beauty services with real API data
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
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import storesApi from '@/services/storesApi';
import productsApi from '@/services/productsApi';
import { useRegion } from '@/contexts/RegionContext';

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
  pink500: '#EC4899',
  purple500: '#8B5CF6',
  amber500: '#F59E0B',
  background: '#F5F5F5',
};

// Beauty categories
const BEAUTY_CATEGORIES = [
  { id: 'salon', title: 'Salon', icon: '💇‍♀️', color: '#EC4899', route: '/beauty/salon' },
  { id: 'spa', title: 'Spa & Massage', icon: '💆‍♀️', color: '#8B5CF6', route: '/beauty/spa' },
  { id: 'products', title: 'Products', icon: '💄', color: '#F43F5E', route: '/beauty/products' },
  { id: 'wellness', title: 'Wellness', icon: '🧘‍♀️', color: '#10B981', route: '/beauty/wellness' },
  { id: 'skincare', title: 'Skincare', icon: '✨', color: '#F59E0B', route: '/beauty/skincare' },
  { id: 'haircare', title: 'Hair Care', icon: '💇', color: '#3B82F6', route: '/beauty/haircare' },
];

// Top brands with routes
const TOP_BRANDS = [
  { id: '1', name: 'Nykaa', logo: '💅', discount: 'Up to 40% off', route: '/brand/nykaa' },
  { id: '2', name: 'Sephora', logo: '💄', discount: 'Buy 2 Get 1', route: '/brand/sephora' },
  { id: '3', name: 'MAC', logo: '💋', discount: '15% cashback', route: '/brand/mac' },
  { id: '4', name: 'Forest Essentials', logo: '🌿', discount: '20% off', route: '/brand/forest essentials' },
];

interface DisplaySalon {
  id: string;
  name: string;
  rating: number;
  distance: string;
  cashback: string;
  image: string;
  isVerified: boolean;
  category: string;
}

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  cashback: string;
  image: string;
  brand: string;
}

const BeautyPage: React.FC = () => {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [featuredSalons, setFeaturedSalons] = useState<DisplaySalon[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<DisplayProduct[]>([]);
  const [stats, setStats] = useState({ salons: 0, maxCashback: 30, products: 0 });

  const transformStoreToSalon = (store: any): DisplaySalon => ({
    id: store._id || store.id,
    name: store.name,
    rating: store.ratings?.average || 4.5,
    distance: store.distance ? `${store.distance.toFixed(1)} km` : '1.0 km',
    cashback: store.offers?.cashback?.percentage
      ? `${store.offers.cashback.percentage}%`
      : store.cashback?.maxPercentage
        ? `${store.cashback.maxPercentage}%`
        : '20%',
    image: store.logo || store.banner || store.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    isVerified: store.isVerified || store.verification?.isVerified || false,
    category: store.category?.name || 'Salon',
  });

  const transformProduct = (product: any): DisplayProduct => {
    const basePrice = product.pricing?.basePrice || product.price || 0;
    const salePrice = product.pricing?.salePrice || basePrice;
    const discount = basePrice > salePrice ? Math.round((1 - salePrice / basePrice) * 100) : 0;

    return {
      id: product._id || product.id,
      name: product.name,
      price: salePrice,
      originalPrice: basePrice,
      discount,
      cashback: product.cashback?.percentage ? `${product.cashback.percentage}%` : '10%',
      image: product.images?.[0]?.url || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      brand: product.brand?.name || 'Brand',
    };
  };

  const fetchData = useCallback(async () => {
    try {
      // Fetch stores and products in parallel
      const [storesResponse, productsResponse] = await Promise.all([
        storesApi.getStores({
          tags: ['beauty', 'salon', 'spa'],
          limit: 10,
        }),
        productsApi.getProducts({
          tags: ['beauty', 'cosmetics', 'skincare'],
          limit: 10,
        }),
      ]);

      // Process stores
      if (storesResponse.success && storesResponse.data?.stores) {
        setFeaturedSalons(storesResponse.data.stores.slice(0, 6).map(transformStoreToSalon));
        setStats(prev => ({
          ...prev,
          salons: storesResponse.data?.pagination?.total || storesResponse.data?.stores?.length || 0,
        }));
      }

      // Process products
      if (productsResponse.success && productsResponse.data?.products) {
        setTrendingProducts(productsResponse.data.products.slice(0, 8).map(transformProduct));
        setStats(prev => ({
          ...prev,
          products: productsResponse.data?.pagination?.total || productsResponse.data?.products?.length || 0,
        }));
      }
    } catch (error) {
      console.error('[BeautyPage] Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleCategoryPress = (route: string) => {
    router.push(route as any);
  };

  const handleSalonPress = (salonId: string) => {
    router.push(`/MainStorePage?storeId=${salonId}` as any);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/ProductPage?productId=${productId}` as any);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&category=beauty` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.pink500} />
        <Text style={styles.loadingText}>Loading beauty services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#EC4899', '#F43F5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>💄 Beauty & Wellness</Text>
            <Text style={styles.headerSubtitle}>Pamper yourself, earn rewards</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray600} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search salons, spas, products..."
            placeholderTextColor={COLORS.gray600}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray600} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.salons || '500'}+</Text>
            <Text style={styles.statLabel}>Salons & Spas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.maxCashback}%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2X</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.pink500]} />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.categoriesGrid}>
            {BEAUTY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Salons */}
        {featuredSalons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Salons & Spas</Text>
              <TouchableOpacity onPress={() => router.push('/stores?category=beauty-wellness' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {featuredSalons.map((salon) => (
                <TouchableOpacity
                  key={salon.id}
                  style={styles.salonCard}
                  onPress={() => handleSalonPress(salon.id)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: salon.image }} style={styles.salonImage} />
                  {salon.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={10} color={COLORS.white} />
                    </View>
                  )}
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{salon.cashback}</Text>
                  </View>
                  <View style={styles.salonInfo}>
                    <Text style={styles.salonName} numberOfLines={1}>{salon.name}</Text>
                    <Text style={styles.salonCategory} numberOfLines={1}>{salon.category}</Text>
                    <View style={styles.salonMeta}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color={COLORS.amber500} />
                        <Text style={styles.ratingText}>{salon.rating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.distanceText}>{salon.distance}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Products</Text>
              <TouchableOpacity onPress={() => router.push('/products?category=beauty-wellness' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {trendingProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    {product.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{product.discount}% OFF</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productBrand}>{product.brand}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>{currencySymbol}{product.price.toLocaleString()}</Text>
                      {product.discount > 0 && (
                        <Text style={styles.originalPrice}>{currencySymbol}{product.originalPrice.toLocaleString()}</Text>
                      )}
                    </View>
                    <Text style={styles.productCashback}>{product.cashback} cashback</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Brands</Text>
          <View style={styles.brandsGrid}>
            {TOP_BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.brandCard}
                activeOpacity={0.8}
                onPress={() => router.push(brand.route as any)}
              >
                <Text style={styles.brandLogo}>{brand.logo}</Text>
                <Text style={styles.brandName}>{brand.name}</Text>
                <Text style={styles.brandDiscount}>{brand.discount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>💅</Text>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Beauty Week Special</Text>
              <Text style={styles.promoSubtitle}>Extra 15% cashback on all bookings</Text>
            </View>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => router.push('/offers' as any)}
            >
              <Text style={styles.promoButtonText}>View Offers</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/stores?category=beauty-wellness&filter=verified' as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#0284C7" />
              </View>
              <Text style={styles.quickActionLabel}>Verified{'\n'}Clinics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/stores?category=beauty-wellness&filter=nearby' as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="location" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionLabel}>Near{'\n'}Me</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/offers?type=cashback' as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="wallet" size={24} color="#059669" />
              </View>
              <Text style={styles.quickActionLabel}>Best{'\n'}Cashback</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/stores?category=beauty-wellness&filter=try-buy' as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
                <Ionicons name="flash" size={24} color="#DB2777" />
              </View>
              <Text style={styles.quickActionLabel}>60 Min{'\n'}Service</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.navy,
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
    fontSize: 20,
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
  section: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pink500,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
  },
  horizontalList: {
    paddingRight: 16,
    gap: 12,
  },
  salonCard: {
    width: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  salonImage: {
    width: '100%',
    height: 120,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primaryGreen,
    padding: 4,
    borderRadius: 8,
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
  salonInfo: {
    padding: 12,
  },
  salonName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  salonCategory: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  salonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  productCard: {
    width: 150,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  productInfo: {
    padding: 10,
  },
  productBrand: {
    fontSize: 10,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
    minHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.gray600,
    textDecorationLine: 'line-through',
  },
  productCashback: {
    fontSize: 10,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: 'center',
  },
  brandLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  brandDiscount: {
    fontSize: 12,
    color: COLORS.green500,
    fontWeight: '600',
  },
  promoBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  promoEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  promoButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.purple500,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: COLORS.navy,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default BeautyPage;
