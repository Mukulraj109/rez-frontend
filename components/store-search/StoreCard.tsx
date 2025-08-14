import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StoreCardProps } from '@/types/store-search';
import StoreInfo from './StoreInfo';
import ProductGrid from './ProductGrid';
import { 
  COLORS, 
  SPACING, 
  BORDER_RADIUS,
  SHADOWS 
} from '@/constants/search-constants';

const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onStoreSelect,
  onProductSelect,
  showDistance = true,
  maxProducts = 4,
}) => {
  const screenWidth = Dimensions.get('window').width;

  // Handle store selection
  const handleStorePress = () => {
    if (onStoreSelect) {
      onStoreSelect(store);
    }
  };

  // Limit products to display
  const productsToShow = store.products.slice(0, maxProducts);

  const styles = createStyles(screenWidth);

  return (
    <View style={styles.container}>
      {/* Store Information */}
      <View style={styles.storeInfoContainer}>
        <StoreInfo
          store={store}
          onStorePress={handleStorePress}
          showFullInfo={showDistance}
        />
      </View>

      {/* Products Grid */}
      <View style={styles.productsContainer}>
        <ProductGrid
          products={store.products}
          store={store}
          onProductSelect={onProductSelect}
          maxItems={maxProducts}
          columns={2}
        />
      </View>
    </View>
  );
};

const createStyles = (screenWidth: number) => {
  const isTablet = screenWidth > 768;
  const cardPadding = isTablet ? SPACING.XL : SPACING.LG;

  return StyleSheet.create({
    container: {
      backgroundColor: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.XL,
      marginBottom: SPACING.XL,
      overflow: 'hidden',
      ...SHADOWS.LG,
      borderWidth: 0.5,
      borderColor: COLORS.GRAY_200,
      elevation: 6,
      // Modern gradient-like shadow
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    storeInfoContainer: {
      paddingHorizontal: cardPadding,
      paddingTop: cardPadding,
      paddingBottom: SPACING.SM,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.GRAY_100,
    },
    productsContainer: {
      paddingHorizontal: cardPadding,
      paddingTop: SPACING.LG,
      paddingBottom: cardPadding,
    },
  });
};

export default StoreCard;