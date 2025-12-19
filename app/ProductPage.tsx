import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, View, Modal, TouchableOpacity, Alert, ActivityIndicator, Platform, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import StoreHeader from './StoreSection/StoreHeader';
import ProductInfo from './StoreSection/ProductInfo';
import StoreActionButtons from './StoreSection/StoreActionButtons';
import NewSection from './StoreSection/NewSection';
import Section3 from './StoreSection/Section3';
import Section4 from './StoreSection/Section4';
import Section5 from './StoreSection/Section5';
import Section6 from './StoreSection/Section6';
import CombinedSection78 from './StoreSection/CombinedSection78';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import SimilarProducts from '@/components/products/SimilarProducts';
import FrequentlyBoughtTogether from '@/components/products/FrequentlyBoughtTogether';
import BundleDeals from '@/components/products/BundleDeals';
import useRecommendations from '@/hooks/useRecommendations';
import AddedToCartModal from '@/components/cart/AddedToCartModal';
import RelatedProductsSection from '@/components/product/RelatedProductsSection';
import ProductGallerySection from '@/components/product/ProductGallerySection';
import LockPriceModal from '@/components/product/LockPriceModal';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// NEW COMPONENTS FOR REDESIGNED PRODUCT PAGE
import CompletePurchaseSection from '@/components/product/CompletePurchaseSection';
import PayWithRezSection from '@/components/product/PayWithRezSection';
import DeliveryPickupCards from '@/components/product/DeliveryPickupCards';
import WhyGoodDealSection from '@/components/product/WhyGoodDealSection';
import ProductTabbedSection from '@/components/product/ProductTabbedSection';
import BottomBanner from '@/components/product/BottomBanner';
import ProductStickyBottomBar from '@/components/product/ProductStickyBottomBar';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import homepageDataService from '@/services/homepageDataService';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import cartApi from '@/services/cartApi';
import wishlistApi from '@/services/wishlistApi';
import asyncStorageService from '@/services/asyncStorageService';
import reviewsService from '@/services/reviewsApi';

interface Store {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  ratings?: {
    average?: number;
    count?: number;
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: [number, number]; // [longitude, latitude]
    deliveryRadius?: number;
    landmark?: string;
  };
  operationalInfo?: {
    deliveryTime?: string;
    minimumOrder?: number;
  };
  // Action buttons configuration for ProductPage
  actionButtons?: {
    enabled: boolean;
    buttons: Array<{
      id: 'call' | 'product' | 'location' | 'custom';
      enabled: boolean;
      label?: string;
      destination?: {
        type: 'phone' | 'url' | 'maps' | 'internal';
        value: string;
      };
      order?: number;
    }>;
  };
}

interface ProductAnalytics {
  peopleBoughtToday?: number;
  delivery?: {
    estimated?: string;
  };
  cashback?: {
    percentage?: number;
    amount?: number;
  };
}

interface DynamicCardData {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  images?: string[];
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  merchant?: string;
  type?: string;
  section?: string;
  discount?: number;
  isAvailable?: boolean;
  stock?: number;
  store?: Store;
  storeId?: string;
  selectedVariant?: {
    id?: string;
  };
  pricing?: {
    selling?: number;
    compare?: number;
    discount?: number;
  };
  ratings?: {
    average?: number;
    count?: number;
  };
  inventory?: {
    isAvailable?: boolean;
    stock?: number;
  };
  analytics?: ProductAnalytics;
  availabilityStatus?: string;
  location?: string;
  originalRating?: {
    value?: number;
    count?: number;
  };
  cashback?: {
    percentage?: number;
    maxAmount?: number;
  };
  computedCashback?: {
    amount?: number;
    percentage?: number;
  };
  computedDelivery?: string;
  todayPurchases?: number;
  todayViews?: number;
  deliveryInfo?: {
    estimatedDays?: string;
    standardDeliveryTime?: string;
    expressDeliveryTime?: string;
  };
  productType?: 'product' | 'service';
}

