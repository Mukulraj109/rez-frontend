/**
 * Pay In Store - Payment Screen
 *
 * Final payment screen with:
 * - Bill summary & discount breakdown
 * - Coin redemption (ReZ Coins, Promo Coins, PayBill)
 * - Hybrid payment support (coins + UPI/card)
 * - Payment method selection
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
// Note: @react-native-community/slider doesn't work on web, using custom coin selector
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import CrossPlatformSlider from '@/components/common/CrossPlatformSlider';
import StripeCardForm from '@/components/payment/StripeCardForm';
import {
  PaymentScreenParams,
  CoinBalance,
  CoinRedemption,
  PaymentMethodType,
  PaymentMethod,
  StorePaymentInitResponse,
} from '@/types/storePayment.types';
import apiClient from '@/services/apiClient';
import storePaymentApi from '@/services/storePaymentApi';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';

// Initialize Stripe
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const DEFAULT_COIN_REDEMPTION: CoinRedemption = {
  rezCoins: 0,
  promoCoins: 0,
  payBill: 0,
  totalAmount: 0,
};

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    type: 'upi',
    name: 'UPI',
    icon: 'phone-portrait-outline',
    isAvailable: true,
    description: 'GPay, PhonePe, Paytm, etc.',
  },
  {
    id: 'credit_card',
    type: 'credit_card',
    name: 'Credit Card',
    icon: 'card-outline',
    isAvailable: true,
    description: 'Visa, Mastercard, Rupay',
  },
  {
    id: 'debit_card',
    type: 'debit_card',
    name: 'Debit Card',
    icon: 'card',
    isAvailable: true,
    description: 'All bank cards',
  },
  {
    id: 'netbanking',
    type: 'netbanking',
    name: 'Net Banking',
    icon: 'business-outline',
    isAvailable: true,
    description: 'All major banks',
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<PaymentScreenParams>();
  const { storeId, storeName, amount, selectedOffers: selectedOffersParam } = params;
  const { state } = useAuth();
  const user = state.user;
  const { state: gamificationState, actions: gamificationActions } = useGamification();

  const billAmount = parseFloat(amount || '0');
  const selectedOfferIds: string[] = selectedOffersParam ? JSON.parse(selectedOffersParam) : [];

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coin balances
  const [coinBalances, setCoinBalances] = useState<CoinBalance[]>([]);
  const [coinRedemption, setCoinRedemption] = useState<CoinRedemption>(DEFAULT_COIN_REDEMPTION);

  // Payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Calculated values
  const [discountAmount, setDiscountAmount] = useState(0);
  const [maxCoinRedemptionPercent, setMaxCoinRedemptionPercent] = useState(100);

  // Stripe payment state
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [currentPaymentData, setCurrentPaymentData] = useState<StorePaymentInitResponse | null>(null);

  // UPI payment state
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [upiProcessing, setUpiProcessing] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, [storeId, gamificationState.coinBalance?.total]);

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch coin balances from wallet API
      const walletBalances = await storePaymentApi.getCoinBalances();

      // Use GamificationContext as fallback for rezCoins if wallet API returns 0
      const rezCoinBalance = walletBalances.rezCoins || gamificationState.coinBalance?.total || 0;

      // Set coin balances from wallet API
      setCoinBalances([
        {
          type: 'rezCoins',
          name: 'ReZ Coins',
          balance: rezCoinBalance,
          icon: 'diamond',
        },
        {
          type: 'promoCoins',
          name: 'Promo Coins',
          balance: walletBalances.promoCoins,
          icon: 'gift',
        },
        {
          type: 'payBill',
          name: 'PayBill Balance',
          balance: walletBalances.payBillBalance,
          icon: 'wallet',
        },
      ]);

      // Load store payment settings
      const storeResponse = await apiClient.get(`/stores/${storeId}`);
      if (storeResponse.success && storeResponse.data) {
        const store = storeResponse.data;
        setMaxCoinRedemptionPercent(store.paymentSettings?.maxCoinRedemptionPercent || 100);
      }

      // Calculate discount from selected offers
      if (selectedOfferIds.length > 0) {
        const offersResponse = await apiClient.get(`/store-payment/offers/${storeId}`, {
          params: { amount: billAmount },
        });
        if (offersResponse.success && offersResponse.data) {
          const allOffers = [
            ...(offersResponse.data.storeOffers || []),
            ...(offersResponse.data.bankOffers || []),
            ...(offersResponse.data.rezOffers || []),
          ];
          const selectedOffers = allOffers.filter((o: any) => selectedOfferIds.includes(o.id));

          const totalDiscount = selectedOffers.reduce((sum: number, offer: any) => {
            if (offer.valueType === 'PERCENTAGE') {
              const discount = (billAmount * offer.value) / 100;
              return sum + (offer.maxDiscount ? Math.min(discount, offer.maxDiscount) : discount);
            }
            return sum + offer.value;
          }, 0);

          setDiscountAmount(totalDiscount);
        }
      }

      // Set default payment method
      setSelectedPaymentMethod(PAYMENT_METHODS[0]);
    } catch (err: any) {
      console.error('Failed to load payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaxUsableCoins = useCallback(
    (coinType: 'rezCoins' | 'promoCoins' | 'payBill'): number => {
      const balance = coinBalances.find((c) => c.type === coinType)?.balance || 0;
      const afterDiscount = billAmount - discountAmount;
      const maxAllowed = (afterDiscount * maxCoinRedemptionPercent) / 100;

      // Calculate already used coins from other types
      const otherCoinsUsed = Object.entries(coinRedemption)
        .filter(([key]) => key !== coinType && key !== 'totalAmount')
        .reduce((sum, [, value]) => sum + value, 0);

      const availableForThisCoin = Math.max(0, maxAllowed - otherCoinsUsed);
      return Math.min(balance, Math.floor(availableForThisCoin));
    },
    [coinBalances, billAmount, discountAmount, maxCoinRedemptionPercent, coinRedemption]
  );

  const handleCoinChange = (coinType: 'rezCoins' | 'promoCoins' | 'payBill', value: number) => {
    const newRedemption = { ...coinRedemption, [coinType]: Math.floor(value) };
    newRedemption.totalAmount =
      newRedemption.rezCoins + newRedemption.promoCoins + newRedemption.payBill;
    setCoinRedemption(newRedemption);
  };

  const calculateAmountToPay = (): number => {
    const afterDiscount = billAmount - discountAmount;
    const afterCoins = afterDiscount - coinRedemption.totalAmount;
    return Math.max(0, afterCoins);
  };

  const handlePayment = async () => {
    // Prevent double-click
    if (isProcessing) {
      console.log('⚠️ Payment already in progress');
      return;
    }

    const amountToPay = calculateAmountToPay();

    // Validate payment method selection
    if (amountToPay > 0 && !selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    // Validate coin balances before submission
    const rezCoinBalance = coinBalances.find(c => c.type === 'rezCoins')?.balance || 0;
    const promoCoinBalance = coinBalances.find(c => c.type === 'promoCoins')?.balance || 0;
    const payBillBalance = coinBalances.find(c => c.type === 'payBill')?.balance || 0;

    if (coinRedemption.rezCoins > rezCoinBalance) {
      setError(`Insufficient ReZ Coins. You have ₹${rezCoinBalance} but trying to use ₹${coinRedemption.rezCoins}`);
      return;
    }
    if (coinRedemption.promoCoins > promoCoinBalance) {
      setError(`Insufficient Promo Coins. You have ₹${promoCoinBalance} but trying to use ₹${coinRedemption.promoCoins}`);
      return;
    }
    if (coinRedemption.payBill > payBillBalance) {
      setError(`Insufficient PayBill balance. You have ₹${payBillBalance} but trying to use ₹${coinRedemption.payBill}`);
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Initiate payment
      const response = await apiClient.post('/store-payment/initiate', {
        storeId,
        amount: billAmount,
        paymentMethod: amountToPay > 0 ? selectedPaymentMethod?.type : 'coins_only',
        coinsToRedeem: coinRedemption,
        offersApplied: selectedOfferIds,
      });

      console.log('💳 Payment initiate response:', response);

      if (response.success && response.data) {
        const paymentData: StorePaymentInitResponse = response.data;

        // If payment amount is 0 (full coin payment), auto-confirm
        if (amountToPay === 0) {
          const confirmResponse = await apiClient.post('/store-payment/confirm', {
            paymentId: paymentData.paymentId,
          });

          if (confirmResponse.success && confirmResponse.data) {
            navigateToSuccess(confirmResponse.data);
          } else {
            setError(confirmResponse.error || 'Payment confirmation failed');
          }
        } else {
          // Navigate to appropriate payment flow based on method
          handlePaymentRedirect(paymentData);
        }
      } else {
        setError(response.error || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.error || err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentRedirect = (paymentData: StorePaymentInitResponse) => {
    console.log('🔄 Handling payment redirect:', {
      paymentMethod: paymentData.paymentMethod,
      selectedType: selectedPaymentMethod?.type,
      hasClientSecret: !!paymentData.clientSecret,
    });
    
    // Check if we have a client secret for Stripe card payment
    if (paymentData.clientSecret && selectedPaymentMethod?.type.includes('card')) {
      // Show Stripe card form modal for card payments
      console.log('💳 Card payment - showing Stripe card form');
      setStripeClientSecret(paymentData.clientSecret);
      setCurrentPaymentData(paymentData);
      setError(null); // Clear any previous errors
      setIsProcessing(false); // Stop processing spinner so modal is interactive
      setShowStripeModal(true);
    } else if (paymentData.paymentMethod === 'upi' || selectedPaymentMethod?.type === 'upi') {
      // For UPI, show UPI payment modal
      console.log('📱 UPI payment - showing UPI modal');
      setCurrentPaymentData(paymentData);
      setError(null); // Clear any previous errors
      setUpiId(''); // Reset UPI ID input
      setIsProcessing(false);
      setShowUpiModal(true);
    } else if (selectedPaymentMethod?.type === 'netbanking') {
      // Net banking - would redirect to bank portal in production
      console.log('🏦 Net Banking - not implemented yet');
      setError('Net Banking payments are coming soon. Please use UPI or Card.');
      setIsProcessing(false);
    } else {
      // Other payment methods - show manual confirmation
      console.log('💰 Manual payment - merchant verification required');
      setError('Please complete payment and ask the merchant to confirm');
      setIsProcessing(false);
    }
  };

  const confirmPaymentManually = async (paymentData: StorePaymentInitResponse) => {
    try {
      setIsProcessing(true);
      const confirmResponse = await apiClient.post('/store-payment/confirm', {
        paymentId: paymentData.paymentId,
        transactionId: `TXN_${Date.now()}`,
      });

      if (confirmResponse.success && confirmResponse.data) {
        navigateToSuccess(confirmResponse.data);
      } else {
        setError(confirmResponse.error || 'Payment confirmation failed');
      }
    } catch (err: any) {
      setError('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // UPI Payment handler
  const handleUpiPayment = async () => {
    if (!upiId.trim()) {
      setError('Please enter your UPI ID');
      return;
    }

    // Basic UPI ID validation
    const upiRegex = /^[\w.-]+@[\w]+$/;
    if (!upiRegex.test(upiId.trim())) {
      setError('Please enter a valid UPI ID (e.g., name@upi)');
      return;
    }

    if (!currentPaymentData) {
      setError('Payment data not found');
      return;
    }

    try {
      setUpiProcessing(true);
      setError(null);
      console.log('📱 Processing UPI payment with ID:', upiId);

      // In production, this would:
      // 1. Use Stripe's UPI payment method, OR
      // 2. Generate a UPI deep link/intent, OR
      // 3. Show a QR code for the payment
      
      // For now, we'll simulate the UPI payment flow
      // and confirm with the backend
      const confirmResponse = await apiClient.post('/store-payment/confirm', {
        paymentId: currentPaymentData.paymentId,
        transactionId: `UPI_${Date.now()}`,
        upiId: upiId.trim(),
      });

      console.log('💾 UPI payment confirmation response:', confirmResponse);

      if (confirmResponse.success && confirmResponse.data) {
        setShowUpiModal(false);
        setUpiId('');
        navigateToSuccess(confirmResponse.data);
      } else {
        setError(confirmResponse.error || 'UPI payment confirmation failed');
      }
    } catch (err: any) {
      console.error('UPI payment error:', err);
      setError(err.message || 'UPI payment failed. Please try again.');
    } finally {
      setUpiProcessing(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setShowStripeModal(false);

    if (!currentPaymentData) {
      setError('Payment data not found');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('✅ Stripe payment succeeded, confirming with backend:', paymentIntentId);
      
      // Confirm with backend after Stripe payment success
      const confirmResponse = await apiClient.post('/store-payment/confirm', {
        paymentId: currentPaymentData.paymentId,
        transactionId: paymentIntentId,
      });

      console.log('💾 Backend confirmation response:', confirmResponse);

      if (confirmResponse.success && confirmResponse.data) {
        navigateToSuccess(confirmResponse.data);
      } else {
        setError(confirmResponse.error || 'Payment confirmation failed');
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setError('Failed to confirm payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePaymentError = (errorMessage: string) => {
    setShowStripeModal(false);
    setError(errorMessage);
  };

  const handleStripePaymentCancel = async () => {
    setShowStripeModal(false);
    
    // Cancel the payment on backend to clean up
    if (currentPaymentData?.paymentId) {
      try {
        console.log('🚫 Cancelling payment:', currentPaymentData.paymentId);
        await apiClient.post('/store-payment/cancel', {
          paymentId: currentPaymentData.paymentId,
          reason: 'user_cancelled',
        });
      } catch (err) {
        console.error('Failed to cancel payment:', err);
        // Don't show error to user - just log it
      }
    }
    
    setStripeClientSecret(null);
    setCurrentPaymentData(null);
  };

  const navigateToSuccess = async (paymentResult: any) => {
    // Backend has already deducted coins from wallet in confirmStorePayment
    // We just need to refresh the frontend state to reflect the updated balance
    if (coinRedemption.totalAmount > 0) {
      try {
        // Sync wallet balance from backend (coins already deducted there)
        await gamificationActions.syncCoinsFromWallet();
        console.log(`[Payment] Wallet synced after ${coinRedemption.totalAmount} coins used`);
      } catch (err) {
        console.error('[Payment] Failed to sync wallet balance:', err);
        // Continue anyway - balance will update on next screen load
      }
    }

    router.replace({
      pathname: '/pay-in-store/success',
      params: {
        paymentId: paymentResult.paymentId,
        storeId,
        storeName,
        amount: billAmount.toString(),
        coinsUsed: coinRedemption.totalAmount.toString(),
        rewards: JSON.stringify(paymentResult.rewards || {
          cashback: 0,
          coinsEarned: Math.floor(billAmount / 10), // 1 coin per ₹10 (fallback)
          bonusCoins: 0,
        }),
      },
    });
  };

  const amountToPay = calculateAmountToPay();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <Text style={styles.headerSubtitle}>{storeName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bill Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bill Amount</Text>
            <Text style={styles.summaryValue}>₹{billAmount.toFixed(2)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.discountLabel}>
                <Ionicons name="pricetag" size={14} color={COLORS.success[500]} />
                <Text style={[styles.summaryLabel, { color: COLORS.success[600] }]}>
                  Offer Discount
                </Text>
              </View>
              <Text style={[styles.summaryValue, { color: COLORS.success[600] }]}>
                -₹{discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          {coinRedemption.totalAmount > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.discountLabel}>
                <Ionicons name="diamond" size={14} color={COLORS.primary[500]} />
                <Text style={[styles.summaryLabel, { color: COLORS.primary[600] }]}>
                  Coins Redeemed
                </Text>
              </View>
              <Text style={[styles.summaryValue, { color: COLORS.primary[600] }]}>
                -₹{coinRedemption.totalAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Amount to Pay</Text>
            <Text style={styles.totalValue}>₹{amountToPay.toFixed(2)}</Text>
          </View>
        </View>

        {/* Coin Redemption */}
        <View style={styles.coinsCard}>
          <Text style={styles.sectionTitle}>Redeem Coins</Text>
          <Text style={styles.sectionSubtitle}>
            Use up to {maxCoinRedemptionPercent}% of your bill with coins
          </Text>

          {coinBalances.map((coin) => {
            const maxUsable = getMaxUsableCoins(coin.type as any);
            const currentValue = coinRedemption[coin.type as keyof CoinRedemption] as number;

            return (
              <View key={coin.type} style={styles.coinSliderContainer}>
                <View style={styles.coinHeader}>
                  <View style={styles.coinInfo}>
                    {coin.type === 'rezCoins' ? (
                      <Image
                        source={require('@/assets/images/rez-coin.png')}
                        style={styles.coinIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name={coin.icon as any}
                        size={20}
                        color={
                          coin.type === 'promoCoins'
                            ? COLORS.secondary[500]
                            : COLORS.info[500]
                        }
                      />
                    )}
                    <Text style={styles.coinName}>{coin.name}</Text>
                  </View>
                  <Text style={styles.coinBalance}>
                    Balance: {coin.balance} {coin.type === 'payBill' && '₹'}
                  </Text>
                </View>

                {/* Slider Row */}
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderValueRow}>
                    <Text style={styles.sliderMinValue}>0</Text>
                    <Text style={styles.sliderCurrentValue}>
                      {coin.type === 'payBill' ? '₹' : ''}{currentValue}
                    </Text>
                    <Text style={styles.sliderMaxValue}>{maxUsable}</Text>
                  </View>

                  <CrossPlatformSlider
                    value={currentValue}
                    onValueChange={(value) => handleCoinChange(coin.type as any, value)}
                    minimumValue={0}
                    maximumValue={maxUsable > 0 ? maxUsable : 1}
                    step={1}
                    minimumTrackTintColor={COLORS.primary[500]}
                    maximumTrackTintColor={COLORS.neutral[200]}
                    thumbTintColor={COLORS.primary[500]}
                    disabled={maxUsable === 0}
                  />

                  {/* Quick Select Buttons */}
                  <View style={styles.quickSelectRow}>
                    <TouchableOpacity
                      style={[styles.quickSelectButton, currentValue === 0 && styles.quickSelectActive]}
                      onPress={() => handleCoinChange(coin.type as any, 0)}
                    >
                      <Text style={[styles.quickSelectText, currentValue === 0 && styles.quickSelectTextActive]}>None</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickSelectButton, currentValue === Math.floor(maxUsable / 2) && styles.quickSelectActive]}
                      onPress={() => handleCoinChange(coin.type as any, Math.floor(maxUsable / 2))}
                      disabled={maxUsable === 0}
                    >
                      <Text style={[styles.quickSelectText, currentValue === Math.floor(maxUsable / 2) && styles.quickSelectTextActive]}>Half</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickSelectButton, currentValue === maxUsable && styles.quickSelectActive]}
                      onPress={() => handleCoinChange(coin.type as any, maxUsable)}
                      disabled={maxUsable === 0}
                    >
                      <Text style={[styles.quickSelectText, currentValue === maxUsable && styles.quickSelectTextActive]}>Max</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {maxUsable === 0 && coin.balance > 0 && (
                  <Text style={styles.coinLimitText}>
                    Max redemption limit reached
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Payment Methods */}
        {amountToPay > 0 && (
          <View style={styles.paymentMethodsCard}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  selectedPaymentMethod?.id === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method)}
              >
                <View
                  style={[
                    styles.paymentMethodIcon,
                    selectedPaymentMethod?.id === method.id && styles.paymentMethodIconSelected,
                  ]}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={24}
                    color={
                      selectedPaymentMethod?.id === method.id
                        ? COLORS.primary[500]
                        : COLORS.neutral[500]
                    }
                  />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodDesc}>{method.description}</Text>
                </View>
                {selectedPaymentMethod?.id === method.id ? (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary[500]} />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color={COLORS.neutral[300]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Fully paid with coins banner */}
        {amountToPay === 0 && coinRedemption.totalAmount > 0 && (
          <LinearGradient
            colors={[COLORS.success[500], COLORS.success[600]]}
            style={styles.fullCoinBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.fullCoinText}>
              Full payment covered by coins! No additional payment needed.
            </Text>
          </LinearGradient>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error[500]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomAmount}>₹{amountToPay.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                {amountToPay === 0 ? 'Confirm Payment' : `Pay ₹${amountToPay.toFixed(0)}`}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Stripe Card Payment Modal */}
      <Modal
        visible={showStripeModal}
        transparent
        animationType="slide"
        onRequestClose={handleStripePaymentCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {stripeClientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripeClientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: COLORS.primary[500],
                      colorBackground: '#FFFFFF',
                      colorText: '#111827',
                      colorDanger: '#EF4444',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      borderRadius: '12px',
                    },
                  },
                }}
              >
                <StripeCardForm
                  clientSecret={stripeClientSecret}
                  amount={currentPaymentData?.remainingAmount || 0}
                  onSuccess={handleStripePaymentSuccess}
                  onError={handleStripePaymentError}
                  onCancel={handleStripePaymentCancel}
                />
              </Elements>
            )}
          </View>
        </View>
      </Modal>

      {/* UPI Payment Modal */}
      <Modal
        visible={showUpiModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowUpiModal(false);
          setUpiId('');
          setError(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.upiModalContent}>
            {/* Header */}
            <View style={styles.upiHeader}>
              <View>
                <Text style={styles.upiTitle}>Pay via UPI</Text>
                <Text style={styles.upiSubtitle}>
                  {currentPaymentData?.storeName || storeName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowUpiModal(false);
                  setUpiId('');
                  setError(null);
                }}
                style={styles.upiCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Amount Display */}
            <View style={styles.upiAmountContainer}>
              <Text style={styles.upiAmountLabel}>Amount to Pay</Text>
              <Text style={styles.upiAmount}>
                ₹{currentPaymentData?.remainingAmount || calculateAmountToPay()}
              </Text>
            </View>

            {/* UPI ID Input */}
            <View style={styles.upiInputContainer}>
              <Text style={styles.upiInputLabel}>Enter your UPI ID</Text>
              <View style={styles.upiInputWrapper}>
                <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="yourname@upi"
                  placeholderTextColor="#9CA3AF"
                  style={styles.upiTextInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
              <Text style={styles.upiHint}>
                Example: name@paytm, name@oksbi, name@ybl
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.upiErrorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.upiErrorText}>{error}</Text>
              </View>
            )}

            {/* UPI Apps Info */}
            <View style={styles.upiAppsInfo}>
              <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
              <Text style={styles.upiAppsText}>
                Payment request will be sent to your UPI app (GPay, PhonePe, Paytm, etc.)
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.upiButtonContainer}>
              <TouchableOpacity
                style={styles.upiCancelButton}
                onPress={() => {
                  setShowUpiModal(false);
                  setUpiId('');
                  setError(null);
                }}
                disabled={upiProcessing}
              >
                <Text style={styles.upiCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.upiPayButton,
                  (!upiId.trim() || upiProcessing) && styles.upiPayButtonDisabled,
                ]}
                onPress={handleUpiPayment}
                disabled={!upiId.trim() || upiProcessing}
              >
                {upiProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.upiPayButtonText}>
                    Pay ₹{currentPaymentData?.remainingAmount || calculateAmountToPay()}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  discountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  totalValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary[600],
  },
  coinsCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  coinSliderContainer: {
    marginBottom: SPACING.lg,
  },
  coinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
  coinName: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  coinBalance: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  sliderContainer: {
    marginTop: SPACING.sm,
  },
  sliderValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sliderMinValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  sliderCurrentValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary[600],
    fontWeight: '700',
  },
  sliderMaxValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  quickSelectButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  quickSelectActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  quickSelectText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  quickSelectTextActive: {
    color: '#FFFFFF',
  },
  coinLimitText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning[600],
    marginTop: SPACING.xs,
  },
  paymentMethodsCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    marginBottom: SPACING.sm,
  },
  paymentMethodSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodIconSelected: {
    backgroundColor: COLORS.primary[100],
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentMethodName: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  paymentMethodDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  fullCoinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  fullCoinText: {
    ...TYPOGRAPHY.body,
    color: '#FFFFFF',
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error[700],
    flex: 1,
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.lg,
  },
  bottomInfo: {
    alignItems: 'flex-start',
  },
  bottomLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  bottomAmount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  payButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary[500],
    gap: SPACING.sm,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.neutral[400],
  },
  payButtonText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.lg,
  },
  // UPI Modal Styles
  upiModalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    ...SHADOWS.lg,
  },
  upiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  upiTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  upiSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  upiCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiAmountContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  upiAmountLabel: {
    fontSize: 13,
    color: '#059669',
    marginBottom: 4,
  },
  upiAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#059669',
  },
  upiInputContainer: {
    marginBottom: 16,
  },
  upiInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  upiInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  upiTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
    margin: 0,
  },
  upiHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  upiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  upiErrorText: {
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  upiAppsInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  upiAppsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  upiButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  upiCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  upiCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  upiPayButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  upiPayButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  upiPayButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
