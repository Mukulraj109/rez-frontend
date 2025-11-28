import React, { useCallback, memo } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ListRenderItemInfo } from 'react-native';
import { ProductItem } from '@/types/homepage.types';
import StoreProductCard from './StoreProductCard';
import StoreProductCardSkeleton from './StoreProductCardSkeleton';
import { useRouter } from 'expo-router';

interface StoreProductGridProps {
  products: ProductItem[];
  loading?: boolean;
  onProductPress?: (product: ProductItem) => void;
}

// Estimated card height for getItemLayout optimization
const ESTIMATED_CARD_HEIGHT = 280;

const StoreProductGrid = memo(function StoreProductGrid({
  products,
  loading = false,
  onProductPress,
}: StoreProductGridProps) {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  // Determine number of columns based on screen width
  const numColumns = screenWidth > 768 ? 3 : 2;
  const itemGap = 12;
  const containerPadding = 0;

  // Memoized product press handler
  const handleProductPress = useCallback((product: ProductItem) => {
    if (onProductPress) {
      onProductPress(product);
    } else {
      // Default navigation to product detail page
      router.push(`/product/${product.id}`);
    }
  }, [onProductPress, router]);

  // Memoized render function for products
  const renderProduct = useCallback(({ item }: ListRenderItemInfo<ProductItem>) => (
    <View style={[styles.itemWrapper, { paddingHorizontal: itemGap / 2 }]}>
      <StoreProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        variants={(item as any).variants}
      />
    </View>
  ), [handleProductPress, itemGap]);

  // Memoized render function for skeletons
  const renderSkeleton = useCallback(() => (
    <View style={[styles.itemWrapper, { paddingHorizontal: itemGap / 2 }]}>
      <StoreProductCardSkeleton />
    </View>
  ), [itemGap]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: ProductItem | null, index: number) => {
    if (loading || item === null) {
      return `skeleton-${index}`;
    }
    return `product-${item.id || item._id || index}`;
  }, [loading]);

  // Optimized getItemLayout for instant scrolling
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ESTIMATED_CARD_HEIGHT,
    offset: ESTIMATED_CARD_HEIGHT * Math.floor(index / numColumns),
    index,
  }), [numColumns]);

  // Render skeleton loaders
  if (loading) {
    const skeletonCount = 6;
    return (
      <FlatList
        data={Array(skeletonCount).fill(null)}
        renderItem={renderSkeleton}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={`skeleton-${numColumns}`}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.contentContainer, { paddingHorizontal: containerPadding }]}
        scrollEnabled={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
      />
    );
  }

  // Render product grid with virtual scrolling optimizations
  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      key={`products-${numColumns}`}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: containerPadding }]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      initialNumToRender={6} // Only render 6 items initially (3 rows on mobile)
      maxToRenderPerBatch={6} // Load 6 more as user scrolls
      windowSize={3} // Keep 3 screens of content in memory
      removeClippedSubviews={true} // Unmount off-screen items (Android optimization)
      getItemLayout={getItemLayout} // Pre-calculate positions for instant scrolling
    />
  );
});

export default StoreProductGrid;

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
});
