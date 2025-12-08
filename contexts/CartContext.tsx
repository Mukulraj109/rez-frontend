import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem as CartItemType } from '@/types/cart';
import { CartItem as ApiCartItemType, UnifiedCartItem, UnifiedCart } from '@/services/cartApi';
import cartService from '@/services/cartApi';
import { mapBackendCartToFrontend } from '@/utils/dataMappers';
import offlineQueueService from '@/services/offlineQueueService';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from './AuthContext';
import { billUploadAnalytics } from '@/services/billUploadAnalytics';
import cacheService from '@/services/cacheService';
import {
  CartItem as UnifiedCartItemType,
  toCartItem,
  validateCartItem as validateUnifiedCartItem,
  isCartItemAvailable
} from '@/types/unified';
import {
  validateCartItem,
  validateQuantity,
  MAX_QUANTITY_PER_ITEM,
  MIN_QUANTITY,
} from '@/utils/cartValidation';

// Extended cart item with quantity and selected state
interface CartItemWithQuantity extends CartItemType {
  quantity: number;
  selected: boolean;
  addedAt: string;
  productId?: string;
  variant?: any;
  itemType?: 'product' | 'service' | 'event';
  serviceBookingDetails?: {
    bookingDate: Date | string | null;
    timeSlot: { start: string; end: string } | null;
    duration: number;
    serviceType: string;
    customerNotes?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  } | null;
  metadata?: any;
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
  appliedCardOffer?: any; // Applied card offer discount
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
  | { type: 'SET_PENDING_SYNC'; payload: boolean }
  | { type: 'SET_CARD_OFFER'; payload: any }
  | { type: 'REMOVE_CARD_OFFER' };

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
  isOnline: true,
  pendingSync: false,
  appliedCardOffer: undefined,
};

// Helper functions
const calculateTotals = (items: CartItemWithQuantity[]) => {
  const selectedItems = items.filter(item => item.selected);
  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => {
    const price = item.discountedPrice || item.originalPrice || 0;
    const discount = item.discount || 0; // Lock fee discount (only applies to lockedQuantity items)
    // Total = (price × quantity) - discount
    // This ensures: 2 items at ₹10,000 = ₹20,000, minus ₹500 lock fee = ₹19,500
    return sum + (price * item.quantity) - discount;
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
      // Validate cart item structure
      const itemValidation = validateCartItem(action.payload);
      if (!itemValidation.valid) {
        console.error('🛒 [CartReducer] Invalid cart item:', itemValidation.error);
        return {
          ...state,
          error: itemValidation.error || 'Invalid cart item',
        };
      }

      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newItems: CartItemWithQuantity[];

      // Preserve metadata from payload
      const payloadMetadata = (action.payload as any).metadata;

      if (existingItem) {
        // Validate quantity increase
        const quantityValidation = validateQuantity(
          1, // Adding 1 more
          MAX_QUANTITY_PER_ITEM,
          existingItem.quantity
        );

        if (!quantityValidation.valid) {
          console.warn('🛒 [CartReducer] Quantity limit reached:', quantityValidation.error);
          return {
            ...state,
            error: quantityValidation.error || 'Cannot add more items',
          };
        }

        // Increase quantity if item already exists
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1, metadata: payloadMetadata || item.metadata }
            : item
        );
      } else {
        // Validate initial quantity
        const quantityValidation = validateQuantity(1, MAX_QUANTITY_PER_ITEM, 0);
        if (!quantityValidation.valid) {
          console.error('🛒 [CartReducer] Invalid quantity:', quantityValidation.error);
          return {
            ...state,
            error: quantityValidation.error || 'Invalid quantity',
          };
        }

        // Add new item
        const newItem: CartItemWithQuantity = {
          ...action.payload,
          quantity: 1,
          selected: true,
          addedAt: new Date().toISOString(),
          metadata: payloadMetadata, // Preserve metadata
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
        error: null, // Clear any previous errors
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

      // Allow quantity 0 for removal
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
          error: null,
        };
      }

      // Validate quantity
      const quantityValidation = validateQuantity(quantity, MAX_QUANTITY_PER_ITEM, 0);
      if (!quantityValidation.valid) {
        console.warn('🛒 [CartReducer] Invalid quantity update:', quantityValidation.error);
        return {
          ...state,
          error: quantityValidation.error || 'Invalid quantity',
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
        error: null,
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

    case 'SET_CARD_OFFER':
      return { ...state, appliedCardOffer: action.payload };

    case 'REMOVE_CARD_OFFER':
      return { ...state, appliedCardOffer: undefined };

    default:
      return state;
  }
}

