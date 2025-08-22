// Wishlist Page
// Displays user's saved items with management options

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';

export default function WishlistPage() {
  const router = useRouter();
  const { 
    wishlistItems, 
    removeFromWishlist, 
    clearWishlist, 
    isLoading, 
    error 
  } = useWishlist();
  const [refreshing, setRefreshing] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // In real app, this would reload wishlist from API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${productName}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromWishlist(productId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item from wishlist');
            }
          }
        }
      ]
    );
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

  const handleAddToCart = (item: WishlistItem) => {
    Alert.alert(
      'Added to Cart',
      `${item.productName} has been added to your cart!`,
      [
        { text: 'Continue Shopping' },
        { text: 'View Cart', onPress: () => router.push('/CartPage') },
      ]
    );
  };

  const renderWishlistItem = (item: WishlistItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemCard}
      onPress={() => handleItemPress(item.productId)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.productImage }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <ThemedText style={styles.itemBrand}>{item.brand}</ThemedText>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.productId, item.productName)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.productName}
        </ThemedText>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
            <ThemedText style={styles.reviewText}>({item.reviewCount})</ThemedText>
          </View>
          
          <View style={[
            styles.availabilityBadge,
            { backgroundColor: item.availability === 'IN_STOCK' ? '#22C55E' : item.availability === 'LIMITED' ? '#F59E0B' : '#EF4444' }
          ]}>
            <ThemedText style={styles.availabilityText}>
              {item.availability === 'IN_STOCK' ? 'In Stock' : item.availability === 'LIMITED' ? 'Limited' : 'Out of Stock'}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>₹{item.price.toLocaleString()}</ThemedText>
            {item.originalPrice && (
              <>
                <ThemedText style={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</ThemedText>
                <ThemedText style={styles.discount}>{item.discount}% OFF</ThemedText>
              </>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              { opacity: item.availability === 'OUT_OF_STOCK' ? 0.5 : 1 }
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={item.availability === 'OUT_OF_STOCK'}
          >
            <Ionicons name="cart-outline" size={16} color="#8B5CF6" />
            <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
          </TouchableOpacity>
        </View>
        
        <ThemedText style={styles.addedDate}>
          Added {new Date(item.addedAt).toLocaleDateString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

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
          <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
          <ThemedText style={styles.emptyTitle}>Your wishlist is empty</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Save items you love by tapping the heart icon
          </ThemedText>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/Store')}
          >
            <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
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
            {wishlistItems.map(renderWishlistItem)}
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
    gap: 12,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    marginLeft: 2,
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  availabilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  originalPrice: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 10,
    color: '#22C55E',
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  addToCartText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 4,
  },
  addedDate: {
    fontSize: 10,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpace: {
    height: 20,
  },
});