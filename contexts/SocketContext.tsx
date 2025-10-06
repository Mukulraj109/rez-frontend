import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  SocketEvents,
  SocketState,
  SocketConfig,
  StockUpdatePayload,
  LowStockPayload,
  OutOfStockPayload,
  PriceUpdatePayload,
  ProductAvailabilityPayload,
  FlashSaleStartedPayload,
  FlashSaleEndingSoonPayload,
  FlashSaleEndedPayload,
  FlashSaleStockUpdatedPayload,
  FlashSaleStockLowPayload,
  FlashSaleSoldOutPayload,
  StockUpdateCallback,
  LowStockCallback,
  OutOfStockCallback,
  PriceUpdateCallback,
  ProductAvailabilityCallback,
  FlashSaleStartedCallback,
  FlashSaleEndingSoonCallback,
  FlashSaleEndedCallback,
  FlashSaleStockUpdatedCallback,
  FlashSaleStockLowCallback,
  FlashSaleSoldOutCallback,
  ConnectionCallback,
  ErrorCallback,
} from '@/types/socket.types';

// Get Socket URL from environment
const getSocketUrl = (): string => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';
  // Extract the base URL without /api path
  const baseUrl = apiBaseUrl.replace('/api', '');

  // For web, use localhost. For mobile, use the machine's IP address
  if (Platform.OS === 'web') {
    return baseUrl;
  }

  // For mobile development, replace localhost with your machine's IP
  // You can get this from the Expo DevTools or by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  return baseUrl.replace('localhost', '10.0.2.2'); // Default Android emulator host
};

// Socket configuration with sensible defaults
const DEFAULT_CONFIG: Partial<SocketConfig> = {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
};

interface SocketContextType {
  socket: Socket | null;
  state: SocketState;

  // Connection methods
  connect: () => void;
  disconnect: () => void;

  // Event subscription methods
  onStockUpdate: (callback: StockUpdateCallback) => () => void;
  onLowStock: (callback: LowStockCallback) => () => void;
  onOutOfStock: (callback: OutOfStockCallback) => () => void;
  onPriceUpdate: (callback: PriceUpdateCallback) => () => void;
  onProductAvailability: (callback: ProductAvailabilityCallback) => () => void;
  onConnect: (callback: ConnectionCallback) => () => void;
  onDisconnect: (callback: ConnectionCallback) => () => void;
  onError: (callback: ErrorCallback) => () => void;

  // Flash sale event subscription methods
  onFlashSaleStarted: (callback: FlashSaleStartedCallback) => () => void;
  onFlashSaleEndingSoon: (callback: FlashSaleEndingSoonCallback) => () => void;
  onFlashSaleEnded: (callback: FlashSaleEndedCallback) => () => void;
  onFlashSaleStockUpdated: (callback: FlashSaleStockUpdatedCallback) => () => void;
  onFlashSaleStockLow: (callback: FlashSaleStockLowCallback) => () => void;
  onFlashSaleSoldOut: (callback: FlashSaleSoldOutCallback) => () => void;

