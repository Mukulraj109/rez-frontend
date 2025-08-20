import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

// Types
export interface RealTimeConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enableHeartbeat: boolean;
  enableAutoReconnect: boolean;
}

export interface RealTimeMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  error: string | null;
  lastConnected: number | null;
  reconnectAttempts: number;
}

export interface Subscription {
  id: string;
  channel: string;
  callback: (message: RealTimeMessage) => void;
  filter?: (message: RealTimeMessage) => boolean;
}

// Event types
export type ConnectionEventType = 
  | 'connected' 
  | 'disconnected' 
  | 'connecting' 
  | 'reconnecting' 
  | 'error' 
  | 'message';

export type ConnectionEventCallback = (data?: any) => void;

// Storage keys
const STORAGE_KEYS = {
  CONNECTION_HISTORY: 'realtime_connection_history',
  USER_PREFERENCES: 'realtime_preferences',
};

// Default configuration
const DEFAULT_CONFIG: RealTimeConfig = {
  url: __DEV__ ? 'ws://localhost:3001' : 'wss://api.rezapp.com/ws',
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000, // 30 seconds
  enableHeartbeat: true,
  enableAutoReconnect: true,
};

// Message types
export const MESSAGE_TYPES = {
  // Offers and deals
  NEW_OFFER: 'new_offer',
  OFFER_UPDATED: 'offer_updated',
  OFFER_EXPIRED: 'offer_expired',
  DEAL_NOTIFICATION: 'deal_notification',
  
  // Orders
  ORDER_STATUS_UPDATE: 'order_status_update',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Cart and shopping
  CART_SYNC: 'cart_sync',
  PRICE_UPDATE: 'price_update',
  STOCK_UPDATE: 'stock_update',
  
  // Social features
  FRIEND_ACTIVITY: 'friend_activity',
  RECOMMENDATION: 'recommendation',
  
  // System
  HEARTBEAT: 'heartbeat',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  FORCE_UPDATE: 'force_update',
  
  // Authentication
  TOKEN_REFRESH: 'token_refresh',
  SESSION_EXPIRED: 'session_expired',
} as const;

class RealTimeService {
  private ws: WebSocket | null = null;
  private config: RealTimeConfig;
  private status: ConnectionStatus;
  private subscriptions: Map<string, Subscription> = new Map();
  private eventListeners: Map<ConnectionEventType, ConnectionEventCallback[]> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;

  constructor(config?: Partial<RealTimeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.status = {
      connected: false,
      connecting: false,
      reconnecting: false,
      error: null,
      lastConnected: null,
      reconnectAttempts: 0,
    };

    // Listen to app state changes
    this.setupAppStateListener();
  }

  // Initialize the real-time service
  async initialize(): Promise<void> {
    try {
      await this.loadConnectionHistory();
      
      if (this.config.enableAutoReconnect) {
        await this.connect();
      }
    } catch (error) {
      console.error('Failed to initialize real-time service:', error);
    }
  }

