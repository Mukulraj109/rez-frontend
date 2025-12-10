import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, View, Modal, TouchableOpacity, Alert, ActivityIndicator, Platform, Dimensions } from 'react-native';
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
import AddedToCartModal from '@/components/cart/AddedToCartModal';
import RelatedProductsSection from '@/components/product/RelatedProductsSection';
import ProductGallerySection from '@/components/product/ProductGallerySection';
import LockPriceModal from '@/components/product/LockPriceModal';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import homepageDataService from '@/services/homepageDataService';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import cartApi from '@/services/cartApi';
import wishlistApi from '@/services/wishlistApi';
import asyncStorageService from '@/services/asyncStorageService';

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
  const [isLocked, setIsLocked] = useState(false);
  const [lockedItemId, setLockedItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [showLockPriceModal, setShowLockPriceModal] = useState(false);
  const fetchedProductIdRef = useRef<string | null>(null);

  // Responsive breakpoints
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;

  // Function to fetch backend data for a product
  const fetchBackendData = async (productId: string) => {
    console.log('🔍 [ProductPage] fetchBackendData called with ID:', productId);
    setIsLoadingBackend(true);
    setError(null);
    try {
      // Import productsApi dynamically to avoid circular dependencies
      const { default: productsApi } = await import('@/services/productsApi');

      // Fetch product details from backend
      console.log('📡 [ProductPage] Calling API: getProductById(' + productId + ')');
      const response = await productsApi.getProductById(productId);

      if (response.success && response.data) {
        const productData = response.data;
        console.log('✅ [ProductPage] Backend returned product:', productData.name || productData.title);
        console.log('💰 [ProductPage] Backend price:', productData.pricing?.selling || productData.price?.current);

        // Update cardData with real backend data using the correct structure
        const productType = (productData as any).productType || 'product';

        // Determine correct price: check if price is a direct number or an object
        const priceField = (productData as any).price;
        const actualPrice = typeof priceField === 'number' ? priceField :
          (priceField?.current || priceField?.selling ||
            (productData as any).pricing?.selling ||
            (productData as any).pricing?.basePrice ||
            0);
        const originalPriceField = (productData as any).originalPrice;
        const actualOriginalPrice = typeof originalPriceField === 'number' ? originalPriceField :
          (originalPriceField?.original ||
            (productData as any).price?.original ||
            (productData as any).pricing?.compare ||
            (productData as any).pricing?.mrp ||
            undefined);
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

        console.log('🔍 [ProductPage] Price resolution:');
        console.log('   - price field type:', typeof priceField);
        console.log('   - price field value:', priceField);
        console.log('   - price.current:', (productData as any).price?.current);
        console.log('   - pricing.selling:', (productData as any).pricing?.selling);
        console.log('   - pricing.basePrice:', (productData as any).pricing?.basePrice);
        console.log('   - Using price:', actualPrice);
        console.log('   - originalPrice field:', originalPriceField);
        console.log('   - Using originalPrice:', actualOriginalPrice);

        console.log('🔍 [ProductPage] Rating resolution:');
        console.log('   - rating.value:', (productData as any).rating?.value);
        console.log('   - ratings.average:', productData.ratings?.average);
        console.log('   - Using rating:', actualRatingValue);
        console.log('   - rating.count:', (productData as any).rating?.count);
        console.log('   - ratings.count:', productData.ratings?.count);
        console.log('   - Using count:', actualReviewCount);

        // Debug: Log store data from backend
        console.log('🏪 [ProductPage] Backend store data:', productData.store);
        console.log('📍 [ProductPage] Backend store.location:', productData.store?.location);

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

        console.log('📦 [ProductPage] updatedCardData.store:', updatedCardData.store);
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
        }).catch(err => console.log('[ProductPage] Error tracking product view:', err));

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
          console.log('✅ [ProductPage] Received cardData for product:', parsedData.id || parsedData.title);
          console.log('📦 [ProductPage] Card price:', parsedData.price, 'Card title:', parsedData.title);

          setCardData(parsedData);
          setIsDynamic(true);
          fetchedProductIdRef.current = params.cardId as string;

          // Also fetch latest backend data in background to ensure freshness
          console.log('🔄 [ProductPage] Fetching backend data for product ID:', params.cardId);
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
        console.log('⚠️ [ProductPage] No cardData passed, fetching from backend for ID:', params.cardId);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isWeb ? styles.webScrollContent : undefined}
      >
        <View style={[
          styles.contentWrapper,
          MAX_CONTENT_WIDTH && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }
        ]}>
          {/* Pass dynamic data to components */}
          <StoreHeader
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />
          <ProductInfo
            dynamicData={isDynamic ? { ...cardData, analytics: productAnalytics } : null}
            cardType={params.cardType as string}
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

          {/* Quantity Selector - Amazon/Flipkart style dropdown */}
          <View style={styles.quantitySelectorContainer}>
            <ThemedText style={styles.quantityLabel}>Quantity:</ThemedText>
            <TouchableOpacity
              style={styles.quantityDropdown}
              onPress={() => setShowQuantityPicker(true)}
            >
              <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
              <Ionicons name="chevron-down" size={16} color="#00C06A" />
            </TouchableOpacity>
          </View>

          {/* Quantity Picker Modal */}
          <Modal
            visible={showQuantityPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowQuantityPicker(false)}
          >
            <TouchableOpacity
              style={styles.quantityModalOverlay}
              activeOpacity={1}
              onPress={() => setShowQuantityPicker(false)}
            >
              <View style={styles.quantityModalContent}>
                <View style={styles.quantityModalHeader}>
                  <ThemedText style={styles.quantityModalTitle}>Select Quantity</ThemedText>
                  <TouchableOpacity onPress={() => setShowQuantityPicker(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.quantityOptionsScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: Math.min(cardData?.stock || cardData?.inventory?.stock || 10, 10) }, (_, i) => (
                    <TouchableOpacity
                      key={i + 1}
                      style={[
                        styles.quantityOption,
                        quantity === i + 1 && styles.quantityOptionSelected
                      ]}
                      onPress={() => {
                        setQuantity(i + 1);
                        setShowQuantityPicker(false);
                      }}
                    >
                      <ThemedText style={[
                        styles.quantityOptionText,
                        quantity === i + 1 && styles.quantityOptionTextSelected
                      ]}>
                        {i + 1}
                      </ThemedText>
                      {quantity === i + 1 && (
                        <Ionicons name="checkmark" size={20} color="#00C06A" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Buy & Lock Buttons - Above Instagram */}
          <StoreActionButtons
            storeType={storeType}
            onBuyPress={handleBuyPress}
            onLockPress={handleLockPress}
            onBookingPress={handleBookingPress}
            customLockText="Lock Price"
            customBookingText="Book Service"
            dynamicData={isDynamic ? cardData : null}
            isLocked={isLocked}
            buttonGroup="buy-lock"
          />

          {/* Instagram Card */}
          <NewSection
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />

          {/* Call, Product, Location Buttons - Below Instagram */}
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
          <Section3
            productPrice={cardData?.price || cardData?.pricing?.selling || 1000}
            storeId={cardData?.storeId || cardData?.store?.id || cardData?.store?._id}
          />
          <Section4
            productPrice={cardData?.price || cardData?.pricing?.selling || 1000}
            storeId={cardData?.storeId || cardData?.store?.id || cardData?.store?._id}
            onPress={() => {
              const storeId = cardData?.storeId || cardData?.store?.id || cardData?.store?._id;
              const storeName = cardData?.store?.name || 'Store';
              const orderValue = cardData?.price || cardData?.pricing?.selling || 1000;
              if (storeId) {
                router.push(`/CardOffersPage?storeId=${storeId}&storeName=${encodeURIComponent(storeName)}&orderValue=${orderValue}`);
              }
            }}
          />
          <Section5
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />
          <Section6
            dynamicData={isDynamic ? cardData : null}
            cardType={params.cardType as string}
          />


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


          {/* Related Products Section */}
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


          {/* Reviews Section */}
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
                showWriteButton={true}
                currentUserId={authState.user?.id}
              />
            )}
          </View>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webScrollContent: {
    paddingBottom: Platform.OS === 'web' ? 40 : 20,
  },
  contentWrapper: {
    flex: 1,
  },
  quantitySelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  quantityDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#00C06A',
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    gap: 8,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C06A',
    minWidth: 20,
    textAlign: 'center',
  },
  quantityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    maxWidth: 300,
    maxHeight: 400,
    overflow: 'hidden',
  },
  quantityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quantityModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  quantityOptionsScroll: {
    maxHeight: 300,
  },
  quantityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quantityOptionSelected: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  quantityOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  quantityOptionTextSelected: {
    color: '#00C06A',
    fontWeight: '600',
  },
  relatedProductsSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 18,
    marginHorizontal: 16,
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
});