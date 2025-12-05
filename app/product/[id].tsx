// Product Detail Page
// Dynamic route for individual product details

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Href } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLocation } from '@/contexts/LocationContext';
import { useProductReviews } from '@/hooks/useProductReviews';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import productsApi from '@/services/productsApi';
import { useWallet } from '@/hooks/useWallet';
import ProductVariantSelector from '@/components/product/ProductVariantSelector';
import { IProductVariant } from '@/types/product-variants.types';
import { useProductAvailability } from '@/hooks/useProductAvailability';
import AddToCartModal from '@/components/product/AddToCartModal';
import { useCart } from '@/contexts/CartContext';
import StockBadge from '@/components/product/StockBadge';
import StockNotificationModal from '@/components/product/StockNotificationModal';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import RelatedProductsSection from '@/components/product/RelatedProductsSection';
import FrequentlyBoughtTogether from '@/components/product/FrequentlyBoughtTogether';
import DeliveryInformation from '@/components/product/DeliveryInformation';
import ReturnPolicyCard from '@/components/product/ReturnPolicyCard';
import SellerInformation from '@/components/product/SellerInformation';
import CashbackRewardsCard from '@/components/product/CashbackRewardsCard';
import ProductShareModal from '@/components/product/ProductShareModal';
import SizeGuideModal from '@/components/product/SizeGuideModal';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import analyticsService from '@/services/analyticsService';
import ExpertReviews from '@/components/product/ExpertReviews';
import CustomerPhotos from '@/components/product/CustomerPhotos';
import QASection from '@/components/product/QASection';
import ProductComparison from '@/components/product/ProductComparison';
import ProductPageErrorBoundary from '@/components/product/ProductPageErrorBoundary';
import ProductPageSkeleton from '@/components/product/ProductPageSkeleton';
import {
  validateAddToCart,
  validateQuantity,
  getMaxAvailableQuantity,
  isProductAvailable,
  MAX_QUANTITY_PER_ITEM,
} from '@/utils/cartValidation';

const { width: screenWidth } = Dimensions.get('window');

interface StoreInfo {
  id: string;
  name: string;
  logo?: string;
  slug?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    coordinates?: [number, number]; // [longitude, latitude]
    deliveryRadius?: number;
  };
}

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  videos?: string[]; // Product videos
  description: string;
  specifications: { [key: string]: string };
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED';
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  tags: string[];
  variants?: IProductVariant[]; // Product variants for selection
  store?: StoreInfo; // Store information with location
}