  // Connect to WebSocket
  async connect(customUrl?: string): Promise<void> {
    if (this.status.connected || this.status.connecting) {
      console.warn('Already connected or connecting');
      return;
    }

    try {
      this.updateStatus({ connecting: true, error: null });
      this.emit('connecting');

      const url = customUrl || this.config.url;
      
      // Get auth token for connection
      const authToken = await AsyncStorage.getItem('auth_token');
      const wsUrl = authToken ? `${url}?token=${authToken}` : url;

      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketListeners();

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    try {
      this.clearTimers();
      
      if (this.ws) {
        this.ws.close(1000, 'Manual disconnect');
        this.ws = null;
      }

      this.updateStatus({
        connected: false,
        connecting: false,
        reconnecting: false,
        error: null,
      });

      this.emit('disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  // Send message through WebSocket
  send(message: RealTimeMessage): boolean {
    try {
      if (!this.status.connected || !this.ws) {
        console.warn('Cannot send message: not connected');
        return false;
      }

      const messageWithId = {
        ...message,
        id: message.id || this.generateMessageId(),
        timestamp: message.timestamp || Date.now(),
      };

      this.ws.send(JSON.stringify(messageWithId));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Subscribe to specific message types or channels
  subscribe(
    channel: string,
    callback: (message: RealTimeMessage) => void,
    filter?: (message: RealTimeMessage) => boolean
  ): string {
    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      channel,
      callback,
      filter,
    };

    this.subscriptions.set(subscription.id, subscription);

    // Send subscription message to server
    this.send({
      type: 'subscribe',
      data: { channel },
      timestamp: Date.now(),
    });

    return subscription.id;
  }

  // Unsubscribe from messages
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      // Send unsubscribe message to server
      this.send({
        type: 'unsubscribe',
        data: { channel: subscription.channel },
        timestamp: Date.now(),
      });

      this.subscriptions.delete(subscriptionId);
    }
  }

  // Subscribe to specific offer updates
  subscribeToOfferUpdates(callback: (offer: any) => void): string {
    return this.subscribe(
      'offers',
      callback,
      (message) => [
        MESSAGE_TYPES.NEW_OFFER,
        MESSAGE_TYPES.OFFER_UPDATED,
        MESSAGE_TYPES.OFFER_EXPIRED,
      ].includes(message.type as any)
    );
  }

  // Subscribe to order status updates
  subscribeToOrderUpdates(callback: (order: any) => void): string {
    return this.subscribe(
      'orders',
      callback,
      (message) => [
        MESSAGE_TYPES.ORDER_STATUS_UPDATE,
        MESSAGE_TYPES.ORDER_DELIVERED,
        MESSAGE_TYPES.ORDER_CANCELLED,
      ].includes(message.type as any)
    );
  }

  // Subscribe to cart synchronization
  subscribeToCartSync(callback: (cart: any) => void): string {
    return this.subscribe(
      'cart',
      callback,
      (message) => [
        MESSAGE_TYPES.CART_SYNC,
        MESSAGE_TYPES.PRICE_UPDATE,
        MESSAGE_TYPES.STOCK_UPDATE,
      ].includes(message.type as any)
    );
  }

  // Add event listener
  on(event: ConnectionEventType, callback: ConnectionEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // Remove event listener
  off(event: ConnectionEventType, callback: ConnectionEventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Get connection status
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  // Get active subscriptions
  getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  // Private methods
  private setupWebSocketListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.updateStatus({
        connected: true,
        connecting: false,
        reconnecting: false,
        error: null,
        lastConnected: Date.now(),
        reconnectAttempts: 0,
      });

      this.startHeartbeat();
      this.emit('connected');
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.updateStatus({ connected: false, connecting: false });
      this.clearTimers();
      
      this.emit('disconnected', { code: event.code, reason: event.reason });

      // Auto-reconnect if enabled and not a normal closure
      if (this.config.enableAutoReconnect && event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleConnectionError('WebSocket error occurred');
    };

    this.ws.onmessage = (event) => {
      try {
        const message: RealTimeMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: RealTimeMessage): void {
    // Handle heartbeat
    if (message.type === MESSAGE_TYPES.HEARTBEAT) {
      this.send({
        type: 'heartbeat_ack',
        data: {},
        timestamp: Date.now(),
      });
      return;
    }

    // Emit message event
    this.emit('message', message);

    // Process subscriptions
    for (const subscription of this.subscriptions.values()) {
      // Check if message matches subscription channel or filter
      const matchesChannel = subscription.channel === 'all' || 
                           message.type === subscription.channel ||
                           message.data?.channel === subscription.channel;

      if (matchesChannel) {
        // Apply filter if provided
        if (!subscription.filter || subscription.filter(message)) {
          try {
            subscription.callback(message);
          } catch (error) {
            console.error('Error in subscription callback:', error);
          }
        }
      }
    }
  }

  private handleConnectionError(error: string): void {
    this.updateStatus({
      connected: false,
      connecting: false,
      error,
    });

    this.emit('error', { error });

    if (this.config.enableAutoReconnect) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.status.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached');
      return;
    }

    this.updateStatus({ reconnecting: true });
    this.emit('reconnecting', { attempts: this.status.reconnectAttempts });

    this.reconnectTimer = setTimeout(() => {
      this.updateStatus({ reconnectAttempts: this.status.reconnectAttempts + 1 });
      this.connect();
    }, this.config.reconnectInterval) as any;
  }

  private startHeartbeat(): void {
    if (!this.config.enableHeartbeat) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.status.connected) {
        this.send({
          type: MESSAGE_TYPES.HEARTBEAT,
          data: { timestamp: Date.now() },
          timestamp: Date.now(),
        });
      }
    }, this.config.heartbeatInterval) as any;
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private updateStatus(updates: Partial<ConnectionStatus>): void {
    this.status = { ...this.status, ...updates };
  }

  private emit(event: ConnectionEventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active' && !this.status.connected && this.config.enableAutoReconnect) {
          // Reconnect when app becomes active
          this.connect();
        } else if (nextAppState === 'background') {
          // Optionally disconnect when app goes to background
          // this.disconnect();
        }
      }
    );
  }

  private async loadConnectionHistory(): Promise<void> {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTION_HISTORY);
      if (history) {
        const connectionData = JSON.parse(history);
        // Use connection data to optimize reconnection strategy
        console.log('Loaded connection history:', connectionData);
      }
    } catch (error) {
      console.error('Error loading connection history:', error);
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.subscriptions.clear();
    this.eventListeners.clear();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

// Create and export singleton instance
export const realTimeService = new RealTimeService();

// Utility functions
export const RealTimeUtils = {
  // Format connection status for display
  formatConnectionStatus: (status: ConnectionStatus): string => {
    if (status.connected) return 'Connected';
    if (status.connecting) return 'Connecting...';
    if (status.reconnecting) return `Reconnecting (${status.reconnectAttempts})`;
    if (status.error) return `Error: ${status.error}`;
    return 'Disconnected';
  },

  // Check if message is relevant to user
  isRelevantMessage: (message: RealTimeMessage, userId: string): boolean => {
    return message.data?.userId === userId || 
           message.data?.targetUsers?.includes(userId) ||
           message.data?.broadcast === true;
  },

  // Get message priority
  getMessagePriority: (type: string): 'high' | 'medium' | 'low' => {
    const highPriority = [
      MESSAGE_TYPES.ORDER_STATUS_UPDATE,
      MESSAGE_TYPES.SESSION_EXPIRED,
      MESSAGE_TYPES.FORCE_UPDATE,
    ];
    
    const mediumPriority = [
      MESSAGE_TYPES.NEW_OFFER,
      MESSAGE_TYPES.CART_SYNC,
      MESSAGE_TYPES.PRICE_UPDATE,
    ];

    if (highPriority.includes(type as any)) return 'high';
    if (mediumPriority.includes(type as any)) return 'medium';
    return 'low';
  },
};

export default realTimeService;