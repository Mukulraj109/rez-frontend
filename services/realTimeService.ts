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
  url: __DEV__ ? 'ws://localhost:5001' : 'wss://api.rezapp.com/ws',
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
  ORDER_LOCATION_UPDATE: 'order_location_update',
  ORDER_ETA_UPDATE: 'order_eta_update',

  // Cart and shopping
  CART_SYNC: 'cart_sync',
  PRICE_UPDATE: 'price_update',
  STOCK_UPDATE: 'stock_update',
  CART_ITEM_RESERVED: 'cart_item_reserved',
  CART_ITEM_RELEASED: 'cart_item_released',

  // Support Chat - Messages
  SUPPORT_MESSAGE_RECEIVED: 'support_message_received',
  SUPPORT_MESSAGE_SENT: 'support_message_sent',
  SUPPORT_MESSAGE_DELIVERED: 'support_message_delivered',
  SUPPORT_MESSAGE_READ: 'support_message_read',
  SUPPORT_MESSAGE_DELETED: 'support_message_deleted',

  // Support Chat - Agent
  SUPPORT_AGENT_ASSIGNED: 'support_agent_assigned',
  SUPPORT_AGENT_TYPING_START: 'support_agent_typing_start',
  SUPPORT_AGENT_TYPING_STOP: 'support_agent_typing_stop',
  SUPPORT_AGENT_STATUS_CHANGED: 'support_agent_status_changed',
  SUPPORT_AGENT_JOINED: 'support_agent_joined',
  SUPPORT_AGENT_LEFT: 'support_agent_left',

  // Support Chat - Queue
  SUPPORT_QUEUE_POSITION_UPDATED: 'support_queue_position_updated',
  SUPPORT_QUEUE_JOINED: 'support_queue_joined',
  SUPPORT_QUEUE_LEFT: 'support_queue_left',

  // Support Chat - Ticket
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  SUPPORT_TICKET_STATUS_CHANGED: 'support_ticket_status_changed',
  SUPPORT_TICKET_CLOSED: 'support_ticket_closed',
  SUPPORT_TICKET_REOPENED: 'support_ticket_reopened',
  SUPPORT_TICKET_RATED: 'support_ticket_rated',

  // Support Chat - Transfer
  SUPPORT_CONVERSATION_TRANSFERRED: 'support_conversation_transferred',
  SUPPORT_TRANSFER_ACCEPTED: 'support_transfer_accepted',
  SUPPORT_TRANSFER_REJECTED: 'support_transfer_rejected',

  // Support Chat - Calls
  SUPPORT_CALL_REQUEST: 'support_call_request',
  SUPPORT_CALL_ACCEPTED: 'support_call_accepted',
  SUPPORT_CALL_REJECTED: 'support_call_rejected',
  SUPPORT_CALL_STARTED: 'support_call_started',
  SUPPORT_CALL_ENDED: 'support_call_ended',

  // Support Chat - Co-browsing
  SUPPORT_COBROWSING_INVITATION: 'support_cobrowsing_invitation',
  SUPPORT_COBROWSING_ACCEPTED: 'support_cobrowsing_accepted',
  SUPPORT_COBROWSING_REJECTED: 'support_cobrowsing_rejected',
  SUPPORT_COBROWSING_STARTED: 'support_cobrowsing_started',
  SUPPORT_COBROWSING_ENDED: 'support_cobrowsing_ended',

  // Support Chat - FAQ
  SUPPORT_FAQ_SUGGESTED: 'support_faq_suggested',

  // Legacy chat (keep for backward compatibility)
  CHAT_MESSAGE: 'chat_message',
  CHAT_TYPING: 'chat_typing',
  CHAT_READ: 'chat_read',
  CHAT_AGENT_STATUS: 'chat_agent_status',

  // Feed
  FEED_NEW_POST: 'feed_new_post',
  FEED_POST_LIKED: 'feed_post_liked',
  FEED_POST_COMMENTED: 'feed_post_commented',
  FEED_USER_FOLLOWED: 'feed_user_followed',

  // Leaderboard
  LEADERBOARD_UPDATE: 'leaderboard_update',
  LEADERBOARD_RANK_CHANGE: 'leaderboard_rank_change',
  LEADERBOARD_ACHIEVEMENT: 'leaderboard_achievement',

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
  private messageQueue: RealTimeMessage[] = [];
  private maxQueueSize: number = 100;
  private authToken: string | null = null;

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
      this.authToken = await AsyncStorage.getItem('auth_token');
      const wsUrl = this.authToken ? `${url}?token=${this.authToken}` : url;

      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketListeners();

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  }

  // Update authentication token
  async updateAuthToken(token: string | null): Promise<void> {
    this.authToken = token;
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }

    // Reconnect with new token if connected
    if (this.status.connected) {
      this.disconnect();
      await this.connect();
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
      const messageWithId = {
        ...message,
        id: message.id || this.generateMessageId(),
        timestamp: message.timestamp || Date.now(),
      };

      if (!this.status.connected || !this.ws) {
        // Queue message if offline
        this.queueMessage(messageWithId);
        console.warn('Cannot send message: not connected. Message queued.');
        return false;
      }

      this.ws.send(JSON.stringify(messageWithId));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      // Queue message on error
      this.queueMessage(message);
      return false;
    }
  }

  // Queue message for later delivery
  private queueMessage(message: RealTimeMessage): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest message if queue is full
      this.messageQueue.shift();
      console.warn('Message queue full, removing oldest message');
    }
    this.messageQueue.push(message);
  }

  // Process queued messages
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queue) {
      const sent = this.send(message);
      if (!sent) {
        // If send fails, message will be re-queued
        break;
      }
    }
  }

  // Get queue size
  getQueueSize(): number {
    return this.messageQueue.length;
  }

  // Clear message queue
  clearQueue(): void {
    this.messageQueue = [];
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

  // Subscribe to support chat updates
  subscribeToSupportChat(ticketId: string, callback: (event: any) => void): string {
    return this.subscribe(
      `support_ticket_${ticketId}`,
      callback,
      (message) => {
        // Filter for all support chat related messages
        const supportTypes = Object.keys(MESSAGE_TYPES)
          .filter(key => key.startsWith('SUPPORT_'))
          .map(key => (MESSAGE_TYPES as any)[key]);

        return supportTypes.includes(message.type as any);
      }
    );
  }

  // Subscribe to agent typing indicators
  subscribeToAgentTyping(ticketId: string, callback: (typing: any) => void): string {
    return this.subscribe(
      `support_ticket_${ticketId}`,
      callback,
      (message) => [
        MESSAGE_TYPES.SUPPORT_AGENT_TYPING_START,
        MESSAGE_TYPES.SUPPORT_AGENT_TYPING_STOP,
      ].includes(message.type as any)
    );
  }

  // Subscribe to queue updates
  subscribeToQueueUpdates(callback: (queue: any) => void): string {
    return this.subscribe(
      'support_queue',
      callback,
      (message) => [
        MESSAGE_TYPES.SUPPORT_QUEUE_POSITION_UPDATED,
        MESSAGE_TYPES.SUPPORT_QUEUE_JOINED,
        MESSAGE_TYPES.SUPPORT_QUEUE_LEFT,
      ].includes(message.type as any)
    );
  }

  // Subscribe to agent status changes
  subscribeToAgentStatus(callback: (status: any) => void): string {
    return this.subscribe(
      'support_agents',
      callback,
      (message) => [
        MESSAGE_TYPES.SUPPORT_AGENT_STATUS_CHANGED,
        MESSAGE_TYPES.SUPPORT_AGENT_JOINED,
        MESSAGE_TYPES.SUPPORT_AGENT_LEFT,
      ].includes(message.type as any)
    );
  }

  // Send support chat event
  sendSupportChatEvent(ticketId: string, eventType: string, data: any): boolean {
    return this.send({
      type: eventType,
      data: {
        ticketId,
        ...data,
      },
      timestamp: Date.now(),
    });
  }

  // Notify typing started
  notifyTypingStarted(ticketId: string, userId: string): boolean {
    return this.sendSupportChatEvent(ticketId, 'user_typing_start', { userId });
  }

  // Notify typing stopped
  notifyTypingStopped(ticketId: string, userId: string): boolean {
    return this.sendSupportChatEvent(ticketId, 'user_typing_stop', { userId });
  }

  // Mark message as read
  markMessageAsRead(ticketId: string, messageId: string, userId: string): boolean {
    return this.sendSupportChatEvent(ticketId, 'message_read', { messageId, userId });
  }

  // Join ticket room
  joinTicketRoom(ticketId: string, userId: string): boolean {
    return this.send({
      type: 'join_ticket',
      data: { ticketId, userId },
      timestamp: Date.now(),
    });
  }

  // Leave ticket room
  leaveTicketRoom(ticketId: string, userId: string): boolean {
    return this.send({
      type: 'leave_ticket',
      data: { ticketId, userId },
      timestamp: Date.now(),
    });
  }

  // Add event listener
  on(event: ConnectionEventType, callback: ConnectionEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    const listeners = this.eventListeners.get(event)!;
    // Prevent duplicate listeners
    if (!listeners.includes(callback)) {
      listeners.push(callback);
    }
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

      this.updateStatus({
        connected: true,
        connecting: false,
        reconnecting: false,
        error: null,
        lastConnected: Date.now(),
        reconnectAttempts: 0,
      });

      this.startHeartbeat();

      // Process any queued messages
      this.processMessageQueue();

      this.emit('connected');
    };

    this.ws.onclose = (event) => {

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

    // Clear any existing reconnect timer to prevent accumulation
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
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

    // Clear existing heartbeat timer to prevent accumulation
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

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
    this.messageQueue = [];

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
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