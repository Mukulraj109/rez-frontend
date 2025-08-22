// Wishlist Context
// Manages user's wishlist items with add/remove functionality

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import wishlistApi from '@/services/wishlistApi';

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

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get default wishlist from backend
      const response = await wishlistApi.getDefaultWishlist();
      
      if (!response.data) {
        // If no default wishlist exists, create one
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
      
      // Convert backend wishlist items to frontend format
      const wishlistItems: WishlistItem[] = response.data.items.map(backendItem => ({
        id: backendItem.id,
        productId: backendItem.itemId,
        productName: backendItem.item.name,
        productImage: backendItem.item.image || 'https://via.placeholder.com/300',
        price: backendItem.item.price || 0,
        originalPrice: backendItem.item.price ? backendItem.item.price * 1.2 : 0, // Assume 20% discount
        discount: 20,
        rating: backendItem.item.rating || 4.0,
        reviewCount: Math.floor(Math.random() * 1000) + 100, // Random review count
        brand: 'Brand', // Default brand
        category: backendItem.category || 'General',
        availability: backendItem.item.availability === 'available' ? 'IN_STOCK' : 
                     backendItem.item.availability === 'out_of_stock' ? 'OUT_OF_STOCK' : 'LIMITED',
        addedAt: backendItem.addedAt
      }));
      
      setWishlistItems(wishlistItems);
    } catch (err) {
      setError('Failed to load wishlist');
      console.error('Error loading wishlist:', err);
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

      // Add item to backend wishlist
      const response = await wishlistApi.addToWishlist({
        itemType: 'product',
        itemId: item.productId,
        notes: `Added ${item.productName}`,
        priority: 'medium',
        tags: [item.category]
      });
      
      if (!response.data) {
        throw new Error('Failed to add item to wishlist');
      }
      
      // Create frontend item from backend response
      const newItem: WishlistItem = {
        ...item,
        id: response.data.id,
        addedAt: response.data.addedAt,
      };
      
      setWishlistItems(prev => [newItem, ...prev]);
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
      
      // Remove from backend
      await wishlistApi.removeFromWishlist(itemToRemove.id);
      
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      const errorMessage = 'Failed to remove from wishlist';
      setError(errorMessage);
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