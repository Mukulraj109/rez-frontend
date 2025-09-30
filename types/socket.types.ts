/**
 * Socket.IO Event Types
 * These types match the backend Socket.IO events for real-time stock updates
 */

// Stock status levels
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

// Base stock update event payload
export interface StockUpdatePayload {
  productId: string;
  storeId: string;
  quantity: number;
  status: StockStatus;
  previousQuantity?: number;
  timestamp: string;
}

// Low stock event payload
export interface LowStockPayload {
  productId: string;
  storeId: string;
  storeName: string;
  productName: string;
  quantity: number;
  threshold: number;
  timestamp: string;
}

// Out of stock event payload
export interface OutOfStockPayload {
  productId: string;
  storeId: string;
  storeName: string;
  productName: string;
  timestamp: string;
}

// Price update event payload
export interface PriceUpdatePayload {
  productId: string;
  storeId: string;
  oldPrice: number;
  newPrice: number;
  discountPercentage?: number;
  timestamp: string;
}

// Product availability event payload
export interface ProductAvailabilityPayload {
  productId: string;
  storeId: string;
  isAvailable: boolean;
  reason?: string;
  timestamp: string;
}

// Socket event names (must match backend)
export const SocketEvents = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',

  // Stock events
  STOCK_UPDATED: 'stock:updated',
  STOCK_LOW: 'stock:low',
  STOCK_OUT: 'stock:outofstock',

  // Price events
  PRICE_UPDATED: 'price:updated',

  // Product events
  PRODUCT_AVAILABILITY: 'product:availability',

  // Subscription events (client -> server)
  SUBSCRIBE_PRODUCT: 'subscribe:product',
  UNSUBSCRIBE_PRODUCT: 'unsubscribe:product',
  SUBSCRIBE_STORE: 'subscribe:store',
  UNSUBSCRIBE_STORE: 'unsubscribe:store',
} as const;

// Socket connection state
export interface SocketState {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

// Socket configuration
export interface SocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
}

// Stock subscription options
export interface SubscriptionOptions {
  productId?: string;
  storeId?: string;
}

// Callback types for event listeners
export type StockUpdateCallback = (payload: StockUpdatePayload) => void;
export type LowStockCallback = (payload: LowStockPayload) => void;
export type OutOfStockCallback = (payload: OutOfStockPayload) => void;
export type PriceUpdateCallback = (payload: PriceUpdatePayload) => void;
export type ProductAvailabilityCallback = (payload: ProductAvailabilityPayload) => void;
export type ConnectionCallback = () => void;
export type ErrorCallback = (error: Error) => void;