// Context
interface CartContextType {
  state: CartState;
  refreshCart: () => Promise<void>; // Alias for loadCart
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
    setCardOffer: (offer: any) => Promise<void>;
    removeCardOffer: () => void;
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

  // Actions - Define functions before useEffects
  const loadCart = useCallback(async () => {
    try {
      dispatch({ type: 'CART_LOADING', payload: true });

      // Try to load from API first
      try {
        const response = await cartService.getCart();

        if (response.success && response.data) {

          const mappedCart = mapBackendCartToFrontend(response.data);

          // Convert to CartItemWithQuantity format
          const cartItems: CartItemWithQuantity[] = mappedCart.items.map((item: any) => {

            return {
              id: item.id,
              productId: item.productId,
              name: item.name,
              image: item.image,
              originalPrice: item.originalPrice,
              discountedPrice: item.price,
              discount: item.discount, // Lock fee discount
              lockedQuantity: item.lockedQuantity, // How many items have lock fee applied
              quantity: item.quantity,
              selected: true,
              addedAt: item.addedAt,
              store: item.store,
              variant: item.variant,
              subtotal: item.subtotal,
              savings: item.savings,
              // Item type and service/event details
              itemType: item.itemType || 'product',
              serviceBookingDetails: item.serviceBookingDetails || null,
              metadata: item.metadata || null,
            };
          });

          // Save to AsyncStorage as cache (optimized)
          // Note: optimizeCartForStorage is defined later, but we'll save directly here
          // The optimization will happen on next save
          try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
          } catch (error: any) {
            if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
              console.warn('🛒 [CartContext] Storage quota exceeded when loading cart');
              // Save only last 30 items
              const limitedItems = cartItems.slice(-30);
              await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
            }
          }

          dispatch({ type: 'CART_LOADED', payload: cartItems });
          return;
        }
      } catch (apiError) {

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
  }, []);

