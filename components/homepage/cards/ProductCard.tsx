import React, { useMemo, useEffect, useState, useCallback, memo } from 'react';
import {
  TouchableOpacity,
  Pressable,
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
import RatingStars from '@/components/reviews/RatingStars';
import { useStockStatus } from '@/hooks/useStockStatus';
import { useStockNotifications } from '@/hooks/useStockNotifications';
import { useToast } from '@/hooks/useToast';
import { getProductId } from '@/types/product-unified.types';

function ProductCard({
  product,
  onPress,
  onAddToCart,
  width = 180,
  showAddToCart = true
}: ProductCardProps) {
  const { state: cartState, actions: cartActions } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { subscribe, subscribing } = useStockNotifications();
  const { showSuccess, showError } = useToast();
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Stock status
  const stock = product.inventory?.stock ?? (product.availabilityStatus === 'out_of_stock' ? 0 : 100);
  const lowStockThreshold = product.inventory?.lowStockThreshold ?? 5;
  const { isOutOfStock, isLowStock, canAddToCart: canAddToCartStock } = useStockStatus({
    stock,
    lowStockThreshold,
  });

  // Memoize product ID to avoid recalculation - use helper for consistency
  const productId = useMemo(() => getProductId(product), [product._id, product.id]);

  // Check if product is in cart and get quantity - ONLY for THIS product
  const { cartItem, quantityInCart, isInCart } = useMemo(() => {
    // Find this specific product in cart
    const item = cartState.items.find(i => i.productId === productId);
    const qty = item?.quantity || 0;
    const inCart = qty > 0;

    return {
      cartItem: item,
      quantityInCart: qty,
      isInCart: inCart
    };
  }, [productId, cartState.items]);

  // Memoize formatPrice function
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Memoize price calculations
  const priceData = useMemo(() => {
    const savings = product.price.original && product.price.original > product.price.current
      ? product.price.original - product.price.current
      : 0;

    let discount = 0;
    if (product.price.discount) {
      discount = product.price.discount;
    } else if (product.price.original && product.price.original > product.price.current) {
      discount = Math.round(((product.price.original - product.price.current) / product.price.original) * 100);
    }

    return { savings, discount };
  }, [product.price.original, product.price.current, product.price.discount]);

  // Memoize event handlers with useCallback
  const handleToggleWishlist = useCallback(async (e: any) => {
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
          discount: priceData.discount,
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
  }, [isTogglingWishlist, isInWishlist, productId, removeFromWishlist, addToWishlist, product.name, product.image, product.price.current, product.price.original, priceData.discount, product.rating, product.brand, product.category, isOutOfStock, isLowStock]);

  // Memoize badge rendering
  const badges = useMemo(() => {
    const badgeElements = [];

    if (product.isNewArrival) {
      badgeElements.push(
        <View key="new" style={[styles.badge, styles.newBadge]}>
          <ThemedText style={styles.newBadgeText}>New</ThemedText>
        </View>
      );
    }

    if (priceData.discount > 0) {
      badgeElements.push(
        <View key="discount" style={[styles.badge, styles.discountBadge]}>
          <ThemedText style={styles.discountBadgeText}>{priceData.discount}% OFF</ThemedText>
        </View>
      );
    }

    return badgeElements.length > 0 ? (
      <View style={styles.badgesContainer}>
        {badgeElements}
      </View>
    ) : null;
  }, [product.isNewArrival, priceData.discount]);

  // Memoize stock badge rendering
  const stockBadge = useMemo(() => {
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
  }, [product.inventory, isOutOfStock, isLowStock, stock, lowStockThreshold]);

  // Memoize availability status rendering
  const availabilityStatus = useMemo(() => {
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
  }, [product.availabilityStatus]);

  // Memoize accessibility label
  const productLabel = useMemo(() => {
    const stockStatus = isOutOfStock ? 'Out of stock' : isLowStock ? 'Low stock' : 'In stock';
    const wishlistStatus = isInWishlist(productId) ? 'in wishlist' : 'not in wishlist';

    return `${product.brand || 'Brand'} ${product.name || 'Product Name'}. Price ${formatPrice(product.price.current)}${product.price.original && product.price.original > product.price.current ? `. Was ${formatPrice(product.price.original)}` : ''}${priceData.discount > 0 ? `. ${priceData.discount}% off` : ''}${product.rating ? `. ${product.rating.value} stars, ${product.rating.count} reviews` : ''}. ${stockStatus}${product.cashback ? `. ${product.cashback.percentage}% cashback` : ''}. ${wishlistStatus}`;
  }, [product.brand, product.name, product.price.current, product.price.original, priceData.discount, product.rating, product.cashback, isOutOfStock, isLowStock, isInWishlist, productId, formatPrice]);

  // Memoize press handler
  const handlePress = useCallback(() => {
    onPress(product);
  }, [onPress, product]);

  // Memoize notify me handler
  const handleNotifyMe = useCallback((e: any) => {
    e.stopPropagation();
    subscribe(productId, 'push');
  }, [subscribe, productId]);

  // Memoize decrease quantity handler
  const handleDecreaseQuantity = useCallback(async (e: any) => {
    e.stopPropagation();
    try {
      if (quantityInCart > 1) {
        await cartActions.updateQuantity(cartItem!.id, quantityInCart - 1);
        showSuccess(`${product.name} quantity decreased`);
      } else {
        await cartActions.removeItem(cartItem!.id);
        showSuccess(`${product.name} removed from cart`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError(`Failed to update ${product.name}`);
    }
  }, [quantityInCart, cartActions, cartItem, showSuccess, showError, product.name]);

  // Memoize increase quantity handler
  const handleIncreaseQuantity = useCallback(async (e: any) => {
    e.stopPropagation();
    try {
      if (quantityInCart < stock) {
        await cartActions.updateQuantity(cartItem!.id, quantityInCart + 1);
        showSuccess(`${product.name} quantity increased`);
      } else {
        showError(`Maximum quantity reached for ${product.name}`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError(`Failed to update ${product.name}`);
    }
  }, [quantityInCart, stock, cartActions, cartItem, showSuccess, showError, product.name]);

  // Memoize add to cart handler
  const handleAddToCart = useCallback(async (e: any) => {
    e.stopPropagation();
    if (onAddToCart && canAddToCartStock) {
      try {
        await onAddToCart(product);
        showSuccess(`${product.name} added to cart`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        showError(`Failed to add ${product.name} to cart`);
      }
    }
  }, [onAddToCart, canAddToCartStock, product, showSuccess, showError]);

  return (
    <Pressable
      style={[styles.container, { width }]}
      onPress={handlePress}
      accessibilityLabel={productLabel}
      accessibilityHint="Double tap to view product details"
    >
      <ThemedView style={styles.card}>
        {/* Product Image */}
        <View
          style={styles.imageContainer}
          accessibilityLabel={`Product image for ${product.name}`}
          accessibilityRole="image"
        >
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/200x200?text=No+Image' }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
            accessible={false}
          />
          {badges}
          {stockBadge}

          {/* Wishlist Heart Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleToggleWishlist}
            disabled={isTogglingWishlist}
            activeOpacity={0.7}
            accessibilityLabel={isInWishlist(productId) ? "Remove from wishlist" : "Add to wishlist"}
            accessibilityRole="button"
            accessibilityHint={isInWishlist(productId) ? "Double tap to remove from wishlist" : "Double tap to add to wishlist"}
            accessibilityState={{ disabled: isTogglingWishlist }}
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
            {product.brand || 'Brand'}
          </ThemedText>
          
          <ThemedText style={styles.name} numberOfLines={2}>
            {product.name || 'Product Name'}
          </ThemedText>

          {/* Rating - Using RatingStars component for consistency */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <RatingStars
                rating={product.rating.value}
                size={12}
                showCount={true}
                count={product.rating.count}
              />
            </View>
          )}

          {/* Price Information */}
          <View
            style={styles.priceContainer}
            accessibilityLabel={`Price: ${formatPrice(product.price.current)}${product.price.original && product.price.original > product.price.current ? `. Was ${formatPrice(product.price.original)}. You save ${formatPrice(priceData.savings)}` : ''}`}
            accessibilityRole="text"
          >
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
          {priceData.savings > 0 && (
            <ThemedText
              style={styles.savings}
              accessibilityLabel={`You save ${formatPrice(priceData.savings)}`}
            >
              You save {formatPrice(priceData.savings)}
            </ThemedText>
          )}

          {/* Cashback */}
          {product.cashback && (
            <View
              style={styles.cashbackContainer}
              accessibilityLabel={`${product.cashback.percentage || 0}% cashback available`}
              accessibilityRole="text"
            >
              <ThemedText style={styles.cashbackText}>
                {product.cashback.percentage || 0}% cashback
              </ThemedText>
            </View>
          )}

          {/* Availability Status */}
          {availabilityStatus}
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
                  onPress={handleNotifyMe}
                  activeOpacity={0.95}
                  disabled={subscribing[productId]}
                  accessibilityLabel={subscribing[productId] ? 'Subscribing to stock notifications' : 'Notify me when product is back in stock'}
                  accessibilityRole="button"
                  accessibilityHint="Double tap to subscribe to notifications when this product is available"
                  accessibilityState={{ disabled: subscribing[productId] }}
                >
                  <Ionicons name="notifications-outline" size={18} color="#8B5CF6" />
                  <ThemedText style={styles.notifyMeText}>
                    {subscribing[productId] ? 'Subscribing...' : 'Notify Me'}
                  </ThemedText>
                </TouchableOpacity>
              ) : isInCart ? (
                // Quantity Controls (Flipkart style)
                <View
                  style={styles.quantityControls}
                  key="quantity-controls"
                  accessibilityLabel={`Quantity in cart: ${quantityInCart}. Use buttons to adjust quantity`}
                  accessibilityRole="adjustable"
                >
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={handleDecreaseQuantity}
                    activeOpacity={0.7}
                    accessibilityLabel={quantityInCart > 1 ? "Decrease quantity" : "Remove from cart"}
                    accessibilityRole="button"
                    accessibilityHint={quantityInCart > 1 ? "Double tap to decrease quantity by one" : "Double tap to remove product from cart"}
                  >
                    <Ionicons name="remove" size={18} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View
                    style={styles.quantityDisplay}
                    accessibilityLabel={`Current quantity: ${quantityInCart}`}
                    accessibilityRole="text"
                  >
                    <ThemedText style={styles.quantityText}>{quantityInCart}</ThemedText>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      quantityInCart >= stock && styles.quantityButtonDisabled
                    ]}
                    onPress={handleIncreaseQuantity}
                    activeOpacity={quantityInCart >= stock ? 1 : 0.7}
                    disabled={quantityInCart >= stock}
                    accessibilityLabel="Increase quantity"
                    accessibilityRole="button"
                    accessibilityHint={quantityInCart >= stock ? `Maximum stock reached: ${stock}` : "Double tap to increase quantity by one"}
                    accessibilityState={{ disabled: quantityInCart >= stock }}
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
                  onPress={handleAddToCart}
                  activeOpacity={0.95}
                  disabled={!canAddToCartStock}
                  accessibilityLabel={`Add ${product.name} to cart`}
                  accessibilityRole="button"
                  accessibilityHint="Double tap to add this product to your shopping cart"
                  accessibilityState={{ disabled: !canAddToCartStock }}
                >
                  <Ionicons name="cart" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

// Memoize the component with a custom comparison function
// Only re-render when THIS product's data or cart quantity changes
const MemoizedProductCard = memo(ProductCard, (prevProps, nextProps) => {
  // If product ID changed, re-render - use helper for consistency
  if (getProductId(prevProps.product) !== getProductId(nextProps.product)) {
    return false;
  }

  // If product data changed (price, stock, etc), re-render
  if (
    prevProps.product.price.current !== nextProps.product.price.current ||
    prevProps.product.price.original !== nextProps.product.price.original ||
    prevProps.product.price.discount !== nextProps.product.price.discount ||
    prevProps.product.inventory?.stock !== nextProps.product.inventory?.stock ||
    prevProps.product.availabilityStatus !== nextProps.product.availabilityStatus ||
    prevProps.product.name !== nextProps.product.name ||
    prevProps.product.image !== nextProps.product.image
  ) {
    return false;
  }

  // If width or showAddToCart props changed, re-render
  if (prevProps.width !== nextProps.width || prevProps.showAddToCart !== nextProps.showAddToCart) {
    return false;
  }

  // If callbacks changed (they shouldn't with stable refs), re-render
  if (prevProps.onPress !== nextProps.onPress || prevProps.onAddToCart !== nextProps.onAddToCart) {
    return false;
  }

  // Otherwise, don't re-render (cart changes to OTHER products won't trigger re-render)
  return true;
});

export default MemoizedProductCard;

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