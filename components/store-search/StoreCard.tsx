import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StoreCardProps } from '@/types/store-search';
import StoreInfo from './StoreInfo';
import ProductGrid from './ProductGrid';
import QuickActions from '@/components/store/QuickActions';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS
} from '@/constants/search-constants';

const StoreCard: React.FC<StoreCardProps & {
  showQuickActions?: boolean;
  storeType?: 'PRODUCT' | 'SERVICE' | 'HYBRID' | 'RESTAURANT';
  contact?: {
    phone?: string;
    email?: string;
  };
}> = ({
  store,
  onStoreSelect,
  onProductSelect,
  showDistance = true,
  maxProducts = 4,
  showQuickActions = true, // Enable by default in store search
  storeType,
  contact,
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

      {/* Quick Actions */}
      {showQuickActions && (
        <View style={styles.quickActionsContainer}>
          <QuickActions
            storeId={store.storeId}
            storeName={store.storeName}
            storeType={storeType || 'PRODUCT'}
            contact={contact}
            location={{
              address: store.location,
            }}
            variant="compact"
            maxActions={4}
            hideTitle={false}
          />
        </View>
      )}
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
      paddingBottom: SPACING.MD,
    },
    quickActionsContainer: {
      paddingHorizontal: cardPadding,
      paddingBottom: cardPadding,
      paddingTop: SPACING.SM,
      borderTopWidth: 1,
      borderTopColor: COLORS.GRAY_100,
    },
  });
};

export default StoreCard;