// Discounts API Client
// Handles all discount-related API calls

import apiClient, { ApiResponse } from './apiClient';

// Types
export interface Discount {
  _id: string;
  code?: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  applicableOn: 'bill_payment' | 'all' | 'specific_products' | 'specific_categories';
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  isActive: boolean;
  priority: number;
  metadata?: {
    displayText?: string;
    icon?: string;
    backgroundColor?: string;
  };
  discountAmount?: number;
  canApply?: boolean;
}

export interface DiscountUsageHistory {
  _id: string;
  discount: {
    _id: string;
    name: string;
    code?: string;
    type: string;
    value: number;
  };
  order: {
    _id: string;
    orderNumber: string;
    status: string;
  };
  discountAmount: number;
  orderValue: number;
  usedAt: string;
}

export interface ValidateDiscountRequest {
  code: string;
  orderValue: number;
  productIds?: string[];
  categoryIds?: string[];
}

export interface ValidateDiscountResponse {
  valid: boolean;
  discount: {
    _id: string;
    code?: string;
    name: string;
    type: string;
    value: number;
    discountAmount: number;
    finalAmount: number;
  };
}

export interface ApplyDiscountRequest {
  discountId: string;
  orderId: string;
  orderValue: number;
}

export interface ApplyDiscountResponse {
  discountAmount: number;
  finalAmount: number;
  usageId: string;
}

class DiscountsApi {
  /**
   * Get all discounts with filters
   */
  async getDiscounts(params?: {
    applicableOn?: string;
    type?: string;
    minValue?: number;
    maxValue?: number;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ discounts: Discount[]; total: number; page: number; limit: number }>> {
    try {
      const response = await apiClient.get<any>('/discounts', params);
      return response;
    } catch (error) {
      console.error('[DISCOUNTS API] Error fetching discounts:', error);
      throw error;
    }
  }

  /**
   * Get single discount by ID
   */
  async getDiscountById(id: string): Promise<ApiResponse<Discount>> {
    try {
      const response = await apiClient.get<Discount>(`/discounts/${id}`);
      return response;
    } catch (error) {
      console.error(`[DISCOUNTS API] Error fetching discount ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get discounts for a specific product
   */
  async getDiscountsForProduct(
    productId: string,
    orderValue?: number
  ): Promise<ApiResponse<Discount[]>> {
    try {
      const response = await apiClient.get<Discount[]>(
        `/discounts/product/${productId}`,
        orderValue ? { orderValue } : undefined
      );
      return response;
    } catch (error) {
      console.error(`[DISCOUNTS API] Error fetching discounts for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get bill payment discounts
   */
  async getBillPaymentDiscounts(orderValue?: number): Promise<ApiResponse<Discount[]>> {
    try {
      const response = await apiClient.get<Discount[]>(
        '/discounts/bill-payment',
        orderValue ? { orderValue } : undefined
      );
      return response;
    } catch (error) {
      console.error('[DISCOUNTS API] Error fetching bill payment discounts:', error);
      throw error;
    }
  }

  /**
   * Validate discount code
   */
  async validateDiscount(
    data: ValidateDiscountRequest
  ): Promise<ApiResponse<ValidateDiscountResponse>> {
    try {
      const response = await apiClient.post<ValidateDiscountResponse>(
        '/discounts/validate',
        data
      );
      return response;
    } catch (error) {
      console.error('[DISCOUNTS API] Error validating discount:', error);
      throw error;
    }
  }

  /**
   * Apply discount to order (authenticated users only)
   */
  async applyDiscount(
    data: ApplyDiscountRequest
  ): Promise<ApiResponse<ApplyDiscountResponse>> {
    try {
      const response = await apiClient.post<ApplyDiscountResponse>('/discounts/apply', data);
      return response;
    } catch (error) {
      console.error('[DISCOUNTS API] Error applying discount:', error);
      throw error;
    }
  }

  /**
   * Get user's discount usage history (authenticated users only)
   */
  async getUserDiscountHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ history: DiscountUsageHistory[]; total: number }>> {
    try {
      const response = await apiClient.get<any>('/discounts/my-history', params);
      return response;
    } catch (error) {
      console.error('[DISCOUNTS API] Error fetching discount history:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a discount (admin only)
   */
  async getDiscountAnalytics(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(`/discounts/${id}/analytics`);
      return response;
    } catch (error) {
      console.error(`[DISCOUNTS API] Error fetching discount analytics ${id}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const discountsApi = new DiscountsApi();

export default discountsApi;
