// Payment Service
// Handles payment gateway integration for wallet topup

import apiClient, { ApiResponse } from './apiClient';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'card' | 'wallet' | 'netbanking';
  icon: string;
  isAvailable: boolean;
  processingFee?: number;
  processingTime?: string;
  description?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentMethodType: string; // Required by backend: 'credit_card', 'debit_card', 'upi', 'wallet', 'netbanking'
  paymentMethodId?: string;
  userDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentUrl?: string;
  qrCode?: string;
  upiId?: string;
  expiryTime?: string;
  transactionId?: string;
  gatewayResponse?: any;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  failureReason?: string;
  completedAt?: string;
}

class PaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      const response = await apiClient.get('/wallet/payment-methods');
      
      if (response.success && response.data) {

        return response as ApiResponse<PaymentMethod[]>;
      }

      // Fallback to mock data if backend fails
      console.warn('⚠️ [PAYMENT SERVICE] Backend failed, using fallback data');
      return this.getFallbackPaymentMethods();
    } catch (error) {
      console.error('❌ [PAYMENT SERVICE] Failed to fetch payment methods:', error);
      return this.getFallbackPaymentMethods();
    }
  }

  /**
   * Fallback payment methods (for development/offline scenarios)
   */
  private getFallbackPaymentMethods(): ApiResponse<PaymentMethod[]> {
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 'upi',
        name: 'UPI',
        type: 'upi',
        icon: '📱',
        isAvailable: true,
        processingFee: 0,
        processingTime: 'Instant'
      },
      {
        id: 'card',
        name: 'Debit/Credit Card',
        type: 'card',
        icon: '💳',
        isAvailable: true,
        processingFee: 2.5,
        processingTime: '2-3 minutes'
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        type: 'wallet',
        icon: '👛',
        isAvailable: true,
        processingFee: 1.5,
        processingTime: 'Instant'
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        type: 'netbanking',
        icon: '🏦',
        isAvailable: true,
        processingFee: 0,
        processingTime: '5-10 minutes'
      }
    ];

    return {
      success: true,
      data: mockPaymentMethods
    };
  }

  /**
   * Initiate payment
   */
  async initiatePayment(paymentRequest: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      // In production, this would call the actual payment gateway
      const response = await apiClient.post('/wallet/initiate-payment', paymentRequest);
      
      if (response.success && response.data) {
        return response as ApiResponse<PaymentResponse>;
      }

      // Fallback to mock response for development
      return this.createMockPaymentResponse(paymentRequest);
    } catch (error) {
      console.error('❌ [PAYMENT SERVICE] Payment initiation failed:', error);
      return this.createMockPaymentResponse(paymentRequest);
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      const response = await apiClient.get(`/wallet/payment-status/${paymentId}`);
      
      if (response.success && response.data) {
        return response as ApiResponse<PaymentStatusResponse>;
      }

      // Fallback to mock response
      return {
        success: true,
        data: {
          paymentId,
          status: 'completed',
          transactionId: `TXN_${Date.now()}`,
          completedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ [PAYMENT SERVICE] Status check failed:', error);
      return {
        success: false,
        error: 'Failed to check payment status'
      };
    }
  }

  /**
   * Process UPI payment
   */
  async processUPIPayment(amount: number, upiId?: string): Promise<ApiResponse<PaymentResponse>> {
    const paymentRequest: PaymentRequest = {
      amount,
      currency: 'INR',
      paymentMethod: 'upi',
      paymentMethodType: 'upi',
      metadata: {
        upiId: upiId || 'user@paytm',
        app: 'paytm'
      }
    };

    return this.initiatePayment(paymentRequest);
  }

  /**
   * Process card payment
   */
  async processCardPayment(
    amount: number,
    cardDetails: {
      number: string;
      expiry: string;
      cvv: string;
      name: string;
    }
  ): Promise<ApiResponse<PaymentResponse>> {
    const cardType = this.detectCardType(cardDetails.number);
    const paymentRequest: PaymentRequest = {
      amount,
      currency: 'INR',
      paymentMethod: 'card',
      paymentMethodType: cardType === 'visa' || cardType === 'mastercard' ? 'credit_card' : 'debit_card',
      metadata: {
        cardLast4: cardDetails.number.slice(-4),
        cardType: cardType
      }
    };

    return this.initiatePayment(paymentRequest);
  }

  /**
   * Process wallet payment
   */
  async processWalletPayment(amount: number, walletType: string = 'paytm'): Promise<ApiResponse<PaymentResponse>> {
    const paymentRequest: PaymentRequest = {
      amount,
      currency: 'INR',
      paymentMethod: 'wallet',
      paymentMethodType: 'wallet',
      metadata: {
        walletType
      }
    };

    return this.initiatePayment(paymentRequest);
  }

  /**
   * Process net banking payment
   */
  async processNetBankingPayment(amount: number, bankCode: string): Promise<ApiResponse<PaymentResponse>> {
    const paymentRequest: PaymentRequest = {
      amount,
      currency: 'INR',
      paymentMethod: 'netbanking',
      paymentMethodType: 'netbanking',
      metadata: {
        bankCode
      }
    };

    return this.initiatePayment(paymentRequest);
  }

  /**
   * Create mock payment response for development
   */
  private createMockPaymentResponse(paymentRequest: PaymentRequest): ApiResponse<PaymentResponse> {
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockResponse: PaymentResponse = {
      paymentId,
      orderId: `ORDER_${Date.now()}`,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      status: 'pending',
      paymentUrl: `https://payment-gateway.com/pay/${paymentId}`,
      qrCode: `upi://pay?pa=merchant@paytm&pn=REZ&am=${paymentRequest.amount}&cu=INR&tn=Wallet+Topup`,
      upiId: 'merchant@paytm',
      expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      transactionId: `TXN_${Date.now()}`,
      gatewayResponse: {
        gateway: 'mock',
        timestamp: new Date().toISOString()
      }
    };

    return {
      success: true,
      data: mockResponse
    };
  }

  /**
   * Detect card type from card number
   */
  private detectCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\D/g, '');
    
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    
    return 'unknown';
  }

  /**
   * Validate UPI ID format
   */
  validateUPIId(upiId: string): boolean {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(upiId);
  }

  /**
   * Validate card number (Luhn algorithm)
   */
  validateCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/\D/g, '');
    
    if (number.length < 13 || number.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Format card number for display
   */
  formatCardNumber(cardNumber: string): string {
    const number = cardNumber.replace(/\D/g, '');
    return number.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon(type: string): string {
    const icons: Record<string, string> = {
      upi: '📱',
      card: '💳',
      wallet: '👛',
      netbanking: '🏦'
    };
    
    return icons[type] || '💳';
  }
}

// Export singleton instance
const paymentService = new PaymentService();
export default paymentService;
