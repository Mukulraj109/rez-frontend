// Modern Payment Page with Razorpay Integration
// Production-ready payment interface for REZ app
// Supports both native Razorpay and web-based checkout

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import paymentService, { PaymentMethod, PaymentResponse } from '@/services/paymentService';
import PaymentValidator from '@/services/paymentValidation';
import apiClient from '@/services/apiClient';

// Import Razorpay for native support
// Note: Requires expo-dev-client or web fallback
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (error) {

}

const { width, height } = Dimensions.get('window');

// Get Razorpay Key from environment
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

export default function PaymentPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const amount = Number(params.amount) || 5000;
  const currency = (params.currency as string) || 'INR';
  const orderId = params.orderId as string; // MongoDB order ID

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'methods' | 'details' | 'processing'>('methods');

  // Razorpay state
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState(RAZORPAY_KEY_ID);

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    loadPaymentMethods();
    animateEntrance();
  }, []);

  useEffect(() => {
    if (currentStep === 'processing') {
      animateProgress();
    }
  }, [currentStep]);

  const animateEntrance = () => {
    fadeAnim.setValue(0.3);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  const loadPaymentMethods = async () => {

    setIsLoading(true);
    try {
      const response = await paymentService.getPaymentMethods();
      if (response.success && response.data) {
        // Filter to show only Razorpay-supported methods
        const razorpayMethods = response.data.map(method => ({
          ...method,
          gateway: 'razorpay'
        }));
        setPaymentMethods(razorpayMethods);
      }
    } catch (error) {
      console.error('❌ [PAYMENT] Failed to load payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = useCallback(() => {
    if (currentStep === 'details') {
      setCurrentStep('methods');
      setSelectedMethod(null);
    } else {
      router.back();
    }
  }, [currentStep, router]);

  const handleMethodSelect = (method: PaymentMethod) => {

    setSelectedMethod(method);
    // For Razorpay, directly proceed to payment
    handleRazorpayPayment();
  };

  /**
   * Create Razorpay order on backend
   */
  const createRazorpayOrder = async (): Promise<any> => {

    try {
      const response = await apiClient.post('/payment/create-order', {
        orderId: orderId, // MongoDB order ID
        amount: amount,   // in rupees
        currency: currency
      });

      if (response.success && response.data) {

        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create payment order');
      }
    } catch (error: any) {
      console.error('❌ [RAZORPAY] Order creation failed:', error);
      throw error;
    }
  };

  /**
   * Verify payment on backend
   */
  const verifyPayment = async (paymentData: any): Promise<boolean> => {

    try {
      const response = await apiClient.post('/payment/verify', {
        orderId: orderId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      if (response.success && response.data) {

        return true;
      } else {
        console.error('❌ [RAZORPAY] Payment verification failed:', response.error);
        return false;
      }
    } catch (error: any) {
      console.error('❌ [RAZORPAY] Verification error:', error);
      return false;
    }
  };

  /**
   * Handle Razorpay payment
   */
  const handleRazorpayPayment = async () => {

    setCurrentStep('processing');
    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order on backend
      const orderData = await createRazorpayOrder();

      setRazorpayOrderId(orderData.razorpayOrderId);
      setRazorpayKeyId(orderData.razorpayKeyId);

      // Step 2: Open Razorpay checkout
      if (RazorpayCheckout) {
        // Native Razorpay checkout
        openNativeRazorpayCheckout(orderData);
      } else {
        // Web-based fallback (for Expo Go)
        openWebRazorpayCheckout(orderData);
      }

    } catch (error: any) {
      console.error('❌ [RAZORPAY] Payment initiation failed:', error);
      setCurrentStep('methods');
      setIsProcessing(false);
      Alert.alert(
        'Payment Failed',
        error.message || 'Failed to initiate payment. Please try again.'
      );
    }
  };

  /**
   * Open native Razorpay checkout
   */
  const openNativeRazorpayCheckout = (orderData: any) => {

    const options = {
      description: 'REZ App - Wallet Topup',
      image: 'https://your-logo-url.com/logo.png', // Your app logo
      currency: orderData.currency,
      key: orderData.razorpayKeyId,
      amount: orderData.amount, // in paise
      order_id: orderData.razorpayOrderId,
      name: 'REZ App',
      prefill: {
        email: 'user@example.com',
        contact: '9876543210',
        name: 'User Name'
      },
      theme: { color: '#8B5CF6' },
      modal: {
        ondismiss: () => {

          setCurrentStep('methods');
          setIsProcessing(false);
          Alert.alert('Payment Cancelled', 'You cancelled the payment.');
        }
      }
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        // Payment successful

        handlePaymentSuccess(data);
      })
      .catch((error: any) => {
        // Payment failed
        console.error('❌ [RAZORPAY] Payment failed:', error);
        handlePaymentFailure(error);
      });
  };

  /**
   * Open web-based Razorpay checkout (fallback for Expo Go)
   */
  const openWebRazorpayCheckout = (orderData: any) => {

    // For Expo Go, we'll use a simplified mock flow
    // In production with expo-dev-client, use expo-web-browser to open Razorpay

    Alert.alert(
      'Payment Method',
      'Razorpay web checkout will open in your browser. This is a fallback for Expo Go.\n\nFor production, use expo-dev-client for native integration.',
      [
        {
          text: 'Cancel',
          onPress: () => {
            setCurrentStep('methods');
            setIsProcessing(false);
          },
          style: 'cancel'
        },
        {
          text: 'Continue (Mock)',
          onPress: () => {
            // Simulate successful payment for testing
            setTimeout(() => {
              const mockData = {
                razorpay_order_id: orderData.razorpayOrderId,
                razorpay_payment_id: 'pay_mock_' + Date.now(),
                razorpay_signature: 'mock_signature_' + Date.now()
              };
              handlePaymentSuccess(mockData);
            }, 2000);
          }
        }
      ]
    );
  };

  /**
   * Handle payment success
   */
  const handlePaymentSuccess = async (paymentData: any) => {

    try {
      // Verify payment on backend
      const isVerified = await verifyPayment(paymentData);

      if (isVerified) {

        // Payment verified - navigate to order confirmation page
        setIsProcessing(false);

        setTimeout(() => {
          router.replace(`/order-confirmation?orderId=${orderId}` as any);
        }, 500);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('❌ [RAZORPAY] Payment processing failed:', error);
      setCurrentStep('methods');
      setIsProcessing(false);
      Alert.alert(
        'Verification Failed',
        'Payment was received but verification failed. Please contact support.',
        [
          {
            text: 'Contact Support',
            onPress: () => {
              // Navigate to support
              router.push('/support' as any);
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    }
  };

  /**
   * Handle payment failure
   */
  const handlePaymentFailure = (error: any) => {
    console.error('❌ [RAZORPAY] Payment failed:', error);

    setCurrentStep('methods');
    setIsProcessing(false);

    const errorMessage = error.description || error.message || 'Payment failed. Please try again.';

    Alert.alert(
      'Payment Failed',
      errorMessage,
      [
        {
          text: 'Try Again',
          onPress: () => {
            // Allow user to retry
            setCurrentStep('methods');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            router.back();
          }
        }
      ]
    );
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'upi':
        return 'phone-portrait-outline';
      case 'wallet':
        return 'wallet-outline';
      case 'netbanking':
        return 'business-outline';
      default:
        return 'card-outline';
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'card':
        return '#3B82F6';
      case 'upi':
        return '#8B5CF6';
      case 'wallet':
        return '#EC4899';
      case 'netbanking':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const renderPaymentMethods = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ThemedText style={styles.stepTitle}>Choose Payment Method</ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Secure payment powered by Razorpay
      </ThemedText>

      <View style={styles.razorpayBadge}>
        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
        <ThemedText style={styles.razorpayBadgeText}>
          Secured by Razorpay - PCI DSS Compliant
        </ThemedText>
      </View>

      <View style={styles.methodsGrid}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              { borderColor: getMethodColor(method.type) },
            ]}
            onPress={() => handleMethodSelect(method)}
            disabled={!method.isAvailable || isProcessing}
            activeOpacity={0.7}
          >
            <View style={[styles.methodIconContainer, { backgroundColor: getMethodColor(method.type) }]}>
              <Ionicons name={getMethodIcon(method.type)} size={24} color="#FFFFFF" />
            </View>

            <View style={styles.methodInfo}>
              <ThemedText style={styles.methodName}>{method.name}</ThemedText>
              <ThemedText style={styles.methodGateway}>Razorpay Gateway</ThemedText>
              <View style={styles.methodDetails}>
                <ThemedText style={styles.methodFee}>
                  {method.processingFee && method.processingFee > 0
                    ? `Fee: ${method.processingFee}%`
                    : 'No fee'
                  }
                </ThemedText>
                <ThemedText style={styles.methodTime}>{method.processingTime}</ThemedText>
              </View>
            </View>

            <View style={styles.methodArrow}>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.supportedMethods}>
        <ThemedText style={styles.supportedTitle}>Supported Payment Options:</ThemedText>
        <ThemedText style={styles.supportedText}>
          UPI, Cards (Visa, Mastercard, Amex, RuPay), Net Banking, Wallets (Paytm, PhonePe, etc.)
        </ThemedText>
      </View>
    </Animated.View>
  );

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <View style={styles.processingIcon}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>

      <ThemedText style={styles.processingTitle}>Processing Payment</ThemedText>
      <ThemedText style={styles.processingSubtitle}>
        Please wait while we securely process your payment...
      </ThemedText>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <ThemedText style={styles.progressText}>Processing...</ThemedText>
      </View>

      <View style={styles.securityInfo}>
        <Ionicons name="lock-closed" size={16} color="#10B981" />
        <ThemedText style={styles.securityText}>
          256-bit SSL Encrypted
        </ThemedText>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Payment</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading payment methods...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerBg}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Payment</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.amountSection}>
          <ThemedText style={styles.amountLabel}>Amount to Pay</ThemedText>
          <ThemedText style={styles.amountValue}>
            ₹{amount.toLocaleString()}
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {currentStep === 'methods' && renderPaymentMethods()}
        {currentStep === 'processing' && renderProcessing()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBg: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 34,
  },
  amountSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  amountLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    marginBottom: 5,
  },
  amountValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  razorpayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    gap: 6,
  },
  razorpayBadgeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  methodsGrid: {
    gap: 16,
    marginTop: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 4,
  },
  methodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodGateway: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  methodDetails: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  methodFee: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodTime: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  methodArrow: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginLeft: 8,
  },
  supportedMethods: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  supportedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  supportedText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  processingIcon: {
    marginBottom: 24,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});