export default function StorePage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { state: authState } = useAuth();
  const { state: cartState, refreshCart } = useCart();
  const [cardData, setCardData] = useState<DynamicCardData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);
  const [backendData, setBackendData] = useState<DynamicCardData | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAddedToCartModal, setShowAddedToCartModal] = useState(false);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedItemId, setLockedItemId] = useState<string | null>(null);
  const [quantity] = useState(1); // Default quantity for lock
  const [showLockPriceModal, setShowLockPriceModal] = useState(false);
  const fetchedProductIdRef = useRef<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lockSectionYRef = useRef<number>(0);

  // Responsive breakpoints
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;

  // Computed values for new sections
  const productPrice = cardData?.price || cardData?.pricing?.selling || 0;
  const originalPrice = cardData?.originalPrice || cardData?.pricing?.compare || productPrice;
  const discountPercentage = cardData?.discount || cardData?.pricing?.discount ||
    (originalPrice > productPrice ? Math.round((1 - productPrice / originalPrice) * 100) : 0);
  const earnableCoins = Math.floor(productPrice * 0.1);
  const cashbackAmount = cardData?.computedCashback?.amount || cardData?.cashback?.maxAmount || Math.floor(productPrice * 0.05);
  const savingsAmount = originalPrice > productPrice ? originalPrice - productPrice : 0;

  // Get product ID for recommendations
  const productId = cardData?.id || cardData?._id || (params.cardId as string);

  // Fetch recommendations for Similar Products, Frequently Bought Together, and Bundle Deals
  const {
    similar,
    frequentlyBought,
    bundles,
    loading: recommendationsLoading
  } = useRecommendations({
    productId: productId || '',
    autoFetch: !!productId,
    trackView: false  // Disable view tracking to prevent infinite API calls
  });

  // Function to fetch backend data for a product
  const fetchBackendData = async (productId: string) => {
        setIsLoadingBackend(true);
    setError(null);
    try {
      // Import productsApi dynamically to avoid circular dependencies
      const { default: productsApi } = await import('@/services/productsApi');

      // Fetch product details from backend
      const response = await productsApi.getProductById(productId);

      if (response.success && response.data) {
        const productData = response.data;

        // Update cardData with real backend data using the correct structure
        const productType = (productData as any).productType || 'product';

        // Determine correct price: check if price is a direct number or an object
        const priceField = (productData as any).price;
        const actualPrice = typeof priceField === 'number' ? priceField :
          (priceField?.current || priceField?.selling ||
            (productData as any).pricing?.selling ||
            (productData as any).pricing?.basePrice ||
            0);
        // Get original price - check unified price object first, then raw pricing
        const unifiedPriceOriginal = (productData as any).price?.original;
        const originalPriceField = (productData as any).originalPrice;
        const actualOriginalPrice =
          unifiedPriceOriginal ||
          (typeof originalPriceField === 'number' ? originalPriceField : null) ||
          originalPriceField?.original ||
          (productData as any).pricing?.original ||
          (productData as any).pricing?.compare ||
          (productData as any).pricing?.mrp ||
          undefined;
        const actualDiscount = (productData as any).discount ||
          (productData as any).price?.discount ||
          (productData as any).pricing?.discount ||
          0;

        // Determine correct rating: prioritize rating.value over ratings.average if rating object exists
        const actualRatingValue = (productData as any).rating?.value ||
          productData.ratings?.average ||
          0;
        const actualReviewCount = (productData as any).rating?.count ||
          productData.ratings?.count ||
          0;

        const updatedCardData: DynamicCardData = {
          id: (productData as any)._id || productData.id,
          _id: (productData as any)._id,
          title: productData.name || (productData as any).title,
          name: productData.name,
          description: productData.description,
          price: actualPrice,
          originalPrice: actualOriginalPrice,
          rating: actualRatingValue,
          reviewCount: actualReviewCount,
          ratings: productData.ratings, // Full ratings object
          category: (productData.category as any)?.name || (productData.category as any) || 'General',
          merchant: productData.store?.name || (productData as any).merchant || 'Store',
          image: (productData.images?.[0] as any)?.url || (productData as any).image,
          images: (productData.images as any)?.map((img: any) => img.url || img) || [],
          discount: actualDiscount,
          isAvailable: (productData as any).inventory?.isAvailable || (productData as any).availabilityStatus === 'in_stock',
          availabilityStatus: (productData as any).inventory?.isAvailable ? 'in_stock' : 'out_of_stock',
          stock: (productData as any).inventory?.stock || 0,
          productType: productType, // 'product' or 'service'
          pricing: (productData as any).pricing,
          inventory: (productData as any).inventory,
          // Add full store data for navigation to MainStorePage
          store: productData.store as any,
          storeId: (productData.store as any)?._id || productData.store?.id,
          // Add computed fields from backend
          computedCashback: (productData as any).computedCashback,
          computedDelivery: (productData as any).computedDelivery,
          todayPurchases: (productData as any).todayPurchases,
          todayViews: (productData as any).todayViews,
          cashback: (productData as any).cashback,
          deliveryInfo: (productData as any).deliveryInfo,
        };

        setCardData(updatedCardData);

        setBackendData(productData as any);

        // Track this product as recently viewed
        asyncStorageService.addRecentlyViewedProduct({
          _id: updatedCardData.id || updatedCardData._id,
          name: updatedCardData.name,
          title: updatedCardData.title,
          image: updatedCardData.image,
          images: updatedCardData.images,
          price: updatedCardData.price ? {
            current: updatedCardData.price,
            original: updatedCardData.originalPrice,
          } : undefined,
          rating: {
            value: updatedCardData.rating || 0,
            count: updatedCardData.reviewCount || 0,
          },
          cashback: updatedCardData.cashback,
        }).catch(() => {});

        // Fetch product analytics and track view
        try {
          // Track product view
          await productsApi.trackProductView(productId);

          // Get analytics data
          const analyticsResponse = await productsApi.getProductAnalytics(productId);
          if (analyticsResponse.success && analyticsResponse.data) {
            setProductAnalytics(analyticsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching analytics:', error);
        }

        // Check if product is already locked
        try {
          const lockedResponse = await cartApi.getLockedItems();
          if (lockedResponse.success && lockedResponse.data) {
            const lockedItem = lockedResponse.data.lockedItems.find(
              (item: any) => item.product?._id === productId || item.product?.id === productId
            );
            if (lockedItem) {
              setIsLocked(true);
              setLockedItemId(lockedItem._id || lockedItem.product?._id);
            } else {
              setIsLocked(false);
              setLockedItemId(null);
            }
          }
        } catch (error) {
          console.error('Error checking locked status:', error);
        }
      } else {
        console.error('Failed to fetch product data:', response.message);
        setError(response.message || 'Failed to load product');
      }
    } catch (error) {
      console.error('Error fetching backend data:', error);
      setError('Unable to load product. Please try again.');
    } finally {
      setIsLoadingBackend(false);
    }
  };

  const retryFetch = () => {
    const productId = params.cardId as string;
    if (productId) {
      fetchBackendData(productId);
    }
  };

  // Check if product is locked (call this when page comes into focus)
  const checkLockStatus = useCallback(async () => {
    const productId = cardData?.id || cardData?._id || params.cardId;
    if (!productId) return;

    try {
      const lockedResponse = await cartApi.getLockedItems();

      if (lockedResponse.success && lockedResponse.data) {
        const lockedItem = lockedResponse.data.lockedItems.find(
          (item: any) => item.product?._id === productId || item.product?.id === productId
        );
        if (lockedItem) {
          setIsLocked(true);
          setLockedItemId(lockedItem._id || lockedItem.product?._id);
        } else {
          setIsLocked(false);
          setLockedItemId(null);
        }
      }
    } catch (error) {
      console.error('Error checking locked status:', error);
    }
  }, [cardData?.id, cardData?._id, params.cardId]);

  // Refresh lock status when page comes into focus
  useFocusEffect(
    useCallback(() => {
      checkLockStatus();
    }, [checkLockStatus])
  );

  // Parse dynamic card data from navigation params
  useEffect(() => {
    // Only process if we have the required params and haven't already processed this cardId
    if (params.cardId && params.cardType && fetchedProductIdRef.current !== params.cardId) {

      // Check if we have cardData passed from navigation
      if (params.cardData) {
        try {
          // Parse and use the passed card data immediately for fast display
          const parsedData = JSON.parse(params.cardData as string);
          setCardData(parsedData);
          setIsDynamic(true);
          fetchedProductIdRef.current = params.cardId as string;

          // Also fetch latest backend data in background to ensure freshness
          fetchBackendData(params.cardId as string);
        } catch (error) {
          console.error('❌ [ProductPage] Failed to parse card data:', error);

          // Fallback: Create basic card data and fetch from backend
          const cardDataFromParams: DynamicCardData = {
            id: params.cardId as string,
            title: 'Product Details',
            description: 'Loading product information...',
            category: params.category as string || 'general',
            type: params.cardType as string
          };

          setCardData(cardDataFromParams);
          setIsDynamic(true);
          fetchedProductIdRef.current = params.cardId as string;
          fetchBackendData(params.cardId as string);
        }
      } else {
        // No cardData passed - fetch from backend only
        const cardDataFromParams: DynamicCardData = {
          id: params.cardId as string,
          title: 'Product Details',
          description: 'Loading product information...',
          category: params.category as string || 'general',
          type: params.cardType as string
        };

        setCardData(cardDataFromParams);
        setIsDynamic(true);
        fetchedProductIdRef.current = params.cardId as string;
        fetchBackendData(params.cardId as string);
      }
    } else {
      setIsDynamic(false);
    }
  }, [params.cardId, params.cardType, params.category, params.cardData]);

  // Fetch reviews for the store
  useEffect(() => {
    const fetchStoreReviews = async () => {
      const storeId = cardData?.storeId || cardData?.store?.id || cardData?.store?._id;
      if (!storeId) return;

      setReviewsLoading(true);
      try {
        // Fetch reviews from API
        const response = await reviewsService.getTargetReviews('store', storeId, {
          limit: 5,
          sortBy: 'newest'
        });

        if (response.data?.reviews) {
          // Transform reviews to match the ProductTabbedSection format
          const formattedReviews = response.data.reviews.map((review: any) => ({
            id: review.id || review._id,
            userName: review.user?.name || review.userName || 'Anonymous',
            userAvatar: review.user?.avatar,
            rating: review.rating || 5,
            date: formatReviewDate(review.createdAt),
            text: review.content || review.comment || review.text || '',
            cashbackEarned: review.metadata?.cashbackEarned || Math.floor(Math.random() * 100) + 50
          }));
          setStoreReviews(formattedReviews);
        }
      } catch (err) {
        console.log('Failed to fetch reviews:', err);
        // Keep empty array - component will show default reviews
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchStoreReviews();
  }, [cardData?.storeId, cardData?.store?.id, cardData?.store?._id]);

  // Helper function to format review date
  const formatReviewDate = (dateString: string): string => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  // Determine store type from backend productType (defaults to PRODUCT)
  const storeType = cardData?.productType === 'service' ? 'SERVICE' : 'PRODUCT';

  // ============================================
  // PRODUCTION-READY BUTTON HANDLERS
  // ============================================

  const handleBuyPress = async () => {
    try {
      if (!cardData?.id && !cardData?._id) {
        showAlert('Error', 'Product information not available', [{ text: 'OK' }], 'error');
        return;
      }

      const productId = cardData.id || cardData._id;

      // Add to cart via API with selected quantity
      const cartResponse = await cartApi.addToCart({
        productId: productId!,
        quantity: quantity,
        variant: cardData.selectedVariant as any
      });

      if (cartResponse.success) {
        // Refresh cart context to update cart badge/count
        await refreshCart();
        // Show the added to cart modal
        setShowAddedToCartModal(true);
      } else {
        showAlert('Error', cartResponse.message || 'Failed to add to cart', [{ text: 'OK' }], 'error');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      showAlert('Error', 'Unable to add to cart. Please try again.', [{ text: 'OK' }], 'error');
    }
  };

  const handleLockPress = async () => {
    // Open the paid lock modal instead of directly locking
    if (!cardData?.id && !cardData?._id) {
      showAlert('Error', 'Product information not available', [{ text: 'OK' }], 'error');
      return;
    }

    // Open the LockPriceModal for paid lock (MakeMyTrip style)
    setShowLockPriceModal(true);
  };

  // Handle successful lock with payment
  const handleLockSuccess = async (lockDetails: {
    lockFee: number;
    duration: number;
    expiresAt: string;
    message: string;
  }) => {
    // Refresh cart context to update locked items count
    await refreshCart();

    // Update lock state
    setIsLocked(true);
    setLockedItemId(cardData?.id || cardData?._id || null);

    // Show success alert using cross-platform modal
    showAlert(
      'Price Locked!',
      lockDetails.message,
      [
        { text: 'OK', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/CartPage') }
      ],
      'success'
    );
  };

  // Handle Lock Now button from sticky bottom bar
  const handleStickyLockPress = () => {
    // Scroll to the lock section
    if (scrollViewRef.current && lockSectionYRef.current > 0) {
      scrollViewRef.current.scrollTo({
        y: lockSectionYRef.current - 100, // Offset for header
        animated: true,
      });
    }
  };

  const handleBookingPress = async () => {
    try {
      if (!cardData?.store?.id && !cardData?.store?._id) {
        showAlert('Error', 'Store information not available', [{ text: 'OK' }], 'error');
        return;
      }

      // Navigate to booking page
      router.push({
        pathname: '/booking',
        params: {
          productId: cardData.id || cardData._id,
          storeId: cardData.store.id || cardData.store._id,
          productName: cardData.title || cardData.name,
          storeName: cardData.store.name
        }
      } as any);
    } catch (error) {
      console.error('Booking error:', error);
      showAlert('Error', 'Unable to open booking. Please try again.', [{ text: 'OK' }], 'error');
    }
  };

  // Content max width for web
  const MAX_CONTENT_WIDTH = isDesktop ? 1200 : undefined;

  return (
    <ThemedView style={styles.container}>
      {/* Sticky Header - Outside ScrollView */}
      <View style={styles.stickyHeader}>
        <StoreHeader
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
          isInStore={cardData?.availabilityStatus === 'in_stock' || cardData?.isAvailable}
          showImage={false}
          showHeaderBar={true}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          isWeb ? styles.webScrollContent : undefined,
          {
            paddingBottom: 100, // Space for sticky bottom bar
            paddingTop: Platform.OS === 'ios' ? 120 : 75, // Space for sticky header
          },
        ]}
      >
        <View style={[
          styles.contentWrapper,
          MAX_CONTENT_WIDTH && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }
        ]}>
          {/* 1. Product Image Section */}
          <StoreHeader
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
            isInStore={cardData?.availabilityStatus === 'in_stock' || cardData?.isAvailable}
            showImage={true}
            showHeaderBar={false}
          />

          {/* 2. Product Info with Brand & Category */}
          <ProductInfo
            dynamicData={isDynamic ? { ...cardData, analytics: productAnalytics } : null}
            cardType={params.cardType as string}
            quantity={quantity}
            isLocked={isLocked}
            onLockSuccess={handleLockSuccess}
          />

          {/* Loading indicator when fetching backend data */}
          {isLoadingBackend && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00C06A" />
              <ThemedText style={styles.loadingText}>Loading product details...</ThemedText>
            </View>
          )}

          {/* Error state with retry */}
          {error && !isLoadingBackend && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <ThemedText style={styles.errorTitle}>Oops! Something went wrong</ThemedText>
              <ThemedText style={styles.errorMessage}>{error}</ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={retryFetch} activeOpacity={0.8}>
                <Ionicons name="refresh-outline" size={20} color="#fff" />
                <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* ========== NEW REDESIGNED SECTIONS ========== */}

          
          {/* Locked Product Badge (when already locked) */}
          {isLocked && (
            <View style={styles.lockedBadgeContainer}>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={20} color="#10B981" />
                <ThemedText style={styles.lockedBadgeText}>Price Locked</ThemedText>
              </View>
              <ThemedText style={styles.lockedSubtext}>
                This product is reserved for you. Complete your purchase before the lock expires.
              </ThemedText>
              <TouchableOpacity
                style={styles.viewCartButton}
                onPress={() => router.push('/CartPage')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.viewCartButtonText}>View in Cart</ThemedText>
                <Ionicons name="arrow-forward" size={16} color="#00C06A" />
              </TouchableOpacity>
            </View>
          )}

          {/* 8. Complete Purchase Section */}
          {!isLoadingBackend && cardData && (
            <CompletePurchaseSection
              storeInfo={{
                name: cardData.store?.name || 'Store',
                location: cardData.store?.location?.address ||
                  `${cardData.store?.location?.city || ''}, ${cardData.store?.location?.state || ''}`.trim() ||
                  'Location available at store',
                hours: '9 AM - 9 PM',
              }}
              deliveryFee={49}
              onVisitStore={() => {
                const storeId = cardData?.store?._id || cardData?.store?.id || cardData?.storeId;
                if (storeId) {
                  router.push(`/MainStorePage?storeId=${storeId}` as any);
                }
              }}
              onBuyOnline={handleBuyPress}
              isLocked={isLocked}
            />
          )}

          {/* 9. Pay with ReZ Section */}
          {!isLoadingBackend && cardData && productPrice > 0 && (
            <PayWithRezSection
              productPrice={productPrice}
              earnableCoins={earnableCoins}
            />
          )}

          {/* 10. Delivery & Pickup Cards */}
          {!isLoadingBackend && cardData && (
            <DeliveryPickupCards />
          )}

          {/* 11. Why This is a Good Deal */}
          {!isLoadingBackend && cardData && (
            <WhyGoodDealSection
              savingsAmount={savingsAmount}
              insights={[
                {
                  icon: 'bulb',
                  iconColor: '#F59E0B',
                  text: savingsAmount > 0
                    ? `This product is usually bought on weekends — locking now saves ₹${savingsAmount}`
                    : 'Lock the price now to avoid future price increases',
                },
                {
                  icon: 'flame',
                  iconColor: '#EF4444',
                  text: 'High demand item — price may change later',
                },
                {
                  icon: 'gift',
                  iconColor: '#00C06A',
                  text: `Earn ${earnableCoins} ReZ coins + ₹${cashbackAmount} cashback on this purchase`,
                },
              ]}
            />
          )}

          {/* 12. Product Tabbed Section (Description/Specs/Reviews/Lock Info) */}
          {!isLoadingBackend && cardData && (
            <ProductTabbedSection
              description={cardData.description || 'No description available for this product.'}
              features={cardData.features || []}
              specifications={[
                { key: 'Category', value: cardData.category || 'N/A' },
                { key: 'Store', value: cardData.store?.name || cardData.merchant || 'N/A' },
                { key: 'Availability', value: cardData.isAvailable ? 'In Stock' : 'Out of Stock' },
                { key: 'Delivery Time', value: cardData.store?.operationalInfo?.deliveryTime || '30-45 mins' },
                { key: 'Minimum Order', value: cardData.store?.operationalInfo?.minimumOrder ? `₹${cardData.store.operationalInfo.minimumOrder}` : 'N/A' },
                { key: 'Cashback', value: `Up to ${cardData.store?.offers?.cashback || 5}%` },
                { key: 'ReZ Coins', value: '10% of purchase' },
                { key: 'Lock Duration', value: 'Up to 48 hours' },
              ].filter(spec => spec.value !== 'N/A')}
              reviews={storeReviews}
              averageRating={cardData.ratings?.average || cardData.rating?.value || 0}
              reviewCount={cardData.ratings?.count || cardData.rating?.count || 0}
              lockDetails={{
                isLocked: isLocked,
              }}
              onViewAllReviews={() => {
                const storeId = cardData?.storeId || cardData?.store?.id || cardData?.store?._id;
                if (storeId) {
                  router.push(`/reviews/${storeId}`);
                }
              }}
            />
          )}

          {/* Similar Products Section */}
          <SimilarProducts
            similarProducts={similar}
            loading={recommendationsLoading}
            onProductPress={(prodId) => {
              router.push({
                pathname: '/ProductPage',
                params: { cardId: prodId, cardType: 'product' }
              } as any);
            }}
          />

          {/* Frequently Bought Together Section - uses bundles as fallback if frequentlyBought is empty */}
          <FrequentlyBoughtTogether
            bundles={frequentlyBought.length > 0 ? frequentlyBought : bundles}
            loading={recommendationsLoading}
            onAddToCart={(products) => {
              // TODO: Implement bundle add to cart
            }}
            onProductPress={(prodId) => {
              router.push({
                pathname: '/ProductPage',
                params: { cardId: prodId, cardType: 'product' }
              } as any);
            }}
          />

          {/* Bundle Deals Section */}
          <BundleDeals
            bundles={bundles}
            loading={recommendationsLoading}
            onAddToCart={(products) => {
              // TODO: Implement bundle add to cart
            }}
            onProductPress={(prodId) => {
              router.push({
                pathname: '/ProductPage',
                params: { cardId: prodId, cardType: 'product' }
              } as any);
            }}
          />

          {/* 13. Write a Review Card */}
          {!isLoadingBackend && cardData && (
            <TouchableOpacity
              style={styles.writeReviewCard}
              onPress={() => setShowReviewForm(true)}
              activeOpacity={0.8}
            >
              <View style={styles.writeReviewContent}>
                <View style={styles.writeReviewIcon}>
                  <Ionicons name="create-outline" size={20} color="#00C06A" />
                </View>
                <View style={styles.writeReviewText}>
                  <ThemedText style={styles.writeReviewTitle}>Write a review</ThemedText>
                  <ThemedText style={styles.writeReviewSubtitle}>
                    Earn {cashbackAmount > 0 ? `₹${cashbackAmount}` : '5%'} cashback instantly
                  </ThemedText>
                </View>
              </View>
              <View style={styles.writeReviewBadge}>
                <Ionicons name="gift-outline" size={16} color="#10B981" />
                <ThemedText style={styles.writeReviewBadgeText}>
                  ₹{cashbackAmount || Math.floor(productPrice * 0.05)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}

          {/* 14. Customer Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsSectionHeader}>
              <ThemedText style={styles.reviewsSectionTitle}>
                Customer Reviews
              </ThemedText>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => {
                  const storeId = cardData?.storeId || cardData?.store?.id || cardData?.store?._id;
                  if (storeId) {
                    router.push(`/reviews/${storeId}`);
                  }
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.seeAllText}>See All</ThemedText>
                <Ionicons name="chevron-forward" size={16} color="#00C06A" />
              </TouchableOpacity>
            </View>

            {(cardData?.storeId || cardData?.store?.id || cardData?.store?._id) && (
              <ReviewList
                storeId={cardData.storeId || cardData.store!.id || cardData.store!._id!}
                onWriteReviewPress={() => setShowReviewForm(true)}
                showWriteButton={false}
                currentUserId={authState.user?.id}
              />
            )}
          </View>

          {/* 14. Related Products (You May Also Like) */}
          {isDynamic && cardData && (cardData.id || cardData._id) && (
            <View style={styles.relatedProductsSection}>
              <ErrorBoundary
                fallback={
                  <View style={styles.errorFallback}>
                    <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
                    <ThemedText style={styles.errorText}>
                      Unable to load recommendations
                    </ThemedText>
                  </View>
                }
              >
                <RelatedProductsSection
                  productId={cardData.id || cardData._id!}
                  title="You May Also Like"
                  type="similar"
                  limit={6}
                  onProductPress={(productId) => {
                    router.push({
                      pathname: '/ProductPage',
                      params: { cardId: productId, cardType: 'product' }
                    } as any);
                  }}
                />
              </ErrorBoundary>
            </View>
          )}

          {/* ========== EXISTING SECTIONS (Moved to Bottom) ========== */}

          {/* 15. Instagram Card */}
          <NewSection
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />

          {/* 16. Mega Sale Offers */}
          <Section3
            productPrice={productPrice || 1000}
            storeId={cardData?.storeId || cardData?.store?.id || cardData?.store?._id}
          />

          {/* 17. Card Offers */}
          <Section4
            productPrice={productPrice || 1000}
            storeId={cardData?.storeId || cardData?.store?.id || cardData?.store?._id}
            onPress={() => {
              const storeId = cardData?.storeId || cardData?.store?.id || cardData?.store?._id;
              const storeName = cardData?.store?.name || 'Store';
              if (storeId) {
                router.push(`/CardOffersPage?storeId=${storeId}&storeName=${encodeURIComponent(storeName)}&orderValue=${productPrice}`);
              }
            }}
          />

          {/* 18. Store Action Buttons */}
          <StoreActionButtons
            storeType={storeType}
            storeActionConfig={cardData?.store?.actionButtons}
            storeData={{
              storeId: cardData?.store?._id || cardData?.store?.id || cardData?.storeId,
              storeName: cardData?.store?.name,
              phone: cardData?.store?.phone || cardData?.store?.contact?.phone,
              location: cardData?.store?.location,
              name: cardData?.store?.name,
            }}
            dynamicData={isDynamic ? cardData : null}
            buttonGroup="store-actions"
          />

          {/* 19. Section 5 */}
          <Section5
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />

          {/* 20. Section 6 */}
          <Section6
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />

          {/* 21. Combined Section 7 & 8 */}
          <CombinedSection78
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />

          {/* Product Gallery Section */}
          {isDynamic && cardData && (cardData.id || cardData._id) && (
            <ProductGallerySection
              productId={cardData.id || cardData._id!}
              variantId={cardData.selectedVariant?.id}
            />
          )}

          {/* 22. Bottom Banner */}
          <BottomBanner />
        </View>
      </ScrollView>

      {/* Review Form Modal */}
      <Modal
        visible={showReviewForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Write a Review</ThemedText>
            <TouchableOpacity
              onPress={() => setShowReviewForm(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>

          {(cardData?.storeId || cardData?.store?.id || cardData?.store?._id) && (
            <ReviewForm
              storeId={cardData.storeId || cardData.store!.id || cardData.store!._id!}
              onSubmit={(review) => {
                setShowReviewForm(false);
                // Optionally reload reviews or update UI
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </View>
      </Modal>

      {/* Added to Cart Modal */}
      {cardData && (
        <AddedToCartModal
          visible={showAddedToCartModal}
          onClose={() => setShowAddedToCartModal(false)}
          onViewCart={() => router.push('/CartPage')}
          product={{
            id: cardData.id || cardData._id || '',
            name: cardData.title || cardData.name || '',
            image: cardData.image || cardData.images?.[0] || '',
            price: cardData.price || 0,
            quantity: 1,
          }}
          cartItemCount={cartState.items.length}
          cartTotal={(cartState as any).total || 0}
        />
      )}

      {/* Lock Price Modal (MakeMyTrip style) */}
      {cardData && (
        <LockPriceModal
          visible={showLockPriceModal}
          onClose={() => setShowLockPriceModal(false)}
          productId={cardData.id || cardData._id || ''}
          productName={cardData.title || cardData.name || ''}
          productPrice={cardData.price || cardData.pricing?.selling || 0}
          quantity={quantity}
          variant={cardData.selectedVariant as any}
          onLockSuccess={handleLockSuccess}
        />
      )}

      {/* Sticky Bottom Bar with Price and Lock Now Button */}
      {cardData && productPrice > 0 && (
        <ProductStickyBottomBar
          price={productPrice}
          originalPrice={originalPrice}
          isLocked={isLocked}
          onLockPress={handleStickyLockPress}
          onAddToCart={handleBuyPress}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
  },
  webScrollContent: {
    paddingBottom: Platform.OS === 'web' ? 40 : 20,
  },
  contentWrapper: {
    flex: 1,
  },
  relatedProductsSection: {
    marginTop: 32,
    marginBottom: 24,
    marginHorizontal: 0,
    backgroundColor: '#FFFFFF',
  },
  reviewsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  reviewsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#00C06A',
    fontWeight: '600',
  },
  // Write Review Card styles (ReZ brand colors: green #00C06A, golden #F59E0B)
  writeReviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  writeReviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  writeReviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  writeReviewText: {
    flex: 1,
  },
  writeReviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  writeReviewSubtitle: {
    fontSize: 13,
    color: '#00C06A',
    fontWeight: '500',
  },
  writeReviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  writeReviewBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorFallback: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  // Locked Product Badge Styles
  lockedBadgeContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 12,
  },
  lockedBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockedSubtext: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00C06A',
    gap: 8,
  },
  viewCartButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00C06A',
  },
});