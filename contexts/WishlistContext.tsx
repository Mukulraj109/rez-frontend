// Wishlist Context
// Manages user's wishlist items with add/remove functionality

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import wishlistApi from '@/services/wishlistApi';
import { useSocket } from '@/contexts/SocketContext';

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  brand: string;
  category: string;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED';
  addedAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  getWishlistCount: () => number;
  isLoading: boolean;
  error: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribeToProduct, onStockUpdate, onProductAvailability } = useSocket();

  useEffect(() => {
    loadWishlist();
  }, []);

  // Subscribe to stock updates for all wishlist items
  useEffect(() => {
    if (wishlistItems.length === 0) return;

    // Subscribe to stock updates for each product in wishlist
    wishlistItems.forEach(item => {
      subscribeToProduct(item.productId);
    });

    // Listen for stock updates
    const unsubscribeStock = onStockUpdate((payload) => {
      setWishlistItems(prev =>
        prev.map(item =>
          item.productId === payload.productId
            ? {
                ...item,
                availability:
                  payload.status === 'OUT_OF_STOCK'
                    ? 'OUT_OF_STOCK'
                    : payload.status === 'LOW_STOCK'
                    ? 'LIMITED'
                    : 'IN_STOCK',
              }
            : item
        )
      );
    });

    // Listen for availability changes
    const unsubscribeAvailability = onProductAvailability((payload) => {
      setWishlistItems(prev =>
        prev.map(item =>
          item.productId === payload.productId
            ? {
                ...item,
                availability: payload.isAvailable ? 'IN_STOCK' : 'OUT_OF_STOCK',
              }
            : item
        )
      );
    });

    // Cleanup
    return () => {
      unsubscribeStock();
      unsubscribeAvailability();
    };
  }, [wishlistItems.length]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user's wishlists from backend
      const response = await wishlistApi.getWishlists(1, 50);

      // If unauthorized (401), silently skip - user may not be logged in
      if (!response || !response.success) {
        console.log('ℹ️ [WISHLIST] Could not load wishlist (user may not be authenticated)');
        setWishlistItems([]);
        setIsLoading(false);
        return;
      }

      if (!response.data || !response.data.wishlists || response.data.wishlists.length === 0) {
        // If no wishlists exist, create a default one
        const newWishlistResponse = await wishlistApi.createWishlist({
          name: 'My Wishlist',
          description: 'Default wishlist',
          isPublic: false
        });

        if (!newWishlistResponse.data) {
          throw new Error('Failed to create default wishlist');
        }

        // Start with empty wishlist
        setWishlistItems([]);
        return;
      }

      // Get the first (default or most recent) wishlist
      const defaultWishlist = response.data.wishlists[0];

      if (!defaultWishlist.items || defaultWishlist.items.length === 0) {
        setWishlistItems([]);
        return;
      }

      // Convert backend wishlist items to frontend format
      const wishlistItems: WishlistItem[] = defaultWishlist.items.map((backendItem: any) => {
        const item = backendItem.itemId || {};
        return {
          id: backendItem._id || backendItem.id || String(Math.random()),
          productId: typeof backendItem.itemId === 'string' ? backendItem.itemId : (item._id || item.id || ''),
          productName: item.name || 'Unknown Product',
          productImage: (item.images && item.images[0]) || item.image || 'https://via.placeholder.com/300',
          price: item.salePrice || item.basePrice || item.price || 0,
          originalPrice: item.basePrice || (item.salePrice ? item.salePrice * 1.2 : 0),
          discount: item.basePrice && item.salePrice
            ? Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100)
            : 0,
          rating: item.rating?.average || item.rating || 4.0,
          reviewCount: item.rating?.count || Math.floor(Math.random() * 1000) + 100,
          brand: item.brand || 'Brand',
          category: item.category?.name || backendItem.tags?.[0] || 'General',
          availability: item.inventory?.stock > 0 ? 'IN_STOCK' :
                       item.inventory?.stock === 0 ? 'OUT_OF_STOCK' : 'LIMITED',
          addedAt: backendItem.addedAt || new Date().toISOString()
        };
      });

      setWishlistItems(wishlistItems);
    } catch (err) {
      // Don't show errors for authentication issues (401) - user may not be logged in
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('401') || errorMessage.includes('Access token')) {
        console.log('ℹ️ [WISHLIST] Wishlist requires authentication');
        setWishlistItems([]);
      } else {
        setError('Failed to load wishlist');
        console.error('❌ [WISHLIST] Error loading wishlist:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const addToWishlist = async (item: Omit<WishlistItem, 'id' | 'addedAt'>): Promise<void> => {
    try {
      setError(null);

      // Check if already in wishlist
      if (isInWishlist(item.productId)) {
        throw new Error('Item already in wishlist');
      }

      // First, get the user's wishlists to find the default/first one
      const wishlistsResponse = await wishlistApi.getWishlists(1, 1);
      let wishlistId: string | undefined;

      if (wishlistsResponse.data && wishlistsResponse.data.wishlists && wishlistsResponse.data.wishlists.length > 0) {
        wishlistId = wishlistsResponse.data.wishlists[0].id || wishlistsResponse.data.wishlists[0]._id;
      } else {
        // Create a default wishlist if none exists
        const newWishlistResponse = await wishlistApi.createWishlist({
          name: 'My Wishlist',
          description: 'Default wishlist',
          isPublic: false
        });
        wishlistId = newWishlistResponse.data?.id || newWishlistResponse.data?._id;
      }

      if (!wishlistId) {
        throw new Error('Failed to get or create wishlist');
      }

      // Add item to backend wishlist using the correct endpoint
      const response = await wishlistApi.addToWishlist({
        itemType: 'Product',
        itemId: item.productId,
        wishlistId,
        notes: `Added ${item.productName}`,
        priority: 'medium',
        tags: [item.category]
      });

      if (!response.data) {
        throw new Error('Failed to add item to wishlist');
      }

      // Reload wishlist to get the updated data with proper population
      await loadWishlist();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeFromWishlist = async (productId: string): Promise<void> => {
    try {
      setError(null);

      // Find the wishlist item to remove
      const itemToRemove = wishlistItems.find(item => item.productId === productId);
      if (!itemToRemove) {
        throw new Error('Item not found in wishlist');
      }

      // Get the wishlist ID
      const wishlistsResponse = await wishlistApi.getWishlists(1, 1);
      if (!wishlistsResponse.data || !wishlistsResponse.data.wishlists || wishlistsResponse.data.wishlists.length === 0) {
        throw new Error('Wishlist not found');
      }

      const wishlistId = wishlistsResponse.data.wishlists[0].id || wishlistsResponse.data.wishlists[0]._id;

      // Remove from backend using the correct endpoint: DELETE /wishlist/:wishlistId/items/:itemId
      await wishlistApi.removeFromWishlist(itemToRemove.id);

      // Optimistically update UI
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      const errorMessage = 'Failed to remove from wishlist';
      setError(errorMessage);
      // Reload wishlist to sync state
      await loadWishlist();
      throw new Error(errorMessage);
    }
  };

  const clearWishlist = async (): Promise<void> => {
    try {
      setError(null);
      
      // Get default wishlist and clear it
      const response = await wishlistApi.getDefaultWishlist();
      if (response.data) {
        await wishlistApi.clearWishlist(response.data.id);
      }
      
      setWishlistItems([]);
    } catch (err) {
      const errorMessage = 'Failed to clear wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getWishlistCount = (): number => {
    return wishlistItems.length;
  };

  const contextValue: WishlistContextType = {
    wishlistItems,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    getWishlistCount,
    isLoading,
    error,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};