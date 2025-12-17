/**
 * Store Payment API Service
 *
 * Handles all API calls for the store payment flow including:
 * - QR code lookup
 * - Offers retrieval
 * - Payment initiation and confirmation
 * - Transaction history
 */

import apiClient from './apiClient';
import {
  StorePaymentInfo,
  OffersResponse,
  StorePaymentRequest,
  StorePaymentInitResponse,
  StorePaymentConfirmRequest,
  StorePaymentConfirmResponse,
  PaymentHistoryResponse,
  QRLookupResponse,
  OffersApiResponse,
  PaymentInitApiResponse,
  PaymentConfirmApiResponse,
  PaymentHistoryApiResponse,
} from '@/types/storePayment.types';

const STORE_PAYMENT_BASE = '/store-payment';

/**
 * Store Payment API Service
 */
const storePaymentApi = {
  /**
   * Lookup store by QR code
   */
  async lookupByQR(qrCode: string): Promise<StorePaymentInfo> {
    const response = await apiClient.get<QRLookupResponse>(
      `${STORE_PAYMENT_BASE}/lookup/${encodeURIComponent(qrCode)}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Store not found');
    }

    return response.data;
  },

  /**
   * Lookup store by QR code (POST method - for JSON payload)
   */
  async lookupByQRPost(qrCode: string): Promise<StorePaymentInfo> {
    const response = await apiClient.post<QRLookupResponse>(
      `${STORE_PAYMENT_BASE}/lookup`,
      { qrCode }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Store not found');
    }

    return response.data;
  },

  /**
   * Get available offers for a store payment
   */
  async getOffers(storeId: string, amount: number): Promise<OffersResponse> {
    const response = await apiClient.get<OffersApiResponse>(
      `${STORE_PAYMENT_BASE}/offers/${storeId}`,
      { params: { amount } }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to load offers');
    }

    return response.data;
  },

  /**
   * Initiate a store payment
   */
  async initiatePayment(request: StorePaymentRequest): Promise<StorePaymentInitResponse> {
    const response = await apiClient.post<PaymentInitApiResponse>(
      `${STORE_PAYMENT_BASE}/initiate`,
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to initiate payment');
    }

    return response.data;
  },

  /**
   * Confirm a store payment
   */
  async confirmPayment(request: StorePaymentConfirmRequest): Promise<StorePaymentConfirmResponse> {
    const response = await apiClient.post<PaymentConfirmApiResponse>(
      `${STORE_PAYMENT_BASE}/confirm`,
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to confirm payment');
    }

    return response.data;
  },

  /**
   * Get payment transaction history
   */
  async getHistory(params?: {
    page?: number;
    limit?: number;
    storeId?: string;
  }): Promise<PaymentHistoryResponse> {
    try {
      const response = await apiClient.get<PaymentHistoryApiResponse>(
        `${STORE_PAYMENT_BASE}/history`,
        { params }
      );

      if (!response.success || !response.data) {
        // Return empty history instead of throwing - no history is valid
        return {
          transactions: [],
          pagination: {
            page: 1,
            limit: params?.limit || 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }

      return response.data;
    } catch (error) {
      // Return empty history on error - API might not be implemented yet
      return {
        transactions: [],
        pagination: {
          page: 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  },

  /**
   * Get store payment details by paymentId
   */
  async getPaymentDetails(paymentId: string): Promise<{
    id: string;
    paymentId: string;
    storeId: string;
    storeName: string;
    storeLogo?: string;
    billAmount: number;
    discountAmount: number;
    coinRedemption: {
      rezCoins: number;
      promoCoins: number;
      payBill: number;
      totalAmount: number;
    };
    coinsUsed: number;
    remainingAmount: number;
    paymentMethod: string;
    offersApplied: string[];
    status: string;
    rewards?: {
      cashbackEarned: number;
      coinsEarned: number;
      bonusCoins: number;
    };
    transactionId?: string;
    createdAt: string;
    completedAt?: string;
  }> {
    const url = `${STORE_PAYMENT_BASE}/details/${encodeURIComponent(paymentId)}`;
    console.log('📜 [StorePaymentAPI] Fetching payment details:', url);

    const response = await apiClient.get(url);
    console.log('📜 [StorePaymentAPI] Response:', response);

    if (!response.success || !response.data) {
      throw new Error(response.error || response.message || 'Payment not found');
    }

    return response.data;
  },

  /**
   * Get store payment info by store ID
   */
  async getStorePaymentInfo(storeId: string): Promise<StorePaymentInfo> {
    const response = await apiClient.get<QRLookupResponse>(
      `/stores/${storeId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Store not found');
    }

    return response.data;
  },

  /**
   * Get user's coin balances for payment
   * Uses /wallet/balance endpoint which returns coin balances
   */
  async getCoinBalances(): Promise<{
    rezCoins: number;
    promoCoins: number;
    payBillBalance: number;
  }> {
    try {
      const response = await apiClient.get('/wallet/balance');

      if (!response.success) {
        // Return default values if endpoint fails
        return {
          rezCoins: 0,
          promoCoins: 0,
          payBillBalance: 0,
        };
      }

      // Backend returns: { balance: { coins, promoCoins, payBill }, ... }
      const balance = response.data?.balance || {};
      return {
        rezCoins: balance.coins || 0,
        promoCoins: balance.promoCoins || 0,
        payBillBalance: balance.payBill || 0,
      };
    } catch (error) {
      // Return default values on error
      return {
        rezCoins: 0,
        promoCoins: 0,
        payBillBalance: 0,
      };
    }
  },

  /**
   * Calculate payment summary
   */
  calculatePaymentSummary(
    billAmount: number,
    discountAmount: number,
    coinsRedeemed: number,
    maxCoinPercent: number = 100
  ): {
    afterDiscount: number;
    maxCoinsAllowed: number;
    amountToPay: number;
    totalSavings: number;
  } {
    const afterDiscount = Math.max(0, billAmount - discountAmount);
    const maxCoinsAllowed = Math.floor((afterDiscount * maxCoinPercent) / 100);
    const effectiveCoins = Math.min(coinsRedeemed, maxCoinsAllowed);
    const amountToPay = Math.max(0, afterDiscount - effectiveCoins);
    const totalSavings = discountAmount + effectiveCoins;

    return {
      afterDiscount,
      maxCoinsAllowed,
      amountToPay,
      totalSavings,
    };
  },
};

export default storePaymentApi;

// Named exports for tree-shaking
export const {
  lookupByQR,
  lookupByQRPost,
  getOffers,
  initiatePayment,
  confirmPayment,
  getHistory,
  getPaymentDetails,
  getStorePaymentInfo,
  getCoinBalances,
  calculatePaymentSummary,
} = storePaymentApi;
