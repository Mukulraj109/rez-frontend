// Razorpay Payment Service for REZ App
// Handles Razorpay payment integration with React Native

import { Platform, Alert } from 'react-native';
import apiClient from './apiClient';
import type {
  PaymentRequest,
  PaymentResponse,
  RazorpayOrder,
  RazorpayPaymentData,
  PaymentMethodType,
} from '@/types/payment.types';

// Import Razorpay for native support (requires expo-dev-client)
let RazorpayCheckout: any = null;
try {
  if (Platform.OS !== 'web') {
    RazorpayCheckout = require('react-native-razorpay').default;
  }
} catch (error) {

}

// Get Razorpay configuration from environment
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
const RAZORPAY_ENABLED = process.env.EXPO_PUBLIC_ENABLE_RAZORPAY === 'true';

/**
 * Razorpay Service Class
 */
class RazorpayService {
  private keyId: string;
  private isNativeAvailable: boolean;

  constructor() {
    this.keyId = RAZORPAY_KEY_ID;
    this.isNativeAvailable = !!RazorpayCheckout;

    console.log('🔧 [RAZORPAY] Initializing Razorpay Service');
    console.log('🔧 [RAZORPAY] Platform:', Platform.OS);
    console.log('🔧 [RAZORPAY] Enabled:', RAZORPAY_ENABLED);
    console.log('🔧 [RAZORPAY] Key ID:', this.keyId ? (this.keyId.substring(0, 15) + '...') : 'NOT SET');
    console.log('🔧 [RAZORPAY] Native Available:', this.isNativeAvailable);

    if (!RAZORPAY_ENABLED) {
      console.warn('⚠️ [RAZORPAY] Razorpay is disabled in environment config');
    }

    if (!this.keyId || this.keyId.includes('your_razorpay_key_id')) {
      console.warn('⚠️ [RAZORPAY] Razorpay key not configured properly');
      console.warn('⚠️ [RAZORPAY] Please set EXPO_PUBLIC_RAZORPAY_KEY_ID in your .env file');
    }
  }

  /**
   * Check if Razorpay is properly configured
   */
  isConfigured(): boolean {
    return (
      RAZORPAY_ENABLED &&
      !!this.keyId &&
      !this.keyId.includes('your_razorpay_key_id')
    );
  }

  /**
   * Check if native Razorpay is available
   */
  isNativeCheckoutAvailable(): boolean {
    return this.isNativeAvailable && Platform.OS !== 'web';
  }

  /**
   * Create Razorpay order on backend
   */
  async createOrder(
    orderId: string,
    amount: number,
    currency: string = 'INR',
    metadata?: Record<string, any>
  ): Promise<RazorpayOrder> {

    try {
      if (!this.isConfigured()) {
        throw new Error('Razorpay is not properly configured');
      }

      const response = await apiClient.post('/payment/razorpay/create-order', {
        orderId,
        amount, // in rupees
        currency,
        metadata,
      });

      if (response.success && response.data) {
        const data = (response.data as {
          razorpayOrderId: string;
          amount: number;
          currency: string;
          receipt: string;
          status: string;
          keyId?: string;
        }) || {} as any;

        return {
          id: data.razorpayOrderId,
          amount: data.amount, // in paise
          currency: data.currency,
          receipt: data.receipt,
          status: data.status,
          key: data.keyId || this.keyId,
        };
      } else {
        throw new Error(response.error || 'Failed to create Razorpay order');
      }
    } catch (error: any) {
      console.error('❌ [RAZORPAY] Order creation failed:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  /**
   * Open Razorpay checkout
   */
  async openCheckout(
    order: RazorpayOrder,
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    },
    metadata?: Record<string, any>
  ): Promise<RazorpayPaymentData> {

    if (this.isNativeCheckoutAvailable()) {
      return this.openNativeCheckout(order, userDetails, metadata);
    } else {
      return this.openWebCheckout(order, userDetails, metadata);
    }
  }

  /**
   * Open native Razorpay checkout (for native apps)
   */
  private async openNativeCheckout(
    order: RazorpayOrder,
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    },
    metadata?: Record<string, any>
  ): Promise<RazorpayPaymentData> {

    return new Promise((resolve, reject) => {
      const options = {
        description: 'REZ App - Order Payment',
        image: 'https://your-logo-url.com/logo.png', // Replace with your app logo
        currency: order.currency,
        key: order.key,
        amount: order.amount, // in paise
        order_id: order.id,
        name: 'REZ App',
        prefill: {
          email: userDetails?.email || 'user@example.com',
          contact: userDetails?.contact || '',
          name: userDetails?.name || 'User',
        },
        theme: { color: '#8B5CF6' },
        notes: metadata || {},
        modal: {
          ondismiss: () => {

            reject(new Error('Payment cancelled by user'));
          },
        },
      };

      RazorpayCheckout.open(options)
        .then((data: RazorpayPaymentData) => {

          resolve(data);
        })
        .catch((error: any) => {
          console.error('❌ [RAZORPAY] Payment failed:', error);
          reject(error);
        });
    });
  }

  /**
   * Open web-based Razorpay checkout (fallback for Expo Go and web)
   */
  private async openWebCheckout(
    order: RazorpayOrder,
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    },
    metadata?: Record<string, any>
  ): Promise<RazorpayPaymentData> {
    console.log('🌐 [RAZORPAY] Opening web checkout');
    console.log('🌐 [RAZORPAY] Order ID:', order.id);
    console.log('🌐 [RAZORPAY] Amount:', order.amount);

    // For web or Expo Go, we need to use expo-web-browser or create a webview
    // For now, we'll show instructions to the user

    return new Promise((resolve, reject) => {
      if (Platform.OS === 'web') {
        console.log('🌐 [RAZORPAY] Platform is web, loading Razorpay script...');
        // On web, load Razorpay script and open checkout
        this.loadRazorpayWebScript()
          .then(() => {
            console.log('✅ [RAZORPAY] Razorpay script loaded successfully');
            const Razorpay = (window as any).Razorpay;

            if (!Razorpay) {
              console.error('❌ [RAZORPAY] Razorpay object not found on window');
              reject(new Error('Razorpay script failed to load'));
              return;
            }

            const options = {
              key: order.key,
              amount: order.amount,
              currency: order.currency,
              name: 'REZ App',
              description: 'Subscription Payment',
              order_id: order.id,
              prefill: {
                name: userDetails?.name || 'User',
                email: userDetails?.email || 'user@example.com',
                contact: userDetails?.contact || '',
              },
              theme: { color: '#8B5CF6' },
              handler: (response: RazorpayPaymentData) => {
                console.log('✅ [RAZORPAY] Payment successful:', response);
                resolve(response);
              },
              modal: {
                ondismiss: () => {
                  console.log('⚠️ [RAZORPAY] Payment modal dismissed');
                  reject(new Error('Payment cancelled by user'));
                },
              },
            };

            console.log('🚀 [RAZORPAY] Opening Razorpay checkout with options:', {
              ...options,
              key: options.key.substring(0, 15) + '...'
            });

            const rzp = new Razorpay(options);
            rzp.open();
          })
          .catch((error) => {
            console.error('❌ [RAZORPAY] Failed to load Razorpay script:', error);
            reject(error);
          });
      } else {
        // For Expo Go on mobile, show alert with mock payment option
        Alert.alert(
          'Payment Required',
          'Razorpay native checkout requires expo-dev-client.\n\nFor testing in Expo Go, we can simulate payment completion.',
          [
            {
              text: 'Cancel',
              onPress: () => reject(new Error('Payment cancelled by user')),
              style: 'cancel',
            },
            {
              text: 'Simulate Payment (Test)',
              onPress: () => {
                // Simulate successful payment for testing
                const mockData: RazorpayPaymentData = {
                  razorpay_order_id: order.id,
                  razorpay_payment_id: 'pay_mock_' + Date.now(),
                  razorpay_signature: 'mock_signature_' + Date.now(),
                };

                resolve(mockData);
              },
            },
          ],
          { cancelable: false }
        );
      }
    });
  }

  /**
   * Load Razorpay web script (for web platform)
   */
  private loadRazorpayWebScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window object not available'));
        return;
      }

      // Check if script is already loaded
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  }

  /**
   * Verify payment on backend
   */
  async verifyPayment(
    orderId: string,
    paymentData: RazorpayPaymentData
  ): Promise<PaymentResponse> {

    try {
      const response = await apiClient.post('/payment/razorpay/verify', {
        orderId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      if (response.success && response.data) {
        return response.data as PaymentResponse;
      } else {
        throw new Error(response.error || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('❌ [RAZORPAY] Verification error:', error);
      throw new Error(error.message || 'Payment verification failed');
    }
  }

  /**
   * Process complete payment flow
   */
  async processPayment(
    paymentRequest: PaymentRequest,
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    }
  ): Promise<PaymentResponse> {

    try {
      // Step 1: Create Razorpay order
      const order = await this.createOrder(
        paymentRequest.orderId,
        paymentRequest.amount,
        paymentRequest.currency,
        paymentRequest.metadata
      );
      // Step 2: Open Razorpay checkout
      const paymentData = await this.openCheckout(order, userDetails, paymentRequest.metadata);

      // Step 3: Verify payment
      const paymentResponse = await this.verifyPayment(paymentRequest.orderId, paymentData);

      return paymentResponse;
    } catch (error: any) {
      console.error('❌ [RAZORPAY] Payment flow failed:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {

    try {
      const response = await apiClient.get(`/payment/razorpay/status/${paymentId}`);

      if (response.success && response.data) {
        return response.data as PaymentResponse;
      } else {
        throw new Error(response.error || 'Failed to check payment status');
      }
    } catch (error: any) {
      console.error('❌ [RAZORPAY] Status check failed:', error);
      throw new Error(error.message || 'Failed to check payment status');
    }
  }

  /**
   * Get supported payment methods from Razorpay
   */
  getSupportedMethods(): PaymentMethodType[] {
    return ['upi', 'card', 'netbanking', 'wallet'];
  }

  /**
   * Validate Razorpay configuration
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!RAZORPAY_ENABLED) {
      errors.push('Razorpay is disabled in environment configuration');
    }

    if (!this.keyId || this.keyId.includes('your_razorpay_key_id')) {
      errors.push('Razorpay key ID is not configured properly');
    }

    if (!this.isNativeCheckoutAvailable() && Platform.OS !== 'web') {
      errors.push(
        'Native Razorpay module not available. Install react-native-razorpay and build with expo-dev-client'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
const razorpayService = new RazorpayService();
export default razorpayService;
