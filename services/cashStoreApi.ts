/**
 * Cash Store API Service
 *
 * API integration for Cash Store affiliate tracking feature.
 * Cash Store = Affiliate cashback for external websites (Amazon, Myntra, etc.)
 * Users earn real cashback (rupees) by shopping through tracking links.
 *
 * This is different from ReZ Mall which is an in-app delivery marketplace
 * where users earn ReZ Coins.
 */

import { apiClient } from '../config/api';

// API endpoints
const CASH_STORE_ENDPOINTS = {
  // Affiliate tracking
  AFFILIATE_CLICK: '/cashstore/affiliate/click',
  AFFILIATE_CLICKS: '/cashstore/affiliate/clicks',
  AFFILIATE_PURCHASES: '/cashstore/affiliate/purchases',
  AFFILIATE_SUMMARY: '/cashstore/affiliate/summary',
};

// Types
export interface AffiliateClickResult {
  clickId: string;
  trackingUrl: string;
  brand: {
    name: string;
    cashback: number;
  };
}

export interface AffiliateClick {
  _id: string;
  clickId: string;
  brand: {
    _id: string;
    name: string;
    logo: string;
  };
  status: 'clicked' | 'converted' | 'expired';
  brandSnapshot: {
    name: string;
    cashbackPercentage: number;
    maxCashback: number;
  };
  createdAt: string;
  expiresAt: string;
}

export interface AffiliatePurchase {
  _id: string;
  purchaseId: string;
  brand: {
    _id: string;
    name: string;
    logo: string;
  };
  externalOrderId: string;
  orderAmount: number;
  cashbackRate: number;
  actualCashback: number;
  status: 'pending' | 'confirmed' | 'credited' | 'rejected' | 'refunded';
  purchasedAt: string;
  creditedAt?: string;
}

export interface AffiliateCashbackSummary {
  totalEarned: number;
  pending: number;
  confirmed: number;
  credited: number;
  totalClicks: number;
  totalPurchases: number;
  conversionRate: number;
  recentActivity: Array<{
    type: 'click' | 'purchase' | 'credit';
    brand: string;
    amount?: number;
    date: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

class CashStoreApiService {
  /**
   * Track affiliate click and get tracking URL
   * Called when user taps "Shop Now" on an external brand
   *
   * @param brandId - The ID of the cash store brand
   * @returns Tracking URL and click ID
   */
  async trackAffiliateClick(brandId: string): Promise<AffiliateClickResult | null> {
    try {
      const response = await apiClient.post<ApiResponse<AffiliateClickResult>>(
        CASH_STORE_ENDPOINTS.AFFILIATE_CLICK,
        { brandId }
      );
      return response.data.data || null;
    } catch (error) {
      console.warn('[Cash Store] Failed to track affiliate click:', error);
      return null;
    }
  }

  /**
   * Get user's click history
   * Shows all affiliate clicks made by the user
   */
  async getUserClicks(page: number = 1, limit: number = 20): Promise<{
    clicks: AffiliateClick[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<AffiliateClick[]>>(
        `${CASH_STORE_ENDPOINTS.AFFILIATE_CLICKS}?page=${page}&limit=${limit}`
      );
      return {
        clicks: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0,
        pages: response.data.meta?.pagination?.pages || 0,
      };
    } catch (error) {
      console.error('[Cash Store] Error fetching user clicks:', error);
      throw error;
    }
  }

  /**
   * Get user's purchase history
   * Shows all purchases made through affiliate links
   */
  async getUserPurchases(page: number = 1, limit: number = 20): Promise<{
    purchases: AffiliatePurchase[];
    total: number;
    pages: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<AffiliatePurchase[]>>(
        `${CASH_STORE_ENDPOINTS.AFFILIATE_PURCHASES}?page=${page}&limit=${limit}`
      );
      return {
        purchases: response.data.data || [],
        total: response.data.meta?.pagination?.total || 0,
        pages: response.data.meta?.pagination?.pages || 0,
      };
    } catch (error) {
      console.error('[Cash Store] Error fetching user purchases:', error);
      throw error;
    }
  }

  /**
   * Get user's cashback summary
   * Shows total earned, pending, confirmed, credited amounts
   */
  async getCashbackSummary(): Promise<AffiliateCashbackSummary | null> {
    try {
      const response = await apiClient.get<ApiResponse<AffiliateCashbackSummary>>(
        CASH_STORE_ENDPOINTS.AFFILIATE_SUMMARY
      );
      return response.data.data || null;
    } catch (error) {
      console.error('[Cash Store] Error fetching cashback summary:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cashStoreApi = new CashStoreApiService();
export default cashStoreApi;
