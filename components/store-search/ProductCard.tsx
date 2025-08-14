import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ProductCardProps } from '@/types/store-search';
import DiscountBadge from './DiscountBadge';
import PaymentIndicator from './PaymentIndicator';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS,
  SHADOWS,
  PRODUCT_GRID 
} from '@/constants/search-constants';

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  store,
  onPress,
  showStore = false,
  size = 'medium',
}) => {
  const [imageError, setImageError] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const handlePress = () => {
    if (onPress) {
      onPress(product, store);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Calculate dimensions based on size
  const getSizeDimensions = () => {
    const isTablet = screenWidth > 768;
    const padding = isTablet ? 24 : 16;
    const productPadding = SPACING.XS * 2; // Horizontal padding from ProductGrid
    const imageMargins = SPACING.SM * 2; // Account for left and right image margins
    const availableWidth = screenWidth - (padding * 2);
    const cardWidth = (availableWidth / PRODUCT_GRID.COLUMNS) - productPadding - imageMargins;

    switch (size) {
      case 'small':
        return { width: cardWidth * 0.8, height: cardWidth * 0.8 * 1.4 };
      case 'large':
        return { width: cardWidth * 1.2, height: cardWidth * 1.2 * 1.4 };
      default:
        return { width: cardWidth, height: cardWidth * 1.4 };
    }
  };

  const dimensions = getSizeDimensions();
  const styles = createStyles(dimensions, screenWidth);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${product.name} - ${product.price}`}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="image-outline"
              size={32}
              color={COLORS.GRAY_400}
            />
          </View>
        )}

        {/* Discount Badge */}
        {product.discountPercentage && product.discountPercentage > 0 && (
          <View style={styles.discountBadgeContainer}>
            <DiscountBadge
              percentage={product.discountPercentage}
              size="small"
            />
          </View>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <ThemedText style={styles.outOfStockText}>
              Out of Stock
            </ThemedText>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* Top Content - Product Name and Store */}
        <View style={styles.topContent}>
          {/* Product Name */}
          <ThemedText style={styles.productName} numberOfLines={2}>
            {product.name}
          </ThemedText>

          {/* Store Name (if shown) */}
          {showStore && (
            <ThemedText style={styles.storeName} numberOfLines={1}>
              {store.storeName}
            </ThemedText>
          )}
        </View>

        {/* Bottom Content - Price, Rating, Payment */}
        <View style={styles.bottomContent}>
          {/* Price Container */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <ThemedText style={styles.currentPrice}>
                ₹{product.price.toLocaleString('en-IN')}
              </ThemedText>
              {product.originalPrice && product.originalPrice > product.price && (
                <ThemedText style={styles.originalPrice}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </ThemedText>
              )}
            </View>

            {/* Rating (if available) */}
            {product.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons
                  name="star"
                  size={12}
                  color="#FFB800"
                  style={styles.ratingIcon}
                />
                <ThemedText style={styles.ratingText}>
                  {product.rating.toFixed(1)}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Rez Pay Indicator */}
          {product.hasRezPay && (
            <View style={styles.paymentIndicatorContainer}>
              <PaymentIndicator
                type="rez_pay"
                size="small"
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (
  dimensions: { width: number; height: number },
  screenWidth: number
) => {
  const isTablet = screenWidth > 768;
  // Account for image margins in height calculation
  const imageMargins = SPACING.SM * 2; // top and bottom margins
  const imageHeight = (dimensions.width * PRODUCT_GRID.IMAGE_ASPECT_RATIO) - imageMargins;

  return StyleSheet.create({
    container: {
      width: dimensions.width,
      flex: 1, // Allow card to stretch to match row height
      backgroundColor: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.XL,
      overflow: 'hidden',
      ...SHADOWS.MD,
      borderWidth: 0.5,
      borderColor: COLORS.GRAY_200,
      elevation: 4,
      alignSelf: 'center', // Center card within its container
      // Modern gradient-like shadow
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    imageContainer: {
      position: 'relative',
      height: imageHeight,
      backgroundColor: COLORS.GRAY_50,
      margin: SPACING.SM,
      borderRadius: BORDER_RADIUS.LG,
      overflow: 'hidden',
      // Subtle enhancement for better visual separation
      borderWidth: 0.5,
      borderColor: COLORS.GRAY_200,
    },
    productImage: {
      width: '100%',
      height: '100%',
      borderRadius: BORDER_RADIUS.LG,
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.GRAY_100,
      borderRadius: BORDER_RADIUS.LG,
    },
    discountBadgeContainer: {
      position: 'absolute',
      top: SPACING.XS,
      left: SPACING.XS,
      zIndex: 2,
    },
    outOfStockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3,
    },
    outOfStockText: {
      color: COLORS.WHITE,
      fontSize: TYPOGRAPHY.FONT_SIZE_SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_SEMIBOLD,
    },
    detailsContainer: {
      padding: SPACING.MD,
      paddingTop: SPACING.SM,
      flex: 1,
      justifyContent: 'space-between', // Distribute content evenly within the container
    },
    topContent: {
      flex: 1, // Allow top content to expand if needed
    },
    bottomContent: {
      // This will stick to the bottom
    },
    productName: {
      fontSize: isTablet ? TYPOGRAPHY.FONT_SIZE_BASE : TYPOGRAPHY.FONT_SIZE_SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_SEMIBOLD,
      color: COLORS.TEXT_PRIMARY,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT_TIGHT * (isTablet ? TYPOGRAPHY.FONT_SIZE_BASE : TYPOGRAPHY.FONT_SIZE_SM),
      marginBottom: SPACING.SM,
    },
    storeName: {
      fontSize: TYPOGRAPHY.FONT_SIZE_XS,
      color: COLORS.TEXT_SECONDARY,
      marginBottom: SPACING.XS,
    },
    priceContainer: {
      marginBottom: SPACING.SM,
      marginTop: SPACING.XS,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.XS,
    },
    currentPrice: {
      fontSize: isTablet ? TYPOGRAPHY.FONT_SIZE_LG : TYPOGRAPHY.FONT_SIZE_BASE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_BOLD,
      color: COLORS.TEXT_PRIMARY,
      marginRight: SPACING.SM,
    },
    originalPrice: {
      fontSize: TYPOGRAPHY.FONT_SIZE_SM,
      color: COLORS.TEXT_SECONDARY,
      textDecorationLine: 'line-through',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingIcon: {
      marginRight: SPACING.XS,
    },
    ratingText: {
      fontSize: TYPOGRAPHY.FONT_SIZE_XS,
      color: COLORS.TEXT_SECONDARY,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_MEDIUM,
    },
    paymentIndicatorContainer: {
      alignSelf: 'flex-start',
    },
  });
};

export default ProductCard;