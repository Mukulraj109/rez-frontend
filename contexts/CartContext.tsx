import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem as CartItemType } from '@/types/cart';
import cartService from '@/services/cartApi';
import { mapBackendCartToFrontend } from '@/utils/dataMappers';

// Extended cart item with quantity and selected state
interface CartItemWithQuantity extends CartItemType {
  quantity: number;
  selected: boolean;
  addedAt: string;
}

interface CartState {
  items: CartItemWithQuantity[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
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
  | { type: 'CLEAR_ERROR' };

// Storage key
const CART_STORAGE_KEY = 'shopping_cart';

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Helper functions
const calculateTotals = (items: CartItemWithQuantity[]) => {
  const selectedItems = items.filter(item => item.selected);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => {
    const price = item.discountedPrice || item.originalPrice || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  return { totalItems, totalPrice };
};

// Reducer
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
      
      if (existingItem) {
        // Increase quantity if item already exists
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItemWithQuantity = {
          ...action.payload,
          quantity: 1,
          selected: true,
          addedAt: new Date().toISOString(),
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
        // Remove item if quantity is 0 or less
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
    
    default:
      return state;
  }
}

// Context
interface CartContextType {
  state: CartState;
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
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (state.lastUpdated) {
      saveCartToStorage();
    }
  }, [state.items]);

  // Actions
  const loadCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING', payload: true });

      console.log('🛒 [CartContext] Loading cart from API...');

      // Try to load from API first
      try {
        const response = await cartService.getCart();

        if (response.success && response.data) {
          console.log('🛒 [CartContext] Cart loaded from API successfully');
          console.log('🛒 [CartContext] Raw backend cart data:', response.data);
          console.log('🛒 [CartContext] Raw cart items:', response.data.items);

          const mappedCart = mapBackendCartToFrontend(response.data);
          console.log('🛒 [CartContext] Mapped cart:', mappedCart);

          // Convert to CartItemWithQuantity format
          const cartItems: CartItemWithQuantity[] = mappedCart.items.map((item: any) => {
            console.log('🛒 [CartContext] Mapping item to CartItemWithQuantity:', {
              id: item.id,
              name: item.name,
              image: item.image,
              hasImage: !!item.image
            });

            return {
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
            };
          });

          // Save to AsyncStorage as cache
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));

          dispatch({ type: 'CART_LOADED', payload: cartItems });
          return;
        }
      } catch (apiError) {
        console.log('🛒 [CartContext] API failed, loading from cache:', apiError);
      }

      // Fallback to AsyncStorage cache
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
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  };

  const addItem = async (item: CartItemType) => {
    try {
      console.log('🛒 [CartContext] Adding item to cart via API:', item);

      // First update UI optimistically
      dispatch({ type: 'ADD_ITEM', payload: item });

      // Then sync with backend
      try {
        const response = await cartService.addToCart({
          productId: item.productId || item.id,
          quantity: 1,
          variant: item.variant,
        });

        if (response.success && response.data) {
          console.log('🛒 [CartContext] Item added to API cart successfully');
          // Reload cart from backend to get updated totals
          await loadCart();
        }
      } catch (apiError) {
        console.error('🛒 [CartContext] API add failed, keeping local change:', apiError);
        // Keep the optimistic update even if API fails
      }
    } catch (error) {
      console.error('🛒 [CartContext] Failed to add item:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to add item'
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      console.log('🛒 [CartContext] Removing item from cart:', itemId);
      console.log('🛒 [CartContext] Current cart items:', state.items.map(i => ({ id: i.id, productId: i.productId, name: i.name })));

      // Find the item to get its productId and variant
      const item = state.items.find(i => i.id === itemId);

      if (!item) {
        console.error('🛒 [CartContext] Item not found in cart:', itemId);
        console.error('🛒 [CartContext] Available item IDs:', state.items.map(i => i.id));
        return;
      }

      console.log('🛒 [CartContext] Found item to remove:', {
        itemId: item.id,
        productId: item.productId,
        name: item.name,
        variant: item.variant
      });

      // Optimistic update
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      // Sync with backend using productId (not cart item id)
      try {
        const productIdToRemove = item.productId || itemId;
        console.log('🛒 [CartContext] Calling API to remove product:', productIdToRemove, 'with variant:', item.variant);

        const response = await cartService.removeCartItem(
          productIdToRemove,
          item.variant
        );

        console.log('🛒 [CartContext] API remove response:', response);

        if (response.success) {
          console.log('🛒 [CartContext] Item removed from API cart successfully');
          // Reload cart to ensure sync with backend
          await loadCart();
        } else {
          console.error('🛒 [CartContext] API remove failed, response not successful:', response);
          // Revert optimistic update by reloading
          await loadCart();
        }
      } catch (apiError) {
        console.error('🛒 [CartContext] API remove failed with error:', apiError);
        // Revert optimistic update by reloading cart from backend
        await loadCart();
      }
    } catch (error) {
      console.error('🛒 [CartContext] Failed to remove item:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove item'
      });
      // Reload to get correct state
      await loadCart();
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      console.log('🛒 [CartContext] Updating quantity for cart item:', itemId, 'to quantity:', quantity);

      // Find the item to get its productId
      const item = state.items.find(i => i.id === itemId);
      if (!item) {
        console.error('🛒 [CartContext] Item not found in cart:', itemId);
        return;
      }

      const productId = item.productId || itemId;
      console.log('🛒 [CartContext] Found productId:', productId, 'variant:', item.variant);

      // Optimistic update
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });

      // Sync with backend using productId (not cart item id)
      try {
        if (quantity > 0) {
          const response = await cartService.updateCartItem(
            productId,
            { quantity },
            item.variant
          );

          if (response.success) {
            console.log('🛒 [CartContext] Quantity updated in API cart successfully');
            // Reload cart to ensure sync with backend
            await loadCart();
          } else {
            console.error('🛒 [CartContext] API update failed, response not successful');
            // Revert optimistic update by reloading
            await loadCart();
          }
        } else {
          // Remove item if quantity is 0
          await removeItem(itemId);
        }
      } catch (apiError) {
        console.error('🛒 [CartContext] API update failed with error:', apiError);
        // Revert optimistic update by reloading cart from backend
        await loadCart();
      }
    } catch (error) {
      console.error('🛒 [CartContext] Failed to update quantity:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update quantity'
      });
      // Reload to get correct state
      await loadCart();
    }
  };

  const toggleItemSelection = (itemId: string) => {
    dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: itemId });
  };

  const selectAllItems = (selected: boolean) => {
    dispatch({ type: 'SELECT_ALL_ITEMS', payload: selected });
  };

  const clearCart = async () => {
    try {
      console.log('🛒 [CartContext] Clearing cart');

      // Clear local state
      dispatch({ type: 'CLEAR_CART' });
      await AsyncStorage.removeItem(CART_STORAGE_KEY);

      // Clear backend cart
      try {
        await cartService.clearCart();
        console.log('🛒 [CartContext] Cart cleared on backend');
      } catch (apiError) {
        console.error('🛒 [CartContext] API clear failed:', apiError);
      }
    } catch (error) {
      console.error('🛒 [CartContext] Failed to clear cart:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to clear cart'
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Utility functions
  const getSelectedItems = (): CartItemWithQuantity[] => {
    return state.items.filter(item => item.selected);
  };

  const isItemInCart = (itemId: string): boolean => {
    return state.items.some(item => item.id === itemId);
  };

  const getItemQuantity = (itemId: string): number => {
    const item = state.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const applyCoupon = async (couponCode: string) => {
    try {
      console.log('🛒 [CartContext] Applying coupon:', couponCode);

      const response = await cartService.applyCoupon({ couponCode });

      if (response.success && response.data) {
        console.log('🛒 [CartContext] Coupon applied successfully');
        await loadCart(); // Reload to get updated totals
      }
    } catch (error) {
      console.error('🛒 [CartContext] Failed to apply coupon:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to apply coupon'
      });
      throw error;
    }
  };

  const removeCoupon = async () => {
    try {
      console.log('🛒 [CartContext] Removing coupon');

      const response = await cartService.removeCoupon();

      if (response.success && response.data) {
        console.log('🛒 [CartContext] Coupon removed successfully');
        await loadCart(); // Reload to get updated totals
      }
    } catch (error) {
      console.error('🛒 [CartContext] Failed to remove coupon:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to remove coupon'
      });
      throw error;
    }
  };

  const contextValue: CartContextType = {
    state,
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
    },
  };

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