/**
 * HomeDeliverySection Component
 * Premium section for home delivery, groceries, pharmacy, and more
 * Features category tabs with real API integration and modern UI design
 */

import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useHomeDeliverySection, HomeDeliverySectionProduct } from '@/hooks/useHomeDeliverySection';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/useToast';
import {
  HOME_DELIVERY_SUBCATEGORIES,
  HOME_DELIVERY_SECTION_CONFIG,
  HOME_DELIVERY_COLORS,
} from '@/config/homeDeliverySectionConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated components
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.View;

interface HomeDeliverySectionProps {
  backgroundImage?: any;
}

// Default background image
const DEFAULT_BACKGROUND_IMAGE = require('@/assets/images/homepage-sections/home-delivery-banner.png');

// Card dimensions - matching New Arrivals style
const NEW_CARD_WIDTH = 170;
const NEW_IMAGE_HEIGHT = 140;
const NEW_CARD_HEIGHT = 310;

// Skeleton Loading Card
const SkeletonCard = memo(() => (
  <View style={styles.productCard}>
    <View style={[styles.productImageContainer, styles.skeletonImage]}>
      <View style={styles.skeletonShimmer} />
    </View>
    <View style={styles.productInfo}>
      <View style={[styles.skeletonText, { width: '50%', height: 12 }]} />
      <View style={[styles.skeletonText, { width: '80%', height: 14, marginTop: 8 }]} />
      <View style={[styles.skeletonText, { width: '60%', height: 12, marginTop: 8 }]} />
      <View style={[styles.skeletonText, { width: '40%', height: 16, marginTop: 8 }]} />
    </View>
    <View style={[styles.skeletonText, { width: '90%', height: 36, marginHorizontal: 10, marginBottom: 10, borderRadius: 8 }]} />
  </View>
));

// Product Card Component - New Arrivals Style with Cart Integration
const ProductCard = memo(({
  product,
  index,
  onPress,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  quantityInCart,
}: {
  product: HomeDeliverySectionProduct;
  index: number;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncreaseQuantity?: () => void;
  onDecreaseQuantity?: () => void;
  quantityInCart: number;
}) => {
  const scale = useSharedValue(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isInCart = quantityInCart > 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handleWishlistPress = (e: any) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCartPress = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    }
  };

  const handleIncreasePress = (e: any) => {
    e.stopPropagation();
    if (onIncreaseQuantity) {
      onIncreaseQuantity();
    }
  };

  const handleDecreasePress = (e: any) => {
    e.stopPropagation();
    if (onDecreaseQuantity) {
      onDecreaseQuantity();
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={12} color="#F59E0B" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={12} color="#F59E0B" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={12} color="#D1D5DB" />
        );
      }
    }
    return stars;
  };

  return (
    <AnimatedView
      entering={FadeInRight.delay(index * 80).springify()}
      layout={Layout.springify()}
    >
      <AnimatedTouchable
        style={[styles.productCard, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="bag-outline" size={40} color={HOME_DELIVERY_COLORS.textMuted} />
            </View>
          )}

          {/* New Badge - Top Left */}
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>

          {/* Wishlist Heart - Top Right */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted ? '#EF4444' : '#374151'}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Brand Name */}
          <Text style={styles.brandName} numberOfLines={1}>
            {product.brand || 'GENERIC'}
          </Text>

          {/* Product Name */}
          <ThemedText style={styles.productName} numberOfLines={1}>
            {product.name}
          </ThemedText>

          {/* Star Rating */}
          {product.rating && product.rating.value > 0 && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(product.rating.value)}
              </View>
              {product.rating.count > 0 && (
                <Text style={styles.ratingCount}>({product.rating.count})</Text>
              )}
            </View>
          )}

          {/* Price */}
          <Text style={styles.productPrice}>
            ₹{product.price?.current || 0}
          </Text>
        </View>

        {/* Add to Cart Button OR Quantity Controls */}
        {isInCart ? (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecreasePress}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantityInCart}</Text>
            </View>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncreasePress}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCartPress}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </AnimatedTouchable>
    </AnimatedView>
  );
});

