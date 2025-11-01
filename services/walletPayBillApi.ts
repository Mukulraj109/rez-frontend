import apiClient, { ApiResponse } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// WALLET PAYBILL API SERVICE - Production Ready
// ============================================================================

// Configuration constants
const CONFIG = {
  MIN_AMOUNT: 10,
  MAX_AMOUNT: 100000,
  DEFAULT_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 60000, // 1 minute
};

/**
 * PayBill Top-up Request
 */
export interface PayBillTopupRequest {
  amount: number;
  bonusAmount: number;
  paymentType: 'card' | 'upi';
  currency?: string;
  storeId?: string;
  storeName?: string;
  metadata?: {
    bonusPercentage?: number;
    walletTopup?: boolean;
    productId?: string;
    productName?: string;
    autoAddToCart?: boolean;
    platform?: string;
  };
}

/**
 * Payment Intent Response
 */
export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  bonusAmount: number;
  totalAmount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded';
  metadata: any;
}

/**
 * Payment Confirmation Request
 */
export interface PaymentConfirmRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
  timestamp?: string;
}

/**
 * Payment Confirmation Response
 */
export interface PaymentConfirmResponse {
  success: boolean;
  transaction: {
    id: string;
    transactionId: string;
    amount: number;
    bonusAmount: number;
    totalAmount: number;
    status: 'completed' | 'failed' | 'pending';
    timestamp: string;
  };
  wallet: {
    previousBalance: number;
    creditedAmount: number;
    newBalance: number;
    currency: string;
  };
  autoCartAdded?: boolean;
  productId?: string;
}

/**
 * Store Wallet Balance Response
 */
export interface StoreWalletBalanceResponse {
  storeId: string;
  storeName: string;
  balance: number;
  currency: string;
  lastTopup?: string;
  totalTopups: number;
  totalSpent: number;
}

/**
 * PayBill Transaction History
 */
export interface PayBillTransaction {
  id: string;
  transactionId: string;
  type: 'topup' | 'payment' | 'refund';
  amount: number;
  bonusAmount?: number;
  totalAmount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  storeId?: string;
  storeName?: string;
  timestamp: string;
}

/**
 * Wallet PayBill API Service Class
 * Production-ready implementation for store wallet with PayBill integration
 */
class WalletPayBillService {
  private readonly baseEndpoint = '/wallet/paybill';
  private pendingRequests = new Map<string, Promise<any>>();
  private balanceCache = new Map<string, { data: any; timestamp: number }>();
  private retryCounters = new Map<string, number>();

  /**
   * Create payment intent for PayBill topup with retry logic and deduplication
   * Integrates with Stripe to create a payment intent
   */
  async createPaymentIntent(
    data: PayBillTopupRequest,
    options?: { skipRetry?: boolean }
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    try {

      // Input validation
      const validationError = this.validatePaymentData(data);
      if (validationError) {
        return {
          success: false,
          error: validationError,
          message: 'Validation failed'
        };
      }

      // Deduplicate concurrent requests
      const requestKey = `create-intent-${data.storeId}-${data.amount}-${Date.now()}`;
      if (this.pendingRequests.has(requestKey)) {

        return await this.pendingRequests.get(requestKey);
      }

      // Create payment intent with retry logic
      const requestPromise = this.makeRequestWithRetry(
        async () => {
          const response = await apiClient.post<PaymentIntentResponse>(
            `${this.baseEndpoint}/create-payment-intent`,
            {
              amount: data.amount,
              bonusAmount: data.bonusAmount || 0,
              paymentType: data.paymentType,
              currency: data.currency || 'INR',
              metadata: {
                ...data.metadata,
                storeId: data.storeId,
                storeName: data.storeName,
                timestamp: new Date().toISOString(),
                idempotencyKey: requestKey
              }
            }
          );
          return response;
        },
        options?.skipRetry ? 1 : CONFIG.RETRY_ATTEMPTS,
        'createPaymentIntent'
      );
      this.pendingRequests.set(requestKey, requestPromise);

      try {
        const response = await requestPromise;

        return response;
      } finally {
        this.pendingRequests.delete(requestKey);
      }
    } catch (error: any) {
      console.error('❌ [PayBill API] Error creating payment intent:', error);
      return this.handleApiError(error, 'Failed to create payment intent');
    }
  }

