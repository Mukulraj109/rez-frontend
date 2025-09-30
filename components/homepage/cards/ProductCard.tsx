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
import { ProductCardProps } from '@/types/homepage.types';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import StockBadge from '@/components/common/StockBadge';
import { useStockStatus } from '@/hooks/useStockStatus';
import { useStockNotifications } from '@/hooks/useStockNotifications';

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  width = 180,
  showAddToCart = true
}: ProductCardProps) {
  const { state: cartState, actions: cartActions } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { subscribe, subscribing } = useStockNotifications();
  const [, forceUpdate] = useState({});
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Stock status
  const stock = product.inventory?.stock ?? (product.availabilityStatus === 'out_of_stock' ? 0 : 100);
  const lowStockThreshold = product.inventory?.lowStockThreshold ?? 5;
  const { isOutOfStock, isLowStock, canAddToCart: canAddToCartStock } = useStockStatus({
    stock,
    lowStockThreshold,
  });

  // Force re-render when cart changes
  useEffect(() => {
    forceUpdate({});
  }, [cartState.items.length, cartState.items]);

  // Check if product is in cart and get quantity - memoized to ensure proper re-renders
  const { productId, cartItem, quantityInCart, isInCart } = useMemo(() => {
    const id = product._id || product.id;
    const item = cartState.items.find(i => i.productId === id);
    const qty = item?.quantity || 0;
    const inCart = qty > 0;

    console.log('🛒 [ProductCard] Cart check for', product.name, ':', {
      lookingForId: id,
      cartItemsCount: cartState.items.length,
      allCartProductIds: cartState.items.map(i => ({ productId: i.productId, id: i.id, name: i.name })),
      foundInCart: !!item,
      quantityInCart: qty,
      isInCart: inCart
    });

    return {
      productId: id,
      cartItem: item,
      quantityInCart: qty,
      isInCart: inCart
    };
  }, [product._id, product.id, product.name, cartState.items, cartState.items.length]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateSavings = () => {
    if (product.price.original && product.price.original > product.price.current) {
      return product.price.original - product.price.current;
    }
    return 0;
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
          productName: product.name,
          productImage: product.image,
          price: product.price.current,
          originalPrice: product.price.original,
          discount: getDiscountPercentage(),
          rating: product.rating?.value || 0,
          reviewCount: product.rating?.count || 0,
          brand: product.brand,
          category: product.category || 'General',
          availability: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LIMITED' : 'IN_STOCK',
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const renderBadges = () => {
    const badges = [];

    if (product.isNewArrival) {
      badges.push(
        <View key="new" style={[styles.badge, styles.newBadge]}>
          <ThemedText style={styles.newBadgeText}>New</ThemedText>
        </View>
      );
    }

    const discount = getDiscountPercentage();
    if (discount > 0) {
      badges.push(
        <View key="discount" style={[styles.badge, styles.discountBadge]}>
          <ThemedText style={styles.discountBadgeText}>{discount}% OFF</ThemedText>
        </View>
      );
    }

    return badges.length > 0 ? (
      <View style={styles.badgesContainer}>
        {badges}
      </View>
    ) : null;
  };

  const renderStockBadge = () => {
    // Show stock badge on the bottom-right corner of image
    if (product.inventory || isOutOfStock || isLowStock) {
      return (
        <View style={styles.stockBadgeContainer}>
          <StockBadge
            stock={stock}
            lowStockThreshold={lowStockThreshold}
            variant="compact"
          />
        </View>
      );
    }
    return null;
  };

  const renderAvailabilityStatus = () => {
    switch (product.availabilityStatus) {
      case 'low_stock':
        return (
          <View style={styles.lowStockContainer}>
            <ThemedText style={styles.lowStockText}>Only few left!</ThemedText>
          </View>
        );
      case 'out_of_stock':
        return (
          <View style={styles.outOfStockContainer}>
            <ThemedText style={styles.outOfStockText}>Out of Stock</ThemedText>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(product)}
      activeOpacity={0.95}
    >
      <ThemedView style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
          {renderBadges()}
          {renderStockBadge()}

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
            {product.brand}
          </ThemedText>
          
          <ThemedText style={styles.name} numberOfLines={2}>
            {product.name}
          </ThemedText>

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

          {/* Price Information */}
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

          {/* Savings */}
          {calculateSavings() > 0 && (
            <ThemedText style={styles.savings}>
              You save {formatPrice(calculateSavings())}
            </ThemedText>
          )}

          {/* Cashback */}
          {product.cashback && (
            <View style={styles.cashbackContainer}>
              <ThemedText style={styles.cashbackText}>
                {product.cashback.percentage}% cashback
              </ThemedText>
            </View>
          )}

          {/* Availability Status */}
          {renderAvailabilityStatus()}
        </View>

        {/* Add to Cart Button / Quantity Controls - Bottom aligned */}
        <View style={styles.bottomSection}>
          {showAddToCart && (
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
                    if (onAddToCart && canAddToCartStock) {
                      onAddToCart(product);
                    }
                  }}
                  activeOpacity={0.95}
                  disabled={!canAddToCartStock}
                >
                  <Ionicons name="cart" size={18} color="#FFFFFF" />
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
    height: 320,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'column',
    gap: 4,
  },
  stockBadgeContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 10,
    paddingBottom: 48, // Space for bottom section
    flex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  brand: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    lineHeight: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 18,
    minHeight: 36,
    maxHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 10,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
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
  lowStockContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  lowStockText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  outOfStockContainer: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  outOfStockText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 13,
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
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  notifyMeText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  notifyMeButtonDisabled: {
    opacity: 0.5,
  },
});