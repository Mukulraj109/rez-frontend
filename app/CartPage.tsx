import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ supports 'edges'

import { useRouter, useFocusEffect } from 'expo-router';
import CartHeader from '@/components/cart/CartHeader';
import SlidingTabs from '@/components/cart/SlidingTabs';
import CartItem from '@/components/cart/CartItem';
import LockedItem from '@/components/cart/LockedItem';
import PriceSection from '@/components/cart/PriceSection';
import CartValidation from '@/components/cart/CartValidation';
import StockWarningBanner from '@/components/cart/StockWarningBanner';
import CardOffersSection from '@/components/cart/CardOffersSection';
import { ThemedText } from '@/components/ThemedText';
import { CartItem as CartItemType, LockedProduct, LOCK_CONFIG } from '@/types/cart';
import {
  mockServicesData,
  mockLockedProductsData,
  calculateTotal,
  getItemCount,
  calculateLockedTotal,
  getLockedItemCount,
  updateLockedProductTimers,
} from '@/utils/mockCartData';
import { useCart } from '@/contexts/CartContext';
import { useCartValidation } from '@/hooks/useCartValidation';
import cartApi from '@/services/cartApi';

export default function CartPage() {
  const router = useRouter();
  const { state: cartState, actions: cartActions } = useCart();
  const [activeTab, setActiveTab] = useState<'products' | 'service' | 'lockedproduct'>('products');
  const [serviceItems, setServiceItems] = useState<CartItemType[]>([]); // Empty - services should come from backend too
  const [lockedProducts, setLockedProducts] = useState<LockedProduct[]>([]);

  // Cart validation state
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

  // Use cart validation hook
  const {
    validationState,
    hasInvalidItems,
    canCheckout,
    invalidItemCount,
    warningCount,
    errorCount,
    validateCart,
    clearValidation,
    removeInvalidItems,
  } = useCartValidation({
    autoValidate: false, // Manual validation before checkout
    validationInterval: 0, // Disable periodic validation on cart page
    showToastNotifications: false, // We'll handle notifications via modal
  });

  // Use real cart items from CartContext
  const productItems = useMemo(() => {
    return cartState.items.map(item => {
      // Preserve metadata for event items
      const metadata = (item as any).metadata || {};
      const isEvent = metadata.eventType === 'event';
      
      return {
        id: item.id,
        productId: (item as any).productId || item.id,
        name: item.name,
        image: item.image || '',
        price: item.discountedPrice || item.originalPrice || 0,
        originalPrice: item.originalPrice,
        cashback: isEvent ? '0' : `Upto 12% cash back`, // Events don't have cashback
        quantity: item.quantity,
        discount: (item as any).discount,
        variant: (item as any).variant,
        store: (item as any).store,
        category: 'products' as const,
        // Preserve event metadata
        metadata: isEvent ? metadata : undefined,
        isEvent: isEvent,
      };
    });
  }, [cartState.items, cartState.isLoading, cartState.error]);

  const currentItems = useMemo(() => {
    if (activeTab === 'products') return productItems;
    if (activeTab === 'service') return serviceItems;
    if (activeTab === 'lockedproduct') return lockedProducts;
    return [];
  }, [activeTab, productItems, serviceItems, lockedProducts]);

  const allItems = useMemo(() => [...productItems, ...serviceItems], [productItems, serviceItems]);

  // Use real cart totals from CartContext
  const overallTotal = useMemo(() => {
    // ✅ FIX: Add type checking and safe number conversion
    const cartTotal = typeof cartState.totalPrice === 'number' && !isNaN(cartState.totalPrice)
      ? cartState.totalPrice
      : 0;
    const lockedTotal = typeof calculateLockedTotal === 'function'
      ? calculateLockedTotal(lockedProducts)
      : 0;
    const total = cartTotal + lockedTotal;

    console.log('💰 [CART PAGE] Total calculation:', {
      cartTotal,
      lockedTotal,
      total
    });

    return total;
  }, [cartState.totalPrice, lockedProducts]);

  const overallItemCount = useMemo(() => {
    // ✅ FIX: Add type checking for item count calculation
    const cartCount = typeof cartState.totalItems === 'number' && !isNaN(cartState.totalItems)
      ? cartState.totalItems
      : 0;
    const lockedCount = typeof getLockedItemCount === 'function'
      ? getLockedItemCount(lockedProducts)
      : 0;

    console.log('🔢 [CART PAGE] Item count:', {
      cartCount,
      lockedCount,
      total: cartCount + lockedCount
    });

    return cartCount + lockedCount;
  }, [cartState.totalItems, lockedProducts]);

  // Function to load locked items
  const loadLockedItems = useCallback(async () => {
    try {
      const response = await cartApi.getLockedItems();
      if (response.success && response.data) {
        const formattedLockedItems = response.data.lockedItems.map((item: any) => {
          console.log('🔒 [CART] Raw locked item from API:', {
            id: item._id,
            isPaidLock: item.isPaidLock,
            lockFee: item.lockFee,
            lockFeePercentage: item.lockFeePercentage,
            lockPaymentStatus: item.lockPaymentStatus,
          });
          const productId = item.product?._id || item.product;
          const lockedAt = new Date(item.lockedAt);
          const expiresAt = new Date(item.expiresAt);
          const remainingTime = expiresAt.getTime() - Date.now();
          const lockDuration = expiresAt.getTime() - lockedAt.getTime();
          
          // Determine status based on remaining time
          const status: 'active' | 'expiring' | 'expired' = 
            remainingTime <= 0 ? 'expired' : 
            remainingTime <= 120000 ? 'expiring' : 
            'active';
          
          return {
            id: item._id || item.product?._id,
            productId: productId,
            name: item.product?.name || 'Product',
            price: item.lockedPrice,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            image: item.product?.images?.[0]?.url || item.product?.images?.[0],
            store: item.store?.name || 'Store',
            variant: item.variant,
            cashback: `Upto 12% cash back`,
            category: 'products' as const,
            lockedAt,
            expiresAt,
            remainingTime: Math.max(0, remainingTime),
            lockDuration,
            status,
            notes: item.notes,
            // Paid lock fields
            lockFee: item.lockFee,
            lockFeePercentage: item.lockFeePercentage,
            paymentMethod: item.paymentMethod,
            lockPaymentStatus: item.lockPaymentStatus,
            isPaidLock: item.isPaidLock,
          };
        });
        setLockedProducts(formattedLockedItems);
      }
    } catch (error) {
      console.error('Failed to load locked items:', error);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    const loadData = async () => {
      await cartActions.loadCart();
      await loadLockedItems();
    };
    loadData();
  }, [loadLockedItems]);

  // Reload locked items when page comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLockedItems();
    }, [loadLockedItems])
  );

  const handleTabChange = (tabKey: 'products' | 'service' | 'lockedproduct') => {
    setActiveTab(tabKey);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (activeTab === 'products') {
      // Use CartContext to remove item (will sync with backend)
      await cartActions.removeItem(itemId);
    } else if (activeTab === 'service') {
      setServiceItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (activeTab === 'products') {
      await cartActions.updateQuantity(itemId, newQuantity);
    }
  };

  const handleUnlockItem = async (itemId: string, productId: string) => {
    if (!productId) {
      Alert.alert('Error', 'Product ID is missing');
      return;
    }

    try {
      const response = await cartApi.unlockItem(productId);

      if (response.success) {
        setLockedProducts(prev => prev.filter(item => item.id !== itemId));
        Alert.alert('Success', 'Item unlocked successfully');
      } else {
        Alert.alert('Error', response.message || response.error || 'Failed to unlock item');
      }
    } catch (error) {
      console.error('Failed to unlock item:', error);
      Alert.alert('Error', 'Unable to unlock item. Please try again.');
    }
  };

  const handleMoveToCart = async (itemId: string, productId: string) => {
    try {
      const response = await cartApi.moveLockedToCart(productId);
      if (response.success) {
        // Remove from locked items
        setLockedProducts(prev => prev.filter(item => item.id !== itemId));
        // Reload cart to show the moved item
        await cartActions.loadCart();
        Alert.alert(
          'Moved to Cart!',
          'Item has been moved to your cart at the locked price.',
          [
            { text: 'OK', style: 'cancel' },
            { text: 'View Cart', onPress: () => setActiveTab('products') }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to move item to cart');
      }
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      Alert.alert('Error', 'Unable to move item to cart. Please try again.');
    }
  };

  const handleExpireItem = (itemId: string) => {
    setLockedProducts(prev => prev.filter(item => item.id !== itemId));
  };

  // Timer management for locked products
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Set up interval only once when component mounts or when we have locked products
    if (lockedProducts.length > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setLockedProducts(prev => {
          // Only update if there are still locked products
          if (prev.length === 0) return prev;

          const updated = updateLockedProductTimers(prev);

          // Only update state if something actually changed
          const hasChanges = updated.length !== prev.length ||
            updated.some((item, i) => item.remainingTime !== prev[i]?.remainingTime);

          return hasChanges ? updated : prev;
        });
      }, LOCK_CONFIG.UPDATE_INTERVAL);
    }

    // Clear interval if no locked products
    if (lockedProducts.length === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [lockedProducts.length]); // Safe to ignore timeLeft changes

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleBuyNow = async () => {
    // Validate cart before proceeding to checkout
    const validationResult = await validateCart();

    if (!validationResult) {
      Alert.alert('Validation Error', 'Unable to validate cart. Please try again.');
      return;
    }

    // If there are any issues, show validation modal
    if (validationResult.issues.length > 0 || !validationResult.canCheckout) {
      setShowValidationModal(true);
      return;
    }

    // If validation passed, proceed to checkout
    router.push('/checkout');
  };

  const handleContinueToCheckout = () => {
    setShowValidationModal(false);

    // Only proceed if we have valid items
    if (validationState.validationResult?.validItems.length ?? 0 > 0) {
      router.push('/checkout');
    } else {
      Alert.alert('Cannot Checkout', 'No valid items in cart to checkout');
    }
  };

  const handleRemoveInvalidItems = async () => {
    await removeInvalidItems();
    setShowValidationModal(false);
  };

  const handleRefreshValidation = async () => {
    await validateCart();
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => {
    // Render locked item if on locked products tab
    if (activeTab === 'lockedproduct') {
      return (
        <View style={styles.cardWrapper}>
          <LockedItem
            item={item as any}
            onMoveToCart={handleMoveToCart}
            onUnlock={handleUnlockItem}
            showAnimation={true}
          />
        </View>
      );
    }

    // Render regular cart item
    return (
      <View style={styles.cardWrapper}>
        <CartItem
          item={item}
          onRemove={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
          showAnimation={true}
        />
      </View>
    );
  };

  const renderEmptyState = () => {
    let title = "Your cart is empty 🛒";
    let subtitle = "Add some items to get started";

    if (activeTab === 'lockedproduct') {
      title = "No locked products 🔒";
      subtitle = "Lock products to reserve them at current price for 24 hours";
    } else if (activeTab === 'products') {
      subtitle = "Add some products to get started";
    } else if (activeTab === 'service') {
      subtitle = "Add some services to get started";
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
        <ThemedText style={styles.emptySubtitle}>{subtitle}</ThemedText>
      </View>
    );
  };

  return (
   <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

      <CartHeader onBack={handleBackPress} />

      <SlidingTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Stock Warning Banner */}
      {showWarningBanner && validationState.validationResult && validationState.validationResult.issues.length > 0 && (
        <StockWarningBanner
          issues={validationState.validationResult.issues}
          onDismiss={() => setShowWarningBanner(false)}
          onViewDetails={() => setShowValidationModal(true)}
          autoHide={false}
        />
      )}

      <View style={styles.listContainer}>
        {cartState.isLoading && activeTab === 'products' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C06A" />
            <ThemedText style={styles.loadingText}>Loading cart...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={currentItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              currentItems.length === 0 && styles.emptyListContent,
              overallItemCount > 0 && { paddingBottom: Platform.OS === 'ios' ? 180 : 160 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
          />
        )}
      </View>

      {/* Card Offers Section */}
      {overallItemCount > 0 && overallTotal > 0 && (
        <CardOffersSection
          storeId={(productItems[0] as any)?.store?.id || (productItems[0] as any)?.storeId}
          orderValue={overallTotal}
          onOfferApplied={(offer) => {
            // Offer applied - cart context will handle it
            console.log('Card offer applied:', offer);
          }}
        />
      )}

      {overallItemCount > 0 && (
        <PriceSection
          totalPrice={overallTotal}
          onBuyNow={handleBuyNow}
          itemCount={overallItemCount}
          loading={validationState.isValidating}
        />
      )}

      {/* Validation Modal */}
      <CartValidation
        visible={showValidationModal}
        validationResult={validationState.validationResult}
        loading={validationState.isValidating}
        onClose={() => setShowValidationModal(false)}
        onContinueToCheckout={handleContinueToCheckout}
        onRemoveInvalidItems={handleRemoveInvalidItems}
        onRefresh={handleRefreshValidation}
      />
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.1)',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.1)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2240',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#00C06A',
    fontWeight: '600',
  },
});