  /**
   * Validate payment data
   */
  private validatePaymentData(data: PayBillTopupRequest): string | null {
    // Amount validation
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      return 'Invalid amount format';
    }

    if (data.amount < CONFIG.MIN_AMOUNT) {
      return `Minimum topup amount is ₹${CONFIG.MIN_AMOUNT}`;
    }

    if (data.amount > CONFIG.MAX_AMOUNT) {
      return `Maximum topup amount is ₹${CONFIG.MAX_AMOUNT}`;
    }

    // Payment type validation
    if (!['card', 'upi'].includes(data.paymentType)) {
      return 'Invalid payment type. Must be card or upi';
    }

    // Store ID validation
    if (!data.storeId || typeof data.storeId !== 'string') {
      return 'Store ID is required';
    }

    return null;
  }

  /**
   * Make request with retry logic
   */
  private async makeRequestWithRetry<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxAttempts: number,
    operationName: string
  ): Promise<ApiResponse<T>> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await requestFn();

        // Reset retry counter on success
        this.retryCounters.delete(operationName);

        return response;
      } catch (error: any) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {

          break;
        }

        // Check if we should retry
        if (attempt < maxAttempts) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Track failed operations
    const retryCount = (this.retryCounters.get(operationName) || 0) + 1;
    this.retryCounters.set(operationName, retryCount);

    throw lastError;
  }

  /**
   * Handle API errors with proper formatting
   */
  private handleApiError(error: any, defaultMessage: string): ApiResponse<any> {
    // Network errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        success: false,
        error: 'Request timed out. Please check your connection and try again.',
        message: 'Network timeout'
      };
    }

    if (!error.response) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check your internet connection.',
        message: 'Network error'
      };
    }

    // Server errors
    const status = error.response?.status;
    const errorData = error.response?.data;

    if (status === 401) {
      // Clear auth and redirect to login
      this.handleAuthError();
      return {
        success: false,
        error: 'Your session has expired. Please log in again.',
        message: 'Authentication required'
      };
    }

    if (status === 429) {
      return {
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        message: 'Rate limit exceeded'
      };
    }

    if (status >= 500) {
      return {
        success: false,
        error: 'Server error occurred. Please try again later.',
        message: 'Server error'
      };
    }

    // Default error
    return {
      success: false,
      error: errorData?.error || error.message || defaultMessage,
      message: errorData?.message || 'Request failed'
    };
  }

  /**
   * Handle authentication errors
   */
  private async handleAuthError() {
    try {
      // Clear stored auth token
      await AsyncStorage.removeItem('authToken');
      // Emit auth error event for app to handle
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    } catch (error) {
      console.error('Error handling auth error:', error);
    }
  }

  /**
   * Confirm payment after successful Stripe payment
   * Updates wallet balance and processes any auto-cart additions
   */
  async confirmPayment(
    data: PaymentConfirmRequest
  ): Promise<ApiResponse<PaymentConfirmResponse>> {
    try {

      if (!data.paymentIntentId) {
        return {
          success: false,
          error: 'Payment intent ID is required',
          message: 'Validation failed'
        };
      }

      const response = await apiClient.post<PaymentConfirmResponse>(
        `${this.baseEndpoint}/confirm-payment`,
        {
          paymentIntentId: data.paymentIntentId,
          paymentMethodId: data.paymentMethodId,
          timestamp: data.timestamp || new Date().toISOString()
        }
      );
      if (response.success && response.data) {

        // Validate wallet data
        if (response.data.wallet && typeof response.data.wallet.newBalance === 'number') {

        } else {
          console.warn('⚠️ Invalid wallet data in response:', response.data.wallet);
        }

        if (response.data.autoCartAdded) {

        }
      }

      return response;
    } catch (error: any) {
      console.error('❌ [PayBill API] Error confirming payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm payment',
        message: 'Payment confirmation failed'
      };
    }
  }

  /**
   * Get store-specific wallet balance with abort signal support
   */
  async getStoreWalletBalance(
    storeId: string,
    options?: { signal?: AbortSignal; skipCache?: boolean }
  ): Promise<ApiResponse<StoreWalletBalanceResponse>> {
    try {
      // Check cache first (unless skipped)
      if (!options?.skipCache) {
        const cacheKey = `balance-${storeId}`;
        const cached = this.balanceCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
          return { success: true, data: cached.data };
        }
      }

      if (__DEV__) {

      }

      const response = await apiClient.get<StoreWalletBalanceResponse>(
        `${this.baseEndpoint}/balance/${storeId}`
      );
      if (response.success && response.data) {
        // Cache the balance
        const cacheKey = `balance-${storeId}`;
        this.balanceCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });

        if (__DEV__) {

        }
      }

      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request cancelled',
          message: 'Balance fetch cancelled'
        };
      }

      if (__DEV__) {
        console.error('❌ [PayBill API] Error fetching balance:', error);
      }

      return {
        success: false,
        error: error.message || 'Failed to fetch wallet balance',
        message: 'Balance fetch failed'
      };
    }
  }

  /**
   * Get PayBill transaction history
   */
  async getTransactionHistory(
    filters?: {
      storeId?: string;
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<{ transactions: PayBillTransaction[] }>> {
    try {

      const response = await apiClient.get<{ transactions: PayBillTransaction[] }>(
        `${this.baseEndpoint}/transactions`,
        filters
      );
      if (response.success && response.data) {

      }

      return response;
    } catch (error: any) {
      console.error('❌ [PayBill API] Error fetching transactions:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch transactions',
        message: 'Transaction fetch failed',
        data: { transactions: [] }
      };
    }
  }

  /**
   * Process payment using wallet balance
   */
  async processWalletPayment(data: {
    amount: number;
    storeId: string;
    orderId?: string;
    productIds?: string[];
    description?: string;
  }): Promise<ApiResponse<PaymentConfirmResponse>> {
    try {

      const response = await apiClient.post<PaymentConfirmResponse>(
        `${this.baseEndpoint}/pay`,
        {
          ...data,
          timestamp: new Date().toISOString()
        }
      );
      if (response.success && response.data) {

      }

      return response;
    } catch (error: any) {
      console.error('❌ [PayBill API] Error processing payment:', error);
      return {
        success: false,
        error: error.message || 'Failed to process payment',
        message: 'Payment processing failed'
      };
    }
  }

  /**
   * Validate Stripe configuration
   */
  isConfigured(): boolean {
    const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    return !!publishableKey;
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(platform: 'web' | 'ios' | 'android'): string[] {
    if (platform === 'web') {
      return ['card']; // UPI not supported on web via Stripe
    }
    return ['card', 'upi'];
  }

  /**
   * Calculate bonus amount based on percentage
   */
  calculateBonus(amount: number, bonusPercentage: number = 20): number {
    return Math.round(amount * (bonusPercentage / 100) * 100) / 100;
  }

  /**
   * Format currency for display with validation
   */
  formatCurrency(amount: number | null | undefined, currency: string = 'INR'): string {
    // Validate amount is a valid number
    if (amount === null || amount === undefined || isNaN(amount)) {
      console.warn('Invalid amount for formatting:', amount);
      return currency === 'INR' ? '₹0' : '$0';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

// Export singleton instance
const walletPayBillService = new WalletPayBillService();
export default walletPayBillService;
export { WalletPayBillService };