// Main Component
function HomeDeliverySection({ backgroundImage = DEFAULT_BACKGROUND_IMAGE }: HomeDeliverySectionProps) {
  const router = useRouter();
  const { state: cartState, actions: cartActions } = useCart();
  const { showSuccess, showError } = useToast();
  const {
    activeSubcategory,
    products,
    loading,
    error,
    setActiveSubcategory,
    refreshProducts,
  } = useHomeDeliverySection();

  const imageLoadedRef = useRef(false);
  const tabScrollRef = useRef<ScrollView>(null);

  // Tab underline animation
  const tabPositions = useRef<Record<string, number>>({});
  const underlineLeft = useSharedValue(0);
  const underlineWidth = useSharedValue(60);

  const underlineStyle = useAnimatedStyle(() => ({
    left: underlineLeft.value,
    width: underlineWidth.value,
  }));

  // Memoize image source
  const imageSource = useMemo(() => {
    if (!imageLoadedRef.current) {
      imageLoadedRef.current = true;
    }
    return backgroundImage || DEFAULT_BACKGROUND_IMAGE;
  }, []);

  const handleSubcategoryPress = useCallback((subcategoryId: string, layout?: { x: number; width: number }) => {
    setActiveSubcategory(subcategoryId);
    if (layout) {
      underlineLeft.value = withSpring(layout.x, { damping: 15, stiffness: 150 });
      underlineWidth.value = withSpring(layout.width, { damping: 15, stiffness: 150 });
    }
  }, [setActiveSubcategory, underlineLeft, underlineWidth]);

  const handleProductPress = useCallback((product: HomeDeliverySectionProduct) => {
    router.push({
      pathname: '/ProductPage',
      params: {
        cardId: product.id,
        cardType: 'product',
      },
    } as any);
  }, [router]);

  const handleRetry = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Handle Add to Cart
  const handleAddToCart = useCallback(async (product: HomeDeliverySectionProduct) => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price?.current || 0,
        originalPrice: product.price?.original || product.price?.current || 0,
        discountedPrice: product.price?.current || 0,
        image: product.image || '',
        cashback: product.cashback?.percentage ? `${product.cashback.percentage}%` : '0%',
        category: 'products' as const,
      };

      await cartActions.addItem(cartItem);
      showSuccess(`${product.name} added to cart`);
    } catch (err) {
      console.error('[HomeDeliverySection] Error adding to cart:', err);
      showError('Failed to add to cart');
    }
  }, [cartActions, showSuccess, showError]);

  // Handle Increase Quantity
  const handleIncreaseQuantity = useCallback(async (product: HomeDeliverySectionProduct) => {
    try {
      const cartItem = cartState.items.find(item => item.id === product.id);
      if (cartItem) {
        await cartActions.updateQuantity(cartItem.id, cartItem.quantity + 1);
      }
    } catch (err) {
      console.error('[HomeDeliverySection] Error increasing quantity:', err);
      showError('Failed to update quantity');
    }
  }, [cartState.items, cartActions, showError]);

  // Handle Decrease Quantity
  const handleDecreaseQuantity = useCallback(async (product: HomeDeliverySectionProduct) => {
    try {
      const cartItem = cartState.items.find(item => item.id === product.id);
      if (cartItem) {
        if (cartItem.quantity > 1) {
          await cartActions.updateQuantity(cartItem.id, cartItem.quantity - 1);
        } else {
          await cartActions.removeItem(cartItem.id);
          showSuccess(`${product.name} removed from cart`);
        }
      }
    } catch (err) {
      console.error('[HomeDeliverySection] Error decreasing quantity:', err);
      showError('Failed to update quantity');
    }
  }, [cartState.items, cartActions, showSuccess, showError]);

  // Get quantity in cart for a product
  const getQuantityInCart = useCallback((productId: string) => {
    const cartItem = cartState.items.find(item => item.id === productId);
    return cartItem?.quantity || 0;
  }, [cartState.items]);

  // Render category tabs
  const renderCategoryTabs = () => (
    <View style={styles.tabsWrapper}>
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabsScroll}
      >
        {HOME_DELIVERY_SUBCATEGORIES.map((subcategory, index) => {
          const isActive = activeSubcategory === subcategory.id;
          return (
            <TouchableOpacity
              key={subcategory.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleSubcategoryPress(subcategory.id)}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                tabPositions.current[subcategory.id] = x;
                if (index === 0 && underlineLeft.value === 0) {
                  underlineLeft.value = x;
                  underlineWidth.value = width;
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={subcategory.icon as any}
                size={18}
                color={isActive ? HOME_DELIVERY_COLORS.primary : HOME_DELIVERY_COLORS.textPrimary}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {subcategory.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Animated underline */}
      <AnimatedView style={[styles.tabUnderline, underlineStyle]} />
    </View>
  );

  // Render product cards or states
  const renderProducts = () => {
    // Loading state
    if (loading) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
          style={styles.productsScroll}
        >
          {[1, 2, 3].map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </ScrollView>
      );
    }

    // Error state
    if (error) {
      return (
        <TouchableOpacity style={styles.errorContainer} onPress={handleRetry} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={32} color={HOME_DELIVERY_COLORS.primary} />
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      );
    }

    // Empty state
    if (products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={40} color={HOME_DELIVERY_COLORS.textMuted} />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>Check back soon for new listings</Text>
        </View>
      );
    }

    // Products list
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
        style={styles.productsScroll}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onPress={() => handleProductPress(product)}
            onAddToCart={() => handleAddToCart(product)}
            onIncreaseQuantity={() => handleIncreaseQuantity(product)}
            onDecreaseQuantity={() => handleDecreaseQuantity(product)}
            quantityInCart={getQuantityInCart(product.id)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Image Container */}
      <View style={styles.backgroundContainer}>
        <ImageBackground
          source={imageSource}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
          resizeMode="cover"
        >
          {/* Glass Overlay */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.textOverlay}
          />

          {/* Content */}
          <View style={styles.contentOverlay}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <ThemedText style={styles.sectionTitle}>
                  {HOME_DELIVERY_SECTION_CONFIG.title}
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  {HOME_DELIVERY_SECTION_CONFIG.subtitle}
                </ThemedText>
              </View>
            </View>

            {/* Category Tabs */}
            {renderCategoryTabs()}
          </View>
        </ImageBackground>
      </View>

      {/* Product Cards */}
      {renderProducts()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 12,
  },
  backgroundContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  backgroundImage: {
    width: '100%',
    height: 214,
    position: 'relative',
  },
  backgroundImageStyle: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  contentOverlay: {
    position: 'relative',
    padding: 16,
    minHeight: 230,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: HOME_DELIVERY_COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: HOME_DELIVERY_COLORS.textSecondary,
    fontWeight: '500',
  },
  tabsWrapper: {
    position: 'relative',
    marginTop: 'auto',
  },
  tabsContainer: {
    paddingRight: 16,
    gap: 4,
    paddingBottom: 8,
  },
  tabsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: HOME_DELIVERY_COLORS.textPrimary,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: HOME_DELIVERY_COLORS.primary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: HOME_DELIVERY_COLORS.primary,
    borderRadius: 1.5,
  },
  productsContainer: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    gap: 12,
  },
  productsScroll: {
    marginHorizontal: -12,
  },
  productCard: {
    width: 170,
    height: 310,
    backgroundColor: HOME_DELIVERY_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#F9FAFB',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
    }),
  },
  productInfo: {
    padding: 12,
    flex: 1,
  },
  brandName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00796B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: HOME_DELIVERY_COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingCount: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: HOME_DELIVERY_COLORS.textPrimary,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C06A',
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C06A',
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
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
  // Skeleton styles
  skeletonImage: {
    backgroundColor: '#E5E7EB',
  },
  skeletonShimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  skeletonText: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  // Error state
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: HOME_DELIVERY_COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_DELIVERY_COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: HOME_DELIVERY_COLORS.textMuted,
    marginTop: 4,
  },
});

export default memo(HomeDeliverySection, (prevProps, nextProps) => {
  return prevProps.backgroundImage === nextProps.backgroundImage;
});
