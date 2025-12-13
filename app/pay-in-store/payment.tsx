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
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
// Note: @react-native-community/slider doesn't work on web, using custom coin selector
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import {
  PaymentScreenParams,
  CoinBalance,
  CoinRedemption,
  PaymentMethodType,
  PaymentMethod,
  StorePaymentInitResponse,
} from '@/types/storePayment.types';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    loadPaymentData();
  }, [storeId]);

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user's coin balances - handle 404 gracefully
      let wallet = { rezCoins: 0, promoCoins: 0, payBillBalance: 0 };
      try {
        const walletResponse = await apiClient.get('/users/wallet');
        if (walletResponse.data?.success) {
          wallet = walletResponse.data.data;
        }
      } catch (walletError) {
        // Wallet endpoint might not exist yet - use defaults
        console.log('[Payment] Wallet endpoint not available, using defaults');
      }

      setCoinBalances([
        {
          type: 'rezCoins',
          name: 'ReZ Coins',
          balance: wallet.rezCoins || 0,
          icon: 'diamond',
        },
        {
          type: 'promoCoins',
          name: 'Promo Coins',
          balance: wallet.promoCoins || 0,
          icon: 'gift',
        },
        {
          type: 'payBill',
          name: 'PayBill Balance',
          balance: wallet.payBillBalance || 0,
          icon: 'wallet',
        },
      ]);

      // Load store payment settings
      const storeResponse = await apiClient.get(`/stores/${storeId}`);
      if (storeResponse.data?.success) {
        const store = storeResponse.data.data;
        setMaxCoinRedemptionPercent(store.paymentSettings?.maxCoinRedemptionPercent || 100);
      }

      // Calculate discount from selected offers
      if (selectedOfferIds.length > 0) {
        const offersResponse = await apiClient.get(`/store-payment/offers/${storeId}`, {
          params: { amount: billAmount },
        });
        if (offersResponse.data?.success) {
          const allOffers = [
            ...(offersResponse.data.data.storeOffers || []),
            ...(offersResponse.data.data.bankOffers || []),
            ...(offersResponse.data.data.rezOffers || []),
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
    const amountToPay = calculateAmountToPay();

    // Validate
    if (amountToPay > 0 && !selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
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

      if (response.data?.success) {
        const paymentData: StorePaymentInitResponse = response.data.data;

        // If payment amount is 0 (full coin payment), auto-confirm
        if (amountToPay === 0) {
          const confirmResponse = await apiClient.post('/store-payment/confirm', {
            paymentId: paymentData.paymentId,
          });

          if (confirmResponse.data?.success) {
            navigateToSuccess(confirmResponse.data.data);
          } else {
            setError('Payment confirmation failed');
          }
        } else {
          // Navigate to appropriate payment flow based on method
          handlePaymentRedirect(paymentData);
        }
      } else {
        setError(response.data?.error || 'Failed to initiate payment');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentRedirect = (paymentData: StorePaymentInitResponse) => {
    // In a real app, this would integrate with payment gateway
    // For now, simulate success after a delay
    Alert.alert(
      'Payment',
      `Please complete the payment of ₹${paymentData.remainingAmount} via ${selectedPaymentMethod?.name}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Simulate Success',
          onPress: async () => {
            try {
              setIsProcessing(true);
              const confirmResponse = await apiClient.post('/store-payment/confirm', {
                paymentId: paymentData.paymentId,
                transactionId: `TXN_${Date.now()}`,
              });

              if (confirmResponse.data?.success) {
                navigateToSuccess(confirmResponse.data.data);
              } else {
                setError('Payment confirmation failed');
              }
            } catch (err: any) {
              setError('Payment failed');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const navigateToSuccess = (paymentResult: any) => {
    router.replace({
      pathname: '/pay-in-store/success',
      params: {
        paymentId: paymentResult.paymentId,
        storeId,
        storeName,
        amount: billAmount.toString(),
        rewards: JSON.stringify(paymentResult.rewards),
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
                    <Ionicons
                      name={coin.icon as any}
                      size={20}
                      color={
                        coin.type === 'rezCoins'
                          ? COLORS.primary[500]
                          : coin.type === 'promoCoins'
                          ? COLORS.secondary[500]
                          : COLORS.info[500]
                      }
                    />
                    <Text style={styles.coinName}>{coin.name}</Text>
                  </View>
                  <Text style={styles.coinBalance}>
                    Balance: {coin.balance} {coin.type === 'payBill' && '₹'}
                  </Text>
                </View>

                <View style={styles.coinControlRow}>
                  {/* Decrement Button */}
                  <TouchableOpacity
                    style={[
                      styles.coinButton,
                      currentValue === 0 && styles.coinButtonDisabled,
                    ]}
                    onPress={() => handleCoinChange(coin.type as any, Math.max(0, currentValue - 10))}
                    disabled={currentValue === 0}
                  >
                    <Ionicons name="remove" size={20} color={currentValue === 0 ? COLORS.neutral[400] : COLORS.primary[500]} />
                  </TouchableOpacity>

                  {/* Value Display */}
                  <View style={styles.coinValueContainer}>
                    <Text style={styles.coinValue}>
                      {coin.type === 'payBill' ? '₹' : ''}{currentValue}
                    </Text>
                    <Text style={styles.coinMaxText}>/ {maxUsable}</Text>
                  </View>

                  {/* Increment Button */}
                  <TouchableOpacity
                    style={[
                      styles.coinButton,
                      currentValue >= maxUsable && styles.coinButtonDisabled,
                    ]}
                    onPress={() => handleCoinChange(coin.type as any, Math.min(maxUsable, currentValue + 10))}
                    disabled={currentValue >= maxUsable || maxUsable === 0}
                  >
                    <Ionicons name="add" size={20} color={currentValue >= maxUsable ? COLORS.neutral[400] : COLORS.primary[500]} />
                  </TouchableOpacity>

                  {/* Use All Button */}
                  <TouchableOpacity
                    style={[
                      styles.useAllButton,
                      (currentValue === maxUsable || maxUsable === 0) && styles.useAllButtonDisabled,
                    ]}
                    onPress={() => handleCoinChange(coin.type as any, maxUsable)}
                    disabled={currentValue === maxUsable || maxUsable === 0}
                  >
                    <Text style={[
                      styles.useAllText,
                      (currentValue === maxUsable || maxUsable === 0) && styles.useAllTextDisabled,
                    ]}>
                      Use All
                    </Text>
                  </TouchableOpacity>
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
  coinName: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  coinBalance: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  coinControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  coinButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  coinButtonDisabled: {
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[200],
  },
  coinValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  coinValue: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary[600],
  },
  coinMaxText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  useAllButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary[500],
  },
  useAllButtonDisabled: {
    backgroundColor: COLORS.neutral[200],
  },
  useAllText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  useAllTextDisabled: {
    color: COLORS.neutral[500],
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
});
