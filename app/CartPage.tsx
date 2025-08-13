import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import CartHeader from '@/components/cart/CartHeader';
import SlidingTabs from '@/components/cart/SlidingTabs';
import CartItem from '@/components/cart/CartItem';
import PriceSection from '@/components/cart/PriceSection';
import { ThemedText } from '@/components/ThemedText';
import { CartItem as CartItemType } from '@/types/cart';
import {
  mockProductsData,
  mockServicesData,
  calculateTotal,
  getItemCount,
} from '@/utils/mockCartData';

export default function CartPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'service'>('products');
  const [productItems, setProductItems] = useState<CartItemType[]>(mockProductsData);
  const [serviceItems, setServiceItems] = useState<CartItemType[]>(mockServicesData);

  const currentItems = useMemo(
    () => (activeTab === 'products' ? productItems : serviceItems),
    [activeTab, productItems, serviceItems]
  );

  const allItems = useMemo(() => [...productItems, ...serviceItems], [productItems, serviceItems]);
  const overallTotal = useMemo(() => calculateTotal(allItems), [allItems]);
  const overallItemCount = useMemo(() => getItemCount(allItems), [allItems]);

  const handleTabChange = (tabKey: 'products' | 'service') => {
    setActiveTab(tabKey);
  };

  const handleRemoveItem = (itemId: string) => {
    if (activeTab === 'products') {
      setProductItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setServiceItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>Your cart is empty 🛒</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Add some {activeTab === 'products' ? 'products' : 'services'} to get started
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
    paddingBottom: 100,
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
