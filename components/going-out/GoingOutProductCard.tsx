import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { GoingOutProductCardProps } from '@/types/going-out.types';

export function GoingOutProductCard({
  product,
  onPress,
  onAddToCart,
  showAddToCart = true,
  width = 160,
}: GoingOutProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (product.price.discount) {
      return product.price.discount;
    }
    if (product.price.original && product.price.original > product.price.current) {
      return Math.round(((product.price.original - product.price.current) / product.price.original) * 100);
    }
    return 0;
  };

  const handlePress = () => {
    onPress(product);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <View style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Cashback Badge */}
          <LinearGradient
            colors={['#8B5CF6', '#A855F7']}
            style={styles.cashbackBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={styles.cashbackText}>
              Upto {product.cashback.percentage}% cash back
            </ThemedText>
          </LinearGradient>

          {/* New Badge */}
          {product.isNew && (
            <View style={styles.newBadge}>
              <ThemedText style={styles.newBadgeText}>New</ThemedText>
            </View>
          )}

          {/* Discount Badge */}
          {getDiscountPercentage() > 0 && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountBadgeText}>
                {getDiscountPercentage()}% OFF
              </ThemedText>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.content}>
          {/* Product Name */}
          <ThemedText style={styles.productName} numberOfLines={1}>
            {product.name}
          </ThemedText>

          {/* Brand */}
          {product.brand && (
            <ThemedText style={styles.brandName} numberOfLines={1}>
              {product.brand}
            </ThemedText>
          )}

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>
                {product.rating.value}
              </ThemedText>
              <ThemedText style={styles.ratingCount}>
                ({product.rating.count})
              </ThemedText>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>
              {formatPrice(product.price.current)}
            </ThemedText>
            {product.price.original && product.price.original > product.price.current && (
              <ThemedText style={styles.originalPrice}>
                {formatPrice(product.price.original)}
              </ThemedText>
            )}
          </View>

          {/* Add to Cart Button */}
          {showAddToCart && onAddToCart && product.availabilityStatus === 'in_stock' && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={16} color="#8B5CF6" />
              <ThemedText style={styles.addToCartText}>Add</ThemedText>
            </TouchableOpacity>
          )}

          {/* Out of Stock */}
          {product.availabilityStatus === 'out_of_stock' && (
            <View style={styles.outOfStockContainer}>
              <ThemedText style={styles.outOfStockText}>Out of Stock</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cashbackBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  cashbackText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  brandName: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 2,
  },
  ratingCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addToCartText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 4,
  },
  outOfStockContainer: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
});