  // Optimize cart items for storage - remove unnecessary fields
  const optimizeCartForStorage = useCallback((items: CartItemWithQuantity[]) => {
    return items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      // Store only essential image data (URL only, no full image objects)
      image: typeof item.image === 'string' ? item.image : (item.image as any)?.uri || '',
      originalPrice: item.originalPrice,
      discountedPrice: item.discountedPrice,
      quantity: item.quantity,
      selected: item.selected,
      addedAt: item.addedAt,
      // Only store essential metadata (eventId, slotId) - remove large objects
      metadata: item.metadata ? {
        eventId: item.metadata.eventId,
        slotId: item.metadata.slotId,
        slotTime: item.metadata.slotTime,
        eventType: item.metadata.eventType,
        location: item.metadata.location,
        date: item.metadata.date,
        time: item.metadata.time,
      } : undefined,
      // Remove large fields like full store objects, variant objects, etc.
      store: item.store ? (typeof item.store === 'string' ? item.store : item.store.id || item.store.name) : undefined,
      variant: item.variant ? (typeof item.variant === 'string' ? item.variant : item.variant.id || item.variant.name) : undefined,
    }));
  }, []);

  const saveCartToStorage = useCallback(async () => {
    // Skip if no items to save
    if (!state.items || state.items.length === 0) {
      return;
    }

    try {
      // Optimize cart data before saving
      const optimizedItems = optimizeCartForStorage(state.items);
      const cartData = JSON.stringify(optimizedItems);
      
      // Check size (localStorage limit is typically 5-10MB)
      const sizeInMB = new Blob([cartData]).size / (1024 * 1024);
      if (sizeInMB > 3) { // Lower threshold to 3MB
        console.warn('🛒 [CartContext] Cart data is large:', sizeInMB.toFixed(2), 'MB');
        // If too large, keep only last 20 items
        if (optimizedItems.length > 20) {
          const limitedItems = optimizedItems.slice(-20);
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
          console.warn('🛒 [CartContext] Limited cart to 20 items to save storage space');
          return;
        }
      }
      
      await AsyncStorage.setItem(CART_STORAGE_KEY, cartData);
    } catch (error: any) {
      // Handle quota exceeded error - don't throw, just log
      if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
        console.warn('🛒 [CartContext] Storage quota exceeded, attempting to clean up...');
        
        try {
          // Aggressively clean up storage first
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
              // Ignore cleanup errors for individual keys
            }
          }
          
          // Try to save only essential items (last 15 items - very aggressive)
          const optimizedItems = optimizeCartForStorage(state.items);
          const limitedItems = optimizedItems.slice(-15);
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
          console.warn('🛒 [CartContext] Saved only last 15 items after cleanup');
        } catch (retryError) {
          // If still fails, just log - don't throw
          // Cart is still in memory, will sync with backend
          console.warn('🛒 [CartContext] Storage completely full, cart kept in memory only');
          // Try to clear cart storage to free space
          try {
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
          } catch (clearError) {
            // Ignore - storage is full, can't do anything
          }
        }
      } else {
        // For non-quota errors, just log - don't throw
        console.warn('🛒 [CartContext] Failed to save cart to storage (non-quota):', error);
      }
    }
  }, [state.items, optimizeCartForStorage]);

  const addItem = async (item: CartItemType) => {
    try {
      // Debug: Log the item being added
      const itemMetadata = (item as any).metadata;
      console.log('🛒 [CartContext] addItem called with:', {
        id: item.id,
        metadata: itemMetadata,
        hasMetadata: !!itemMetadata,
        metadataEventId: itemMetadata?.eventId,
        fullItem: item,
      });

      // Invalidate cache on cart add
      await cacheService.invalidateByEvent({ type: 'cart:add' });

      // Update UI optimistically - reducer will handle the state update
      // Make sure metadata is preserved - explicitly spread metadata
      const itemWithMetadata = {
        ...item,
        metadata: itemMetadata, // Explicitly preserve metadata
      };
      dispatch({ type: 'ADD_ITEM', payload: itemWithMetadata });
      
      // Calculate new items (same logic as reducer)
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
          metadata: itemMetadata, // Preserve metadata
        };
        newItems = [...currentItems, newItem];
      }
      
      // Save to AsyncStorage immediately to persist (with optimization)
      // Don't let storage errors break the addItem flow - wrap in separate async function
      // Use .catch() to ensure errors never propagate
      (async () => {
        try {
          const optimizedItems = optimizeCartForStorage(newItems);
          const cartData = JSON.stringify(optimizedItems);
          
          // Check size before saving
          const sizeInMB = new Blob([cartData]).size / (1024 * 1024);
          if (sizeInMB > 3) { // Lower threshold to 3MB
            console.warn('🛒 [CartContext] Cart data too large, limiting to last 20 items');
            const limitedItems = optimizedItems.slice(-20);
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
          } else {
            await AsyncStorage.setItem(CART_STORAGE_KEY, cartData);
          }
        } catch (error: any) {
          // Handle quota exceeded error - don't throw, just log
          if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
            console.warn('🛒 [CartContext] Storage quota exceeded when adding item (handled gracefully)');
            
            // Aggressively clean up storage
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
              
              // Also cleanup analytics events to free more space
              try {
                await billUploadAnalytics.cleanupOldEvents(100);
              } catch (analyticsError) {
                // Ignore analytics cleanup errors
              }
              
              // Try to save only last 15 items (very aggressive)
              const optimizedItems = optimizeCartForStorage(newItems);
              const limitedItems = optimizedItems.slice(-15);
              await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(limitedItems));
              console.warn('🛒 [CartContext] Saved only last 15 items after cleanup');
            } catch (retryError) {
              // If still fails, just log - don't throw
              // Item is already in state, will sync with backend
              console.warn('🛒 [CartContext] Storage completely full, item added to memory only');
            }
          } else {
            // For non-quota errors, just log - don't throw
            console.warn('🛒 [CartContext] Failed to save to storage (non-quota):', error);
          }
        }
      })().catch(() => {
        // Final safety net - ensure no errors propagate
        // This should never be reached, but just in case
      });

      // Check if online
      if (state.isOnline) {
        // Sync with backend (but don't reload if it fails - keep local state)
        try {
          // For events, extract the actual eventId from metadata
          // The item.id might be "eventId_slotId" format, but backend needs just eventId
          const itemMetadata = (item as any).metadata;
          let productIdForBackend = item.id;
          
          console.log('🛒 [CartContext] BEFORE extraction:', {
            itemId: item.id,
            itemIdType: typeof item.id,
            hasMetadata: !!itemMetadata,
            metadata: itemMetadata,
            metadataEventId: itemMetadata?.eventId,
            metadataEventIdType: typeof itemMetadata?.eventId,
          });
          
          // ALWAYS extract from composite ID if it contains underscore
          // This is the most reliable way since metadata might not be preserved
          if (item.id && String(item.id).includes('_')) {
            // Extract eventId from composite ID (before underscore)
            // Format: "eventId_slotId" -> "eventId"
            const parts = String(item.id).split('_');
            productIdForBackend = parts[0]; // Take first part (eventId)
            console.log('✅ [CartContext] Extracted from composite ID:', productIdForBackend, 'from', item.id);
          } else if (itemMetadata?.eventId) {
            // Use eventId from metadata if available (fallback)
            productIdForBackend = String(itemMetadata.eventId);
            console.log('✅ [CartContext] Using metadata.eventId:', productIdForBackend);
          }
          
          // Validate productId is hexadecimal (backend requirement)
          const isValidHex = /^[0-9a-fA-F]+$/.test(String(productIdForBackend));
          if (!isValidHex) {
            // If not valid hex, try extracting from composite ID again
            if (item.id && String(item.id).includes('_')) {
              const parts = String(item.id).split('_');
              productIdForBackend = parts[0];
              console.log('✅ [CartContext] Re-extracted from composite ID:', productIdForBackend);
            }
            // If still not valid, log warning
            if (!/^[0-9a-fA-F]+$/.test(String(productIdForBackend))) {
              console.error('❌ [CartContext] Invalid productId format:', productIdForBackend);
            }
          }
          
          // Final validation - ensure productId is valid hex
          const finalProductId = String(productIdForBackend).trim();
          if (!/^[0-9a-fA-F]+$/.test(finalProductId)) {
            console.error('❌ [CartContext] Invalid productId, cannot send to backend:', finalProductId);
            throw new Error(`Invalid productId format: ${finalProductId}. Must be hexadecimal.`);
          }
          
          console.log('✅ [CartContext] FINAL productId:', {
            originalItemId: item.id,
            extractedProductId: finalProductId,
            isValidHex: /^[0-9a-fA-F]+$/.test(finalProductId),
          });
          
          // Backend doesn't accept metadata field, so only send productId and quantity
          // Metadata is preserved in local cart state for UI display
          const requestData = {
            productId: finalProductId,
            quantity: 1,
          };
          
          console.log('📤 [CartContext] Sending to backend:', JSON.stringify(requestData, null, 2));
          
          const response = await cartService.addToCart(requestData);

          if (response.success && response.data) {
            // Only reload if backend sync succeeds
            await loadCart();
          }
        } catch (apiError) {
          console.error('🛒 [CartContext] API add failed, queuing for later:', apiError);
          // Queue for offline sync but keep local state
          await offlineQueueService.addToQueue('add', {
            productId: item.id,
            quantity: 1,
            // Don't include variant since CartItem type doesn't have it
          });
        }
      } else {
        // Queue for offline sync
        await offlineQueueService.addToQueue('add', {
          productId: item.id,
          quantity: 1,
          // Don't include variant since CartItem type doesn't have it
        });
      }
    } catch (error: any) {
      // Don't log quota errors as failures - they're handled gracefully
      if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
        console.warn('🛒 [CartContext] Storage quota issue (item still added to state)');
        // Item is already in state, so don't dispatch error
      } else {
        console.error('🛒 [CartContext] Failed to add item:', error);
        dispatch({
          type: 'CART_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to add item'
        });
      }
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      // Find the item to get its productId and variant
      const item = state.items.find(i => i.id === itemId);

      if (!item) {
        console.error('🛒 [CartContext] Item not found in cart:', itemId);
        console.error('🛒 [CartContext] Available item IDs:', state.items.map(i => i.id));
        return;
      }

      // Invalidate cache on cart remove
      await cacheService.invalidateByEvent({ type: 'cart:remove' });

      // Optimistic update
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      // Sync with backend using productId (not cart item id)
      try {
        const productIdToRemove = item.productId || itemId;

        const response = await cartService.removeCartItem(
          productIdToRemove,
          item.variant
        );
        if (response.success) {

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

      // Find the item to get its productId
      const item = state.items.find(i => i.id === itemId);
      if (!item) {
        console.error('🛒 [CartContext] Item not found in cart:', itemId);
        return;
      }

      const productId = item.productId || itemId;

      // Invalidate cache on cart update
      await cacheService.invalidateByEvent({ type: 'cart:update' });

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

      // Invalidate cache on cart clear
      await cacheService.invalidateByEvent({ type: 'cart:clear' });

      // Clear local state
      dispatch({ type: 'CLEAR_CART' });
      await AsyncStorage.removeItem(CART_STORAGE_KEY);

      // Clear backend cart
      try {
        await cartService.clearCart();

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

      const response = await cartService.applyCoupon({ couponCode });

      if (response.success && response.data) {

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

      const response = await cartService.removeCoupon();

      if (response.success && response.data) {

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

  const setCardOffer = useCallback(async (offer: any) => {
    try {
      dispatch({ type: 'SET_CARD_OFFER', payload: offer });
      
      // If offer has a code, apply it as coupon
      if (offer.code && typeof applyCoupon === 'function') {
        await applyCoupon(offer.code);
      }
    } catch (error) {
      console.error('🛒 [CartContext] Failed to set card offer:', error);
      throw error;
    }
  }, []);

  const removeCardOffer = useCallback(() => {
    dispatch({ type: 'REMOVE_CARD_OFFER' });
  }, []);

  const syncWithServer = useCallback(async () => {
    try {
      if (!state.isOnline) {

        return;
      }

      dispatch({ type: 'CART_LOADING', payload: true });

      // Process offline queue
      const result = await offlineQueueService.processQueue();

      if (result.success) {

        // Reload cart from server
        await loadCart();
      } else {
        console.error('🔄 [CartContext] Sync partially failed:', result);
        dispatch({
          type: 'CART_ERROR',
          payload: `Failed to sync ${result.failed} operations`
        });
      }
    } catch (error) {
      console.error('🔄 [CartContext] Sync error:', error);
      dispatch({
        type: 'CART_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to sync'
      });
    } finally {
      dispatch({ type: 'CART_LOADING', payload: false });
    }
  }, [state.isOnline, loadCart]);

  // Effects - Run after function definitions
  // Load cart only when user is authenticated
  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated && authState.token) {
      loadCart();
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.token, loadCart]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      const isOnline = netState.isConnected ?? false;
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });

      // Auto-sync when connection is restored
      if (isOnline && offlineQueueService.hasPendingOperations()) {
        syncWithServer();
      }
    });

    // Initial check
    NetInfo.fetch().then(netState => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: netState.isConnected ?? false });
    });

    return () => unsubscribe();
  }, [syncWithServer]);

  // Save cart to storage whenever it changes
  // Wrap in try-catch to prevent errors from breaking the app
  useEffect(() => {
    if (state.lastUpdated) {
      // Don't await - let it run in background, errors won't propagate
      saveCartToStorage().catch((error: any) => {
        // Silently handle storage errors - they're already handled in saveCartToStorage
        if (error?.name !== 'QuotaExceededError' && !error?.message?.includes('quota')) {
          console.warn('🛒 [CartContext] Storage save failed in useEffect:', error);
        }
      });
    }
  }, [state.items, state.lastUpdated, saveCartToStorage]);

  // Update pending sync status
  useEffect(() => {
    const interval = setInterval(() => {
      const hasPending = offlineQueueService.hasPendingOperations();
      dispatch({ type: 'SET_PENDING_SYNC', payload: hasPending });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const contextValue: CartContextType = {
    state,
    refreshCart: loadCart, // Alias for loadCart
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
      setCardOffer,
      removeCardOffer,
      syncWithServer,
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