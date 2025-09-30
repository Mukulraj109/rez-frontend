// Wishlist Page
// Displays user's saved items with management options

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import WishlistItem from '@/components/wishlist/WishlistItem';
import WishlistEmpty from '@/components/wishlist/WishlistEmpty';
import type { WishlistItem as WishlistItemType } from '@/contexts/WishlistContext';

export default function WishlistPage() {
  const router = useRouter();
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
    isLoading,
    error,
    getWishlistCount,
  } = useWishlist();
  const { actions: cartActions } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload wishlist from backend
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from wishlist');
    }
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) return;
    
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWishlist();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          }
        }
      ]
    );
  };

  const handleItemPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = async (item: WishlistItemType) => {
    try {
      await cartActions.addItem({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        image: item.productImage,
        quantity: 1,
        storeId: 'default-store',
        storeName: item.brand,
      });

      Alert.alert(
        'Added to Cart',
        `${item.productName} has been added to your cart!`,
        [
          { text: 'Continue Shopping' },
          { text: 'View Cart', onPress: () => router.push('/CartPage') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };


  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Wishlist</ThemedText>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading your wishlist...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>My Wishlist</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleClearWishlist}
          disabled={wishlistItems.length === 0}
        >
          <Ionicons 
            name="trash-outline" 
            size={22} 
            color={wishlistItems.length === 0 ? "#ccc" : "#333"} 
          />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {wishlistItems.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <WishlistEmpty onShopPress={() => router.push('/Store')} />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.itemsList}>
            {wishlistItems.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onPress={handleItemPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
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
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  itemsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  bottomSpace: {
    height: 20,
  },
});