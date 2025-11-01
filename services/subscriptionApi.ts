// BUG FIX #4: Import types from types file instead of duplicating
import apiClient from './apiClient';
import type {
  TierBenefits,
  SubscriptionUsage,
  SubscriptionTier as TierType,
  SubscriptionStatus,
  BillingCycle as BillingCycleType,
  SubscriptionPlan
} from '@/types/subscription.types';

// BUG FIX #4: Use SubscriptionPlan from types instead of duplicate definition
export interface SubscriptionTier {
  tier: TierType;
  name: string;
  pricing: {
    monthly: number;
    yearly: number;
    yearlyDiscount: number;
  };
  benefits: TierBenefits;
  description: string;
  features: string[];
}

export interface CurrentSubscription {
  _id: string;
  user: string;
  tier: TierType;
  status: SubscriptionStatus;
  billingCycle: BillingCycleType;
  price: number;
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  autoRenew: boolean;
  benefits: TierBenefits; // BUG FIX #4: Changed from 'any' to 'TierBenefits'
  usage: SubscriptionUsage;
  daysRemaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValueProposition {
  estimatedMonthlySavings: number;
  estimatedYearlySavings: number;
  paybackPeriod: number;
  benefits: string[];
}

class SubscriptionAPI {
  /**
   * Get all available subscription tiers
   */
  async getAvailableTiers(): Promise<SubscriptionTier[]> {
    try {
      const response = await apiClient.get<{ data: SubscriptionTier[] }>('/subscriptions/tiers');
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching subscription tiers:', error);
      throw error;
    }
  }

  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<CurrentSubscription> {
    try {
      const response = await apiClient.get<{ data: CurrentSubscription }>('/subscriptions/current');
      return response.data?.data as CurrentSubscription;
    } catch (error: any) {
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  }

  /**
   * Subscribe to a plan
   */
  async subscribeToPlan(
    tier: 'premium' | 'vip',
    billingCycle: 'monthly' | 'yearly',
    paymentMethod?: string,
    promoCode?: string,
    source?: string
  ): Promise<{ subscription: CurrentSubscription; paymentUrl: string }> {
    try {
      const response = await apiClient.post<{ data: { subscription: CurrentSubscription; paymentUrl: string } }>('/subscriptions/subscribe', {
        tier,
        billingCycle,
        paymentMethod,
        promoCode,
        source
      });
      return response.data?.data as { subscription: CurrentSubscription; paymentUrl: string };
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(newTier: 'premium' | 'vip'): Promise<{
    subscription: CurrentSubscription;
    proratedAmount: number;
  }> {
    try {
      const response = await apiClient.post<{ data: { subscription: CurrentSubscription; proratedAmount: number } }>('/subscriptions/upgrade', { newTier });
      return response.data?.data as { subscription: CurrentSubscription; proratedAmount: number };
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  /**
   * Downgrade subscription
   */
  async downgradeSubscription(newTier: 'free' | 'premium'): Promise<{
    subscription: CurrentSubscription;
    effectiveDate: string;
    creditAmount: number;
  }> {
    try {
      const response = await apiClient.post<{ data: { subscription: CurrentSubscription; effectiveDate: string; creditAmount: number } }>('/subscriptions/downgrade', { newTier });
      return response.data?.data as { subscription: CurrentSubscription; effectiveDate: string; creditAmount: number };
    } catch (error: any) {
      console.error('Error downgrading subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    reason?: string,
    feedback?: string,
    cancelImmediately?: boolean
  ): Promise<{
    subscription: CurrentSubscription;
    accessUntil: string;
    reactivationEligibleUntil: string;
  }> {
    try {
      const response = await apiClient.post<{ data: { subscription: CurrentSubscription; accessUntil: string; reactivationEligibleUntil: string } }>('/subscriptions/cancel', {
        reason,
        feedback,
        cancelImmediately
      });
      return response.data?.data as { subscription: CurrentSubscription; accessUntil: string; reactivationEligibleUntil: string };
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Renew/reactivate subscription
   */
  async renewSubscription(): Promise<CurrentSubscription> {
    try {
      const response = await apiClient.post<{ data: CurrentSubscription }>('/subscriptions/renew');
      return response.data?.data as CurrentSubscription;
    } catch (error: any) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription benefits
   */
  async getSubscriptionBenefits(): Promise<any> {
    try {
      const response = await apiClient.get<{ data: any }>('/subscriptions/benefits');
      return response.data?.data;
    } catch (error: any) {
      console.error('Error fetching subscription benefits:', error);
      throw error;
    }
  }

  /**
   * Get subscription usage statistics
   */
  async getSubscriptionUsage(): Promise<{
    usage: any;
    roi: {
      subscriptionCost: number;
      totalSavings: number;
      netSavings: number;
      roiPercentage: number;
    };
    daysRemaining: number;
    isActive: boolean;
  }> {
    try {
      const response = await apiClient.get<{ data: {
        usage: any;
        roi: {
          subscriptionCost: number;
          totalSavings: number;
          netSavings: number;
          roiPercentage: number;
        };
        daysRemaining: number;
        isActive: boolean;
      } }>('/subscriptions/usage');
      return response.data?.data as {
        usage: any;
        roi: {
          subscriptionCost: number;
          totalSavings: number;
          netSavings: number;
          roiPercentage: number;
        };
        daysRemaining: number;
        isActive: boolean;
      };
    } catch (error: any) {
      console.error('Error fetching subscription usage:', error);
      throw error;
    }
  }

  /**
   * Get value proposition for upgrading
   */
  async getValueProposition(tier: 'premium' | 'vip'): Promise<ValueProposition> {
    try {
      const response = await apiClient.get<{ data: ValueProposition }>(`/subscriptions/value-proposition/${tier}`);
      return response.data?.data as ValueProposition;
    } catch (error: any) {
      console.error('Error fetching value proposition:', error);
      throw error;
    }
  }

  /**
   * Toggle auto-renewal
   */
  async toggleAutoRenew(autoRenew: boolean): Promise<CurrentSubscription> {
    try {
      const response = await apiClient.patch<{ data: CurrentSubscription }>('/subscriptions/auto-renew', { autoRenew });
      return response.data?.data as CurrentSubscription;
    } catch (error: any) {
      console.error('Error toggling auto-renew:', error);
      throw error;
    }
  }

  /**
   * Validate promo code
   */
  async validatePromoCode(
    code: string,
    tier: 'premium' | 'vip',
    billingCycle: 'monthly' | 'yearly'
  ): Promise<{
    success: boolean;
    data?: {
      discount: number;
      finalPrice: number;
      originalPrice: number;
      message: string;
    };
    message: string;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data?: {
          discount: number;
          finalPrice: number;
          originalPrice: number;
          message: string;
        };
        message: string;
      }>('/subscriptions/validate-promo', {
        code,
        tier,
        billingCycle
      });
      return response.data;
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      // Return error response in expected format
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to validate promo code'
      };
    }
  }

  /**
   * Get billing history
   */
  async getBillingHistory(params?: {
    startDate?: string;
    endDate?: string;
    skip?: number;
    limit?: number;
  }): Promise<{
    history: BillingTransaction[];
    pagination: {
      total: number;
      skip: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    try {
      const response = await apiClient.get<{
        data: {
          history: BillingTransaction[];
          pagination: {
            total: number;
            skip: number;
            limit: number;
            hasMore: boolean;
          };
        }
      }>('/billing/history', { params });
      return response.data?.data as {
        history: BillingTransaction[];
        pagination: {
          total: number;
          skip: number;
          limit: number;
          hasMore: boolean;
        };
      };
    } catch (error: any) {
      console.error('Error fetching billing history:', error);
      throw error;
    }
  }

  /**
   * Get billing summary/statistics
   */
  async getBillingSummary(): Promise<{
    totalSpent: number;
    totalTransactions: number;
    totalSavings: number;
    netSavings: number;
    currentTier: string;
    memberSince: string | null;
    lastPayment: string | null;
  }> {
    try {
      const response = await apiClient.get<{
        data: {
          totalSpent: number;
          totalTransactions: number;
          totalSavings: number;
          netSavings: number;
          currentTier: string;
          memberSince: string | null;
          lastPayment: string | null;
        }
      }>('/billing/summary');
      return response.data?.data as {
        totalSpent: number;
        totalTransactions: number;
        totalSavings: number;
        netSavings: number;
        currentTier: string;
        memberSince: string | null;
        lastPayment: string | null;
      };
    } catch (error: any) {
      console.error('Error fetching billing summary:', error);
      throw error;
    }
  }

  /**
   * Get specific invoice details
   */
  async getInvoice(transactionId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get<{ data: Invoice }>(`/billing/invoice/${transactionId}`);
      return response.data?.data as Invoice;
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Download invoice
   */
  async downloadInvoice(transactionId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/billing/invoice/${transactionId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }
}

// Types for billing history
export interface BillingTransaction {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'failed' | 'pending';
  billingCycle: 'monthly' | 'yearly';
  tier: string;
  type: 'subscription' | 'payment';
  invoiceUrl?: string;
  paymentMethod?: string;
  transactionId?: string;
  description: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'failed' | 'pending';
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    description: string;
    billingCycle: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentId: string;
  transactionId: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  notes?: string;
}

export default new SubscriptionAPI();
