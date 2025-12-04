// Subscription Plans Page - Premium ReZ Design System
// Display all subscription tiers with glassmorphism and premium styling

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import subscriptionAPI from '@/services/subscriptionApi';
import stripeApi from '@/services/stripeApi';
import type { SubscriptionTier as TierType, BillingCycle } from '@/types/subscription.types';
import PaymentSuccessModal from '@/components/subscription/PaymentSuccessModal';
import StripePaymentModal from '@/components/subscription/StripePaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const { width } = Dimensions.get('window');

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  primaryLight: 'rgba(0, 192, 106, 0.1)',
  primaryGlow: 'rgba(0, 192, 106, 0.3)',
  gold: '#FFC857',
  goldDark: '#FF9F1C',
  goldLight: 'rgba(255, 200, 87, 0.15)',
  goldGlow: 'rgba(255, 200, 87, 0.3)',
  navy: '#0B2240',
  slate: '#1F2D3D',
  muted: '#9AA7B2',
  surface: '#F7FAFC',
  white: '#FFFFFF',
  glassWhite: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  error: '#EF4444',
  success: '#10B981',
};

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, actions } = useSubscription();
  const { state: authState } = useAuth();
  const currentTier = state.currentSubscription?.tier || 'free';
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>('monthly');
  const [selectedTier, setSelectedTier] = useState<'premium' | 'vip' | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Stripe payment states
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    subscriptionId: string;
    amount: number;
    tier: 'premium' | 'vip';
    billingCycle: BillingCycle;
  } | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Hide the default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Safe navigation function for web compatibility
  const handleGoBack = () => {
    try {
      if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else if (router && router.push) {
        router.push('/');
      } else {
        router.replace('/');
      }
    } catch (error) {
      if (router) {
        router.replace('/');
      }
    }
  };

  useEffect(() => {
    actions.loadSubscription();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoValid, setPromoValid] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  // Handle subscription purchase with Stripe payment flow
  const handleSubscribe = async (tier: 'premium' | 'vip') => {
    try {
      setIsSubscribing(true);
      setSelectedTier(tier);

      if (!stripeApi.isConfigured()) {
        if (Platform.OS === 'web') {
          toast.error('Payment not available. Stripe is not configured properly.');
        } else {
          Alert.alert('Payment Not Available', 'Stripe is not configured properly.');
        }
        setIsSubscribing(false);
        setSelectedTier(null);
        return;
      }

      const prices = {
        premium: { monthly: 99, yearly: 950 },
        vip: { monthly: 299, yearly: 2850 },
      };
      const amount = selectedBilling === 'monthly'
        ? prices[tier].monthly
        : prices[tier].yearly;

      const confirmMessage = `Subscribe to ${tier === 'vip' ? 'VIP' : 'Premium'} plan for ${selectedBilling === 'monthly' ? 'monthly' : 'yearly'} billing?\n\nAmount: ₹${amount}`;

      if (Platform.OS === 'web') {
        const confirmed = window.confirm(confirmMessage);

        if (!confirmed) {
          setIsSubscribing(false);
          setSelectedTier(null);
          return;
        }

        try {
          setProcessingPayment(true);
          toast.loading('Creating your subscription...', { id: 'create-subscription' });

          const result = await subscriptionAPI.subscribeToPlan(
            tier,
            selectedBilling,
            'stripe',
            promoCode || undefined
          );

          if (result && result.subscription) {
            toast.success('Subscription created! Opening payment...', { id: 'create-subscription' });
            setPaymentData({
              subscriptionId: result.subscription._id,
              amount,
              tier,
              billingCycle: selectedBilling,
            });
            setShowStripeModal(true);
            setIsSubscribing(false);
            setProcessingPayment(false);
          } else {
            throw new Error('Failed to create subscription');
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to create subscription.', { id: 'create-subscription' });
          setIsSubscribing(false);
          setSelectedTier(null);
          setProcessingPayment(false);
        }
      } else {
        Alert.alert('Confirm Subscription', confirmMessage, [
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
                setProcessingPayment(true);
                const result = await subscriptionAPI.subscribeToPlan(
                  tier,
                  selectedBilling,
                  'stripe',
                  promoCode || undefined
                );

                if (result && result.subscription) {
                  setPaymentData({
                    subscriptionId: result.subscription._id,
                    amount,
                    tier,
                    billingCycle: selectedBilling,
                  });
                  setShowStripeModal(true);
                  setIsSubscribing(false);
                  setProcessingPayment(false);
                } else {
                  throw new Error('Failed to create subscription');
                }
              } catch (error: any) {
                Alert.alert('Subscription Failed', error.message || 'Please try again.');
                setIsSubscribing(false);
                setSelectedTier(null);
                setProcessingPayment(false);
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred.';
      if (Platform.OS === 'web') {
        toast.error(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
      setIsSubscribing(false);
      setSelectedTier(null);
      setProcessingPayment(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setPaymentData(null);
  };

  const handlePaymentSuccess = () => {
    setShowStripeModal(false);
    setSelectedTier(null);
    setPaymentData(null);

    if (Platform.OS === 'web') {
      toast.success('Payment successful! Your subscription is now active.', { duration: 5000 });
    }

    actions.loadSubscription(true);

    if (paymentData) {
      setShowSuccessModal(true);
    }
  };

  const handlePaymentClose = () => {
    setShowStripeModal(false);
    setSelectedTier(null);
    setIsSubscribing(false);
    setProcessingPayment(false);
  };

  const handlePaymentError = (error: Error) => {
    setShowStripeModal(false);
    setSelectedTier(null);
    setIsSubscribing(false);
    setProcessingPayment(false);

    if (Platform.OS === 'web') {
      toast.error(`Payment failed: ${error.message}`, { duration: 5000 });
    } else {
      Alert.alert('Payment Failed', error.message);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      if (Platform.OS === 'web') {
        toast.error('Please enter a promo code');
      } else {
        Alert.alert('Error', 'Please enter a promo code');
      }
      return;
    }

    const tierToValidate: 'premium' | 'vip' = selectedTier || 'premium';
    setValidatingPromo(true);

    if (Platform.OS === 'web') {
      toast.loading('Validating promo code...', { id: 'validate-promo' });
    }

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
        const successMsg = response.data.message || `Promo applied! You saved ₹${response.data.discount}`;
        if (Platform.OS === 'web') {
          toast.success(successMsg, { id: 'validate-promo' });
        } else {
          Alert.alert('Success!', successMsg);
        }
      } else {
        setPromoValid(false);
        setPromoDiscount(0);
        setFinalPrice(null);
        const errorMsg = response.message || 'This promo code is not valid';
        if (Platform.OS === 'web') {
          toast.error(errorMsg, { id: 'validate-promo' });
        } else {
          Alert.alert('Invalid Code', errorMsg);
        }
      }
    } catch (error: any) {
      setPromoValid(false);
      setPromoDiscount(0);
      setFinalPrice(null);
      if (Platform.OS === 'web') {
        toast.error('Failed to validate promo code.', { id: 'validate-promo' });
      } else {
        Alert.alert('Error', 'Failed to validate promo code.');
      }
    } finally {
      setValidatingPromo(false);
    }
  };

  // Render feature item
  const renderFeature = (feature: string, included: boolean) => (
    <View style={styles.featureRow} key={feature}>
      <View style={[styles.featureIcon, included && styles.featureIconActive]}>
        <Ionicons
          name={included ? 'checkmark' : 'close'}
          size={14}
          color={included ? COLORS.white : COLORS.muted}
        />
      </View>
      <ThemedText style={[styles.featureText, !included && styles.featureTextDisabled]}>
        {feature}
      </ThemedText>
    </View>
  );

  // Render plan card with premium glassmorphism
  const renderPlanCard = (
    tier: TierType,
    name: string,
    price: number,
    yearlyPrice: number,
    features: string[],
    gradientColors: string[],
    icon: string,
    popular?: boolean
  ) => {
    const isCurrentTier = currentTier === tier;
    const displayPrice = selectedBilling === 'monthly' ? price : Math.floor(yearlyPrice / 12);
    const isUpgrade = tier === 'premium' || tier === 'vip';
    const isVIP = tier === 'vip';
    const isPremium = tier === 'premium';

    return (
      <Animated.View
        style={[
          styles.planCardWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {popular && (
          <LinearGradient
            colors={[COLORS.gold, COLORS.goldDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.popularBadge}
          >
            <Ionicons name="star" size={12} color={COLORS.navy} />
            <ThemedText style={styles.popularText}>MOST POPULAR</ThemedText>
          </LinearGradient>
        )}

        <View style={[styles.planCard, popular && styles.planCardPopular]}>
          {/* Card Shine Effect */}
          <View style={styles.cardShine} />

          {/* Plan Header */}
          <LinearGradient
            colors={gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planHeader}
          >
            <View style={styles.planIconContainer}>
              <Ionicons name={icon as any} size={28} color={COLORS.white} />
            </View>
            <ThemedText style={styles.planName}>{name}</ThemedText>
            {isCurrentTier && (
              <View style={styles.currentBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
              </View>
            )}
          </LinearGradient>

          {/* Plan Body */}
          <View style={styles.planBody}>
            {/* Price */}
            <View style={styles.priceContainer}>
              <ThemedText style={styles.currency}>₹</ThemedText>
              <ThemedText style={styles.price}>{displayPrice}</ThemedText>
              <ThemedText style={styles.period}>/month</ThemedText>
            </View>

            {selectedBilling === 'yearly' && yearlyPrice > 0 && (
              <View style={styles.savingsContainer}>
                <Ionicons name="pricetag" size={14} color={COLORS.primary} />
                <ThemedText style={styles.yearlyNote}>
                  Save {Math.round(((price * 12 - yearlyPrice) / (price * 12)) * 100)}% — ₹{yearlyPrice}/year
                </ThemedText>
              </View>
            )}

            {/* Features */}
            <View style={styles.featuresContainer}>
              {features.map((feature) => renderFeature(feature, true))}
            </View>

            {/* CTA Button */}
            {tier === 'free' ? (
              <View style={styles.freeButton}>
                <ThemedText style={styles.freeButtonText}>Current Plan</ThemedText>
              </View>
            ) : isCurrentTier ? (
              <View style={styles.activeButton}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <ThemedText style={styles.activeButtonText}>Active</ThemedText>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleSubscribe(tier as 'premium' | 'vip')}
                disabled={isSubscribing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isVIP ? [COLORS.gold, COLORS.goldDark] : [COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeButton}
                >
                  {isSubscribing && selectedTier === tier ? (
                    <ActivityIndicator color={isVIP ? COLORS.navy : COLORS.white} />
                  ) : (
                    <>
                      <ThemedText style={[styles.upgradeButtonText, isVIP && styles.vipButtonText]}>
                        {isUpgrade ? 'Upgrade Now' : 'Downgrade'}
                      </ThemedText>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={isVIP ? COLORS.navy : COLORS.white}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Premium Glassmorphism Background */}
      <LinearGradient
        colors={[COLORS.surface, '#E8F5E9', COLORS.surface]}
        style={styles.backgroundGradient}
      />

      {/* Decorative Orbs */}
      <View style={[styles.decorativeOrb, styles.orbPrimary]} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Choose Your Plan</ThemedText>
          <View style={styles.headerRight} />
        </View>

        {/* Header Subtitle */}
        <ThemedText style={styles.headerSubtitle}>
          Unlock premium rewards and exclusive benefits
        </ThemedText>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Billing Toggle */}
        <View style={styles.billingToggleWrapper}>
          <View style={styles.billingToggleContainer}>
            <TouchableOpacity
              style={[
                styles.billingOption,
                selectedBilling === 'monthly' && styles.billingOptionActive,
              ]}
              onPress={() => setSelectedBilling('monthly')}
            >
              {selectedBilling === 'monthly' && (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              )}
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
              {selectedBilling === 'yearly' && (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              )}
              <ThemedText
                style={[
                  styles.billingOptionText,
                  selectedBilling === 'yearly' && styles.billingOptionTextActive,
                ]}
              >
                Yearly
              </ThemedText>
              <View style={styles.saveBadge}>
                <ThemedText style={styles.saveText}>-20%</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promo Code Section */}
        <View style={styles.promoSection}>
          <TouchableOpacity
            style={styles.promoToggle}
            onPress={() => setShowPromoInput(!showPromoInput)}
          >
            <View style={styles.promoIconContainer}>
              <Ionicons name="pricetag" size={18} color={COLORS.primary} />
            </View>
            <ThemedText style={styles.promoToggleText}>
              {showPromoInput ? 'Hide Promo Code' : 'Have a Promo Code?'}
            </ThemedText>
            <Ionicons
              name={showPromoInput ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {showPromoInput && (
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                onPress={handleApplyPromo}
                disabled={validatingPromo}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.promoApplyButton}
                >
                  {validatingPromo ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <ThemedText style={styles.promoApplyText}>Apply</ThemedText>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {promoValid && promoDiscount > 0 && (
            <View style={styles.promoApplied}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
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
            ['#9CA3AF', '#6B7280'],
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
              'Free delivery on ₹500+ orders',
              'Priority customer support',
              'Exclusive deals & early access',
              'Unlimited wishlists',
              'Birthday & anniversary offers',
            ],
            [COLORS.primary, COLORS.primaryDark],
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
            [COLORS.gold, COLORS.goldDark],
            'diamond'
          )}
        </View>

        {/* Comparison Table */}
        <View style={styles.comparisonSection}>
          <View style={styles.comparisonHeader}>
            <Ionicons name="grid-outline" size={20} color={COLORS.primary} />
            <ThemedText style={styles.comparisonTitle}>Feature Comparison</ThemedText>
          </View>

          <View style={styles.comparisonTable}>
            <View style={styles.comparisonTableHeader}>
              <ThemedText style={styles.comparisonHeaderText}>Feature</ThemedText>
              <ThemedText style={styles.comparisonHeaderText}>Free</ThemedText>
              <ThemedText style={[styles.comparisonHeaderText, { color: COLORS.primary }]}>
                Premium
              </ThemedText>
              <ThemedText style={[styles.comparisonHeaderText, { color: COLORS.gold }]}>
                VIP
              </ThemedText>
            </View>

            {[
              { name: 'Cashback Rate', values: ['1x', '2x', '3x'] },
              { name: 'Free Delivery', values: [false, true, true] },
              { name: 'Priority Support', values: [false, true, true] },
              { name: 'Personal Shopper', values: [false, false, true] },
            ].map((row, index) => (
              <View key={row.name} style={[styles.comparisonRow, index % 2 === 0 && styles.comparisonRowAlt]}>
                <ThemedText style={styles.comparisonFeature}>{row.name}</ThemedText>
                {row.values.map((value, i) => (
                  <View key={i} style={styles.comparisonCell}>
                    {typeof value === 'string' ? (
                      <ThemedText style={styles.comparisonValue}>{value}</ThemedText>
                    ) : value ? (
                      <View style={styles.checkIcon}>
                        <Ionicons name="checkmark" size={14} color={COLORS.white} />
                      </View>
                    ) : (
                      <Ionicons name="close" size={18} color={COLORS.error} />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Stripe Payment Modal */}
      {showStripeModal && paymentData && (
        <StripePaymentModal
          visible={showStripeModal}
          tier={paymentData.tier}
          amount={paymentData.amount}
          billingCycle={paymentData.billingCycle}
          subscriptionId={paymentData.subscriptionId}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
          onError={handlePaymentError}
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

      {/* Toast Notifications (Web Only) */}
      {Platform.OS === 'web' && <Toaster position="top-center" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeOrb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.3,
  },
  orbPrimary: {
    width: 300,
    height: 300,
    backgroundColor: COLORS.primaryGlow,
    top: -100,
    right: -100,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 48,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 90,
  },
  billingToggleWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  billingToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassWhite,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  billingOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  billingOptionActive: {
    // Gradient applied via LinearGradient
  },
  billingOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.slate,
    fontFamily: 'Inter-SemiBold',
  },
  billingOptionTextActive: {
    color: COLORS.white,
  },
  saveBadge: {
    position: 'absolute',
    top: 2,
    right: 8,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveText: {
    color: COLORS.navy,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Inter-SemiBold',
  },
  promoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  promoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promoToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Inter-SemiBold',
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.navy,
    backgroundColor: COLORS.white,
    fontFamily: 'Inter-Regular',
  },
  promoApplyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  promoApplyText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  promoAppliedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    fontFamily: 'Inter-SemiBold',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  planCardWrapper: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(11, 34, 64, 0.12)',
      },
    }),
  },
  planCardPopular: {
    borderColor: 'rgba(255, 200, 87, 0.5)',
    borderWidth: 2,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewY: '-5deg' }],
    opacity: 0.5,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  popularText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'Inter-SemiBold',
  },
  planHeader: {
    padding: 24,
    alignItems: 'center',
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  currentBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
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
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 8,
    fontFamily: 'Poppins-Bold',
  },
  price: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.navy,
    fontFamily: 'Poppins-Bold',
  },
  period: {
    fontSize: 16,
    color: COLORS.muted,
    marginTop: 24,
    fontFamily: 'Inter-Regular',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  yearlyNote: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  featuresContainer: {
    marginVertical: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconActive: {
    backgroundColor: COLORS.primary,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.slate,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  featureTextDisabled: {
    color: COLORS.muted,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  upgradeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
  },
  vipButtonText: {
    color: COLORS.navy,
  },
  activeButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  activeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  freeButton: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  freeButtonText: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  comparisonSection: {
    margin: 20,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    fontFamily: 'Poppins-Bold',
  },
  comparisonTable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonTableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  comparisonHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  comparisonRowAlt: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  comparisonFeature: {
    flex: 1,
    fontSize: 13,
    color: COLORS.slate,
    fontFamily: 'Inter-Regular',
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    fontFamily: 'Inter-SemiBold',
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