  // Product/Store subscription methods
  subscribeToProduct: (productId: string) => void;
  unsubscribeFromProduct: (productId: string) => void;
  subscribeToStore: (storeId: string) => void;
  unsubscribeFromStore: (storeId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  config?: Partial<SocketConfig>;
}

export function SocketProvider({ children, config }: SocketProviderProps) {
  const [socketState, setSocketState] = useState<SocketState>({
    connected: false,
    reconnecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const subscribedProducts = useRef<Set<string>>(new Set());
  const subscribedStores = useRef<Set<string>>(new Set());

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = getSocketUrl();
    const socketConfig = { ...DEFAULT_CONFIG, ...config };

    console.log('🔌 [SocketContext] Initializing Socket.IO connection to:', socketUrl);
    console.log('🔌 [SocketContext] Config:', socketConfig);

    try {
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: socketConfig.autoConnect,
        reconnection: socketConfig.reconnection,
        reconnectionAttempts: socketConfig.reconnectionAttempts,
        reconnectionDelay: socketConfig.reconnectionDelay,
        reconnectionDelayMax: socketConfig.reconnectionDelayMax,
        timeout: socketConfig.timeout,
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on(SocketEvents.CONNECT, () => {
        console.log('🔌 [SocketContext] Socket connected');
        setSocketState(prev => ({
          ...prev,
          connected: true,
          reconnecting: false,
          error: null,
          lastConnected: new Date(),
          reconnectAttempts: 0,
        }));

        // Re-subscribe to products and stores after reconnection
        resubscribeAll();
      });

      socket.on(SocketEvents.DISCONNECT, (reason) => {
        console.log('🔌 [SocketContext] Socket disconnected. Reason:', reason);
        setSocketState(prev => ({
          ...prev,
          connected: false,
          reconnecting: reason === 'io server disconnect' ? false : true,
        }));
      });

      socket.on(SocketEvents.CONNECT_ERROR, (error) => {
        console.error('🔌 [SocketContext] Connection error:', error.message);
        setSocketState(prev => ({
          ...prev,
          error: error.message,
          reconnecting: true,
        }));
      });

      socket.on(SocketEvents.RECONNECT_ATTEMPT, (attemptNumber) => {
        console.log('🔌 [SocketContext] Reconnection attempt:', attemptNumber);
        setSocketState(prev => ({
          ...prev,
          reconnecting: true,
          reconnectAttempts: attemptNumber,
        }));
      });

      socket.on(SocketEvents.RECONNECT, (attemptNumber) => {
        console.log('🔌 [SocketContext] Reconnected after', attemptNumber, 'attempts');
        setSocketState(prev => ({
          ...prev,
          connected: true,
          reconnecting: false,
          error: null,
          lastConnected: new Date(),
          reconnectAttempts: 0,
        }));
      });

      socket.on(SocketEvents.RECONNECT_ERROR, (error) => {
        console.error('🔌 [SocketContext] Reconnection error:', error.message);
        setSocketState(prev => ({
          ...prev,
          error: error.message,
        }));
      });

      socket.on(SocketEvents.RECONNECT_FAILED, () => {
        console.error('🔌 [SocketContext] Reconnection failed after all attempts');
        setSocketState(prev => ({
          ...prev,
          reconnecting: false,
          error: 'Failed to reconnect after maximum attempts',
        }));
      });

      // Stock event handlers (for debugging)
      socket.on(SocketEvents.STOCK_UPDATED, (payload: StockUpdatePayload) => {
        console.log('📦 [SocketContext] Stock updated:', payload);
      });

      socket.on(SocketEvents.STOCK_LOW, (payload: LowStockPayload) => {
        console.log('⚠️ [SocketContext] Low stock alert:', payload);
      });

      socket.on(SocketEvents.STOCK_OUT, (payload: OutOfStockPayload) => {
        console.log('❌ [SocketContext] Out of stock:', payload);
      });

      socket.on(SocketEvents.PRICE_UPDATED, (payload: PriceUpdatePayload) => {
        console.log('💰 [SocketContext] Price updated:', payload);
      });

      socket.on(SocketEvents.PRODUCT_AVAILABILITY, (payload: ProductAvailabilityPayload) => {
        console.log('🏷️ [SocketContext] Product availability changed:', payload);
      });

      // Flash sale event handlers (for debugging)
      socket.on(SocketEvents.FLASH_SALE_STARTED, (payload: FlashSaleStartedPayload) => {
        console.log('🔥 [SocketContext] Flash sale started:', payload);
      });

      socket.on(SocketEvents.FLASH_SALE_ENDING_SOON, (payload: FlashSaleEndingSoonPayload) => {
        console.log('⏰ [SocketContext] Flash sale ending soon:', payload);
      });

      socket.on(SocketEvents.FLASH_SALE_ENDED, (payload: FlashSaleEndedPayload) => {
        console.log('❌ [SocketContext] Flash sale ended:', payload);
      });

      socket.on(SocketEvents.FLASH_SALE_STOCK_UPDATED, (payload: FlashSaleStockUpdatedPayload) => {
        console.log('📦 [SocketContext] Flash sale stock updated:', payload);
      });

      socket.on(SocketEvents.FLASH_SALE_STOCK_LOW, (payload: FlashSaleStockLowPayload) => {
        console.log('⚠️ [SocketContext] Flash sale stock low:', payload);
      });

      socket.on(SocketEvents.FLASH_SALE_SOLD_OUT, (payload: FlashSaleSoldOutPayload) => {
        console.log('🚫 [SocketContext] Flash sale sold out:', payload);
      });

    } catch (error) {
      console.error('🔌 [SocketContext] Failed to initialize socket:', error);
      setSocketState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize socket',
      }));
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('🔌 [SocketContext] Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Re-subscribe to all products and stores after reconnection
  const resubscribeAll = useCallback(() => {
    if (!socketRef.current) return;

    console.log('🔄 [SocketContext] Re-subscribing to products and stores');

    subscribedProducts.current.forEach(productId => {
      socketRef.current?.emit(SocketEvents.SUBSCRIBE_PRODUCT, { productId });
    });

    subscribedStores.current.forEach(storeId => {
      socketRef.current?.emit(SocketEvents.SUBSCRIBE_STORE, { storeId });
    });
  }, []);

  // Connection methods
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      console.log('🔌 [SocketContext] Manually connecting socket');
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔌 [SocketContext] Manually disconnecting socket');
      socketRef.current.disconnect();
    }
  }, []);

  // Event subscription methods
  const onStockUpdate = useCallback((callback: StockUpdateCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.STOCK_UPDATED, callback);

    return () => {
      socketRef.current?.off(SocketEvents.STOCK_UPDATED, callback);
    };
  }, []);

  const onLowStock = useCallback((callback: LowStockCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.STOCK_LOW, callback);

    return () => {
      socketRef.current?.off(SocketEvents.STOCK_LOW, callback);
    };
  }, []);

  const onOutOfStock = useCallback((callback: OutOfStockCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.STOCK_OUT, callback);

    return () => {
      socketRef.current?.off(SocketEvents.STOCK_OUT, callback);
    };
  }, []);

  const onPriceUpdate = useCallback((callback: PriceUpdateCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.PRICE_UPDATED, callback);

    return () => {
      socketRef.current?.off(SocketEvents.PRICE_UPDATED, callback);
    };
  }, []);

  const onProductAvailability = useCallback((callback: ProductAvailabilityCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.PRODUCT_AVAILABILITY, callback);

    return () => {
      socketRef.current?.off(SocketEvents.PRODUCT_AVAILABILITY, callback);
    };
  }, []);

  const onConnect = useCallback((callback: ConnectionCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.CONNECT, callback);

    return () => {
      socketRef.current?.off(SocketEvents.CONNECT, callback);
    };
  }, []);

  const onDisconnect = useCallback((callback: ConnectionCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.DISCONNECT, callback);

    return () => {
      socketRef.current?.off(SocketEvents.DISCONNECT, callback);
    };
  }, []);

  const onError = useCallback((callback: ErrorCallback) => {
    if (!socketRef.current) return () => {};

    const errorHandler = (error: any) => {
      callback(error instanceof Error ? error : new Error(String(error)));
    };

    socketRef.current.on(SocketEvents.CONNECT_ERROR, errorHandler);

    return () => {
      socketRef.current?.off(SocketEvents.CONNECT_ERROR, errorHandler);
    };
  }, []);

  // Flash sale event subscription methods
  const onFlashSaleStarted = useCallback((callback: FlashSaleStartedCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.FLASH_SALE_STARTED, callback);

    return () => {
      socketRef.current?.off(SocketEvents.FLASH_SALE_STARTED, callback);
    };
  }, []);

  const onFlashSaleEndingSoon = useCallback((callback: FlashSaleEndingSoonCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.FLASH_SALE_ENDING_SOON, callback);

    return () => {
      socketRef.current?.off(SocketEvents.FLASH_SALE_ENDING_SOON, callback);
    };
  }, []);

  const onFlashSaleEnded = useCallback((callback: FlashSaleEndedCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.FLASH_SALE_ENDED, callback);

    return () => {
      socketRef.current?.off(SocketEvents.FLASH_SALE_ENDED, callback);
    };
  }, []);

  const onFlashSaleStockUpdated = useCallback((callback: FlashSaleStockUpdatedCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.FLASH_SALE_STOCK_UPDATED, callback);

    return () => {
      socketRef.current?.off(SocketEvents.FLASH_SALE_STOCK_UPDATED, callback);
    };
  }, []);

  const onFlashSaleStockLow = useCallback((callback: FlashSaleStockLowCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.FLASH_SALE_STOCK_LOW, callback);

    return () => {
      socketRef.current?.off(SocketEvents.FLASH_SALE_STOCK_LOW, callback);
    };
  }, []);

  const onFlashSaleSoldOut = useCallback((callback: FlashSaleSoldOutCallback) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(SocketEvents.FLASH_SALE_SOLD_OUT, callback);

    return () => {
      socketRef.current?.off(SocketEvents.FLASH_SALE_SOLD_OUT, callback);
    };
  }, []);

  // Product/Store subscription methods
  const subscribeToProduct = useCallback((productId: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn('🔌 [SocketContext] Cannot subscribe: socket not connected');
      return;
    }

    console.log('📦 [SocketContext] Subscribing to product:', productId);
    socketRef.current.emit(SocketEvents.SUBSCRIBE_PRODUCT, { productId });
    subscribedProducts.current.add(productId);
  }, []);

  const unsubscribeFromProduct = useCallback((productId: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      return;
    }

    console.log('📦 [SocketContext] Unsubscribing from product:', productId);
    socketRef.current.emit(SocketEvents.UNSUBSCRIBE_PRODUCT, { productId });
    subscribedProducts.current.delete(productId);
  }, []);

  const subscribeToStore = useCallback((storeId: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn('🔌 [SocketContext] Cannot subscribe: socket not connected');
      return;
    }

    console.log('🏪 [SocketContext] Subscribing to store:', storeId);
    socketRef.current.emit(SocketEvents.SUBSCRIBE_STORE, { storeId });
    subscribedStores.current.add(storeId);
  }, []);

  const unsubscribeFromStore = useCallback((storeId: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      return;
    }

    console.log('🏪 [SocketContext] Unsubscribing from store:', storeId);
    socketRef.current.emit(SocketEvents.UNSUBSCRIBE_STORE, { storeId });
    subscribedStores.current.delete(storeId);
  }, []);

  const contextValue: SocketContextType = {
    socket: socketRef.current,
    state: socketState,
    connect,
    disconnect,
    onStockUpdate,
    onLowStock,
    onOutOfStock,
    onPriceUpdate,
    onProductAvailability,
    onConnect,
    onDisconnect,
    onError,
    onFlashSaleStarted,
    onFlashSaleEndingSoon,
    onFlashSaleEnded,
    onFlashSaleStockUpdated,
    onFlashSaleStockLow,
    onFlashSaleSoldOut,
    subscribeToProduct,
    unsubscribeFromProduct,
    subscribeToStore,
    unsubscribeFromStore,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to use socket context
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Custom hook to subscribe to stock updates for a specific product
export function useStockUpdates(productId: string | null) {
  const { subscribeToProduct, unsubscribeFromProduct, onStockUpdate, onLowStock, onOutOfStock } = useSocket();
  const [stockData, setStockData] = useState<StockUpdatePayload | null>(null);
  const [isLowStock, setIsLowStock] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  useEffect(() => {
    if (!productId) return;

    // Subscribe to product
    subscribeToProduct(productId);

    // Listen for stock updates
    const unsubscribeStock = onStockUpdate((payload) => {
      if (payload.productId === productId) {
        setStockData(payload);
        setIsOutOfStock(payload.status === 'OUT_OF_STOCK');
        setIsLowStock(payload.status === 'LOW_STOCK');
      }
    });

    const unsubscribeLow = onLowStock((payload) => {
      if (payload.productId === productId) {
        setIsLowStock(true);
      }
    });

    const unsubscribeOut = onOutOfStock((payload) => {
      if (payload.productId === productId) {
        setIsOutOfStock(true);
      }
    });

    // Cleanup
    return () => {
      unsubscribeFromProduct(productId);
      unsubscribeStock();
      unsubscribeLow();
      unsubscribeOut();
    };
  }, [productId]);

  return {
    stockData,
    isLowStock,
    isOutOfStock,
    isInStock: stockData?.status === 'IN_STOCK',
  };
}

export { SocketContext };