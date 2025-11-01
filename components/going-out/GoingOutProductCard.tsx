import React, { useState } from 'react';
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
  onToggleWishlist,
  showAddToCart = true,
  width = 180,
  isInWishlist = false,
}: GoingOutProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleWishlistToggle = (e: any) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
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
          {!imageError && product.image ? (
            <Image 
              source={{ uri: product.image }} 
              style={styles.image}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons 
                name="image-outline" 
                size={48} 
                color="#D1D5DB" 
              />
              <ThemedText style={styles.placeholderText}>
                No Image
              </ThemedText>
            </View>
          )}
          
          {imageLoading && !imageError && (
            <View style={styles.imageLoadingOverlay}>
              <Ionicons 
                name="hourglass-outline" 
                size={24} 
                color="#8B5CF6" 
              />
            </View>
          )}
          
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
          <TouchableOpacity 
            style={styles.favoriteButton} 
            activeOpacity={0.8}
            onPress={handleWishlistToggle}
          >
            <Ionicons 
              name={isInWishlist ? "heart" : "heart-outline"} 
              size={16} 
              color={isInWishlist ? "#EF4444" : "#6B7280"} 
            />
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 380, // Fixed height for all cards
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 8,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cashbackBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(139, 92, 246, 0.3)',
      },
    }),
  },
  cashbackText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
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
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  content: {
    padding: 16,
    paddingTop: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
    letterSpacing: -0.2,
    minHeight: 40, // Fixed height for 2 lines
  },
  brandName: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 6,
    minHeight: 16, // Ensure consistent height
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 16, // Ensure consistent height
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 20, // Ensure consistent height
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginRight: 8,
    letterSpacing: -0.3,
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
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(139, 92, 246, 0.1)',
      },
    }),
  },
  addToCartText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.2,
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