// Wishlist Page
// Page for managing user's wishlists

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import wishlistApi, { Wishlist, WishlistItem as ApiWishlistItem } from '@/services/wishlistApi';
import { useAuth } from '@/contexts/AuthContext';
import ShareModal from '@/components/wishlist/ShareModal';

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  addedAt: string;
  productId: string;
}

interface WishlistData {
  id: string;
  name: string;
  description?: string;
  items: WishlistItem[];
  itemCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [wishlists, setWishlists] = useState<WishlistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [newWishlistDescription, setNewWishlistDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedWishlistForShare, setSelectedWishlistForShare] = useState<WishlistData | null>(null);

  // Convert backend wishlist item to frontend format
  const convertWishlistItem = (apiItem: ApiWishlistItem): WishlistItem => {
    const item = apiItem.item || {};
    return {
      id: apiItem.id,
      name: item.name || 'Unknown Product',
      image: item.image || 'https://via.placeholder.com/150',
      price: item.price || 0,
      originalPrice: undefined,
      discount: undefined,
      inStock: item.availability === 'available',
      addedAt: apiItem.addedAt,
      productId: apiItem.itemId,
    };
  };

  // Convert backend wishlist to frontend format
  const convertWishlist = (apiWishlist: Wishlist): WishlistData => {
    return {
      id: apiWishlist.id,
      name: apiWishlist.name,
      description: apiWishlist.description,
      items: apiWishlist.items.map(convertWishlistItem),
      itemCount: apiWishlist.itemCount,
      isPublic: apiWishlist.isPublic,
      createdAt: apiWishlist.createdAt,
      updatedAt: apiWishlist.updatedAt,
    };
  };

