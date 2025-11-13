// Stock Notification API Service
// Handles stock notification subscriptions and management

import apiClient, { ApiResponse } from './apiClient';

export interface StockNotification {
  _id: string;
  userId: string;
  productId: string;
  email?: string;
  phoneNumber?: string;
  notificationMethod: 'email' | 'sms' | 'both' | 'push';
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
  notifiedAt?: string;
  product?: {
    name: string;
    image: string;
    price: number;
  };
}

export interface SubscribeRequest {
  productId: string;
  method?: 'email' | 'sms' | 'both' | 'push';
}

export interface UnsubscribeRequest {
  productId: string;
}

export interface SubscriptionResponse {
  subscription: StockNotification;
  message: string;
}

export interface SubscriptionsResponse {
  subscriptions: StockNotification[];
  total: number;
}

export interface SubscriptionCheckResponse {
  isSubscribed: boolean;
}

/**
 * Stock Notification API Service
 */
class StockNotificationService {
  private baseURL = '/stock-notifications';

  /**
   * Subscribe to stock notifications for a product
   */
  async subscribe(data: SubscribeRequest): Promise<ApiResponse<SubscriptionResponse>> {
    return apiClient.post<SubscriptionResponse>(`${this.baseURL}/subscribe`, data);
  }

  /**
   * Unsubscribe from stock notifications for a product
   */
  async unsubscribe(data: UnsubscribeRequest): Promise<ApiResponse<null>> {
    return apiClient.post<null>(`${this.baseURL}/unsubscribe`, data);
  }

  /**
   * Get user's stock notification subscriptions
   */
  async getMySubscriptions(status?: 'pending' | 'sent' | 'cancelled'): Promise<ApiResponse<SubscriptionsResponse>> {
    const params = status ? { status } : {};
    return apiClient.get<SubscriptionsResponse>(`${this.baseURL}/my-subscriptions`, params);
  }

  /**
   * Check if user is subscribed to a product
   */
  async checkSubscription(productId: string): Promise<ApiResponse<SubscriptionCheckResponse>> {
    return apiClient.get<SubscriptionCheckResponse>(`${this.baseURL}/check/${productId}`);
  }

  /**
   * Delete a stock notification subscription
   */
  async deleteSubscription(notificationId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`${this.baseURL}/${notificationId}`);
  }
}

// Export singleton instance
const stockNotificationService = new StockNotificationService();
export default stockNotificationService;