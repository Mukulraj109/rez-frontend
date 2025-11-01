import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { CategoryItem } from '@/types/category.types';
import { useCart } from '@/contexts/CartContext';
import { showToast } from '@/components/common/ToastManager';

interface CategoryCardProps {
  item: CategoryItem;
  layoutType?: 'compact' | 'detailed' | 'featured';
  onPress: (item: CategoryItem) => void;
  onAddToCart: (item: CategoryItem) => void;
  onToggleFavorite: (item: CategoryItem) => void;
  showQuickActions?: boolean;
  cardStyle?: 'elevated' | 'flat' | 'outlined';
}

export default function CategoryCard({
  item,
  layoutType = 'compact',
  onPress,
  onAddToCart,
  onToggleFavorite,
  showQuickActions = true,
  cardStyle = 'elevated',
}: CategoryCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { state: cartState, actions: cartActions } = useCart();
  const [, forceUpdate] = useState({});

  // Force re-render when cart changes
  useEffect(() => {
    forceUpdate({});
  }, [cartState.items.length, cartState.items]);

  // Check if product is in cart and get quantity - memoized to ensure proper re-renders
  const { productId, cartItem, quantityInCart, isInCart } = useMemo(() => {
    const id = item.id;
    const cartItem = cartState.items.find(i => i.productId === id);
    const qty = cartItem?.quantity || 0;
    const inCart = qty > 0;

    return {
      productId: id,
      cartItem,
      quantityInCart: qty,
      isInCart: inCart
    };
  }, [item.id, cartState.items, cartState.items.length]);
  
  const handlePress = () => {
    onPress(item);
  };

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      // Extract product ID - handle both product._id and product.id formats
      const productId = item.id;

      if (!productId) {
        console.error('❌ [CategoryCard] No product ID found');
        return;
      }

      // Extract price - handle complex price objects
      let currentPrice = 0;
      let originalPrice = 0;

      if (item.price) {
        currentPrice = item.price.current || 0;
        originalPrice = item.price.original ?? item.price.current ?? 0;
      }

      // Extract image - handle multiple possible formats
      let imageUrl = '';
      if (item.image) {
        imageUrl = item.image;
      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0];
      }

      // Prepare cart item data - match the CartItem type from @/types/cart
      const cartItemData = {
        id: productId,
        name: item.name || 'Product',
        price: currentPrice,
        originalPrice: originalPrice,
        discountedPrice: currentPrice,
        image: imageUrl,
        cashback: item.cashback?.percentage ? `${item.cashback.percentage}%` : '0%',
        category: 'products' as const,
        quantity: 1,
        selected: false,
        
        availabilityStatus: 'in_stock' as const,
      };
      // Add to cart via CartContext
      await cartActions.addItem(cartItemData);

      // Show success toast
      showToast({
        message: `${item.name || 'Item'} added to cart`,
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('❌ [CategoryCard] Failed to add to cart:', error);
      
      // Show error toast
      showToast({
        message: 'Failed to add item to cart',
        type: 'error',
        duration: 3000
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = (e: any) => {
    e.stopPropagation();
    onToggleFavorite(item);
  };

  // Get container style based on card style
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    switch (cardStyle) {
      case 'elevated':
        return [...baseStyle, styles.elevatedCard];
      case 'outlined':
        return [...baseStyle, styles.outlinedCard];
      case 'flat':
      default:
        return [...baseStyle, styles.flatCard];
    }
  };

  // Render price information
  const renderPrice = () => {
    if (!item.price) return null;

    return (
      <View style={styles.priceContainer}>
        <ThemedText style={styles.currentPrice}>
          {item.price.currency || '₹'}{item.price.current || 0}
        </ThemedText>
        {item.price.original && item.price.original > item.price.current && (
          <ThemedText style={styles.originalPrice}>
            {item.price.currency || '₹'}{item.price.original}
          </ThemedText>
        )}
      </View>
    );
  };

  // Render rating information
  const renderRating = () => {
    if (!item.rating) return null;

    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <ThemedText style={styles.ratingText}>
          {item.rating.value || 0}
        </ThemedText>
        {item.rating.maxValue && item.rating.maxValue !== 5 && (
          <ThemedText style={styles.ratingMaxText}>
            /{item.rating.maxValue || 5}
          </ThemedText>
        )}
        {item.rating.count && (
          <ThemedText style={styles.ratingCount}>
            ({item.rating.count || 0})
          </ThemedText>
        )}
      </View>
    );
  };

  // Render timing information (delivery time, etc.)
  const renderTiming = () => {
    if (!item.timing?.deliveryTime) return null;

    return (
      <View style={styles.timingContainer}>
        <Ionicons name="time-outline" size={12} color="#6B7280" />
        <ThemedText style={styles.timingText}>
          {item.timing?.deliveryTime || 'N/A'}
        </ThemedText>
      </View>
    );
  };

  // Render cashback information
  const renderCashback = () => {
    if (!item.cashback) return null;

    return (
      <View style={styles.cashbackContainer}>
        <ThemedText style={styles.cashbackText}>
          Upto {item.cashback?.percentage || 0}% cash back
        </ThemedText>
      </View>
    );
  };

  // Render location information (for stores)
  const renderLocation = () => {
    if (!item.location) return null;

    return (
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={12} color="#6B7280" />
        <ThemedText style={styles.locationText} numberOfLines={1}>
          {item.location?.address || 'Location not available'}
        </ThemedText>
      </View>
    );
  };

  // Render badges (featured, popular, new)
  const renderBadges = () => {
    const badges = [];
    
    if (item.isFeatured) {
      badges.push(
        <View key="featured" style={[styles.badge, styles.featuredBadge]}>
          <ThemedText style={styles.badgeText}>Featured</ThemedText>
        </View>
      );
    }
    
    if (item.isPopular) {
      badges.push(
        <View key="popular" style={[styles.badge, styles.popularBadge]}>
          <ThemedText style={styles.badgeText}>Popular</ThemedText>
        </View>
      );
    }
    
    if (item.isNew) {
      badges.push(
        <View key="new" style={[styles.badge, styles.newBadge]}>
          <ThemedText style={styles.badgeText}>New</ThemedText>
        </View>
      );
    }

    if (badges.length === 0) return null;

    return (
      <View style={styles.badgesContainer}>
        {badges}
      </View>
    );
  };

  // Render compact layout (default grid)
  const renderCompactLayout = () => (
    <TouchableOpacity style={getContainerStyle()} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/200x200?text=No+Image' }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        {renderBadges()}
        {showQuickActions && (
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={handleToggleFavorite}
          >
            <Ionicons 
              name="heart-outline" 
              size={18} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {item.name || 'Unnamed Item'}
        </ThemedText>
        
        <View style={styles.metaContainer}>
          {renderRating()}
          {renderTiming()}
        </View>
        
        <View style={styles.bottomSection}>
          {renderPrice()}
          {renderCashback()}
          
          {showQuickActions && (
            <>
              {isInCart ? (
                // Quantity Controls (Flipkart style)
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={async (e) => {
                      e.stopPropagation();
                      try {
                        if (quantityInCart > 1) {
                          await cartActions.updateQuantity(cartItem!.id, quantityInCart - 1);
                        } else {
                          await cartActions.removeItem(cartItem!.id);
                        }
                      } catch (error) {
                        console.error('❌ [CategoryCard] Failed to update quantity:', error);
                        showToast({
                          message: 'Failed to update quantity',
                          type: 'error',
                          duration: 3000
                        });
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
                    style={styles.quantityButton}
                    onPress={async (e) => {
                      e.stopPropagation();
                      try {
                        await cartActions.updateQuantity(cartItem!.id, quantityInCart + 1);
                      } catch (error) {
                        console.error('❌ [CategoryCard] Failed to update quantity:', error);
                        showToast({
                          message: 'Failed to update quantity',
                          type: 'error',
                          duration: 3000
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                // Add to Cart Button
                <TouchableOpacity 
                  style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]} 
                  onPress={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.addToCartText}>Add to cart</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  // Render detailed layout (list view)
  const renderDetailedLayout = () => (
    <TouchableOpacity style={[getContainerStyle(), styles.detailedContainer]} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.detailedImageContainer}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/200x200?text=No+Image' }} 
          style={styles.detailedImage} 
          resizeMode="cover" 
        />
        {renderBadges()}
      </View>
      
      <View style={styles.detailedContent}>
        <View style={styles.detailedHeader}>
          <ThemedText style={styles.detailedTitle} numberOfLines={1}>
            {item.name || 'Unnamed Item'}
          </ThemedText>
          {showQuickActions && (
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Ionicons name="heart-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
          {item.metadata?.description && (
            <ThemedText style={styles.description} numberOfLines={2}>
              {item.metadata.description || 'No description available'}
            </ThemedText>
          )}
        
        <View style={styles.detailedMeta}>
          {renderRating()}
          {renderLocation()}
          {renderTiming()}
        </View>
        
        <View style={styles.detailedFooter}>
          {renderPrice()}
          {renderCashback()}
        </View>
      </View>
    </TouchableOpacity>
  );
  // Render featured layout (hero style)
  const renderFeaturedLayout = () => (
    <TouchableOpacity style={[getContainerStyle(), styles.featuredContainer]} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.featuredImageContainer}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/200x200?text=No+Image' }} 
          style={styles.featuredImage} 
          resizeMode="cover" 
        />
        <View style={styles.featuredOverlay} />
        {renderBadges()}
        
        <View style={styles.featuredContent}>
          <ThemedText style={styles.featuredTitle} numberOfLines={2}>
            {item.name || 'Unnamed Item'}
          </ThemedText>
          
          {item.metadata?.description && (
            <ThemedText style={styles.featuredDescription} numberOfLines={3}>
              {item.metadata.description || 'No description available'}
            </ThemedText>
          )}
          
          <View style={styles.featuredMeta}>
            {renderRating()}
            {renderPrice()}
          </View>
        </View>
        
        {showQuickActions && (
          <View style={styles.featuredActions}>
            <TouchableOpacity style={styles.featuredFavoriteButton} onPress={handleToggleFavorite}>
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.featuredAddButton} onPress={handleAddToCart}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {renderCashback()}
    </TouchableOpacity>
  );
  // Render based on layout type
  switch (layoutType) {
    case 'detailed':
      return renderDetailedLayout();
    case 'featured':
      return renderFeaturedLayout();
    case 'compact':
    default:
      return renderCompactLayout();
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    height: 380, // Further increased height to ensure Add to cart button is fully visible
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.08)',
  },
  elevatedCard: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  outlinedCard: {
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  flatCard: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    minHeight: 160,
    maxHeight: 160,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadge: {
    backgroundColor: '#8B5CF6',
  },
  popularBadge: {
    backgroundColor: '#EF4444',
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 200, // Increased minimum height for content to accommodate button
    maxHeight: 200, // Fixed max height for consistency
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
    height: 40, // Fixed height for 2 lines
    minHeight: 40,
    maxHeight: 40,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    height: 20, // Fixed height for consistent alignment
    minHeight: 20,
    maxHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  ratingMaxText: {
    fontSize: 10,
    color: '#6B7280',
  },
  ratingCount: {
    fontSize: 10,
    color: '#6B7280',
  },
  timingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timingText: {
    fontSize: 11,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    height: 24, // Fixed height for consistent alignment
    minHeight: 24,
    maxHeight: 24,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  cashbackContainer: {
    marginBottom: 8,
    height: 20, // Fixed height for consistent alignment
    minHeight: 20,
    maxHeight: 20,
  },
  cashbackText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    height: 44, // Fixed height for consistent alignment
    minHeight: 44,
    maxHeight: 44,
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#A78BFA',
    opacity: 0.7,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 12,
    height: 44, // Fixed height for consistent alignment
    minHeight: 44,
    maxHeight: 44,
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
  bottomSection: {
    marginTop: 'auto', // Push to bottom
    paddingTop: 8,
    height: 100, // Fixed height for consistent alignment
    minHeight: 100,
    maxHeight: 100,
    justifyContent: 'space-between',
  },
  
  // Detailed layout styles
  detailedContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  detailedImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  detailedImage: {
    width: '100%',
    height: '100%',
  },
  detailedContent: {
    flex: 1,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailedTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  detailedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  detailedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Featured layout styles
  featuredContainer: {
    height: 200,
  },
  featuredImageContainer: {
    position: 'relative',
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 60,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 12,
    color: '#E5E7EB',
    lineHeight: 16,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featuredActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  featuredFavoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});