import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '@/components/homepage/cards/ProductCard';
import { usePersonalizedRecommendations } from '@/hooks/useRecommendations';
import { ProductItem } from '@/types/homepage.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate responsive card width
const getCardWidth = () => {
  if (Platform.OS === 'web') {
    if (SCREEN_WIDTH >= 1024) return 220; // Desktop
    if (SCREEN_WIDTH >= 768) return 200; // Tablet
  }
  return 180; // Mobile
};

interface CrossStoreProductsSectionProps {
  currentStoreId?: string; // To exclude current store products
  onProductPress?: (productId: string, product: ProductItem) => void;
  limit?: number;
}

const CrossStoreProductsSection: React.FC<CrossStoreProductsSectionProps> = ({
  currentStoreId,
  onProductPress,
  limit = 10,
}) => {
  console.log('🛍️ [CrossStoreProductsSection] Rendering with currentStoreId:', currentStoreId);
  const router = useRouter();
  const [cardWidth] = useState(getCardWidth());

  // Exclude current store products from recommendations
  // Note: Set to undefined instead of empty array to avoid API validation error
  const excludeProducts = useMemo(() => undefined, []);

  // Fetch personalized recommendations
  const {
    recommendations,
    loading,
    error,
    fetch,
    refresh,
  } = usePersonalizedRecommendations({
    autoFetch: true,
    limit,
    excludeProducts,
  });

  console.log('🛍️ [CrossStoreProductsSection] Hook state:', {
    loading,
    error,
    recommendationsCount: recommendations?.length || 0,
    recommendations: recommendations?.slice(0, 2), // Log first 2 for debugging
  });

  // Filter out products from current store
  const filteredRecommendations = useMemo(() => {
    if (!currentStoreId) return recommendations;
    return recommendations.filter(
      (product) => product.storeId !== currentStoreId
    );
  }, [recommendations, currentStoreId]);

  // Convert recommendations to ProductItem format
  // Note: API returns ProductRecommendation objects with nested product data
  const products: ProductItem[] = useMemo(() => {
    return filteredRecommendations.map((rec: any) => {
      // Handle both direct product data and nested product structure
      const productData = rec.product || rec;

      return {
        id: productData.id || productData._id,
        _id: productData._id || productData.id,
        type: 'product' as const,
        name: productData.name,
        title: productData.name,
        brand: productData.brand || 'Brand',
        image: productData.image || productData.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image',
        description: productData.description,
        price: {
          current: productData.price?.current || productData.price || 0,
          original: productData.price?.original,
          currency: productData.price?.currency || 'INR',
          discount: productData.price?.discount || 0,
        },
        category: productData.category || 'General',
        subcategory: productData.subcategory,
        rating: productData.rating
          ? {
              value: typeof productData.rating.value === 'string'
                ? parseFloat(productData.rating.value)
                : productData.rating.value,
              count: productData.rating.count || 0,
            }
          : undefined,
        cashback: productData.cashback,
        availabilityStatus: productData.availabilityStatus || 'in_stock',
        inventory: productData.inventory,
        tags: productData.tags || [],
        isNewArrival: productData.isNewArrival,
        isRecommended: true,
        storeName: productData.storeName || productData.store?.name,
        storeId: productData.storeId || productData.store?._id,
        // Include recommendation metadata if available
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons,
      } as ProductItem & { recommendationScore?: number; recommendationReasons?: string[] };
    });
  }, [filteredRecommendations]);

  // Handle product press
  const handleProductPress = useCallback(
    (product: ProductItem) => {
      const productId = product._id || product.id;
      if (onProductPress) {
        onProductPress(productId, product);
      } else {
        router.push(`/product/${productId}`);
      }
    },
    [onProductPress, router]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);

  // Handle view all
  const handleViewAll = useCallback(() => {
    router.push('/search');
  }, [router]);

  // Handle add to cart (will be handled by ProductCard internally)
  const handleAddToCart = useCallback(async (product: ProductItem) => {
    // ProductCard handles this internally via CartContext
    console.log('Add to cart:', product.name);
  }, []);

  // Render skeleton loader
  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <ThemedText style={styles.skeletonText}>Loading recommendations...</ThemedText>
      </View>
    );
  };

  // Render error state
  const renderError = () => {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <ThemedText style={styles.errorTitle}>Failed to load recommendations</ThemedText>
        <ThemedText style={styles.errorMessage}>{error || 'Something went wrong'}</ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
          accessibilityLabel="Retry loading recommendations"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="basket-outline" size={64} color="#9CA3AF" />
        <ThemedText style={styles.emptyTitle}>No recommendations available</ThemedText>
        <ThemedText style={styles.emptyMessage}>
          Check back later for personalized product recommendations
        </ThemedText>
      </View>
    );
  };

  // Render product with store badge
  const renderProduct = ({ item, index }: { item: ProductItem; index: number }) => {
    return (
      <View
        style={[styles.productWrapper, { width: cardWidth }]}
        accessible={true}
        accessibilityLabel={`Product ${index + 1} of ${products.length}. ${item.name} from ${item.storeName || 'Store'}`}
      >
        <ProductCard
          product={item}
          onPress={handleProductPress}
          onAddToCart={handleAddToCart}
          width={cardWidth}
          showAddToCart={true}
        />
        {/* Store Badge Overlay */}
        {item.storeName && (
          <View style={styles.storeBadgeContainer}>
            <View style={styles.storeBadge}>
              <Ionicons name="storefront" size={12} color="#8B5CF6" />
              <ThemedText style={styles.storeBadgeText} numberOfLines={1}>
                From {item.storeName}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Always render section, show empty state if no products
  // if (!loading && products.length === 0 && !error) {
  //   return null;
  // }

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Cross-store product recommendations section"
      accessibilityRole="none"
    >
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={24} color="#8B5CF6" />
          <ThemedText style={styles.title}>Recommended for You</ThemedText>
        </View>
        {!loading && !error && products.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={handleViewAll}
            activeOpacity={0.7}
            accessibilityLabel="View all recommendations"
            accessibilityRole="button"
            accessibilityHint="Double tap to see all recommended products"
          >
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          renderSkeleton()
        ) : error ? (
          renderError()
        ) : products.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item, index) => item._id || item.id || `product-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            getItemLayout={(data, index) => ({
              length: cardWidth,
              offset: (cardWidth + 12) * index,
              index,
            })}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            accessibilityLabel={`${products.length} recommended products`}
            accessibilityRole="list"
          />
        )}
      </View>
    </View>
  );
};

export default CrossStoreProductsSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F5F3FF',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  content: {
    minHeight: 200,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  itemSeparator: {
    width: 12,
  },
  productWrapper: {
    position: 'relative',
  },
  storeBadgeContainer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  storeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B5CF6',
    flexShrink: 1,
  },
  // Skeleton Loader
  skeletonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  skeletonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  // Error State
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
