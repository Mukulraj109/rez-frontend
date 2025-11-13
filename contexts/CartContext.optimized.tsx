/**
 * OPTIMIZED CartContext - Memory Optimizations Applied
 *
 * Memory Optimizations:
 * 1. useCallback for all functions to prevent recreation
 * 2. useMemo for computed values (totals, selected items)
 * 3. Cleanup intervals and subscriptions in useEffect
 * 4. Storage optimization with size limits
 * 5. Debounced storage saves to reduce writes
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem as CartItemType } from '@/types/cart';
import { CartItem as ApiCartItemType } from '@/services/cartApi';
import cartService from '@/services/cartApi';
import { mapBackendCartToFrontend } from '@/utils/dataMappers';
import offlineQueueService from '@/services/offlineQueueService';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from './AuthContext';
import { billUploadAnalytics } from '@/services/billUploadAnalytics';

// Extended cart item with quantity and selected state
interface CartItemWithQuantity extends CartItemType {
  quantity: number;
  selected: boolean;
  addedAt: string;
  productId?: string;
  variant?: any;
}

interface CartState {
  items: CartItemWithQuantity[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isOnline: boolean;
  pendingSync: boolean;
}

type CartAction =
  | { type: 'CART_LOADING'; payload: boolean }
  | { type: 'CART_LOADED'; payload: CartItemWithQuantity[] }
  | { type: 'CART_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: CartItemType }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'TOGGLE_ITEM_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_ITEMS'; payload: boolean }
  | { type: 'CLEAR_CART' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_PENDING_SYNC'; payload: boolean };

// Storage key
const CART_STORAGE_KEY = 'shopping_cart';
const MAX_CART_ITEMS = 50; // Limit cart items to prevent memory issues

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
  isOnline: true,
  pendingSync: false,
};

// OPTIMIZATION: Memoized helper function
const calculateTotals = (items: CartItemWithQuantity[]) => {
  const selectedItems = items.filter(item => item.selected);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => {
    const price = item.discountedPrice || item.originalPrice || 0;
    return sum + (price * item.quantity);
  }, 0);

  return { totalItems, totalPrice };
};

// Reducer (already pure, no optimization needed)
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'CART_LOADING':
      return { ...state, isLoading: action.payload, error: null };

    case 'CART_LOADED':
      const { totalItems: loadedItems, totalPrice: loadedPrice } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems: loadedItems,
        totalPrice: loadedPrice,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case 'CART_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newItems: CartItemWithQuantity[];

      const payloadMetadata = (action.payload as any).metadata;

      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1, metadata: payloadMetadata || item.metadata }
            : item
        );
      } else {
        // OPTIMIZATION: Limit cart items to prevent memory issues
        if (state.items.length >= MAX_CART_ITEMS) {
          console.warn(`Cart limit reached (${MAX_CART_ITEMS} items)`);
          return {
            ...state,
            error: `Cart is full (max ${MAX_CART_ITEMS} items)`,
          };
        }

        const newItem: CartItemWithQuantity = {
          ...action.payload,
          quantity: 1,
          selected: true,
          addedAt: new Date().toISOString(),
          metadata: payloadMetadata,
        };
        newItems = [...state.items, newItem];
      }

      const { totalItems: newTotalItems, totalPrice: newTotalPrice } = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { totalItems: newTotalItems, totalPrice: newTotalPrice } = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== id);
        const { totalItems: newTotalItems, totalPrice: newTotalPrice } = calculateTotals(newItems);

        return {
          ...state,
          items: newItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
          lastUpdated: new Date().toISOString(),
        };
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      const { totalItems: newTotalItems, totalPrice: newTotalPrice } = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'TOGGLE_ITEM_SELECTION': {
      const newItems = state.items.map(item =>
        item.id === action.payload ? { ...item, selected: !item.selected } : item
      );
      const { totalItems: newTotalItems, totalPrice: newTotalPrice } = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'SELECT_ALL_ITEMS': {
      const newItems = state.items.map(item => ({
        ...item,
        selected: action.payload,
      }));

      const { totalItems: newTotalItems, totalPrice: newTotalPrice } = calculateTotals(newItems);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        lastUpdated: new Date().toISOString(),
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: new Date().toISOString(),
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };

    case 'SET_PENDING_SYNC':
      return { ...state, pendingSync: action.payload };

    default:
      return state;
  }
}

// Context
interface CartContextType {
  state: CartState;
  refreshCart: () => Promise<void>;
  actions: {
    loadCart: () => Promise<void>;
    addItem: (item: CartItemType) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    toggleItemSelection: (itemId: string) => void;
    selectAllItems: (selected: boolean) => void;
    clearCart: () => Promise<void>;
    clearError: () => void;
    getSelectedItems: () => CartItemWithQuantity[];
    isItemInCart: (itemId: string) => boolean;
    getItemQuantity: (itemId: string) => number;
    applyCoupon: (couponCode: string) => Promise<void>;
    removeCoupon: () => Promise<void>;
    syncWithServer: () => Promise<void>;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { state: authState } = useAuth();

  // OPTIMIZATION: Use refs to prevent recreating timers
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const netInfoUnsubscribeRef = useRef<(() => void) | null>(null);

  // OPTIMIZATION: Optimize cart items for storage - remove unnecessary fields
  const optimizeCartForStorage = useCallback((items: CartItemWithQuantity[]) => {
    return items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      image: typeof item.image === 'string' ? item.image : (item.image as any)?.uri || '',
      originalPrice: item.originalPrice,
      discountedPrice: item.discountedPrice,
      quantity: item.quantity,
      selected: item.selected,
      addedAt: item.addedAt,
      metadata: item.metadata ? {
        eventId: item.metadata.eventId,
        slotId: item.metadata.slotId,
        slotTime: item.metadata.slotTime,
        eventType: item.metadata.eventType,
        location: item.metadata.location,
        date: item.metadata.date,
        time: item.metadata.time,
      } : undefined,
      store: item.store ? (typeof item.store === 'string' ? item.store : item.store.id || item.store.name) : undefined,
      variant: item.variant ? (typeof item.variant === 'string' ? item.variant : item.variant.id || item.variant.name) : undefined,
    }));
  }, []);

  // OPTIMIZATION: Debounced storage save to reduce I/O
  const saveCartToStorage = useCallback(async () => {
    if (!state.items || state.items.length === 0) {
      return;
    }

    try {
      const optimizedItems = optimizeCartForStorage(state.items);
      const cartData = JSON.stringify(optimizedItems);

      const sizeInMB = new Blob([cartData]).size / (1024 * 1024);
      if (sizeInMB > 3) {
        console.warn('🛒 [CartContext] Cart data too large:', sizeInMB.toFixed(2), 'MB');
        const limitedItems = optimizedItems.slice(-20);
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
      } else {
        await AsyncStorage.setItem(CART_STORAGE_KEY, cartData);
      }
    } catch (error: any) {
      if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
        console.warn('🛒 [CartContext] Storage quota exceeded');

        try {
          const storageKeysToClean = [
            '@errorReporter:errors',
            '@billUpload:analytics:events',
            '@billUpload:queue',
            '@billUpload:state',
          ];

          for (const key of storageKeysToClean) {
            try {
              await AsyncStorage.removeItem(key);
            } catch (cleanupError) {
              // Ignore cleanup errors
            }
          }

          const optimizedItems = optimizeCartForStorage(state.items);
          const limitedItems = optimizedItems.slice(-15);
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
        } catch (retryError) {
          console.warn('🛒 [CartContext] Storage completely full');
        }
      }
    }
  }, [state.items, optimizeCartForStorage]);

  // OPTIMIZATION: Memoized load cart function
  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: 'CART_LOADING', payload: true });

      try {
        const response = await cartService.getCart();

        if (response.success && response.data) {
          const mappedCart = mapBackendCartToFrontend(response.data);

          const cartItems: CartItemWithQuantity[] = mappedCart.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            image: item.image,
            originalPrice: item.originalPrice,
            discountedPrice: item.price,
            discount: item.discount,
            quantity: item.quantity,
            selected: true,
            addedAt: item.addedAt,
            store: item.store,
            variant: item.variant,
            subtotal: item.subtotal,
            savings: item.savings,
          }));

          try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
          } catch (error: any) {
            if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
              const limitedItems = cartItems.slice(-30);
              await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
            }
          }

          dispatch({ type: 'CART_LOADED', payload: cartItems });
          return;
        }
      } catch (apiError) {
        // Fallback to cache
      }

      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const cartItems: CartItemWithQuantity[] = savedCart ? JSON.parse(savedCart) : [];

      dispatch({ type: 'CART_LOADED', payload: cartItems });
    } catch (error) {
      console.error('🛒 [CartContext] Failed to load cart:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load cart'
      });
    }
  }, []);

  // OPTIMIZATION: Memoized add item function
  const addItem = useCallback(async (item: CartItemType) => {
    try {
      const itemMetadata = (item as any).metadata;

      const itemWithMetadata = {
        ...item,
        metadata: itemMetadata,
      };
      dispatch({ type: 'ADD_ITEM', payload: itemWithMetadata });

      // Async storage save (non-blocking)
      (async () => {
        try {
          const currentItems = state.items;
          const existingItem = currentItems.find(i => i.id === item.id);
          let newItems: CartItemWithQuantity[];

          if (existingItem) {
            newItems = currentItems.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1, metadata: itemMetadata || i.metadata }
                : i
            );
          } else {
            const newItem: CartItemWithQuantity = {
              ...item,
              quantity: 1,
              selected: true,
              addedAt: new Date().toISOString(),
              metadata: itemMetadata,
            };
            newItems = [...currentItems, newItem];
          }

          const optimizedItems = optimizeCartForStorage(newItems);
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(optimizedItems));
        } catch (error: any) {
          if (error?.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded when adding item');
          }
        }
      })().catch(() => {});

      // Backend sync
      if (state.isOnline) {
        try {
          const itemMetadata = (item as any).metadata;
          let productIdForBackend = item.id;

          if (item.id && String(item.id).includes('_')) {
            const parts = String(item.id).split('_');
            productIdForBackend = parts[0];
          } else if (itemMetadata?.eventId) {
            productIdForBackend = String(itemMetadata.eventId);
          }

          const requestData = {
            productId: String(productIdForBackend).trim(),
            quantity: 1,
          };

          const response = await cartService.addToCart(requestData);

          if (response.success && response.data) {
            await loadCart();
          }
        } catch (apiError) {
          console.error('🛒 API add failed, queuing:', apiError);
          await offlineQueueService.addToQueue('add', {
            productId: item.id,
            quantity: 1,
          });
        }
      } else {
        await offlineQueueService.addToQueue('add', {
          productId: item.id,
          quantity: 1,
        });
      }
    } catch (error: any) {
      if (error?.name !== 'QuotaExceededError') {
        console.error('🛒 Failed to add item:', error);
        dispatch({
          type: 'CART_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to add item'
        });
      }
    }
  }, [state.items, state.isOnline, optimizeCartForStorage, loadCart]);

  // OPTIMIZATION: Other memoized functions
  const removeItem = useCallback(async (itemId: string) => {
    try {
      const item = state.items.find(i => i.id === itemId);

      if (!item) {
        console.error('🛒 Item not found:', itemId);
        return;
      }

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      try {
        const productIdToRemove = item.productId || itemId;
        const response = await cartService.removeCartItem(productIdToRemove, item.variant);

        if (response.success) {
          await loadCart();
        } else {
          await loadCart();
        }
      } catch (apiError) {
        console.error('🛒 API remove failed:', apiError);
        await loadCart();
      }
    } catch (error) {
      console.error('🛒 Failed to remove item:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove item'
      });
      await loadCart();
    }
  }, [state.items, loadCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const item = state.items.find(i => i.id === itemId);
      if (!item) {
        console.error('🛒 Item not found:', itemId);
        return;
      }

      const productId = item.productId || itemId;
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });

      try {
        if (quantity > 0) {
          const response = await cartService.updateCartItem(productId, { quantity }, item.variant);

          if (response.success) {
            await loadCart();
          } else {
            await loadCart();
          }
        } else {
          await removeItem(itemId);
        }
      } catch (apiError) {
        console.error('🛒 API update failed:', apiError);
        await loadCart();
      }
    } catch (error) {
      console.error('🛒 Failed to update quantity:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update quantity'
      });
      await loadCart();
    }
  }, [state.items, loadCart, removeItem]);

  const toggleItemSelection = useCallback((itemId: string) => {
    dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: itemId });
  }, []);

  const selectAllItems = useCallback((selected: boolean) => {
    dispatch({ type: 'SELECT_ALL_ITEMS', payload: selected });
  }, []);

  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      await AsyncStorage.removeItem(CART_STORAGE_KEY);

      try {
        await cartService.clearCart();
      } catch (apiError) {
        console.error('🛒 API clear failed:', apiError);
      }
    } catch (error) {
      console.error('🛒 Failed to clear cart:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to clear cart'
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // OPTIMIZATION: Memoized utility functions
  const getSelectedItems = useCallback((): CartItemWithQuantity[] => {
    return state.items.filter(item => item.selected);
  }, [state.items]);

  const isItemInCart = useCallback((itemId: string): boolean => {
    return state.items.some(item => item.id === itemId);
  }, [state.items]);

  const getItemQuantity = useCallback((itemId: string): number => {
    const item = state.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  }, [state.items]);

  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      const response = await cartService.applyCoupon({ couponCode });

      if (response.success && response.data) {
        await loadCart();
      }
    } catch (error) {
      console.error('🛒 Failed to apply coupon:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to apply coupon'
      });
      throw error;
    }
  }, [loadCart]);

  const removeCoupon = useCallback(async () => {
    try {
      const response = await cartService.removeCoupon();

      if (response.success && response.data) {
        await loadCart();
      }
    } catch (error) {
      console.error('🛒 Failed to remove coupon:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove coupon'
      });
      throw error;
    }
  }, [loadCart]);

  const syncWithServer = useCallback(async () => {
    try {
      if (!state.isOnline) {
        return;
      }

      dispatch({ type: 'CART_LOADING', payload: true });

      const result = await offlineQueueService.processQueue();

      if (result.success) {
        await loadCart();
      } else {
        dispatch({
          type: 'CART_ERROR',
          payload: `Failed to sync ${result.failed} operations`
        });
      }
    } catch (error) {
      console.error('🔄 Sync error:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to sync'
      });
    } finally {
      dispatch({ type: 'CART_LOADING', payload: false });
    }
  }, [state.isOnline, loadCart]);

  // OPTIMIZATION: Load cart only when authenticated
  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated && authState.token) {
      loadCart();
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.token, loadCart]);

  // OPTIMIZATION: Network monitoring with cleanup
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      const isOnline = netState.isConnected ?? false;
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });

      if (isOnline && offlineQueueService.hasPendingOperations()) {
        syncWithServer();
      }
    });

    NetInfo.fetch().then(netState => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: netState.isConnected ?? false });
    });

    netInfoUnsubscribeRef.current = unsubscribe;

    // CLEANUP
    return () => {
      if (netInfoUnsubscribeRef.current) {
        netInfoUnsubscribeRef.current();
        netInfoUnsubscribeRef.current = null;
      }
    };
  }, [syncWithServer]);

  // OPTIMIZATION: Debounced storage save
  useEffect(() => {
    if (state.lastUpdated) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce storage save (wait 500ms after last change)
      saveTimeoutRef.current = setTimeout(() => {
        saveCartToStorage().catch(() => {});
      }, 500);
    }

    // CLEANUP
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [state.items, state.lastUpdated, saveCartToStorage]);

  // OPTIMIZATION: Pending sync check with cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const hasPending = offlineQueueService.hasPendingOperations();
      dispatch({ type: 'SET_PENDING_SYNC', payload: hasPending });
    }, 5000); // Check every 5 seconds instead of 1 second

    syncCheckIntervalRef.current = interval;

    // CLEANUP
    return () => {
      if (syncCheckIntervalRef.current) {
        clearInterval(syncCheckIntervalRef.current);
        syncCheckIntervalRef.current = null;
      }
    };
  }, []);

  // OPTIMIZATION: Memoize context value to prevent unnecessary re-renders
  const contextValue: CartContextType = useMemo(() => ({
    state,
    refreshCart: loadCart,
    actions: {
      loadCart,
      addItem,
      removeItem,
      updateQuantity,
      toggleItemSelection,
      selectAllItems,
      clearCart,
      clearError,
      getSelectedItems,
      isItemInCart,
      getItemQuantity,
      applyCoupon,
      removeCoupon,
      syncWithServer,
    },
  }), [
    state,
    loadCart,
    addItem,
    removeItem,
    updateQuantity,
    toggleItemSelection,
    selectAllItems,
    clearCart,
    clearError,
    getSelectedItems,
    isItemInCart,
    getItemQuantity,
    applyCoupon,
    removeCoupon,
    syncWithServer,
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartContext };
