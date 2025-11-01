import type { PaymentRequest, PaymentResponse } from '@/types/payment.types';

class StripeReactNativeService {
  private configured = false;

  isNativeSDKAvailable(): boolean {
    return true;
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async initialize(): Promise<void> {
    this.configured = true;
  }

  async processPayment(
    _paymentRequest: PaymentRequest,
    _userDetails?: { name?: string; email?: string; phone?: string }
  ): Promise<PaymentResponse> {
    throw new Error('Stripe processing not implemented in this environment');
  }

  async checkPaymentStatus(_paymentId: string): Promise<PaymentResponse> {
    throw new Error('Stripe status check not implemented in this environment');
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    return {
      isValid: this.configured,
      errors: this.configured ? [] : ['Stripe not initialized'],
    };
  }
}

export default new StripeReactNativeService();


