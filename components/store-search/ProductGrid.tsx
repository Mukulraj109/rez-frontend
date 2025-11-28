import React, { useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ProductGridProps, ProductItem } from '@/types/store-search';
import ProductCard from './ProductCard';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  PRODUCT_GRID
} from '@/constants/search-constants';

// Estimated card height for getItemLayout optimization
const ESTIMATED_CARD_HEIGHT = 220; // Approximate height of a product card row

const ProductGrid: React.FC<ProductGridProps> = memo(({
  products,
  store,
  onProductSelect,
  maxItems = 4,
  columns = PRODUCT_GRID.COLUMNS,
}) => {
  const screenWidth = Dimensions.get('window').width;

  // Limit products to display
  const productsToShow = products.slice(0, maxItems);
  const remainingCount = products.length - maxItems;

  const styles = createStyles(screenWidth, columns);

  // Memoized render function for FlatList items
  const renderItem = useCallback(({ item }: ListRenderItemInfo<ProductItem>) => (
    <View style={styles.productContainer}>
      <ProductCard
        product={item}
        store={store}
        onPress={onProductSelect}
        size="medium"
      />
    </View>
  ), [store, onProductSelect, styles.productContainer]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: ProductItem) =>
    item.productId || String(Math.random()),
  []);

  // Optimized getItemLayout for instant scrolling
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ESTIMATED_CARD_HEIGHT,
    offset: ESTIMATED_CARD_HEIGHT * Math.floor(index / columns),
    index,
  }), [columns]);

  // Empty state
  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          No products available
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Virtualized Product Grid with FlatList */}
      <FlatList
        data={productsToShow}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={columns}
        key={columns} // Force re-render if columns change
        scrollEnabled={false} // Parent ScrollView handles scrolling
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.grid}
        initialNumToRender={maxItems} // Only render visible items initially
        maxToRenderPerBatch={columns * 2} // Render 2 rows at a time
        windowSize={3} // Keep 3 screens of content in memory
        removeClippedSubviews={true} // Unmount off-screen items (Android optimization)
        getItemLayout={getItemLayout}
      />

      {/* Show More Products Indicator */}
      {remainingCount > 0 && (
        <View style={styles.moreProductsContainer}>
          <ThemedText style={styles.moreProductsText}>
            +{remainingCount} more {remainingCount === 1 ? 'product' : 'products'} available
          </ThemedText>
        </View>
      )}
    </View>
  );
});

const createStyles = (screenWidth: number, columns: number) => {
  const isTablet = screenWidth > 768;
  const horizontalPadding = isTablet ? 24 : 16;
  const gridSpacing = PRODUCT_GRID.SPACING;

  return StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center', // Center the entire grid
    },
    grid: {
      width: '100%',
      alignItems: 'center', // Center grid content
    },
    row: {
      flexDirection: 'row',
      marginBottom: SPACING.LG,
      marginHorizontal: -SPACING.XS, // Negative margin to offset productContainer padding
      alignItems: 'stretch', // Make all cards in row have same height
      justifyContent: 'space-between', // Evenly distribute cards with equal spacing
    },
    productContainer: {
      flex: 1,
      paddingHorizontal: SPACING.XS, // Consistent padding between products
      alignItems: 'center', // Center each card within its container
    },
    moreProductsContainer: {
      backgroundColor: COLORS.GRAY_50,
      borderRadius: BORDER_RADIUS.LG,
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      alignItems: 'center',
      marginTop: SPACING.SM,
      borderWidth: 1,
      borderColor: COLORS.BORDER_LIGHT,
    },
    moreProductsText: {
      fontSize: TYPOGRAPHY.FONT_SIZE_SM,
      color: COLORS.TEXT_SECONDARY,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_MEDIUM,
    },
    emptyContainer: {
      backgroundColor: COLORS.GRAY_50,
      borderRadius: BORDER_RADIUS.LG,
      paddingVertical: SPACING.XL,
      paddingHorizontal: SPACING.LG,
      alignItems: 'center',
      marginTop: SPACING.SM,
    },
    emptyText: {
      fontSize: TYPOGRAPHY.FONT_SIZE_BASE,
      color: COLORS.TEXT_SECONDARY,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_MEDIUM,
    },
  });
};

export default ProductGrid;