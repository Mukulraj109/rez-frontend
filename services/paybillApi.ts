// PayBill API Service
// Handles PayBill (prepaid with discount) operations

import apiClient, { ApiResponse } from './apiClient';

export interface PayBillBalance {
  paybillBalance: number;
  currency: string;
  statistics: {
    totalPayBill: number;
    totalPayBillDiscount: number;
  };
}

export interface AddPayBillRequest {
  amount: number;
  paymentMethod?: string;
  paymentId?: string;
  discountPercentage?: number;
}

export interface AddPayBillResponse {
  transaction: any;
  paybillBalance: number;
  originalAmount: number;
  discount: number;
  finalAmount: number;
  discountPercentage: number;
  wallet: {
    balance: {
      total: number;
      available: number;
      pending: number;
      paybill: number;
    };
    currency: string;
  };
  message: string;
}

class PayBillApi {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
  }

  /**
   * Get PayBill balance
   */
  async getBalance(): Promise<ApiResponse<PayBillBalance>> {

    try {
      const response = await apiClient.get<PayBillBalance>('/wallet/paybill/balance');

      if (response.success && response.data) {
        return response as ApiResponse<PayBillBalance>;
      }

      console.warn('⚠️ [PAYBILL API] Failed to fetch balance:', response.message);
      return {
        success: false,
        error: response.message || 'Failed to fetch PayBill balance'
      };
    } catch (error: any) {
      console.error('❌ [PAYBILL API] Error fetching balance:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  /**
   * Add PayBill balance
   */
  async addBalance(request: AddPayBillRequest): Promise<ApiResponse<AddPayBillResponse>> {

    try {
      const response = await apiClient.post<AddPayBillResponse>('/wallet/paybill', request);

      if (response.success && response.data) {
        return response as ApiResponse<AddPayBillResponse>;
      }

      console.warn('⚠️ [PAYBILL API] Failed to add balance:', response.message);
      return {
        success: false,
        error: response.message || 'Failed to add PayBill balance'
      };
    } catch (error: any) {
      console.error('❌ [PAYBILL API] Error adding balance:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(amount: number, discountPercentage: number = 20): {
    originalAmount: number;
    discount: number;
    finalAmount: number;
    discountPercentage: number;
  } {
    const discount = Math.round((amount * discountPercentage) / 100);
    const finalAmount = amount + discount;

    return {
      originalAmount: amount,
      discount,
      finalAmount,
      discountPercentage
    };
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'RC'): string {
    if (currency === 'INR' || currency === 'RC') {
      return '₹' + amount.toFixed(0);
    }
    return amount.toFixed(2) + ' ' + currency;
  }

  /**
   * Get discount text for display
   */
  getDiscountText(discountPercentage: number = 20): string {
    return 'Save ' + discountPercentage + '%';
  }

  /**
   * Validate amount
   */
  validateAmount(amount: number): {
    isValid: boolean;
    error?: string;
  } {
    if (!amount || amount <= 0) {
      return {
        isValid: false,
        error: 'Please enter a valid amount'
      };
    }

    if (amount < 50) {
      return {
        isValid: false,
        error: 'Minimum amount is ₹50'
      };
    }

    if (amount > 100000) {
      return {
        isValid: false,
        error: 'Maximum amount is ₹100,000'
      };
    }

    return { isValid: true };
  }

  /**
   * Use PayBill balance for payment (checkout)
   */
  async useBalance(request: {
    amount: number;
    orderId?: string;
    description?: string;
  }): Promise<ApiResponse<any>> {

    try {
      const response = await apiClient.post('/wallet/paybill/use', request);

      if (response.success && response.data) {

        return response;
      }

      console.warn('⚠️ [PAYBILL API] Failed to use balance:', response.message);
      return {
        success: false,
        error: response.message || 'Failed to use PayBill balance'
      };
    } catch (error: any) {
      console.error('❌ [PAYBILL API] Error using balance:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  /**
   * Get PayBill transaction history
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {

    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = '/wallet/paybill/transactions' + (queryParams.toString() ? '?' + queryParams.toString() : '');
      const response = await apiClient.get(url);

      if (response.success && response.data) {

        return response;
      }

      return {
        success: false,
        error: response.message || 'Failed to fetch transactions'
      };
    } catch (error: any) {
      console.error('❌ [PAYBILL API] Error fetching transactions:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }
}

// Export singleton instance
const paybillApi = new PayBillApi();
export { paybillApi };
export default paybillApi;
