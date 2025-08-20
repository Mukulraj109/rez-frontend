import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ supports 'edges'

import { useRouter } from 'expo-router';
import CartHeader from '@/components/cart/CartHeader';
import SlidingTabs from '@/components/cart/SlidingTabs';
import CartItem from '@/components/cart/CartItem';
import PriceSection from '@/components/cart/PriceSection';
import { ThemedText } from '@/components/ThemedText';
import { CartItem as CartItemType, LockedProduct, LOCK_CONFIG } from '@/types/cart';
import {
  mockProductsData,
  mockServicesData,
  mockLockedProductsData,
  calculateTotal,
  getItemCount,
  calculateLockedTotal,
  getLockedItemCount,
  updateLockedProductTimers,
} from '@/utils/mockCartData';

export default function CartPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'service' | 'lockedproduct'>('products');
  const [productItems, setProductItems] = useState<CartItemType[]>(mockProductsData);
  const [serviceItems, setServiceItems] = useState<CartItemType[]>(mockServicesData);
  const [lockedProducts, setLockedProducts] = useState<LockedProduct[]>(mockLockedProductsData);

  const currentItems = useMemo(() => {
    if (activeTab === 'products') return productItems;
    if (activeTab === 'service') return serviceItems;
    return []; // lockedproduct tab will use different rendering logic
  }, [activeTab, productItems, serviceItems]);

  const allItems = useMemo(() => [...productItems, ...serviceItems], [productItems, serviceItems]);
  const overallTotal = useMemo(() => {
    const cartTotal = calculateTotal(allItems);
    const lockedTotal = calculateLockedTotal(lockedProducts);
    return cartTotal + lockedTotal;
  }, [allItems, lockedProducts]);
  const overallItemCount = useMemo(() => {
    const cartCount = getItemCount(allItems);
    const lockedCount = getLockedItemCount(lockedProducts);
    return cartCount + lockedCount;
  }, [allItems, lockedProducts]);

  const handleTabChange = (tabKey: 'products' | 'service' | 'lockedproduct') => {
    setActiveTab(tabKey);
  };

  const handleRemoveItem = (itemId: string) => {
    if (activeTab === 'products') {
      setProductItems(prev => prev.filter(item => item.id !== itemId));
    } else if (activeTab === 'service') {
      setServiceItems(prev => prev.filter(item => item.id !== itemId));
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

  const handleBuyNow = () => {
    console.log('Buy now pressed with total:', overallTotal);
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => (
    <View style={styles.cardWrapper}>
      <CartItem
        item={item}
        onRemove={handleRemoveItem}
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

      <View style={styles.listContainer}>
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
      </View>

      {overallItemCount > 0 && (
        <PriceSection
          totalPrice={overallTotal}
          onBuyNow={handleBuyNow}
          itemCount={overallItemCount}
          loading={false}
        />
      )}
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
});
