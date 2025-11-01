// Subscription Plans Page
// Display all subscription tiers with pricing, features, and upgrade options

import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import subscriptionAPI from '@/services/subscriptionApi';
import razorpayService from '@/services/razorpayService';
import type { SubscriptionTier as TierType, BillingCycle } from '@/types/subscription.types';
import RazorpayPaymentForm from '@/components/subscription/RazorpayPaymentForm';
import PaymentSuccessModal from '@/components/subscription/PaymentSuccessModal';
import { useAuth } from '@/contexts/AuthContext';
import type { RazorpayPaymentData } from '@/types/payment.types';

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, actions } = useSubscription();
  const { state: authState } = useAuth();
  const currentTier = state.currentSubscription?.tier || 'free';
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>('monthly');
  const [selectedTier, setSelectedTier] = useState<'premium' | 'vip' | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Razorpay payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentUrl: string;
    orderId: string;
    amount: number;
    tier: 'premium' | 'vip';
    billingCycle: BillingCycle;
  } | null>(null);

  // Hide the default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Safe navigation function for web compatibility
  const handleGoBack = () => {
    try {
      if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else if (router && router.push) {
        // Navigate to home if can't go back
        router.push('/');
      } else {
        // Final fallback - replace current route with home
        router.replace('/');
      }
    } catch (error) {
      // If all else fails, navigate to home

      if (router) {
        router.replace('/');
      }
    }
  };

  // BUG FIX #1: Added empty dependency array to prevent infinite re-renders
  useEffect(() => {
    // Fetch available plans
    actions.loadSubscription();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoValid, setPromoValid] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  // Handle subscription purchase with payment flow
  const handleSubscribe = async (tier: 'premium' | 'vip') => {
    try {
      setIsSubscribing(true);
      setSelectedTier(tier);

      // Check if Razorpay is configured
      if (!razorpayService.isConfigured()) {
        Alert.alert(
          'Payment Not Available',
          'Razorpay is not configured. Please contact support or try again later.',
          [{ text: 'OK' }]
        );
        setIsSubscribing(false);
        setSelectedTier(null);
        return;
      }

      // Calculate price based on billing cycle
      const prices = {
        premium: { monthly: 99, yearly: 950 },
        vip: { monthly: 299, yearly: 2850 },
      };
      const amount = selectedBilling === 'monthly'
        ? prices[tier].monthly
        : prices[tier].yearly;

      // Show confirmation dialog with terms
      Alert.alert(
        'Confirm Subscription',
        `Subscribe to ${tier === 'vip' ? 'VIP' : 'Premium'} plan for ${selectedBilling === 'monthly' ? 'monthly' : 'yearly'} billing?\n\nAmount: ₹${amount}\n\nYou will be redirected to Razorpay for secure payment.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setIsSubscribing(false);
              setSelectedTier(null);
            },
          },
          {
            text: 'Proceed to Payment',
            onPress: async () => {
              try {
                // Call backend to create subscription and get payment URL
                const result = await subscriptionAPI.subscribeToPlan(
                  tier,
                  selectedBilling,
                  'razorpay',
                  promoCode || undefined
                );

                if (result && result.paymentUrl) {
                  // Store payment data
                  setPaymentData({
                    paymentUrl: result.paymentUrl,
                    orderId: result.subscription._id,
                    amount: amount,
                    tier: tier,
                    billingCycle: selectedBilling,
                  });

                  // Show payment modal
                  setShowPaymentModal(true);
                  setIsSubscribing(false);
                } else {
                  throw new Error('Failed to initiate payment');
                }
              } catch (error: any) {
                console.error('[SUBSCRIPTION] Error:', error);
                Alert.alert(
                  'Subscription Failed',
                  error.message || 'Failed to initiate payment. Please try again.'
                );
                setIsSubscribing(false);
                setSelectedTier(null);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred. Please try again.');
      setIsSubscribing(false);
      setSelectedTier(null);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (razorpayData: RazorpayPaymentData) => {
    try {
      console.log('[SUBSCRIPTION] Payment successful:', razorpayData);

      // Verify payment with backend
      await razorpayService.verifyPayment(
        paymentData?.orderId || '',
        razorpayData
      );

      // Close payment modal
      setShowPaymentModal(false);

      // Refresh subscription data
      await actions.loadSubscription(true);

      // Navigate to payment confirmation page with details
      router.push({
        pathname: '/subscription/payment-confirmation',
        params: {
          tier: paymentData?.tier || 'premium',
          amount: paymentData?.amount || 0,
          billingCycle: paymentData?.billingCycle || 'monthly',
          transactionId: razorpayData.razorpay_payment_id || paymentData?.orderId || '',
          status: 'success',
        },
      });

      setSelectedTier(null);
    } catch (error: any) {
      console.error('[SUBSCRIPTION] Payment verification failed:', error);

      // Navigate to payment confirmation with failure status
      router.push({
        pathname: '/subscription/payment-confirmation',
        params: {
          tier: paymentData?.tier || 'premium',
          amount: paymentData?.amount || 0,
          billingCycle: paymentData?.billingCycle || 'monthly',
          status: 'failed',
        },
      });

      setShowPaymentModal(false);
      setSelectedTier(null);
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (error: Error) => {
    console.error('[SUBSCRIPTION] Payment failed:', error);
    setShowPaymentModal(false);
    setSelectedTier(null);

    Alert.alert(
      'Payment Failed',
      error.message || 'Payment could not be completed. Please try again.',
      [{ text: 'OK' }]
    );
  };

  // Handle payment modal close
  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setSelectedTier(null);
    setIsSubscribing(false);
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setPaymentData(null);
  };

  // Handle promo code application
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    // Determine which tier to validate for (if user hasn't selected yet, default to premium)
    const tierToValidate: 'premium' | 'vip' = selectedTier || 'premium';

    setValidatingPromo(true);
    try {
      const response = await subscriptionAPI.validatePromoCode(
        promoCode,
        tierToValidate,
        selectedBilling
      );

      if (response.success && response.data) {
        setPromoValid(true);
        setPromoDiscount(response.data.discount);
        setFinalPrice(response.data.finalPrice);
        Alert.alert('Success!', response.data.message || `Promo code applied! You saved ₹${response.data.discount}`);
      } else {
        setPromoValid(false);
        setPromoDiscount(0);
        setFinalPrice(null);
        Alert.alert('Invalid Code', response.message || 'This promo code is not valid');
      }
    } catch (error: any) {
      setPromoValid(false);
      setPromoDiscount(0);
      setFinalPrice(null);
      Alert.alert('Error', 'Failed to validate promo code. Please try again.');
    } finally {
      setValidatingPromo(false);
    }
  };

  // Handle subscription cancellation
  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'Choose an action:',
      [
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Cancel Subscription',
              'Are you sure you want to cancel? You will lose all benefits at the end of your billing period.',
              [
                { text: 'Keep Subscription', style: 'cancel' },
                {
                  text: 'Cancel',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await subscriptionAPI.cancelSubscription();
                      Alert.alert('Cancelled', 'Your subscription has been cancelled');
                      await actions.loadSubscription(true);
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to cancel subscription');
                    }
                  },
                },
              ]
            );
          },
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  // Render feature item
  const renderFeature = (feature: string, included: boolean) => (
    <View style={styles.featureRow} key={feature}>
      <Ionicons
        name={included ? 'checkmark-circle' : 'close-circle-outline'}
        size={20}
        color={included ? '#10B981' : '#D1D5DB'}
      />
      <ThemedText style={[styles.featureText, !included && styles.featureTextDisabled]}>
        {feature}
      </ThemedText>
    </View>
  );

  // Render plan card
  const renderPlanCard = (
    tier: TierType,
    name: string,
    price: number,
    yearlyPrice: number,
    features: string[],
    color: string,
    icon: string,
    popular?: boolean
  ) => {
    const isCurrentTier = currentTier === tier;
    const displayPrice = selectedBilling === 'monthly' ? price : Math.floor(yearlyPrice / 12);
    const isUpgrade = tier === 'premium' || tier === 'vip';

    return (
      <View style={styles.planCard}>
        {popular && (
          <View style={styles.popularBadge}>
            <ThemedText style={styles.popularText}>MOST POPULAR</ThemedText>
          </View>
        )}

        <LinearGradient colors={[color, `${color}99`] as any} style={styles.planHeader}>
          <Ionicons name={icon as any} size={40} color="#FFFFFF" />
          <ThemedText style={styles.planName}>{name}</ThemedText>
          {isCurrentTier && (
            <View style={styles.currentBadge}>
              <ThemedText style={styles.currentBadgeText}>Current Plan</ThemedText>
            </View>
          )}
        </LinearGradient>

        <View style={styles.planBody}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currency}>₹</ThemedText>
            <ThemedText style={styles.price}>{displayPrice}</ThemedText>
            <ThemedText style={styles.period}>/month</ThemedText>
          </View>

          {selectedBilling === 'yearly' && yearlyPrice > 0 && (
            <ThemedText style={styles.yearlyNote}>
              Billed annually at ₹{yearlyPrice} (Save {Math.round(((price * 12 - yearlyPrice) / (price * 12)) * 100)}%)
            </ThemedText>
          )}

          <View style={styles.featuresContainer}>
            {features.map((feature) => renderFeature(feature, true))}
          </View>

          {tier === 'free' ? (
            <View style={styles.freeButton}>
              <ThemedText style={styles.freeButtonText}>Current Plan</ThemedText>
            </View>
          ) : isCurrentTier ? (
            <View style={styles.currentButton}>
              <ThemedText style={styles.currentButtonText}>Active</ThemedText>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: color }]}
              onPress={() => handleSubscribe(tier as 'premium' | 'vip')}
              disabled={isSubscribing}
            >
              {isSubscribing && selectedTier === tier ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <ThemedText style={styles.upgradeButtonText}>
                    {isUpgrade ? 'Upgrade Now' : 'Downgrade'}
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED'] as const} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Choose Your Plan</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Billing Toggle */}
        <View style={styles.billingToggleContainer}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              selectedBilling === 'monthly' && styles.billingOptionActive,
            ]}
            onPress={() => setSelectedBilling('monthly')}
          >
            <ThemedText
              style={[
                styles.billingOptionText,
                selectedBilling === 'monthly' && styles.billingOptionTextActive,
              ]}
            >
              Monthly
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.billingOption,
              selectedBilling === 'yearly' && styles.billingOptionActive,
            ]}
            onPress={() => setSelectedBilling('yearly')}
          >
            <ThemedText
              style={[
                styles.billingOptionText,
                selectedBilling === 'yearly' && styles.billingOptionTextActive,
              ]}
            >
              Yearly
            </ThemedText>
            <View style={styles.saveBadge}>
              <ThemedText style={styles.saveText}>Save 20%</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Promo Code Section */}
        <View style={styles.promoSection}>
          <TouchableOpacity
            style={styles.promoToggle}
            onPress={() => setShowPromoInput(!showPromoInput)}
          >
            <Ionicons name="pricetag-outline" size={20} color="#8B5CF6" />
            <ThemedText style={styles.promoToggleText}>
              {showPromoInput ? 'Hide Promo Code' : 'Have a Promo Code?'}
            </ThemedText>
            <Ionicons
              name={showPromoInput ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#8B5CF6"
            />
          </TouchableOpacity>

          {showPromoInput && (
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.promoApplyButton}
                onPress={handleApplyPromo}
                disabled={validatingPromo}
              >
                {validatingPromo ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText style={styles.promoApplyText}>Apply</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          )}

          {promoValid && promoDiscount > 0 && (
            <View style={styles.promoApplied}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <ThemedText style={styles.promoAppliedText}>
                Promo applied! You saved ₹{promoDiscount}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {/* Free Tier */}
          {renderPlanCard(
            'free',
            'Free',
            0,
            0,
            [
              'Basic cashback',
              'Access to all stores',
              'Email support',
              'Basic wishlist',
            ],
            '#6B7280',
            'person-outline'
          )}

          {/* Premium Tier */}
          {renderPlanCard(
            'premium',
            'Premium',
            99,
            950,
            [
              '2x cashback on all orders',
              'Free delivery on orders above ₹500',
              'Priority customer support',
              'Exclusive deals & early access',
              'Unlimited wishlists',
              'Birthday & anniversary offers',
            ],
            '#8B5CF6',
            'star',
            true
          )}

          {/* VIP Tier */}
          {renderPlanCard(
            'vip',
            'VIP',
            299,
            2850,
            [
              '3x cashback on all orders',
              'Free delivery on all orders',
              'Dedicated concierge service',
              'Premium events access',
              'Personal shopper assistance',
              'Early flash sale access (1 hour)',
              'All Premium benefits',
            ],
            '#F59E0B',
            'diamond'
          )}
        </View>

        {/* Comparison Table */}
        <View style={styles.comparisonSection}>
          <ThemedText style={styles.comparisonTitle}>Feature Comparison</ThemedText>
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <ThemedText style={styles.comparisonFeature}>Cashback Rate</ThemedText>
              <ThemedText style={styles.comparisonValue}>1x</ThemedText>
              <ThemedText style={styles.comparisonValue}>2x</ThemedText>
              <ThemedText style={styles.comparisonValue}>3x</ThemedText>
            </View>
            <View style={styles.comparisonRow}>
              <ThemedText style={styles.comparisonFeature}>Free Delivery</ThemedText>
              <Ionicons name="close" size={16} color="#EF4444" />
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Ionicons name="checkmark" size={16} color="#10B981" />
            </View>
            <View style={styles.comparisonRow}>
              <ThemedText style={styles.comparisonFeature}>Priority Support</ThemedText>
              <Ionicons name="close" size={16} color="#EF4444" />
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Ionicons name="checkmark" size={16} color="#10B981" />
            </View>
            <View style={styles.comparisonRow}>
              <ThemedText style={styles.comparisonFeature}>Personal Shopper</ThemedText>
              <Ionicons name="close" size={16} color="#EF4444" />
              <Ionicons name="close" size={16} color="#EF4444" />
              <Ionicons name="checkmark" size={16} color="#10B981" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Razorpay Payment Modal */}
      {showPaymentModal && paymentData && (
        <RazorpayPaymentForm
          visible={showPaymentModal}
          paymentUrl={paymentData.paymentUrl}
          orderId={paymentData.orderId}
          amount={paymentData.amount}
          tier={paymentData.tier}
          billingCycle={paymentData.billingCycle}
          userDetails={{
            name: authState.user?.name,
            email: authState.user?.email,
            contact: authState.user?.phone,
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={handlePaymentClose}
        />
      )}

      {/* Payment Success Modal */}
      {showSuccessModal && paymentData && (
        <PaymentSuccessModal
          visible={showSuccessModal}
          tier={paymentData.tier}
          price={paymentData.amount}
          billingCycle={paymentData.billingCycle}
          onClose={handleSuccessClose}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  billingToggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  billingOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billingOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  billingOptionTextActive: {
    color: '#111827',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  popularBadge: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    alignItems: 'center',
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    padding: 24,
    alignItems: 'center',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  currentBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planBody: {
    padding: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 8,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  period: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 20,
  },
  yearlyNote: {
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresContainer: {
    marginVertical: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  featureTextDisabled: {
    color: '#9CA3AF',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  freeButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  freeButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  comparisonTable: {
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  comparisonFeature: {
    flex: 2,
    fontSize: 14,
    color: '#374151',
  },
  comparisonValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  promoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  promoApplyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  promoApplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
  },
  promoAppliedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