// Haversine formula for distance calculation between two coordinates
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Distance in km, rounded to 1 decimal
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { state: locationState } = useLocation();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showStockNotificationModal, setShowStockNotificationModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);

  // Cart context
  const { state: cartState, actions: cartActions } = useCart();

  // Wallet hook for coin balance
  const { walletState, fetchWallet } = useWallet({
    autoFetch: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  // Extract coin balance
  const wasilCoin = walletState.data?.coins?.find(c => c.type === 'wasil');
  const coinBalance = wasilCoin?.amount || 0;

  // Availability hook for stock checking
  const {
    availability,
    isLoading: availabilityLoading,
    checkAvailability,
    canAddToCart: canAddToCartCheck,
    getMaxQuantity,
  } = useProductAvailability({
    productId: id as string,
    variantId: selectedVariant?._id,
    selectedVariant,
    autoCheck: true,
  });

  // Debug: Log wallet state
  useEffect(() => {
  }, [walletState, coinBalance]);

  // Use the reviews hook for complete review management
  const {
    reviews,
    summary: reviewSummary,
    isLoading: reviewsLoading,
    isRefreshing: reviewsRefreshing,
    hasMore: hasMoreReviews,
    sortBy,
    filterRating,
    refreshReviews,
    loadMoreReviews,
    setSortBy,
    setFilterRating,
    submitReview,
    updateReview,
    deleteReview,
    markHelpful,
  } = useProductReviews({
    productId: id as string,
    autoLoad: true,
  });

  useEffect(() => {
    loadProductDetails(id as string);
  }, [id]);

  // Track product view when product loads
  useEffect(() => {
    if (product) {
      analyticsService.trackProductView({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        category: product.category,
        brand: product.brand,
        variantId: selectedVariant?._id,
      });
    }
  }, [product?.id, selectedVariant?._id]);

  const loadProductDetails = async (productId: string) => {
    try {

      // Fetch product details from backend
      const productResponse = await productsApi.getProductById(productId);

      if (!productResponse.success || !productResponse.data) {
        setIsLoading(false);
        return;
      }

      const productData = productResponse.data;

      // Transform backend variants to frontend format
      const transformedVariants: IProductVariant[] = (productData.inventory?.variants || []).map((variant: any) => ({
        _id: variant._id || variant.id,
        id: variant.id || variant._id,
        sku: variant.sku || `SKU-${variant._id}`,
        attributes: variant.attributes || [],
        pricing: {
          basePrice: variant.pricing?.basePrice || variant.price || 0,
          salePrice: variant.pricing?.salePrice || variant.pricing?.basePrice || variant.price || 0,
          discount: variant.pricing?.discount || 0,
          currency: variant.pricing?.currency || '₹',
        },
        inventory: {
          quantity: variant.inventory?.quantity || 0,
          isAvailable: variant.inventory?.quantity > 0,
          reserved: variant.inventory?.reserved || 0,
          threshold: variant.inventory?.threshold || 5,
        },
        images: variant.images || [],
        isActive: variant.isActive !== false,
        weight: variant.weight,
        dimensions: variant.dimensions,
      }));

      // Determine price from first available variant or product-level pricing
      const firstVariant = transformedVariants[0];
      const productPrice = firstVariant?.pricing.salePrice || productData.pricing?.salePrice || productData.pricing?.basePrice || 0;
      const productOriginalPrice = firstVariant?.pricing.basePrice || productData.pricing?.basePrice;

      // Extract videos if available
      const productVideos = productData.videos?.map((video: any) => {
        if (typeof video === 'string') return video;
        return video.url || video.uri || '';
      }).filter(Boolean) || [];

      // Extract store information with location
      const storeInfo: StoreInfo | undefined = productData.store ? {
        id: productData.store._id || productData.store.id || '',
        name: productData.store.name || 'Unknown Store',
        logo: productData.store.logo,
        slug: productData.store.slug,
        location: productData.store.location ? {
          address: productData.store.location.address,
          city: productData.store.location.city,
          state: productData.store.location.state,
          coordinates: productData.store.location.coordinates,
          deliveryRadius: productData.store.location.deliveryRadius,
        } : undefined,
      } : undefined;

      // Transform backend product data to component format
      const transformedProduct: ProductDetails = {
        id: productData.id || (productData as { _id?: string })._id || '',
        name: productData.name,
        price: productPrice,
        originalPrice: productOriginalPrice !== productPrice ? productOriginalPrice : undefined,
        discount: productOriginalPrice && productPrice
          ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
          : undefined,
        images: productData.images?.map((img: any) => img.url || img) || [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
        ],
        videos: productVideos.length > 0 ? productVideos : undefined,
        description: productData.description || 'No description available',
        specifications: productData.specifications
          ? Object.fromEntries(productData.specifications.map((s: any) => [s.key, s.value]))
          : firstVariant?.attributes?.reduce((acc: any, attr: any) => {
              acc[attr.key] = attr.value;
              return acc;
            }, {}) || {},
        availability: firstVariant?.inventory.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        rating: reviewSummary?.averageRating || productData.ratings?.average || 0,
        reviewCount: reviewSummary?.totalReviews || productData.ratings?.count || 0,
        category: productData.category?.name || 'General',
        brand: productData.store?.name || 'Unknown',
        tags: productData.tags || [],
        variants: transformedVariants.length > 0 ? transformedVariants : undefined,
        store: storeInfo, // Include store info with location
      };

      setProduct(transformedProduct);
    } catch (error) {
      setError('Failed to load product details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  /**
   * Handle add to cart with full validation and cart integration
   */
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);

      // Get current quantity in cart for this product
      const currentCartQty = cartActions.getItemQuantity(
        selectedVariant ? `${product.id}-${selectedVariant._id}` : product.id
      );

      // Use centralized validation
      const validation = validateAddToCart(
        product,
        quantity,
        selectedVariant,
        currentCartQty,
        {
          checkStock: true,
          checkVariants: true,
          checkQuantityLimits: true,
        }
      );

      // If validation fails, show error and return
      if (!validation.valid) {
        Alert.alert(
          'Cannot Add to Cart',
          validation.error || 'Unable to add this item to cart.',
          [{ text: 'OK' }]
        );
        setIsAddingToCart(false);
        return;
      }

      // Show warning if exists (e.g., low stock)
      if (validation.warning) {
        console.log('Cart Warning:', validation.warning);
      }

      // Build cart item
      const cartItem = {
        id: selectedVariant ? `${product.id}-${selectedVariant._id}` : product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        discountedPrice: product.price,
        image: product.images[0],
        cashback: '0', // Can calculate from product data if available
        category: 'products' as const,
        quantity,
        selected: true,
        variant: selectedVariant ? {
          id: selectedVariant._id,
          sku: selectedVariant.sku,
          attributes: selectedVariant.attributes,
          price: selectedVariant.pricing.salePrice,
        } : undefined,
        inventory: {
          stock: availability?.quantity || 0,
          lowStockThreshold: 5,
        },
        availabilityStatus: availability?.status || 'in_stock' as const,
      };


      // Add to cart via CartContext
      await cartActions.addItem(cartItem);

      
      // Track add to cart event
      analyticsService.trackAddToCart({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        variantId: selectedVariant?._id,
        variantDetails: selectedVariant ? getVariantDetailsString() : undefined,
        totalValue: product.price * quantity,
      });

      // Show success modal
      setShowAddToCartModal(true);

      setIsAddingToCart(false);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add item to cart. Please try again.',
        [{ text: 'OK' }]
      );
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    // Navigate directly to checkout with this product
    router.push(`/checkout?productId=${product?.id}&quantity=${quantity}` as Href);
  };

  const handleWishlist = async () => {
    if (!product) return;

    try {
      const isInList = isInWishlist(product.id);

      if (isInList) {
        await removeFromWishlist(product.id);
        Alert.alert('Removed from Wishlist', `${product.name} removed from your wishlist!`);
        analyticsService.trackWishlist('remove', product.id, product.name);
      } else {
        await addToWishlist({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          reviewCount: product.reviewCount,
          brand: product.brand,
          category: product.category,
          availability: product.availability,
        });
        Alert.alert('Added to Wishlist', `${product.name} added to your wishlist!`);
      }
        analyticsService.trackWishlist('add', product.id, product.name);
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist. Please try again.');
    }
  };

  /**
   * Handle variant selection change
   * Update displayed price, availability, and images based on selected variant
   */
  const handleVariantChange = (variant: IProductVariant | null) => {
    setSelectedVariant(variant);

    if (variant && product) {
      // Update product display with variant-specific data
      const updatedProduct = {
        ...product,
        price: variant.pricing.salePrice,
        originalPrice: variant.pricing.basePrice !== variant.pricing.salePrice ? variant.pricing.basePrice : undefined,
        discount: variant.pricing.discount,
        availability: variant.inventory.isAvailable ? 'IN_STOCK' as const : 'OUT_OF_STOCK' as const,
        // Use variant images if available, otherwise keep product images
        images: variant.images && variant.images.length > 0 ? variant.images : product.images,
      };
      setProduct(updatedProduct);
      
      // Track variant selection
      const attributes = variant.attributes.reduce((acc: Record<string, string>, attr: any) => {
        acc[attr.key] = attr.value;
        return acc;
      }, {});
      analyticsService.trackVariantSelection(product.id, variant._id, attributes);
    }
  };

  /**
   * Generate variant details string for display
   * e.g., "Size: Large, Color: Red"
   */
  const getVariantDetailsString = (): string | undefined => {
    if (!selectedVariant) return undefined;
    return selectedVariant.attributes
      .map(attr => `${attr.key}: ${attr.value}`)
      .join(', ');
  };

  /**
   * Handle stock notification subscription
   */
  const handleStockNotification = async (email: string, phone?: string) => {
    try {

      // TODO: Integrate with backend API when available
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));


      // In production, call backend API:
      // await stockNotificationApi.subscribe({
      //   productId: product!.id,
      //   variantId: selectedVariant?._id,
      //   email,
      //   phone,
      // });
    } catch (error) {
      throw new Error('Failed to subscribe. Please try again later.');
    }
  };

  if (isLoading) {
    return <ProductPageSkeleton showVariants={true} showReviews={false} />;
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <ThemedText style={styles.errorTitle}>Product Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The product you're looking for could not be found.
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ProductPageErrorBoundary
      productId={id as string}
      onRetry={() => loadProductDetails(id as string)}
      onGoBack={handleBackPress}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>Product Details</ThemedText>

        {/* Coin Balance Display */}
        <TouchableOpacity
          style={styles.coinButton}
          onPress={() => router.push('/WalletScreen' as Href)}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={16} color="#FFD700" />
          <ThemedText style={styles.coinText}>{coinBalance}</ThemedText>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleWishlist}
            accessibilityLabel={product && isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            accessibilityRole="button"
            accessibilityHint={`Double tap to ${product && isInWishlist(product.id) ? 'remove from' : 'add to'} your wishlist`}
            accessibilityState={{ selected: product && isInWishlist(product.id) }}
          >
            <Ionicons
              name={product && isInWishlist(product.id) ? "heart" : "heart-outline"}
              size={24}
              color={product && isInWishlist(product.id) ? "#EF4444" : "#333"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowShareModal(true)}
            accessibilityLabel={`Share ${product?.name || 'product'}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to share this product with friends and family"
          >
            <Ionicons name="share-social-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { position: 'relative' }]}
            onPress={() => router.push('/CartPage' as Href)}
            accessibilityLabel={`Shopping cart. ${cartState.totalItems > 0 ? `${cartState.totalItems} item${cartState.totalItems !== 1 ? 's' : ''} in cart` : 'Cart is empty'}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to view your shopping cart"
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
            {cartState.totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartState.totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Product Gallery */}
        <ProductImageGallery
          images={product.images}
          videos={product.videos}
          showThumbnails={true}
          autoPlayVideo={false}
        />

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.brandRow}>
            <ThemedText style={styles.brand}>{product.brand}</ThemedText>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.rating}>{product.rating}</ThemedText>
              <ThemedText style={styles.reviewCount}>({product.reviewCount})</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.productName}>{product.name}</ThemedText>

          {/* Location & View Store Section */}
          {product.store && (
            <View style={styles.locationSection}>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={18} color="#00C06A" />
                <View style={styles.locationTextContainer}>
                  {/* Calculate and show distance if coordinates available */}
                  {product.store.location?.coordinates && locationState.currentLocation?.coordinates && (
                    <ThemedText style={styles.distanceText}>
                      {calculateDistance(
                        locationState.currentLocation.coordinates.latitude,
                        locationState.currentLocation.coordinates.longitude,
                        product.store.location.coordinates[1], // latitude
                        product.store.location.coordinates[0]  // longitude
                      )} km
                    </ThemedText>
                  )}
                  <ThemedText style={styles.locationText}>
                    {product.store.location?.address || product.store.location?.city || 'Location not available'}
                    {product.store.location?.city && product.store.location?.address && `, ${product.store.location.city}`}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewStoreButton}
                onPress={() => router.push(`/Store?storeId=${product.store?.id}` as Href)}
                activeOpacity={0.8}
                accessibilityLabel={`View store ${product.store.name}`}
                accessibilityRole="button"
                accessibilityHint="Double tap to view the store page"
              >
                <ThemedText style={styles.viewStoreText}>View Store</ThemedText>
                <Ionicons name="chevron-forward" size={16} color="#00C06A" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>₹{product.price.toLocaleString()}</ThemedText>
            {product.originalPrice && (
              <>
                <ThemedText style={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</ThemedText>
                <View style={styles.discountBadge}>
                  <ThemedText style={styles.discountText}>{product.discount}% OFF</ThemedText>
                </View>
              </>
            )}
          </View>

          {/* Stock Badge */}
          <View style={styles.stockBadgeContainer}>
            {availability && (
              <StockBadge
                status={availability.status}
                quantity={availability.quantity}
                showIcon={true}
                size="medium"
              />
            )}

            {/* Notify Me Button for Out of Stock */}
            {availability && !availability.canPurchase && (
              <TouchableOpacity
                style={styles.notifyMeButton}
                onPress={() => setShowStockNotificationModal(true)}
                activeOpacity={0.8}
                accessibilityLabel="Notify me when back in stock"
                accessibilityRole="button"
                accessibilityHint="Double tap to set up notifications when this product becomes available"
              >
                <Ionicons name="notifications-outline" size={16} color="#00C06A" />
                <ThemedText style={styles.notifyMeText}>Notify Me</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cashback & Rewards */}
        <CashbackRewardsCard
          productPrice={product.price}
          cashbackOffer={{
            type: 'percentage',
            value: 5,
            maxCashback: 200,
            description: 'Get 5% cashback up to ₹200',
          }}
          rewardPoints={{
            basePoints: 1,
            bonusMultiplier: 2,
            tierBonus: 50,
          }}
          showDetails={true}
        />

        {/* Product Variant Selector */}
        {product.variants && product.variants.length > 0 && (
          <View style={styles.section}>
            <ProductVariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantChange={handleVariantChange}
              showTitle={true}
              size="medium"
            />

            {/* Size Guide Button */}
            <TouchableOpacity
              style={styles.sizeGuideButton}
              onPress={() => {
                setShowSizeGuideModal(true);
                analyticsService.trackSizeGuideView(product.id);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="shirt-outline" size={18} color="#00C06A" />
              <ThemedText style={styles.sizeGuideButtonText}>View Size Guide</ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#00C06A" />
            </TouchableOpacity>
          </View>
        )}

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether
          productId={product.id}
          currentProduct={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
          }}
          onAddToCart={async (productIds) => {

            try {
              // Add all selected products to cart
              for (const prodId of productIds) {
                if (prodId === product.id) {
                  // Add current product (already handled by user)
                  await handleAddToCart();
                } else {
                  // For other products in bundle, we'll need to fetch their details and add
                  // For now, just log - full implementation would fetch product details
                  // TODO: Implement bulk add to cart when backend API is ready
                }
              }

              Alert.alert(
                'Added to Cart',
                `${productIds.length} item${productIds.length > 1 ? 's' : ''} added to your cart!`,
                [
                  { text: 'Continue Shopping', style: 'cancel' },
                  { text: 'View Cart', onPress: () => router.push('/CartPage' as Href) },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to add items to cart. Please try again.');
            }
          }}
          limit={3}
        />

        {/* Delivery Information */}
        <DeliveryInformation
          productId={product.id}
          storeId={product.brand}
          productPrice={product.price}
          onPinCodeChange={(pinCode) => {
          }}
        />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Details
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews ({reviews.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <>
            {/* Description */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={styles.description}>{product.description}</ThemedText>
            </View>

            {/* Specifications */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Specifications</ThemedText>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <ThemedText style={styles.specKey}>{key}</ThemedText>
                  <ThemedText style={styles.specValue}>{value}</ThemedText>
                </View>
              ))}
            </View>

            {/* Return Policy */}
            <ReturnPolicyCard
              productId={product.id}
              categoryId={product.category}
              storeId={product.brand}
            />

            {/* Seller Information */}
            <SellerInformation
              storeId={product.brand}
              storeName={product.brand}
              storeRating={4.5}
              storeReviewCount={1234}
              location="India"
              isVerified={true}
              onVisitStore={() => {
                router.push(`/StoreListPage?storeId=${product.brand}` as Href);
              }}
              onViewProducts={() => {
                router.push(`/StoreListPage?storeId=${product.brand}&tab=products` as Href);
              }}
              onContact={() => {
                router.push(`/help/chat?storeId=${product.brand}` as Href);
              }}
            />
          </>
        ) : (
          <View style={styles.reviewsSection}>
            <ProductReviewsSection
              productId={product.id}
              productName={product.name}
              reviews={reviews}
              summary={reviewSummary}
              isLoading={reviewsLoading}
              isRefreshing={reviewsRefreshing}
              hasMore={hasMoreReviews}
              sortBy={sortBy}
              filterRating={filterRating}
              currentUserId="current-user"
              onRefresh={refreshReviews}
              onLoadMore={loadMoreReviews}
              onSortChange={(sortOption: string) => setSortBy(sortOption as Parameters<typeof setSortBy>[0])}
              onFilterChange={(rating: number | null) => setFilterRating(rating as Parameters<typeof setFilterRating>[0])}
              onSubmitReview={submitReview}
              onUpdateReview={updateReview}
              onDeleteReview={deleteReview}
              onMarkHelpful={markHelpful}
            />

            {/* Expert Reviews Section */}
            <View style={styles.section}>
              <ExpertReviews
                productId={product.id}
                reviews={[]} // TODO: Fetch expert reviews from backend
                onMarkHelpful={(reviewId) => {
                  // TODO: Implement API call to mark expert review as helpful
                }}
              />
            </View>

            {/* Customer Photos Section */}
            <View style={styles.section}>
              <CustomerPhotos
                productId={product.id}
                photos={[]} // TODO: Fetch customer photos from backend
                onUploadPhoto={async (photo) => {
                  // TODO: Implement API call to upload customer photo
                }}
                onMarkHelpful={(photoId) => {
                  // TODO: Implement API call to mark photo as helpful
                }}
                enableUpload={true}
              />
            </View>

            {/* Q&A Section */}
            <View style={styles.section}>
              <QASection
                productId={product.id}
                questions={[]} // TODO: Fetch Q&A from backend
                onAskQuestion={async (question) => {
                  // TODO: Implement API call to submit question
                }}
                onAnswerQuestion={async (questionId, answer) => {
                  // TODO: Implement API call to submit answer
                }}
                onMarkHelpful={(questionId, answerId) => {
                  // TODO: Implement API call to mark as helpful
                }}
              />
            </View>
          </View>
        )}

        {/* Product Comparison Section */}
        {comparisonProducts.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Compare Products</ThemedText>
            <ProductComparison
              products={[
                // Current product
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.images[0],
                  rating: product.rating,
                  reviews: product.reviewCount,
                  brand: product.brand,
                  specs: product.specifications,
                  features: product.tags,
                  discount: product.discount,
                },
                // Comparison products
                ...comparisonProducts,
              ]}
              onRemoveProduct={(productId) => {
                if (productId === product.id) {
                  // Can't remove current product, just clear comparison
                  setComparisonProducts([]);
                } else {
                  setComparisonProducts(prev => prev.filter(p => p.id !== productId));
                }
              }}
              onAddToCart={(productId) => {
                if (productId === product.id) {
                  handleAddToCart();
                } else {
                  // TODO: Add other product to cart
                  Alert.alert('Info', 'Adding comparison products to cart will be available soon!');
                }
              }}
              onViewProduct={(productId) => {
                router.push(`/ProductPage?cardId=${productId}&cardType=product` as Href);
              }}
            />
          </View>
        )}

        {/* Related Products Section */}
        <RelatedProductsSection
          productId={product.id}
          title="Similar Products"
          type="similar"
          limit={6}
          onProductPress={(productId) => {
            router.push(`/ProductPage?cardId=${productId}&cardType=product` as Href);
          }}
        />

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <View
          style={styles.quantityContainer}
          accessibilityRole="adjustable"
          accessibilityLabel={`Quantity: ${quantity}`}
        >
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            accessibilityLabel="Decrease quantity"
            accessibilityRole="button"
            accessibilityHint={`Currently ${quantity} items. Double tap to decrease quantity`}
            accessibilityState={{ disabled: quantity <= 1 }}
            disabled={quantity <= 1}
          >
            <Ionicons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <ThemedText
            style={styles.quantityText}
            accessibilityLabel={`${quantity} items`}
          >
            {quantity}
          </ThemedText>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => {
              const maxAvailable = getMaxAvailableQuantity(product!, selectedVariant);
              setQuantity(Math.min(quantity + 1, maxAvailable));
            }}
            accessibilityLabel="Increase quantity"
            accessibilityRole="button"
            accessibilityHint={`Currently ${quantity} items. Double tap to increase quantity`}
            accessibilityState={{
              disabled: quantity >= getMaxAvailableQuantity(product!, selectedVariant)
            }}
            disabled={quantity >= getMaxAvailableQuantity(product!, selectedVariant)}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (isAddingToCart || !availability?.canPurchase) && styles.buttonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={isAddingToCart || !availability?.canPurchase}
            activeOpacity={0.8}
            accessibilityLabel={isAddingToCart
              ? 'Adding to cart'
              : !availability?.canPurchase
                ? 'Product out of stock'
                : `Add ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart for ₹${(product?.price || 0) * quantity}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to add this product to your shopping cart"
            accessibilityState={{ disabled: isAddingToCart || !availability?.canPurchase, busy: isAddingToCart }}
          >
            {isAddingToCart ? (
              <>
                <ActivityIndicator size="small" color="#00C06A" />
                <ThemedText style={styles.addToCartText}>Adding...</ThemedText>
              </>
            ) : (
              <>
                <Ionicons name="cart-outline" size={20} color="#00C06A" />
                <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buyNowButton,
              !availability?.canPurchase && styles.buttonDisabled,
            ]}
            onPress={handleBuyNow}
            disabled={!availability?.canPurchase}
            activeOpacity={0.8}
            accessibilityLabel={!availability?.canPurchase
              ? 'Product out of stock'
              : `Buy now ${quantity} ${quantity === 1 ? 'item' : 'items'} for ₹${(product?.price || 0) * quantity}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to proceed directly to checkout with this product"
            accessibilityState={{ disabled: !availability?.canPurchase }}
          >
            <ThemedText style={styles.buyNowText}>Buy Now</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add to Cart Success Modal */}
      {product && (
        <AddToCartModal
          visible={showAddToCartModal}
          onClose={() => setShowAddToCartModal(false)}
          onViewCart={() => {
            setShowAddToCartModal(false);
            router.push('/CartPage' as Href);
          }}
          productName={product.name}
          productImage={product.images[0]}
          quantity={quantity}
          price={product.price}
          variantDetails={getVariantDetailsString()}
        />
      )}

      {/* Stock Notification Modal */}
      {product && (
        <StockNotificationModal
          visible={showStockNotificationModal}
          onClose={() => setShowStockNotificationModal(false)}
          onSubscribe={handleStockNotification}
          productName={product.name}
          productImage={product.images[0]}
          variantDetails={getVariantDetailsString()}
        />
      )}

      {/* Product Share Modal */}
      {product && (
        <ProductShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          productId={product.id}
          productName={product.name}
          productImage={product.images[0]}
          productPrice={product.price}
          productUrl={`https://app.wasil.com/product/${product.id}`}
          referralCode="WASIL123" // TODO: Get from user's referral code
          onShareComplete={(platform) => {
            analyticsService.trackShare({
              productId: product.id,
              platform,
              referralCode: 'WASIL123',
            });
          }}
        />
      )}

      {/* Size Guide Modal */}
      {product && (
        <SizeGuideModal
          visible={showSizeGuideModal}
          onClose={() => setShowSizeGuideModal(false)}
          category="clothing"
          productName={product.name}
          fitType="regular"
          sizeChart={[
            {
              size: 'XS',
              measurements: { chest: '32-34', waist: '26-28', hips: '34-36', length: '26' },
              conversions: { us: '0-2', uk: '4-6', eu: '32-34', jp: '5-7' },
            },
            {
              size: 'S',
              measurements: { chest: '34-36', waist: '28-30', hips: '36-38', length: '27' },
              conversions: { us: '4-6', uk: '8-10', eu: '36-38', jp: '9-11' },
            },
            {
              size: 'M',
              measurements: { chest: '36-38', waist: '30-32', hips: '38-40', length: '28' },
              conversions: { us: '8-10', uk: '12-14', eu: '40-42', jp: '13-15' },
            },
            {
              size: 'L',
              measurements: { chest: '38-40', waist: '32-34', hips: '40-42', length: '29' },
              conversions: { us: '12-14', uk: '16-18', eu: '44-46', jp: '17-19' },
            },
            {
              size: 'XL',
              measurements: { chest: '40-42', waist: '34-36', hips: '42-44', length: '30' },
              conversions: { us: '16-18', uk: '20-22', eu: '48-50', jp: '21-23' },
            },
          ]}
        />
      )}
    </SafeAreaView>
    </ProductPageErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  coinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC857',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    shadowColor: '#FFC857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  coinText: {
    color: '#0B2240',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    lineHeight: 26,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flexWrap: 'wrap',
  },
  viewStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00C06A',
    marginLeft: 12,
  },
  viewStoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
    marginRight: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  stockBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  notifyMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00C06A',
    gap: 6,
  },
  notifyMeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  sizeGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00C06A',
    marginTop: 16,
    gap: 8,
  },
  sizeGuideButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
    flex: 1,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specKey: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#666',
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00C06A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#00C06A',
    fontWeight: '600',
  },
  
  // Reviews Section
  reviewsSection: {
    backgroundColor: 'white',
    minHeight: 400,
  },
  reviewSystem: {
    backgroundColor: 'transparent',
  },
  
  bottomSpace: {
    height: 100,
  },
  actionBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 16,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#00C06A',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  addToCartText: {
    color: '#00C06A',
    fontWeight: '600',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#00C06A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyNowText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});