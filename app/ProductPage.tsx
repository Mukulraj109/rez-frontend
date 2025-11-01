import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, View, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import StoreHeader from './StoreSection/StoreHeader';
import ProductInfo from './StoreSection/ProductInfo';
import StoreActionButtons from './StoreSection/StoreActionButtons';
import NewSection from './StoreSection/NewSection';
import Section1 from './StoreSection/Section1';
import Section2 from './StoreSection/Section2';
import Section3 from './StoreSection/Section3';
import Section4 from './StoreSection/Section4';
import Section5 from './StoreSection/Section5';
import Section6 from './StoreSection/Section6';
import CombinedSection78 from './StoreSection/CombinedSection78';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import AddedToCartModal from '@/components/cart/AddedToCartModal';
import homepageDataService from '@/services/homepageDataService';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import cartApi from '@/services/cartApi';
import wishlistApi from '@/services/wishlistApi';

interface Store {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  contact?: string;
  ratings?: {
    average?: number;
    count?: number;
  };
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  operationalInfo?: {
    deliveryTime?: string;
    minimumOrder?: number;
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
  const { state: cartState } = useCart();
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
  const fetchedProductIdRef = useRef<string | null>(null);

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

        const updatedCardData: DynamicCardData = {
          id: (productData as any)._id || productData.id,
          _id: (productData as any)._id,
          title: productData.name || (productData as any).title,
          name: productData.name,
          description: productData.description,
          price: (productData as any).pricing?.selling || (productData as any).price?.current || 0,
          originalPrice: (productData as any).pricing?.compare || (productData as any).price?.original,
          rating: productData.ratings?.average || (productData as any).rating?.value || 0,
          reviewCount: productData.ratings?.count || (productData as any).rating?.count || 0,
          ratings: productData.ratings, // Full ratings object
          category: (productData.category as any)?.name || (productData.category as any) || 'General',
          merchant: productData.store?.name || (productData as any).merchant || 'Store',
          image: (productData.images?.[0] as any)?.url || (productData as any).image,
          images: (productData.images as any)?.map((img: any) => img.url || img) || [],
          discount: (productData as any).pricing?.discount || (productData as any).price?.discount || 0,
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
      // Create card data from URL parameters
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

      // Fetch backend data for the product
      fetchBackendData(params.cardId as string);
    } else if (params.cardData && params.cardId && params.cardType) {
      try {
        const parsedData = JSON.parse(params.cardData as string);
        setCardData(parsedData);
        setIsDynamic(true);
      } catch (error) {
        console.error('Failed to parse card data:', error);
        setIsDynamic(false);
      }
    } else {
      setIsDynamic(false);
    }
  }, [params.cardId, params.cardType, params.category]);

  // Determine store type from backend productType (defaults to PRODUCT)
  const storeType = cardData?.productType === 'service' ? 'SERVICE' : 'PRODUCT';

  // ============================================
  // PRODUCTION-READY BUTTON HANDLERS
  // ============================================

  const handleBuyPress = async () => {
    try {
      if (!cardData?.id && !cardData?._id) {
        Alert.alert('Error', 'Product information not available');
        return;
      }

      const productId = cardData.id || cardData._id;

      // Add to cart via API
      const cartResponse = await cartApi.addToCart({
        productId: productId!,
        quantity: 1,
        variant: cardData.selectedVariant as any
      });

      if (cartResponse.success) {
        // Show the added to cart modal
        setShowAddedToCartModal(true);
      } else {
        Alert.alert('Error', cartResponse.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Unable to add to cart. Please try again.');
    }
  };

  const handleLockPress = async () => {
    try {
      if (!cardData?.id && !cardData?._id) {
        Alert.alert('Error', 'Product information not available');
        return;
      }

      const productId = cardData.id || cardData._id;

      // Lock price - lock item in cart at current price
      const response = await cartApi.lockItem({
        productId: productId!,
        quantity: 1,
        variant: cardData.selectedVariant as any,
        lockDurationHours: 24
      });

      if (response.success) {
        // Find the locked item ID from the response
        const lockedItem = response.data?.cart?.lockedItems?.find(
          (item: any) => item.product?._id === productId || item.product === productId
        );
        const actualLockedItemId = lockedItem?._id;

        // Update lock state
        setIsLocked(true);
        setLockedItemId(actualLockedItemId || productId || null);

        Alert.alert(
          'Price Locked!',
          `Price locked at ₹${cardData.price || cardData.pricing?.selling} for 24 hours. Check your cart's locked section to purchase later.`,
          [
            { text: 'OK', style: 'cancel' },
            { text: 'View Cart', onPress: () => router.push('/CartPage') }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to lock price');
      }
    } catch (error) {
      console.error('Lock error:', error);
      Alert.alert('Error', 'Unable to lock price. Please try again.');
    }
  };

  const handleBookingPress = async () => {
    try {
      if (!cardData?.store?.id && !cardData?.store?._id) {
        Alert.alert('Error', 'Store information not available');
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
      Alert.alert('Error', 'Unable to open booking. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <ActivityIndicator size="large" color="#8B5CF6" />
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
        
        {/* Store Action Buttons */}
        <StoreActionButtons
          storeType={storeType}
          onBuyPress={handleBuyPress}
          onLockPress={handleLockPress}
          onBookingPress={handleBookingPress}
          customLockText="Lock Price"
          customBookingText="Book Service"
          dynamicData={isDynamic ? cardData : null}
          isLocked={isLocked}
        />

        <NewSection
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section1 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section2 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section3
          productPrice={cardData?.price || cardData?.pricing?.selling || 1000}
          storeId={cardData?.storeId || cardData?.store?.id || cardData?.store?._id}
        />
        <Section4
          productPrice={cardData?.price || cardData?.pricing?.selling || 1000}
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
                  router.push(`/store/${storeId}/reviews` as any);
                }
              }}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});