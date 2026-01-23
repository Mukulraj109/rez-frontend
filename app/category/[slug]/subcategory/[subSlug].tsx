/**
 * SubcategoryPage - Shows stores AND products for a subcategory
 * User can switch between tabs to see stores or products
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { storesApi } from '@/services/storesApi';
import productsApi from '@/services/productsApi';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Store item interface
interface StoreItem {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  banner?: string;
  rating: number;
  cashback?: number;
  distance?: string;
  deliveryTime?: string;
  isVerified?: boolean;
}

// Product item interface
interface ProductItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  cashback?: number;
  storeName?: string;
}

export default function SubcategoryPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { slug, subSlug } = useLocalSearchParams<{ slug: string; subSlug: string }>();

  // Tab state
  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');

  // Data states
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);

  // Loading states
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Subcategory name
  const subcategoryName = subSlug
    ? subSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Subcategory';

  /**
   * Fetch stores for this subcategory
   */
  const fetchStores = useCallback(async () => {
    if (!subSlug) return;

    try {
      setIsLoadingStores(true);

      let storesData: any[] = [];
      let source = 'subcategory';

      // 1. Try fetching by subcategory slug first
      const response = await storesApi.getStoresBySubcategorySlug(subSlug, 20);

      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        storesData = response.data;
      } else {
        // 2. Fallback: Try searching for the text (handles cuisines/tags)
        source = 'search';

        // Use searchStores with the subSlug as query
        const searchResponse = await storesApi.searchStores(subSlug);

        if (searchResponse.success && searchResponse.data) {
          // searchStores returns { stores: [], ... }
          if (searchResponse.data.stores && Array.isArray(searchResponse.data.stores)) {
            storesData = searchResponse.data.stores;
          }
        }
      }

      if (storesData.length > 0) {
        const formattedStores = storesData.map((store: any) => ({
          id: store._id || store.id,
          name: store.name,
          slug: store.slug,
          logo: store.logo,
          banner: store.banner,
          rating: store.ratings?.average || store.rating || 4.5,
          cashback: store.offers?.cashback || store.cashback,
          distance: store.distance || '2.0 km',
          deliveryTime: store.operationalInfo?.deliveryTime || '30 min',
          isVerified: store.verification?.isVerified || false,
        }));
        setStores(formattedStores);
      } else {
        setStores([]);
      }
    } catch (err: any) {
      console.error(`[SUBCATEGORY] Error fetching stores:`, err);
      // Even on error, we might want to ensure empty state
      setStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  }, [subSlug]);

  /**
   * Fetch products for this subcategory
   */
  const fetchProducts = useCallback(async () => {
    if (!subSlug) return;

    try {
      setIsLoadingProducts(true);

      let productsData: any[] = [];
      let source = 'subcategory';

      // 1. Try fetching by subcategory slug first
      const response = await productsApi.getProductsBySubcategory(subSlug, 20);

      if (response.success && response.data) {
        // Handle potential array or paginated object
        const data = Array.isArray(response.data) ? response.data : (response.data.products || []);
        if (data.length > 0) {
          productsData = data;
        }
      }

      // 2. Fallback: Search if no products found
      if (productsData.length === 0) {
        source = 'search';

        const searchResponse = await productsApi.searchProducts({ q: subSlug, limit: 20 });

        if (searchResponse.success && searchResponse.data) {
          // SearchResponse has products array
          if (searchResponse.data.products && Array.isArray(searchResponse.data.products)) {
            productsData = searchResponse.data.products;
          }
        }
      }

      if (productsData.length > 0) {
        const formattedProducts = productsData.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          image: product.images?.[0]?.url || product.image,
          price: product.pricing?.salePrice || product.pricing?.basePrice || product.price || 0,
          originalPrice: product.pricing?.basePrice,
          discount: product.pricing?.salePrice && product.pricing?.basePrice
            ? Math.round((1 - product.pricing.salePrice / product.pricing.basePrice) * 100)
            : undefined,
          rating: product.ratings?.average || product.rating,
          cashback: product.cashback?.percentage,
          storeName: product.store?.name,
        }));
        setProducts(formattedProducts);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error(`[SUBCATEGORY] Error fetching products:`, err);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [subSlug]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    if (subSlug) {
      fetchStores();
      fetchProducts();
    }
  }, [subSlug, fetchStores, fetchProducts]);

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStores(), fetchProducts()]);
    setRefreshing(false);
  };

  /**
   * Navigate to store
   */
  const handleStorePress = (store: StoreItem) => {
    router.push(`/store/${store.id}` as any);
  };

  /**
   * Navigate to product
   */
  const handleProductPress = (product: ProductItem) => {
    router.push(`/ProductPage?cardId=${product.id}&cardType=product` as any);
  };

  /**
   * Render store card
   */
  const renderStoreCard = ({ item }: { item: StoreItem }) => (
    <TouchableOpacity
      style={[styles.storeCard, isDark && styles.storeCardDark]}
      onPress={() => handleStorePress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.banner || item.logo || 'https://via.placeholder.com/300x150' }}
        style={styles.storeBanner}
      />
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          {item.logo && (
            <Image source={{ uri: item.logo }} style={styles.storeLogo} />
          )}
          <View style={styles.storeNameContainer}>
            <View style={styles.storeNameRow}>
              <ThemedText style={styles.storeName} numberOfLines={1}>
                {item.name}
              </ThemedText>
              {item.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#00C06A" style={{ marginLeft: 4 }} />
              )}
            </View>
            <ThemedText style={styles.storeDistance}>{item.distance}</ThemedText>
          </View>
        </View>
        <View style={styles.storeStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <ThemedText style={styles.statText}>{item.rating?.toFixed(1) || '4.5'}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <ThemedText style={styles.statText}>{item.deliveryTime}</ThemedText>
          </View>
          {item.cashback && (
            <View style={styles.cashbackBadge}>
              <ThemedText style={styles.cashbackText}>{item.cashback}% Cashback</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render product card
   */
  const renderProductCard = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      style={[styles.productCard, isDark && styles.productCardDark]}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      {item.discount && item.discount > 0 && (
        <View style={styles.discountBadge}>
          <ThemedText style={styles.discountText}>{item.discount}% OFF</ThemedText>
        </View>
      )}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        {item.storeName && (
          <ThemedText style={styles.productStore}>{item.storeName}</ThemedText>
        )}
        <View style={styles.priceRow}>
          <ThemedText style={styles.productPrice}>
            ₹{item.price?.toLocaleString() || '0'}
          </ThemedText>
          {item.originalPrice && item.originalPrice > item.price && (
            <ThemedText style={styles.originalPrice}>
              ₹{item.originalPrice?.toLocaleString()}
            </ThemedText>
          )}
        </View>
        {item.cashback && (
          <View style={styles.productCashback}>
            <Ionicons name="wallet-outline" size={12} color="#00C06A" />
            <ThemedText style={styles.productCashbackText}>{item.cashback}% Cashback</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const isLoading = activeTab === 'stores' ? isLoadingStores : isLoadingProducts;
  const currentData = activeTab === 'stores' ? stores : products;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#00C06A', '#00A85A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>{subcategoryName}</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {stores.length} stores, {products.length} products
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/search?category=${subSlug}` as any)}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={[styles.tabsContainer, isDark && styles.tabsContainerDark]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stores' && styles.activeTab]}
            onPress={() => setActiveTab('stores')}
          >
            <Ionicons
              name="storefront-outline"
              size={18}
              color={activeTab === 'stores' ? '#00C06A' : '#6B7280'}
            />
            <ThemedText
              style={[styles.tabText, activeTab === 'stores' && styles.activeTabText]}
            >
              Stores ({stores.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons
              name="cube-outline"
              size={18}
              color={activeTab === 'products' ? '#00C06A' : '#6B7280'}
            />
            <ThemedText
              style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}
            >
              Products ({products.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C06A" />
            <ThemedText style={styles.loadingText}>
              Loading {activeTab}...
            </ThemedText>
          </View>
        ) : currentData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'stores' ? 'storefront-outline' : 'cube-outline'}
              size={64}
              color="#D1D5DB"
            />
            <ThemedText style={styles.emptyTitle}>
              No {activeTab} found
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Try browsing other categories
            </ThemedText>
          </View>
        ) : activeTab === 'stores' ? (
          <FlatList
            data={stores}
            renderItem={renderStoreCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#00C06A"
                colors={['#00C06A']}
              />
            }
          />
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#00C06A"
                colors={['#00C06A']}
              />
            }
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContainerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#00C06A',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // Store card styles
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeCardDark: {
    backgroundColor: '#1F2937',
  },
  storeBanner: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  storeInfo: {
    padding: 12,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  storeNameContainer: {
    flex: 1,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  storeDistance: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  cashbackBadge: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
  },
  // Product card styles
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  productCardDark: {
    backgroundColor: '#1F2937',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E7EB',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    minHeight: 36,
  },
  productStore: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C06A',
  },
  originalPrice: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  productCashback: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  productCashbackText: {
    fontSize: 11,
    color: '#00C06A',
    marginLeft: 4,
  },
});
