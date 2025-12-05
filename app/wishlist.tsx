// Wishlist Page
// Page for managing user's wishlists with saved deals support

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
  ActivityIndicator,
  FlatList,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import wishlistApi, { Wishlist, WishlistItem as ApiWishlistItem, DiscountSnapshot } from '@/services/wishlistApi';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ShareModal from '@/components/wishlist/ShareModal';
import { showAlert } from '@/components/common/CrossPlatformAlert';

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
  itemType: 'product' | 'discount' | 'store' | 'video';
  discountSnapshot?: DiscountSnapshot;
  notes?: string;
}

// Helper to check if a deal is expired
const isDealExpired = (validUntil?: string): boolean => {
  if (!validUntil) return false;
  return new Date(validUntil) < new Date();
};

// Helper to get days until expiry
const getDaysUntilExpiry = (validUntil?: string): number | null => {
  if (!validUntil) return null;
  const expiryDate = new Date(validUntil);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper to format discount value
const formatDiscountValue = (snapshot?: DiscountSnapshot): string => {
  if (!snapshot) return '';
  if (snapshot.type === 'percentage') {
    return `${snapshot.value}% OFF`;
  }
  return `₹${snapshot.value} OFF`;
};

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
  const { refreshWishlist } = useWishlist(); // Global wishlist context for syncing state
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

  // Helper to normalize MongoDB ObjectId to string
  const normalizeId = (id: any): string => {
    if (!id) return '';
    // Handle MongoDB ObjectId format
    if (typeof id === 'object' && id.$oid) return id.$oid;
    if (typeof id === 'object' && id._id) return normalizeId(id._id);
    if (typeof id === 'object' && id.toString) return id.toString();
    return String(id);
  };

  // Check if itemId is populated (object with data) vs just an ObjectId reference
  const isPopulated = (itemId: any): boolean => {
    return itemId && typeof itemId === 'object' && (itemId.name || itemId.title || itemId.images);
  };

  // Convert backend wishlist item to frontend format
  const convertWishlistItem = (apiItem: any, index: number, wishlistId: string): WishlistItem => {
    // Backend uses capitalized itemType: 'Product', 'Store', 'Video', 'Discount'
    // Normalize to lowercase for frontend
    const rawItemType = apiItem.itemType || 'Product';
    const itemType = (typeof rawItemType === 'string' ? rawItemType.toLowerCase() : 'product') as WishlistItem['itemType'];

    // Generate a unique ID - use multiple fallbacks with wishlistId for uniqueness
    const rawId = apiItem.id || apiItem._id;
    const uniqueId = rawId ? normalizeId(rawId) : `item-${wishlistId}-${index}-${Date.now()}`;

    // Handle discount items - check for discountSnapshot
    if (itemType === 'discount' || apiItem.discountSnapshot) {
      const snapshot = apiItem.discountSnapshot;
      if (snapshot) {
        return {
          id: uniqueId,
          name: snapshot.name || 'Saved Deal',
          image: '',
          price: 0,
          discount: snapshot.value,
          inStock: !isDealExpired(snapshot.validUntil),
          addedAt: apiItem.addedAt || new Date().toISOString(),
          productId: normalizeId(snapshot.discountId) || uniqueId,
          itemType: 'discount',
          discountSnapshot: snapshot,
          notes: apiItem.notes,
        };
      }
    }

    // Backend populates itemId with the document - check if it's populated
    // itemId will be an object with data if populated, or just an ObjectId string if not
    const populatedItem = isPopulated(apiItem.itemId) ? apiItem.itemId : null;

    // Get the actual itemId for reference
    const actualItemId = populatedItem
      ? normalizeId(populatedItem._id || populatedItem.id)
      : normalizeId(apiItem.itemId);

    // ===== HANDLE STORE ITEMS =====
    if (itemType === 'store') {
      // Store fields: name, logo, coverImage, slug, description
      const storeName = populatedItem?.name || 'Followed Store';
      const storeImage = populatedItem?.logo || populatedItem?.coverImage || populatedItem?.images?.[0] || '';

      return {
        id: uniqueId,
        name: storeName,
        image: storeImage,
        price: 0, // Stores don't have prices
        originalPrice: undefined,
        discount: undefined,
        inStock: true, // Stores are always "in stock"
        addedAt: apiItem.addedAt || new Date().toISOString(),
        productId: actualItemId || uniqueId,
        itemType: 'store',
        notes: apiItem.notes,
      };
    }

    // ===== HANDLE PRODUCT ITEMS =====
    if (itemType === 'product') {
      // Product fields: name, images, basePrice, salePrice, title
      const productName = populatedItem?.name || populatedItem?.title || 'Saved Product';
      const productImage = populatedItem?.images?.[0] || populatedItem?.image || populatedItem?.thumbnail || '';

      // Get price - prefer salePrice over basePrice
      let productPrice = 0;
      if (typeof populatedItem?.salePrice === 'number') {
        productPrice = populatedItem.salePrice;
      } else if (typeof populatedItem?.basePrice === 'number') {
        productPrice = populatedItem.basePrice;
      } else if (typeof populatedItem?.price === 'number') {
        productPrice = populatedItem.price;
      } else if (apiItem.priceWhenAdded) {
        productPrice = apiItem.priceWhenAdded;
      }

      // Get original price for discount display
      const originalPrice = populatedItem?.basePrice || populatedItem?.originalPrice;

      // Calculate discount percentage if both prices exist
      let discountPercent: number | undefined;
      if (originalPrice && productPrice && originalPrice > productPrice) {
        discountPercent = Math.round(((originalPrice - productPrice) / originalPrice) * 100);
      }

      // Determine stock status
      const inStock = populatedItem?.availability === 'available' ||
                      populatedItem?.inStock === true ||
                      populatedItem?.stock > 0 ||
                      !populatedItem?.outOfStock;

      return {
        id: uniqueId,
        name: productName,
        image: productImage,
        price: productPrice,
        originalPrice: originalPrice !== productPrice ? originalPrice : undefined,
        discount: discountPercent,
        inStock: inStock !== false, // Default to true if not specified
        addedAt: apiItem.addedAt || new Date().toISOString(),
        productId: actualItemId || uniqueId,
        itemType: 'product',
        notes: apiItem.notes,
      };
    }

    // ===== HANDLE VIDEO ITEMS =====
    if (itemType === 'video') {
      const videoName = populatedItem?.title || populatedItem?.name || 'Saved Video';
      const videoImage = populatedItem?.thumbnail || populatedItem?.thumbnailUrl || populatedItem?.images?.[0] || '';

      return {
        id: uniqueId,
        name: videoName,
        image: videoImage,
        price: 0,
        originalPrice: undefined,
        discount: undefined,
        inStock: true,
        addedAt: apiItem.addedAt || new Date().toISOString(),
        productId: actualItemId || uniqueId,
        itemType: 'video',
        notes: apiItem.notes,
      };
    }

    // ===== FALLBACK FOR UNKNOWN TYPES =====
    return {
      id: uniqueId,
      name: populatedItem?.name || populatedItem?.title || 'Saved Item',
      image: populatedItem?.images?.[0] || populatedItem?.image || '',
      price: populatedItem?.price || populatedItem?.salePrice || populatedItem?.basePrice || 0,
      originalPrice: undefined,
      discount: undefined,
      inStock: true,
      addedAt: apiItem.addedAt || new Date().toISOString(),
      productId: actualItemId || uniqueId,
      itemType: itemType,
      notes: apiItem.notes,
    };
  };

  // Convert backend wishlist to frontend format with deduplication
  const convertWishlist = (apiWishlist: any): WishlistData => {
    // Normalize wishlist ID first
    const wishlistId = normalizeId(apiWishlist.id || apiWishlist._id) || `wishlist-${Date.now()}`;

    // Convert items, passing wishlistId for unique key generation
    const rawItems = Array.isArray(apiWishlist.items)
      ? apiWishlist.items.map((item: any, index: number) => convertWishlistItem(item, index, wishlistId))
      : [];

    // Deduplicate items by ID
    const seenIds = new Set<string>();
    const items = rawItems.filter((item: WishlistItem) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

    return {
      id: wishlistId,
      name: apiWishlist.name || 'My Wishlist',
      description: apiWishlist.description,
      items: items,
      itemCount: items.length,
      isPublic: apiWishlist.isPublic || false,
      createdAt: apiWishlist.createdAt || new Date().toISOString(),
      updatedAt: apiWishlist.updatedAt || new Date().toISOString(),
    };
  };

  const fetchWishlists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!authState?.isAuthenticated) {
        setWishlists([]);
        setIsLoading(false);
        return;
      }

      const response = await wishlistApi.getWishlists(1, 50);

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch wishlists');
      }

      // Convert and deduplicate wishlists by normalized ID
      const fetchedWishlists = response.data.wishlists.map(convertWishlist);
      const seenWishlistIds = new Set<string>();
      const uniqueWishlists = fetchedWishlists.filter((wishlist) => {
        const normalizedId = normalizeId(wishlist.id);
        if (seenWishlistIds.has(normalizedId)) {
          return false;
        }
        seenWishlistIds.add(normalizedId);
        return true;
      });

      // Filter wishlists: show all non-empty + max 1 empty wishlist
      // This prevents showing multiple empty "My Wishlist" sections
      const nonEmptyWishlists = uniqueWishlists.filter(w => w.itemCount > 0);
      const emptyWishlists = uniqueWishlists.filter(w => w.itemCount === 0);
      const filteredWishlists = [
        ...nonEmptyWishlists,
        // Keep only 1 empty wishlist for users to add items to
        ...(emptyWishlists.length > 0 ? [emptyWishlists[0]] : [])
      ];

      setWishlists(filteredWishlists);
    } catch (err) {
      console.error('Error fetching wishlists:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wishlists';
      if (!errorMessage.includes('401') && !errorMessage.includes('Access token')) {
        setError(errorMessage);
      } else {
        setWishlists([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [authState?.isAuthenticated]);

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
      showAlert('Error', 'Please enter a wishlist name', undefined, 'error');
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
      showAlert('Success', 'Wishlist created successfully!', undefined, 'success');
      await fetchWishlists();
    } catch (err) {
      console.error('Error creating wishlist:', err);
      showAlert('Error', 'Failed to create wishlist. Please try again.', undefined, 'error');
    } finally {
      setIsCreating(false);
    }
  }, [newWishlistName, newWishlistDescription, fetchWishlists]);

  const handleWishlistPress = useCallback((wishlist: WishlistData) => {
    // Navigate to wishlist detail page or show items
    // For now, just show an alert with wishlist info
    showAlert(wishlist.name, `${wishlist.itemCount} items`, undefined, 'info');
  }, []);

  const handleItemPress = useCallback((item: WishlistItem) => {
    if (item.itemType === 'discount' && item.discountSnapshot?.storeId) {
      router.push(`/MainStorePage?storeId=${item.discountSnapshot.storeId}`);
    } else if (item.itemType === 'product') {
      // Use ProductPage with cardId and cardType query params
      router.push(`/ProductPage?cardId=${item.productId}&cardType=product`);
    } else if (item.itemType === 'store') {
      router.push(`/MainStorePage?storeId=${item.productId}`);
    } else if (item.itemType === 'video') {
      router.push(`/ugc/${item.productId}`);
    }
  }, [router]);

  const handleRemoveItem = useCallback(async (itemId: string, wishlistId: string) => {
    showAlert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
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
              await wishlistApi.removeFromWishlist(itemId);
              // Sync with global wishlist context so product pages update
              await refreshWishlist();
              showAlert('Success', 'Item removed from wishlist', undefined, 'success');
            } catch (err) {
              console.error('Error removing item:', err);
              showAlert('Error', 'Failed to remove item. Please try again.', undefined, 'error');
              await fetchWishlists();
            }
          },
        },
      ],
      'warning'
    );
  }, [fetchWishlists, refreshWishlist]);

  const handleDeleteWishlist = useCallback(async (wishlistId: string, wishlistName: string) => {
    showAlert(
      'Delete Wishlist',
      `Are you sure you want to delete "${wishlistName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setWishlists(prev => prev.filter(w => w.id !== wishlistId));
              await wishlistApi.deleteWishlist(wishlistId);
              // Sync with global wishlist context so product pages update
              await refreshWishlist();
              showAlert('Success', 'Wishlist deleted', undefined, 'success');
            } catch (err) {
              console.error('Error deleting wishlist:', err);
              showAlert('Error', 'Failed to delete wishlist.', undefined, 'error');
              await fetchWishlists();
            }
          },
        },
      ],
      'warning'
    );
  }, [fetchWishlists, refreshWishlist]);

  // Render a deal/discount card (key is handled by FlatList keyExtractor)
  const renderDealCard = (item: WishlistItem, wishlistId: string) => {
    const snapshot = item.discountSnapshot;
    const daysLeft = getDaysUntilExpiry(snapshot?.validUntil);
    const isExpired = isDealExpired(snapshot?.validUntil);

    return (
      <TouchableOpacity
        style={[styles.dealCard, isExpired && styles.dealCardExpired]}
        onPress={() => handleItemPress(item)}
      >
        {/* Discount Badge */}
        <View style={[styles.discountBadge, isExpired && styles.discountBadgeExpired]}>
          <Ionicons name="pricetag" size={14} color={isExpired ? '#EF4444' : '#00C06A'} />
          <ThemedText style={[styles.discountBadgeText, isExpired && styles.discountBadgeTextExpired]}>
            {formatDiscountValue(snapshot)}
          </ThemedText>
        </View>

        {/* Deal Info */}
        <ThemedText style={[styles.dealName, isExpired && styles.dealNameExpired]} numberOfLines={2}>
          {item.name}
        </ThemedText>

        {snapshot?.storeName && (
          <View style={styles.storeRow}>
            <Ionicons name="storefront-outline" size={12} color="#6B7280" />
            <ThemedText style={styles.dealStoreName}>{snapshot.storeName}</ThemedText>
          </View>
        )}

        {snapshot?.minOrderValue && snapshot.minOrderValue > 0 && (
          <ThemedText style={styles.minOrder}>Min: ₹{snapshot.minOrderValue}</ThemedText>
        )}

        {/* Expiry Status */}
        <View style={styles.expiryRow}>
          {isExpired ? (
            <View style={styles.expiredBadge}>
              <Ionicons name="time-outline" size={12} color="#EF4444" />
              <ThemedText style={styles.expiredText}>Expired</ThemedText>
            </View>
          ) : daysLeft !== null && daysLeft <= 7 ? (
            <View style={[styles.expiryBadge, daysLeft <= 3 && styles.expiryBadgeUrgent]}>
              <Ionicons name="time-outline" size={12} color={daysLeft <= 3 ? '#F59E0B' : '#10B981'} />
              <ThemedText style={[styles.expiryText, daysLeft <= 3 && styles.expiryTextUrgent]}>
                {daysLeft <= 0 ? 'Today' : `${daysLeft}d left`}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <ThemedText style={styles.activeText}>Active</ThemedText>
            </View>
          )}

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemoveItem(item.id, wishlistId)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render a store card (key is handled by FlatList keyExtractor)
  const renderStoreCard = (item: WishlistItem, wishlistId: string) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleItemPress(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.storeLogo} />
      ) : (
        <View style={styles.storeLogoPlaceholder}>
          <Ionicons name="storefront-outline" size={28} color="#00C06A" />
        </View>
      )}
      <View style={styles.storeInfo}>
        <ThemedText style={styles.storeName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <View style={styles.storeFooter}>
          <View style={styles.followingBadge}>
            <Ionicons name="heart" size={12} color="#00C06A" />
            <ThemedText style={styles.followingText}>Following</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemoveItem(item.id, wishlistId)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render a product card (key is handled by FlatList keyExtractor)
  const renderProductCard = (item: WishlistItem, wishlistId: string) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleItemPress(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Ionicons name="image-outline" size={32} color="#D1D5DB" />
        </View>
      )}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        {item.price > 0 && (
          <ThemedText style={styles.productPrice}>
            ₹{item.price.toLocaleString()}
          </ThemedText>
        )}
        <View style={styles.productFooter}>
          <View style={[styles.stockBadge, { backgroundColor: item.inStock ? '#10B981' : '#EF4444' }]}>
            <ThemedText style={styles.stockText}>
              {item.inStock ? 'In Stock' : 'Out of Stock'}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemoveItem(item.id, wishlistId)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render a video card (key is handled by FlatList keyExtractor)
  const renderVideoCard = (item: WishlistItem, wishlistId: string) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => handleItemPress(item)}
    >
      {item.image ? (
        <View style={styles.videoThumbnailContainer}>
          <Image source={{ uri: item.image }} style={styles.videoThumbnail} />
          <View style={styles.playIconOverlay}>
            <Ionicons name="play-circle" size={40} color="#FFFFFF" />
          </View>
        </View>
      ) : (
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam-outline" size={32} color="#D1D5DB" />
        </View>
      )}
      <View style={styles.videoInfo}>
        <ThemedText style={styles.videoName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveItem(item.id, wishlistId)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderWishlistItem = (wishlistId: string) => ({ item, index }: { item: WishlistItem; index: number }) => {
    switch (item.itemType) {
      case 'discount':
        return renderDealCard(item, wishlistId);
      case 'store':
        return renderStoreCard(item, wishlistId);
      case 'video':
        return renderVideoCard(item, wishlistId);
      case 'product':
      default:
        return renderProductCard(item, wishlistId);
    }
  };

  // Render wishlist card (key is handled by FlatList keyExtractor)
  const renderWishlist = ({ item: wishlist, index }: { item: WishlistData; index: number }) => {
    // Separate items by type
    const deals = wishlist.items.filter(i => i.itemType === 'discount');
    const stores = wishlist.items.filter(i => i.itemType === 'store');
    const videos = wishlist.items.filter(i => i.itemType === 'video');
    const products = wishlist.items.filter(i => i.itemType === 'product');

    // Build metadata string
    const metaParts: string[] = [];
    metaParts.push(`${wishlist.itemCount} item${wishlist.itemCount !== 1 ? 's' : ''}`);
    if (deals.length > 0) metaParts.push(`${deals.length} deal${deals.length !== 1 ? 's' : ''}`);
    if (stores.length > 0) metaParts.push(`${stores.length} store${stores.length !== 1 ? 's' : ''}`);

    return (
      <View style={styles.wishlistCard}>
        <View style={styles.wishlistHeader}>
          <View style={styles.wishlistInfo}>
            <ThemedText style={styles.wishlistName}>{wishlist.name}</ThemedText>
            <ThemedText style={styles.wishlistMeta}>
              {metaParts.join(' • ')}
            </ThemedText>
          </View>
          <View style={styles.wishlistActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleWishlistPress(wishlist)}
            >
              <Ionicons name="eye-outline" size={20} color="#00C06A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setSelectedWishlistForShare(wishlist);
                setShowShareModal(true);
              }}
            >
              <Ionicons name="share-outline" size={20} color="#00C06A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDeleteWishlist(wishlist.id, wishlist.name)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Deals Section */}
        {deals.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={16} color="#00C06A" />
              <ThemedText style={styles.sectionTitle}>Saved Deals</ThemedText>
            </View>
            <FlatList
              data={deals}
              renderItem={renderWishlistItem(wishlist.id)}
              keyExtractor={(item, idx) => `deal-${wishlist.id}-${item.id}-${idx}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.itemsRow}
            />
          </View>
        )}

        {/* Stores Section */}
        {stores.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="storefront-outline" size={16} color="#00C06A" />
              <ThemedText style={styles.sectionTitle}>Following Stores</ThemedText>
            </View>
            <FlatList
              data={stores.slice(0, 5)}
              renderItem={renderWishlistItem(wishlist.id)}
              keyExtractor={(item, idx) => `store-${wishlist.id}-${item.id}-${idx}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.itemsRow}
            />
          </View>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bag-outline" size={16} color="#00C06A" />
              <ThemedText style={styles.sectionTitle}>Products</ThemedText>
            </View>
            <FlatList
              data={products.slice(0, 5)}
              renderItem={renderWishlistItem(wishlist.id)}
              keyExtractor={(item, idx) => `product-${wishlist.id}-${item.id}-${idx}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.itemsRow}
            />
          </View>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="videocam-outline" size={16} color="#00C06A" />
              <ThemedText style={styles.sectionTitle}>Saved Videos</ThemedText>
            </View>
            <FlatList
              data={videos.slice(0, 5)}
              renderItem={renderWishlistItem(wishlist.id)}
              keyExtractor={(item, idx) => `video-${wishlist.id}-${item.id}-${idx}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.itemsRow}
            />
          </View>
        )}

        {/* Empty State */}
        {wishlist.items.length === 0 && (
          <View style={styles.emptyWishlist}>
            <Ionicons name="heart-outline" size={40} color="#E5E7EB" />
            <ThemedText style={styles.emptyText}>No items yet</ThemedText>
          </View>
        )}

        {wishlist.items.length > 5 && (
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => handleWishlistPress(wishlist)}>
            <ThemedText style={styles.viewAllText}>View all {wishlist.itemCount} items</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#00C06A" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
        <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Wishlists</ThemedText>
          <TouchableOpacity style={styles.addBtn} onPress={handleCreateWishlist}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
          <ThemedText style={styles.loadingText}>Loading wishlists...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Error State
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
        <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Wishlists</ThemedText>
          <View style={styles.addBtn} />
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorDetails}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <ThemedText style={styles.retryBtnText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
      <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Wishlists</ThemedText>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateWishlist}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        {wishlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#E5E7EB" />
            <ThemedText style={styles.emptyTitle}>No Wishlists Yet</ThemedText>
            <ThemedText style={styles.emptyDesc}>
              Save your favorite products and deals here
            </ThemedText>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateWishlist}>
              <ThemedText style={styles.createBtnText}>Create Wishlist</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={wishlists}
            renderItem={renderWishlist}
            keyExtractor={(item, index) => `wishlist-${item.id}-${index}`}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#00C06A" />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Create Wishlist Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
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
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                <ThemedText style={styles.cancelBtnText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, (!newWishlistName.trim() || isCreating) && styles.submitBtnDisabled]}
                onPress={handleCreateWishlistSubmit}
                disabled={isCreating || !newWishlistName.trim()}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitBtnText}>Create</ThemedText>
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
          ownerName={authState?.user?.profile?.firstName || 'User'}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  addBtn: {
    padding: 8,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: 24,
  },

  // Wishlist Card
  wishlistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  wishlistMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  wishlistActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  // Section
  sectionContainer: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  itemsRow: {
    paddingVertical: 4,
  },

  // Deal Card
  dealCard: {
    backgroundColor: '#E6F7F1',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#B8E5D6',
  },
  dealCardExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    opacity: 0.85,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1F7E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
  },
  discountBadgeExpired: {
    backgroundColor: '#FEE2E2',
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00C06A',
  },
  discountBadgeTextExpired: {
    color: '#EF4444',
  },
  dealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  dealNameExpired: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dealStoreName: {
    fontSize: 11,
    color: '#6B7280',
  },
  minOrder: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  expiryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expiryBadgeUrgent: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiryText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
  expiryTextUrgent: {
    color: '#F59E0B',
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expiredText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  activeText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },

  // Product Card
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    marginTop: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00C06A',
    marginBottom: 6,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeBtn: {
    padding: 4,
  },

  // Store Card
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
  },
  storeLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F7F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  storeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  followingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F7F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  followingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06A',
  },

  // Video Card
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoThumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoPlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  videoName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },

  // Empty States
  emptyWishlist: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createBtn: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // View All
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
    marginRight: 4,
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#00C06A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
