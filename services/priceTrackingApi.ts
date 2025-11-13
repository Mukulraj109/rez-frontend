/**
 * Price Tracking API Service
 *
 * Handles price history and price alert requests
 */

import apiClient from './apiClient';

export interface PricePoint {
  basePrice: number;
  salePrice: number;
  discount: number;
  discountPercentage?: number;
  currency: string;
}

export interface PriceHistoryRecord {
  _id: string;
  productId: string;
  variantId?: string;
  price: PricePoint;
  previousPrice?: PricePoint;
  changeType: 'increase' | 'decrease' | 'no_change' | 'initial';
  changeAmount: number;
  changePercentage: number;
  recordedAt: Date;
  createdAt: Date;
}

export interface PriceStats {
  latest?: PricePoint;
  lowest?: PricePoint;
  highest?: PricePoint;
  average?: {
    salePrice: number;
    basePrice: number;
  };
  trend?: {
    trend: 'increasing' | 'decreasing' | 'stable';
    latest: number;
    oldest: number;
    change: number;
    changePercentage: string;
    dataPoints: number;
    increaseCount: number;
    decreaseCount: number;
  };
  period?: string;
}

export interface PriceAlert {
  _id: string;
  userId: string;
  productId: string;
  variantId?: string;
  alertType: 'target_price' | 'percentage_drop' | 'any_drop';
  targetPrice?: number;
  percentageDrop?: number;
  currentPriceAtCreation: number;
  notificationMethod: ('email' | 'push' | 'sms')[];
  contact?: {
    email?: string;
    phone?: string;
  };
  status: 'active' | 'triggered' | 'expired' | 'cancelled';
  triggeredAt?: Date;
  triggeredPrice?: number;
  expiresAt: Date;
  daysUntilExpiration?: number;
  metadata?: {
    productName?: string;
    productImage?: string;
    variantAttributes?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePriceAlertRequest {
  productId: string;
  variantId?: string;
  alertType: 'target_price' | 'percentage_drop' | 'any_drop';
  targetPrice?: number;
  percentageDrop?: number;
  notificationMethod?: ('email' | 'push' | 'sms')[];
  contact?: {
    email?: string;
    phone?: string;
  };
}

class PriceTrackingApi {
  private baseUrl = '/price-tracking';

  /**
   * Get price history for a product
   */
  async getPriceHistory(
    productId: string,
    options?: {
      variantId?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      console.log('📊 [PriceTrackingApi] Fetching price history:', productId);

      const response = await apiClient.get(`${this.baseUrl}/history/${productId}`, {
        params: options,
      });

      console.log('✅ [PriceTrackingApi] Price history fetched:', response.data.data.count);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceTrackingApi] Get history error:', error);
      throw error;
    }
  }

  /**
   * Get price statistics for a product
   */
  async getPriceStats(
    productId: string,
    options?: {
      variantId?: string;
      days?: number;
    }
  ) {
    try {
      console.log('📈 [PriceTrackingApi] Fetching price stats:', productId);

      const response = await apiClient.get(`${this.baseUrl}/stats/${productId}`, {
        params: options,
      });

      console.log('✅ [PriceTrackingApi] Price stats fetched');
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceTrackingApi] Get stats error:', error);
      throw error;
    }
  }

  /**
   * Create a price alert
   */
  async createPriceAlert(data: CreatePriceAlertRequest) {
    try {
      console.log('🔔 [PriceTrackingApi] Creating price alert:', data);

      const response = await apiClient.post(`${this.baseUrl}/alerts`, data);

      console.log('✅ [PriceTrackingApi] Price alert created');
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceTrackingApi] Create alert error:', error);
      throw error;
    }
  }

  /**
   * Get user's price alerts
   */
  async getMyAlerts(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'triggered' | 'expired' | 'cancelled';
  }) {
    try {
      console.log('📋 [PriceTrackingApi] Fetching my alerts');

      const response = await apiClient.get(`${this.baseUrl}/alerts/my-alerts`, {
        params,
      });

      console.log('✅ [PriceTrackingApi] Alerts fetched:', response.data.data.alerts.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceTrackingApi] Get alerts error:', error);
      throw error;
    }
  }

  /**
   * Check if user has active alert for product
   */
  async checkAlert(productId: string, variantId?: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/alerts/check/${productId}`, {
        params: variantId ? { variantId } : {},
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceTrackingApi] Check alert error:', error);
      throw error;
    }
  }

  /**
   * Cancel a price alert
   */
  async cancelAlert(alertId: string) {
    try {
      console.log('🔕 [PriceTrackingApi] Cancelling alert:', alertId);

      const response = await apiClient.delete(`${this.baseUrl}/alerts/${alertId}`);

      console.log('✅ [PriceTrackingApi] Alert cancelled');
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceTrackingApi] Cancel alert error:', error);
      throw error;
    }
  }

  /**
   * Get alert statistics for a product (Admin/Store)
   */
  async getAlertStats(productId: string) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/alerts/stats/${productId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PriceTrackingApi] Get alert stats error:', error);
      throw error;
    }
  }
}

const priceTrackingApi = new PriceTrackingApi();
export default priceTrackingApi;
