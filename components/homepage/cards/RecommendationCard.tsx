import React, { useMemo, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RecommendationCardProps } from '@/types/homepage.types';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import StockBadge from '@/components/common/StockBadge';
import { useStockStatus } from '@/hooks/useStockStatus';
import { useStockNotifications } from '@/hooks/useStockNotifications';

export default function RecommendationCard({
  recommendation,
  onPress,
  onAddToCart,
  width = 230,
  showReason = true
}: RecommendationCardProps) {
  const { state: cartState, actions: cartActions } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { subscribe, subscribing } = useStockNotifications();
  const [, forceUpdate] = useState({});
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Stock status
  const stock = recommendation.inventory?.stock ?? (recommendation.availabilityStatus === 'out_of_stock' ? 0 : 100);
  const lowStockThreshold = recommendation.inventory?.lowStockThreshold ?? 5;
  const { isOutOfStock, isLowStock, canAddToCart: canAddToCartStock } = useStockStatus({
    stock,
    lowStockThreshold,
  });

  // Force re-render when cart changes
  useEffect(() => {
    forceUpdate({});
  }, [cartState.items.length, cartState.items]);

  // Check if product is in cart and get quantity
  const { productId, cartItem, quantityInCart, isInCart } = useMemo(() => {
    const id = recommendation._id || recommendation.id;
    const item = cartState.items.find(i => i.productId === id);
    const qty = item?.quantity || 0;
    const inCart = qty > 0;

    return {
      productId: id,
      cartItem: item,
      quantityInCart: qty,
      isInCart: inCart
    };
  }, [recommendation._id, recommendation.id, cartState.items, cartState.items.length]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (recommendation.price.discount) {
      return recommendation.price.discount;
    }
    if (recommendation.price.original && recommendation.price.original > recommendation.price.current) {
      return Math.round(((recommendation.price.original - recommendation.price.current) / recommendation.price.original) * 100);
    }
    return 0;
  };

  const handleToggleWishlist = async (e: any) => {
    e.stopPropagation();

    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);
    try {
      const inWishlist = isInWishlist(productId);

      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist({
          productId,
          productName: recommendation.name,
          productImage: recommendation.image,
          price: recommendation.price.current,
          originalPrice: recommendation.price.original,
          discount: getDiscountPercentage(),
          rating: recommendation.rating?.value || 0,
          reviewCount: recommendation.rating?.count || 0,
          brand: recommendation.brand,
          category: recommendation.category || 'General',
          availability: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LIMITED' : 'IN_STOCK',
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const discount = getDiscountPercentage();
  const stockStatus = isOutOfStock ? 'Out of stock' : isLowStock ? 'Low stock' : 'In stock';
  const wishlistStatus = isInWishlist(productId) ? 'in wishlist' : 'not in wishlist';

  const recommendationLabel = `Recommended for you. ${recommendation.brand} ${recommendation.name}. Price ${formatPrice(recommendation.price.current)}${recommendation.price.original && recommendation.price.original > recommendation.price.current ? `. Was ${formatPrice(recommendation.price.original)}` : ''}${discount > 0 ? `. ${discount}% off` : ''}${recommendation.rating ? `. ${recommendation.rating.value} stars, ${recommendation.rating.count} reviews` : ''}. ${Math.round(recommendation.recommendationScore * 100)}% match based on ${recommendation.recommendationReason}. ${stockStatus}${recommendation.cashback ? `. Up to ${recommendation.cashback.percentage}% cashback` : ''}. ${wishlistStatus}`;

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(recommendation)}
      activeOpacity={0.95}
      accessibilityLabel={recommendationLabel}
      accessibilityRole="button"
      accessibilityHint="Double tap to view recommended product details"
    >
      <ThemedView style={styles.card}>
        {/* Recommendation Badge */}
        <View
          style={styles.recommendationBadge}
          accessibilityLabel="Recommended for you"
          accessibilityRole="text"
        >
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          <ThemedText style={styles.recommendationBadgeText}>
            For You
          </ThemedText>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recommendation.image }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
          {getDiscountPercentage() > 0 && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>
                {getDiscountPercentage()}% OFF
              </ThemedText>
            </View>
          )}
          {(recommendation.inventory || isOutOfStock || isLowStock) && (
            <View style={styles.stockBadgeContainer}>
              <StockBadge
                stock={stock}
                lowStockThreshold={lowStockThreshold}
                variant="compact"
              />
            </View>
          )}

          {/* Wishlist Heart Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleToggleWishlist}
            disabled={isTogglingWishlist}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isInWishlist(productId) ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist(productId) ? "#EF4444" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.content}>
          <ThemedText style={styles.brand} numberOfLines={1}>
            {recommendation.brand}
          </ThemedText>
          
          <ThemedText style={styles.name} numberOfLines={2}>
            {recommendation.name}
          </ThemedText>

          {/* Recommendation Reason */}
          {showReason && (
            <View style={styles.reasonContainer}>
              <Ionicons name="bulb-outline" size={12} color="#8B5CF6" />
              <ThemedText style={styles.reasonText} numberOfLines={1}>
                {recommendation.recommendationReason}
              </ThemedText>
            </View>
          )}

          {/* Price Information */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>
              {formatPrice(recommendation.price.current)}
            </ThemedText>
            {recommendation.price.original && recommendation.price.original > recommendation.price.current && (
              <ThemedText style={styles.originalPrice}>
                {formatPrice(recommendation.price.original)}
              </ThemedText>
            )}
          </View>

          {/* Rating */}
          {recommendation.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>
                {typeof recommendation.rating.value === 'number'
                  ? recommendation.rating.value.toFixed(1)
                  : recommendation.rating.value}
              </ThemedText>
              <ThemedText style={styles.ratingCount}>
                ({recommendation.rating.count})
              </ThemedText>
            </View>
          )}

          {/* Cashback */}
          {recommendation.cashback && (
            <View style={styles.cashbackContainer}>
              <ThemedText style={styles.cashbackText}>
                Upto {recommendation.cashback.percentage}% cash back
              </ThemedText>
            </View>
          )}

          {/* Recommendation Score Indicator */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreProgress, 
                  { width: `${recommendation.recommendationScore * 100}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.scoreText}>
              {Math.round(recommendation.recommendationScore * 100)}% match
            </ThemedText>
          </View>

          {/* Add to Cart Button / Quantity Controls */}
          {onAddToCart && (
            <>
              {isOutOfStock ? (
                // Notify Me Button when out of stock
                <TouchableOpacity
                  style={[
                    styles.notifyMeButton,
                    subscribing[productId] && styles.notifyMeButtonDisabled
                  ]}
                  key="notify-me-button"
                  onPress={(e) => {
                    e.stopPropagation();
                    subscribe(productId, 'push');
                  }}
                  activeOpacity={0.95}
                  disabled={subscribing[productId]}
                >
                  <Ionicons name="notifications-outline" size={18} color="#8B5CF6" />
                  <ThemedText style={styles.notifyMeText}>
                    {subscribing[productId] ? 'Subscribing...' : 'Notify Me'}
                  </ThemedText>
                </TouchableOpacity>
              ) : isInCart ? (
                // Quantity Controls (Flipkart style)
                <View style={styles.quantityControls} key="quantity-controls">
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={async (e) => {
                      e.stopPropagation();
                      if (quantityInCart > 1) {
                        await cartActions.updateQuantity(cartItem!.id, quantityInCart - 1);
                      } else {
                        await cartActions.removeItem(cartItem!.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={18} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    <ThemedText style={styles.quantityText}>{quantityInCart}</ThemedText>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      quantityInCart >= stock && styles.quantityButtonDisabled
                    ]}
                    onPress={async (e) => {
                      e.stopPropagation();
                      if (quantityInCart < stock) {
                        await cartActions.updateQuantity(cartItem!.id, quantityInCart + 1);
                      }
                    }}
                    activeOpacity={quantityInCart >= stock ? 1 : 0.7}
                    disabled={quantityInCart >= stock}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                // Add to Cart Button
                <TouchableOpacity
                  style={[
                    styles.addToCartButton,
                    !canAddToCartStock && styles.addToCartButtonDisabled
                  ]}
                  key="add-to-cart-button"
                  onPress={(e) => {
                    e.stopPropagation();
                    if (canAddToCartStock) {
                      onAddToCart(recommendation);
                    }
                  }}
                  activeOpacity={0.95}
                  disabled={!canAddToCartStock}
                >
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
);
}

const styles = StyleSheet.create({
  container: {
    // Container styles handled by parent
    flex: 0,
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    height: 400,
  },
  recommendationBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 10,
  },
  recommendationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    marginTop: 24, // Account for recommendation badge
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stockBadgeContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 12,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 18,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 11,
    color: '#6B7280',
  },
  cashbackContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
  },
  scoreContainer: {
    marginBottom: 10,
  },
  scoreBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 2,
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  scoreText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  addToCartButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#A78BFA',
  },
  notifyMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  notifyMeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  notifyMeButtonDisabled: {
    opacity: 0.5,
  },
});