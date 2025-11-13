import React from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { ProductItem } from '@/types/homepage.types';
import StoreProductCard from './StoreProductCard';
import StoreProductCardSkeleton from './StoreProductCardSkeleton';
import { useRouter } from 'expo-router';

interface StoreProductGridProps {
  products: ProductItem[];
  loading?: boolean;
  onProductPress?: (product: ProductItem) => void;
}

export default function StoreProductGrid({
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

  const handleProductPress = (product: ProductItem) => {
    if (onProductPress) {
      onProductPress(product);
    } else {
      // Default navigation to product detail page
      router.push(`/product/${product.id}`);
    }
  };

  // Render skeleton loaders
  if (loading) {
    const skeletonCount = 6;
    return (
      <FlatList
        data={Array(skeletonCount).fill(null)}
        renderItem={() => (
          <View style={[styles.itemWrapper, { paddingHorizontal: itemGap / 2 }]}>
            <StoreProductCardSkeleton />
          </View>
        )}
        keyExtractor={(_, index) => `skeleton-${index}`}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.contentContainer, { paddingHorizontal: containerPadding }]}
        scrollEnabled={false}
      />
    );
  }

  // Render product grid
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View style={[styles.itemWrapper, { paddingHorizontal: itemGap / 2 }]}>
          <StoreProductCard
            product={item}
            onPress={() => handleProductPress(item)}
            variants={(item as any).variants}
          />
        </View>
      )}
      keyExtractor={(item, index) => `product-${item.id || item._id || index}`}
      numColumns={numColumns}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: containerPadding }]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

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
