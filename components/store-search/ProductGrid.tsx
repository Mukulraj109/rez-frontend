import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ProductGridProps } from '@/types/store-search';
import ProductCard from './ProductCard';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS,
  PRODUCT_GRID 
} from '@/constants/search-constants';

const ProductGrid: React.FC<ProductGridProps> = ({
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

  // Render products in grid
  const renderProductGrid = () => {
    const rows = [];
    for (let i = 0; i < productsToShow.length; i += columns) {
      const rowProducts = productsToShow.slice(i, i + columns);
      rows.push(
        <View key={i} style={styles.row}>
          {rowProducts.map((product, index) => (
            <View key={product.productId} style={styles.productContainer}>
              <ProductCard
                product={product}
                store={store}
                onPress={onProductSelect}
                size="medium"
              />
            </View>
          ))}
          
          {/* Fill remaining slots in row with empty space */}
          {rowProducts.length < columns && (
            <View style={[styles.productContainer, { opacity: 0 }]} />
          )}
        </View>
      );
    }
    return rows;
  };

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
      {/* Product Grid */}
      <View style={styles.grid}>
        {renderProductGrid()}
      </View>

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
};

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