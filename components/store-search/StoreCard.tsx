import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreCardProps } from '@/types/store-search';
import StoreInfo from './StoreInfo';
import ProductGrid from './ProductGrid';
import QuickActions from '@/components/store/QuickActions';
import FastImage from '@/components/common/FastImage';
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
  const [imageError, setImageError] = useState(false);

  // Handle store selection
  const handleStorePress = () => {
    if (onStoreSelect) {
      onStoreSelect(store);
    }
  };

  // Limit products to display
  const productsToShow = store.products.slice(0, maxProducts);

  // Get store image (banner for main display, logo for overlay)
  const storeImage = store.storeImage || null;
  const storeLogo = store.logo || null;

  const styles = createStyles(screenWidth);

  return (
    <View style={styles.container}>
      {/* Store Banner/Logo Image */}
      <TouchableOpacity 
        onPress={handleStorePress}
        activeOpacity={0.9}
        style={styles.imageWrapper}
      >
        {storeImage ? (
          <>
            <FastImage
              source={{ uri: storeImage }}
              style={styles.storeImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
              showLoader={true}
            />
            {/* Store Logo Overlay (circular, bottom-left) */}
            {storeLogo && storeLogo !== storeImage && (
              <View style={styles.logoOverlay}>
                <FastImage
                  source={{ uri: storeLogo }}
                  style={styles.storeLogo}
                  resizeMode="cover"
                  showLoader={false}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="storefront-outline" size={48} color={COLORS.GRAY_400} />
            {storeLogo && (
              <View style={styles.logoOverlay}>
                <FastImage
                  source={{ uri: storeLogo }}
                  style={styles.storeLogo}
                  resizeMode="cover"
                  showLoader={false}
                />
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

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
    imageWrapper: {
      width: '100%',
      height: 200,
      position: 'relative',
      backgroundColor: COLORS.GRAY_100,
      overflow: 'hidden',
    },
    storeImage: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: COLORS.GRAY_100,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    logoOverlay: {
      position: 'absolute',
      bottom: SPACING.MD,
      left: SPACING.MD,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: COLORS.WHITE,
      padding: 4,
      shadowColor: COLORS.BLACK,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: COLORS.WHITE,
    },
    storeLogo: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
    },
  });
};

export default StoreCard;