  const fetchWishlists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!authState.isAuthenticated) {
        setWishlists([]);
        setIsLoading(false);
        return;
      }

      // Fetch wishlists from backend
      const response = await wishlistApi.getWishlists(1, 50);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch wishlists');
      }

      // Convert backend wishlists to frontend format
      const fetchedWishlists = response.data.wishlists.map(convertWishlist);
      setWishlists(fetchedWishlists);
    } catch (err) {
      console.error('Error fetching wishlists:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wishlists';

      // Don't show error for authentication issues
      if (!errorMessage.includes('401') && !errorMessage.includes('Access token')) {
        setError(errorMessage);
      } else {
        setWishlists([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    fetchWishlists();
  }, [fetchWishlists]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchWishlists();
  }, [fetchWishlists]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleCreateWishlist = useCallback(() => {
    setShowCreateModal(true);
    setNewWishlistName('');
    setNewWishlistDescription('');
  }, []);

  const handleCreateWishlistSubmit = useCallback(async () => {
    if (!newWishlistName.trim()) {
      Alert.alert('Error', 'Please enter a wishlist name');
      return;
    }

    try {
      setIsCreating(true);

      const response = await wishlistApi.createWishlist({
        name: newWishlistName.trim(),
        description: newWishlistDescription.trim() || undefined,
        isPublic: false,
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to create wishlist');
      }

      setShowCreateModal(false);
      Alert.alert('Success', 'Wishlist created successfully!');
      await fetchWishlists();
    } catch (err) {
      console.error('Error creating wishlist:', err);
      Alert.alert('Error', 'Failed to create wishlist. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [newWishlistName, newWishlistDescription, fetchWishlists]);

  const handleWishlistPress = useCallback((wishlist: WishlistData) => {
    // Navigate to wishlist detail page
    Alert.alert('Wishlist', `Opening ${wishlist.name}...`);
  }, []);

  const handleItemPress = useCallback((item: WishlistItem) => {
    // Navigate to product detail page
    Alert.alert('Product', `Opening ${item.name}...`);
  }, []);

  const handleRemoveItem = useCallback(async (itemId: string, wishlistId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically update UI
              setWishlists(prev =>
                prev.map(wishlist =>
                  wishlist.id === wishlistId
                    ? {
                        ...wishlist,
                        items: wishlist.items.filter(item => item.id !== itemId),
                        itemCount: wishlist.itemCount - 1,
                      }
                    : wishlist
                )
              );
              // Remove from backend
              await wishlistApi.removeFromWishlist(itemId);
            } catch (err) {
              console.error('Error removing item:', err);
              Alert.alert('Error', 'Failed to remove item. Please try again.');
              // Reload wishlists to sync state
              await fetchWishlists();
            }
          },
        },
      ]
    );
  }, [fetchWishlists]);

  const handleDeleteWishlist = useCallback(async (wishlistId: string, wishlistName: string) => {
    Alert.alert(
      'Delete Wishlist',
      `Are you sure you want to delete "${wishlistName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically update UI
              setWishlists(prev => prev.filter(w => w.id !== wishlistId));

              // Delete from backend
              await wishlistApi.deleteWishlist(wishlistId);
              Alert.alert('Success', 'Wishlist deleted successfully');
            } catch (err) {
              console.error('Error deleting wishlist:', err);
              Alert.alert('Error', 'Failed to delete wishlist. Please try again.');
              // Reload wishlists to sync state
              await fetchWishlists();
            }
          },
        },
      ]
    );
  }, [fetchWishlists]);

  const renderWishlistItem = (wishlistId: string) => ({ item }: { item: WishlistItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
      accessibilityLabel={`${item.name}. Price ${item.price} rupees. ${item.inStock ? 'In stock' : 'Out of stock'}`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view product details"
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <View style={styles.priceContainer}>
          {/* ✅ FIX: Add null checks before price formatting */}
          <ThemedText style={styles.itemPrice}>
            ₹{typeof item.price === 'number' ? item.price.toLocaleString() : '0'}
          </ThemedText>
          {item.originalPrice && typeof item.originalPrice === 'number' && (
            <ThemedText style={styles.originalPrice}>
              ₹{item.originalPrice.toLocaleString()}
            </ThemedText>
          )}
        </View>
        <View style={styles.itemFooter}>
          <View style={[styles.stockBadge, { backgroundColor: item.inStock ? '#10B981' : '#EF4444' }]}>
            <ThemedText style={styles.stockText}>
              {item.inStock ? 'In Stock' : 'Out of Stock'}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id, wishlistId)}
            accessibilityLabel={`Remove ${item.name} from wishlist`}
            accessibilityRole="button"
            accessibilityHint="Double tap to remove this item from wishlist"
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderWishlist = ({ item: wishlist }: { item: WishlistData }) => (
    <View style={styles.wishlistCard}>
      <View style={styles.wishlistHeader}>
        <View style={styles.wishlistInfo}>
          <ThemedText style={styles.wishlistName}>{wishlist.name}</ThemedText>
          <ThemedText style={styles.wishlistDescription}>
            {wishlist.itemCount} item{wishlist.itemCount !== 1 ? 's' : ''}
            {wishlist.description && ` • ${wishlist.description}`}
          </ThemedText>
        </View>
        <View style={styles.wishlistActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleWishlistPress(wishlist)}
            accessibilityLabel={`View ${wishlist.name} wishlist`}
            accessibilityRole="button"
            accessibilityHint="Double tap to view all items in this wishlist"
          >
            <Ionicons name="eye-outline" size={20} color="#7C3AED" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedWishlistForShare(wishlist);
              setShowShareModal(true);
            }}
            accessibilityLabel={`Share ${wishlist.name} wishlist`}
            accessibilityRole="button"
            accessibilityHint="Double tap to share this wishlist with others"
          >
            <Ionicons name="share-outline" size={20} color="#7C3AED" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteWishlist(wishlist.id, wishlist.name)}
            accessibilityLabel={`Delete ${wishlist.name} wishlist`}
            accessibilityRole="button"
            accessibilityHint="Double tap to permanently delete this wishlist"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      {wishlist.items.length > 0 ? (
        <FlatList
          data={wishlist.items.slice(0, 3)} // Show only first 3 items
          renderItem={renderWishlistItem(wishlist.id)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemsContainer}
        />
      ) : (
        <View style={styles.emptyWishlist}>
          <Ionicons name="heart-outline" size={48} color="#E5E7EB" />
          <ThemedText style={styles.emptyText}>No items in this wishlist</ThemedText>
        </View>
      )}
      
      {wishlist.items.length > 3 && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => handleWishlistPress(wishlist)}
          accessibilityLabel={`View all ${wishlist.itemCount} items in ${wishlist.name}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to see all items in this wishlist"
        >
          <ThemedText style={styles.viewAllText}>
            View all {wishlist.itemCount} items
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>My Wishlists</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleCreateWishlist}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading wishlists...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>My Wishlists</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleCreateWishlist}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorDetails}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Navigate to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Wishlists</ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateWishlist}
            accessibilityLabel="Create new wishlist"
            accessibilityRole="button"
            accessibilityHint="Double tap to create a new wishlist"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {wishlists.length === 0 ? (
          <View
            style={styles.emptyContainer}
            accessibilityLabel="No wishlists yet. Start creating wishlists to save your favorite items"
            accessibilityRole="text"
          >
            <Ionicons name="heart-outline" size={80} color="#E5E7EB" />
            <ThemedText style={styles.emptyTitle}>No Wishlists Yet</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Start creating wishlists to save your favorite items
            </ThemedText>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateWishlist}
              accessibilityLabel="Create wishlist"
              accessibilityRole="button"
              accessibilityHint="Double tap to create your first wishlist"
            >
              <ThemedText style={styles.createButtonText}>Create Wishlist</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={wishlists}
            renderItem={renderWishlist}
            keyExtractor={(item) => item.id}
          refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#7C3AED" />
            }
            contentContainerStyle={styles.wishlistsContainer}
          showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Create Wishlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Create New Wishlist</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Wishlist Name"
              placeholderTextColor="#9CA3AF"
              value={newWishlistName}
              onChangeText={setNewWishlistName}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              value={newWishlistDescription}
              onChangeText={setNewWishlistDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={handleCreateWishlistSubmit}
                disabled={isCreating || !newWishlistName.trim()}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.createModalButtonText}>Create</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      {selectedWishlistForShare && (
        <ShareModal
          visible={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedWishlistForShare(null);
          }}
          wishlistId={selectedWishlistForShare.id}
          wishlistName={selectedWishlistForShare.name}
          itemCount={selectedWishlistForShare.itemCount}
          ownerName={authState.user?.profile?.firstName || 'User'}
        />
      )}
    </ThemedView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerBg: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  wishlistsContainer: {
    paddingBottom: 20,
  },
  wishlistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  wishlistDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  wishlistActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemsContainer: {
    paddingVertical: 8,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 160,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  itemDetails: {
    marginTop: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 4,
  },
  emptyWishlist: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  createModalButton: {
    backgroundColor: '#7C3AED',
  },
  createModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});