import React, { useState, useMemo, useEffect, useRef } from 'react';
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

import { useRouter } from 'expo-router';
import CartHeader from '@/components/cart/CartHeader';
import SlidingTabs from '@/components/cart/SlidingTabs';
import CartItem from '@/components/cart/CartItem';
import PriceSection from '@/components/cart/PriceSection';
import CartValidation from '@/components/cart/CartValidation';
import StockWarningBanner from '@/components/cart/StockWarningBanner';
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
    console.log('🛒 [CartPage] Mapping cart items from CartContext:', {
      itemCount: cartState.items.length,
      isLoading: cartState.isLoading,
      error: cartState.error,
      items: cartState.items
    });

    return cartState.items.map(item => {
      console.log('🖼️ [CartPage] Processing cart item:', {
        id: item.id,
        name: item.name,
        image: item.image,
        imageType: typeof item.image,
        hasImage: !!item.image
      });

      return {
        id: item.id,
        productId: item.productId,
        name: item.name,
        image: item.image || '',
        price: item.discountedPrice || item.originalPrice || 0,
        originalPrice: item.originalPrice,
        cashback: `Upto 12% cash back`,
        quantity: item.quantity,
        discount: item.discount,
        variant: item.variant,
        store: item.store,
        category: 'products' as const,
      };
    });
  }, [cartState.items, cartState.isLoading, cartState.error]);

  const currentItems = useMemo(() => {
    if (activeTab === 'products') return productItems;
    if (activeTab === 'service') return serviceItems;
    return []; // lockedproduct tab will use different rendering logic
  }, [activeTab, productItems, serviceItems]);

  const allItems = useMemo(() => [...productItems, ...serviceItems], [productItems, serviceItems]);

  // Use real cart totals from CartContext
  const overallTotal = useMemo(() => {
    console.log('🛒 [CartPage] Calculating total:', {
      cartTotal: cartState.totalPrice,
      cartItemCount: cartState.totalItems,
      productItemsLength: productItems.length,
      serviceItemsLength: serviceItems.length
    });

    // Use real cart total from backend, not calculated from mock data
    const cartTotal = cartState.totalPrice || 0;
    const lockedTotal = calculateLockedTotal(lockedProducts);
    return cartTotal + lockedTotal;
  }, [cartState.totalPrice, lockedProducts]);

  const overallItemCount = useMemo(() => {
    // Use real cart item count from backend
    const cartCount = cartState.totalItems || 0;
    const lockedCount = getLockedItemCount(lockedProducts);
    return cartCount + lockedCount;
  }, [cartState.totalItems, lockedProducts]);

  // Load cart on mount
  useEffect(() => {
    console.log('🛒 [CartPage] Component mounted, loading cart...');
    const loadData = async () => {
      await cartActions.loadCart();
      console.log('🛒 [CartPage] Cart loaded. Current state:', {
        items: cartState.items,
        itemCount: cartState.items.length,
        totalPrice: cartState.totalPrice,
        totalItems: cartState.totalItems,
        isLoading: cartState.isLoading,
        error: cartState.error
      });
    };
    loadData();
  }, []);

  // Debug: Log whenever cartState changes
  useEffect(() => {
    console.log('🛒 [CartPage] CartState changed:', {
      itemCount: cartState.items.length,
      totalPrice: cartState.totalPrice,
      totalItems: cartState.totalItems,
      isLoading: cartState.isLoading,
      error: cartState.error,
      firstItem: cartState.items[0]
    });
  }, [cartState]);

  const handleTabChange = (tabKey: 'products' | 'service' | 'lockedproduct') => {
    setActiveTab(tabKey);
  };

  const handleRemoveItem = async (itemId: string) => {
    console.log('🗑️ [CartPage] Remove button clicked for item:', itemId);

    if (activeTab === 'products') {
      console.log('🗑️ [CartPage] Removing product from cart via CartContext...');
      // Use CartContext to remove item (will sync with backend)
      await cartActions.removeItem(itemId);
    } else if (activeTab === 'service') {
      console.log('🗑️ [CartPage] Removing service from local state (mock data)');
      setServiceItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    console.log('📊 [CartPage] Update quantity for item:', itemId, 'to:', newQuantity);

    if (activeTab === 'products') {
      console.log('📊 [CartPage] Updating product quantity via CartContext...');
      await cartActions.updateQuantity(itemId, newQuantity);
    }
  };

  const handleUnlockItem = (itemId: string) => {
    console.log('🔓 [UNLOCK] Removing locked item:', itemId);
    setLockedProducts(prev => prev.filter(item => item.id !== itemId));
  };

  const handleExpireItem = (itemId: string) => {
    console.log('⏰ [EXPIRE] Auto-removing expired item:', itemId);
    setLockedProducts(prev => prev.filter(item => item.id !== itemId));
  };

  // Timer management for locked products
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (lockedProducts.length > 0) {
      timerRef.current = setInterval(() => {
        setLockedProducts(prev => {
          const updated = updateLockedProductTimers(prev);
          // Check if any items were removed (expired)
          if (updated.length < prev.length) {
            console.log('⏰ [AUTO-EXPIRE] Removed expired locked products');
          }
          return updated;
        });
      }, LOCK_CONFIG.UPDATE_INTERVAL);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lockedProducts.length]);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleBuyNow = async () => {
    console.log('🛒 [CartPage] Proceed to Checkout clicked, validating cart...');

    // Validate cart before proceeding to checkout
    const validationResult = await validateCart();

    if (!validationResult) {
      Alert.alert('Validation Error', 'Unable to validate cart. Please try again.');
      return;
    }

    console.log('🛒 [CartPage] Validation result:', {
      valid: validationResult.valid,
      canCheckout: validationResult.canCheckout,
      issueCount: validationResult.issues.length,
      invalidItemCount: validationResult.invalidItems.length,
    });

    // If there are any issues, show validation modal
    if (validationResult.issues.length > 0 || !validationResult.canCheckout) {
      console.log('🛒 [CartPage] Validation issues found, showing modal');
      setShowValidationModal(true);
      return;
    }

    // If validation passed, proceed to checkout
    console.log('🛒 [CartPage] Validation passed, navigating to checkout');
    router.push('/checkout');
  };

  const handleContinueToCheckout = () => {
    console.log('🛒 [CartPage] Continue to checkout from validation modal');
    setShowValidationModal(false);

    // Only proceed if we have valid items
    if (validationState.validationResult?.validItems.length ?? 0 > 0) {
      router.push('/checkout');
    } else {
      Alert.alert('Cannot Checkout', 'No valid items in cart to checkout');
    }
  };

  const handleRemoveInvalidItems = async () => {
    console.log('🛒 [CartPage] Removing invalid items');
    await removeInvalidItems();
    setShowValidationModal(false);
  };

  const handleRefreshValidation = async () => {
    console.log('🛒 [CartPage] Refreshing validation');
    await validateCart();
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => (
    <View style={styles.cardWrapper}>
      <CartItem
        item={item}
        onRemove={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        showAnimation={true}
      />
    </View>
  );

  const renderEmptyState = () => {
    let title = "Your cart is empty 🛒";
    let subtitle = "Add some items to get started";
    
    if (activeTab === 'lockedproduct') {
      title = "No locked products 🔒";
      subtitle = "Lock products from the store to reserve them for 15 minutes";
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
   <SafeAreaView style={styles.container} edges={['left', 'right']}>

      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

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
            <ActivityIndicator size="large" color="#8B5CF6" />
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
    backgroundColor: '#F9FAFB',
    
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: Platform.OS === 'ios' ? 0 : 0.5,
    borderColor: '#E5E7EB',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
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
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
});
