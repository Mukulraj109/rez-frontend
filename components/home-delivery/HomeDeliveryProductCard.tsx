import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { HomeDeliveryProductCardProps } from '@/types/home-delivery.types';

export function HomeDeliveryProductCard({
  product,
  onPress,
  showCashback = true,
  showDeliveryTime = true,
  compact = false,
}: HomeDeliveryProductCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const discountPercentage = product.price.discount || 0;
  const hasDiscount = discountPercentage > 0;

  // Build comprehensive accessibility label
  const buildAccessibilityLabel = () => {
    const parts = [
      product.name,
      product.brand ? `by ${product.brand}` : '',
      `Price ${product.price.currency}${product.price.current}`,
      product.price.original ? `was ${product.price.currency}${product.price.original}` : '',
      hasDiscount ? `${discountPercentage}% off` : '',
      product.rating ? `Rated ${product.rating.value} stars` : '',
      showCashback ? `Up to ${product.cashback.percentage}% cashback` : '',
      showDeliveryTime ? `Delivery in ${product.deliveryTime}` : '',
      product.shipping.freeShippingEligible ? 'Free shipping available' : '',
      product.isNew ? 'New product' : '',
      `From ${product.store.name}`,
    ];
    return parts.filter(Boolean).join('. ');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        compact && styles.containerCompact,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={buildAccessibilityLabel()}
      accessibilityRole="button"
      accessibilityHint="Double tap to view product details"
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.image && !imageError ? (
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>
              -{discountPercentage}%
            </ThemedText>
          </View>
        )}
        
        {/* New Badge */}
        {product.isNew && (
          <View style={styles.newBadge}>
            <ThemedText style={styles.newText}>NEW</ThemedText>
          </View>
        )}
        
        {/* Free Shipping Badge */}
        {product.shipping.freeShippingEligible && (
          <View style={styles.shippingBadge}>
            <Ionicons name="car-outline" size={12} color="#059669" />
            <ThemedText style={styles.shippingText}>Free</ThemedText>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        {/* Product Name */}
        <ThemedText style={styles.productName} numberOfLines={2}>
          {product.name}
        </ThemedText>
        
        {/* Brand */}
        {product.brand && (
          <ThemedText style={styles.brandText} numberOfLines={1}>
            {product.brand}
          </ThemedText>
        )}
        
        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>
              {product.price.currency}{product.price.current}
            </ThemedText>
            {product.price.original && (
              <ThemedText style={styles.originalPrice}>
                {product.price.currency}{product.price.original}
              </ThemedText>
            )}
          </View>
          
          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>
                {typeof product.rating.value === 'number'
                  ? product.rating.value.toFixed(1)
                  : product.rating.value}
              </ThemedText>
            </View>
          )}
        </View>
        
        {/* Cashback */}
        {showCashback && (
          <View style={styles.cashbackContainer}>
            <Ionicons name="gift-outline" size={14} color="#059669" />
            <ThemedText style={styles.cashbackText}>
              Upto {product.cashback.percentage}% cash back
            </ThemedText>
          </View>
        )}
        
        {/* Delivery Time */}
        {showDeliveryTime && (
          <View style={styles.deliveryContainer}>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <ThemedText style={styles.deliveryText}>
              {product.deliveryTime}
            </ThemedText>
          </View>
        )}
        
        {/* Store Info */}
        <View style={styles.storeContainer}>
          <Ionicons name="storefront-outline" size={12} color="#6B7280" />
          <ThemedText style={styles.storeText} numberOfLines={1}>
            {product.store.name}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    height: 380, // Fixed height for all cards
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  containerCompact: {
    padding: 8,
    height: 340,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  shippingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  shippingText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
    minHeight: 36, // Fixed height for 2 lines
  },
  brandText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    minHeight: 16,
    marginTop: 4,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  cashbackText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  deliveryText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '400',
    flex: 1,
  },
});