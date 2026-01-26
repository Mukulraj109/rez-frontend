/**
 * Shop Page
 * Shows products filtered by vibe, occasion, category, or brand
 * Navigated from category page sections (Shop by Vibe, Shop by Occasion)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import productsApi from '@/services/productsApi';
import categoryMetadataApi from '@/services/categoryMetadataApi';
import { useRegion } from '@/contexts/RegionContext';
import FastImage from '@/components/common/FastImage';
import { showToast } from '@/components/common/ToastManager';
import { getVibesForCategory, getOccasionsForCategory } from '@/data/categoryDummyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  primaryGreen: '#00C06A',
  background: '#F5F7FA',
};

interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  rating?: number;
  cashback?: number;
  discount?: number;
  store?: {
    name: string;
  };
}

const ProductCard = ({
  product,
  onPress,
  currencySymbol,
}: {
  product: Product;
  onPress: () => void;
  currencySymbol: string;
}) => {
  const imageUrl = product.image || (product.images && product.images[0]) || '';
  const discount = product.discount || (product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0);

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <FastImage
            source={imageUrl}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color={COLORS.gray200} />
          </View>
        )}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        {product.store?.name && (
          <Text style={styles.storeName}>{product.store.name}</Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>
            {currencySymbol}{product.price?.toLocaleString()}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {currencySymbol}{product.originalPrice?.toLocaleString()}
            </Text>
          )}
        </View>
        {product.cashback && product.cashback > 0 && (
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackText}>{product.cashback}% cashback</Text>
          </View>
        )}
        {product.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ShopPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get filter params
  const vibeId = params.vibe as string;
  const occasionId = params.occasion as string;
  const categorySlug = params.category as string;
  const brandId = params.brand as string;

  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTitle, setFilterTitle] = useState('Products');
  const [filterSubtitle, setFilterSubtitle] = useState('');
  const [filterIcon, setFilterIcon] = useState('');
  const [filterColor, setFilterColor] = useState(COLORS.primaryGreen);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch filter metadata (vibe/occasion name)
  useEffect(() => {
    const fetchFilterInfo = async () => {
      try {
        if (vibeId && categorySlug) {
          // Try API first
          const response = await categoryMetadataApi.getVibes(categorySlug);
          if (response.success && response.data?.vibes) {
            const vibe = response.data.vibes.find((v: any) => v.id === vibeId);
            if (vibe) {
              setFilterTitle(vibe.name);
              setFilterSubtitle(vibe.description || '');
              setFilterIcon(vibe.icon || '');
              setFilterColor(vibe.color || COLORS.primaryGreen);
              return;
            }
          }
          // Fallback to dummy data
          const vibes = getVibesForCategory(categorySlug);
          const vibe = vibes.find(v => v.id === vibeId);
          if (vibe) {
            setFilterTitle(vibe.name);
            setFilterSubtitle(vibe.description || '');
            setFilterIcon(vibe.icon || '');
            setFilterColor(vibe.color || COLORS.primaryGreen);
          }
        } else if (occasionId && categorySlug) {
          // Try API first
          const response = await categoryMetadataApi.getOccasions(categorySlug);
          if (response.success && response.data?.occasions) {
            const occasion = response.data.occasions.find((o: any) => o.id === occasionId);
            if (occasion) {
              setFilterTitle(occasion.name);
              setFilterSubtitle(`Up to ${occasion.discount}% off`);
              setFilterIcon(occasion.icon || '');
              setFilterColor(occasion.color || COLORS.primaryGreen);
              return;
            }
          }
          // Fallback to dummy data
          const occasions = getOccasionsForCategory(categorySlug);
          const occasion = occasions.find(o => o.id === occasionId);
          if (occasion) {
            setFilterTitle(occasion.name);
            setFilterSubtitle(`Up to ${occasion.discount}% off`);
            setFilterIcon(occasion.icon || '');
            setFilterColor(occasion.color || COLORS.primaryGreen);
          }
        } else if (categorySlug) {
          setFilterTitle(categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        }
      } catch (error) {
        console.error('Error fetching filter info:', error);
        // Use fallback data on error
        if (vibeId && categorySlug) {
          const vibes = getVibesForCategory(categorySlug);
          const vibe = vibes.find(v => v.id === vibeId);
          if (vibe) {
            setFilterTitle(vibe.name);
            setFilterSubtitle(vibe.description || '');
            setFilterIcon(vibe.icon || '');
          }
        } else if (occasionId && categorySlug) {
          const occasions = getOccasionsForCategory(categorySlug);
          const occasion = occasions.find(o => o.id === occasionId);
          if (occasion) {
            setFilterTitle(occasion.name);
            setFilterSubtitle(`Up to ${occasion.discount}% off`);
            setFilterIcon(occasion.icon || '');
          }
        }
      }
    };

    fetchFilterInfo();
  }, [vibeId, occasionId, categorySlug]);

  // Fetch products
  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setPage(1);
        setProducts([]);
        setHasMore(true); // Reset hasMore on refresh
      }

      setLoading(true);

      // Build query params
      const queryParams: any = {
        page: isRefresh ? 1 : page,
        limit: 20,
      };

      if (categorySlug) {
        queryParams.category = categorySlug;
      }

      if (vibeId) {
        queryParams.tags = vibeId;
      }

      if (occasionId) {
        queryParams.occasion = occasionId;
      }

      if (brandId) {
        queryParams.brand = brandId;
      }

      // Fetch products from API
      const response = await productsApi.getProducts(queryParams);

      if (response.success && response.data) {
        const newProducts = response.data.products || response.data || [];

        if (isRefresh) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }

        // Stop pagination if fewer than limit products returned
        setHasMore(newProducts.length === 20);
      } else {
        // API returned unsuccessful response - stop pagination
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Stop pagination on error to prevent infinite loop
      setHasMore(false);
      showToast({
        message: 'Failed to load products',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categorySlug, vibeId, occasionId, brandId, page]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchProducts();
    }
  };

  const handleProductPress = (product: Product) => {
    const productId = product._id || product.id;
    router.push(`/ProductPage?cardId=${productId}&cardType=product` as any);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      currencySymbol={currencySymbol}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {filterIcon && (
        <View style={[styles.filterIconContainer, { backgroundColor: `${filterColor}20` }]}>
          <Text style={styles.filterIcon}>{filterIcon}</Text>
        </View>
      )}
      <Text style={styles.filterTitle}>{filterTitle}</Text>
      {filterSubtitle && (
        <Text style={styles.filterSubtitle}>{filterSubtitle}</Text>
      )}
      <Text style={styles.resultCount}>
        {products.length} {products.length === 1 ? 'product' : 'products'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={COLORS.gray200} />
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your filters or browse other categories
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.back()}
      >
        <Text style={styles.browseButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading || products.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primaryGreen} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[filterColor, filterColor]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{filterTitle}</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Products List */}
      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id || item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primaryGreen}
              colors={[COLORS.primaryGreen]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  filterIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterIcon: {
    fontSize: 36,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
    textAlign: 'center',
  },
  filterSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultCount: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    paddingHorizontal: 16,
    gap: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.gray50,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
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
    marginBottom: 4,
    lineHeight: 18,
  },
  storeName: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.gray600,
    textDecorationLine: 'line-through',
  },
  cashbackBadge: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  cashbackText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
