// Trial Management Page
// Complete trial period management system with beautiful UI and animations

import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import TierBadge from '@/components/subscription/TierBadge';
import TrialCountdownCircle from '@/components/subscription/TrialCountdownCircle';
import BenefitShowcaseCard from '@/components/subscription/BenefitShowcaseCard';
import TrialStatCard from '@/components/subscription/TrialStatCard';
import PricingToggle from '@/components/subscription/PricingToggle';
import subscriptionAPI from '@/services/subscriptionApi';

const { height: screenHeight } = Dimensions.get('window');

export default function TrialPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, actions, computed } = useSubscription();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedTerms, setExpandedTerms] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(screenHeight));

  // Get subscription data
  const subscription = state.currentSubscription;
  const isOnTrial = subscription?.status === 'trial';
  const daysRemaining = computed.daysRemaining;
  const isTrialEnding = daysRemaining < 3;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Fetch trial stats on mount
  useEffect(() => {
    if (isOnTrial) {
      fetchTrialStats();
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Not on trial, redirect
      router.replace('/subscription/manage');
    }
  }, [isOnTrial]);

  const fetchTrialStats = async () => {
    try {
      setIsLoading(true);
      const response = await subscriptionAPI.getSubscriptionUsage();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Error fetching trial stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSubscribeNow = async (tier: 'premium' | 'vip' = 'premium') => {
    try {
      setIsSubscribing(true);
      Alert.alert(
        'Confirm Subscription',
        `Subscribe to ${tier === 'vip' ? 'VIP' : 'Premium'} plan to continue after trial?\n\nBilling: ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsSubscribing(false),
          },
          {
            text: 'Subscribe',
            style: 'default',
            onPress: async () => {
              try {
                const result = await subscriptionAPI.subscribeToPlan(
                  tier,
                  billingCycle
                );

                if (result) {
                  await actions.loadSubscription(true);
                  Alert.alert(
                    'Welcome to Premium!',
                    `You're all set! Your ${tier === 'vip' ? 'VIP' : 'Premium'} benefits are now active.`,
                    [
                      {
                        text: 'Start Shopping',
                        onPress: () => router.replace('/'),
                      },
                    ]
                  );
                }
              } catch (error: any) {
                Alert.alert(
                  'Subscription Failed',
                  error.message || 'Payment processing failed. Please try again.'
                );
              } finally {
                setIsSubscribing(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred. Please try again.');
      setIsSubscribing(false);
    }
  };

  const handleRemindLater = () => {
    Alert.alert(
      'Remind Me Later',
      'We\'ll send you a notification when your trial is about to end.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Reminder',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  // Trial Details Card
  const renderTrialDetails = () => (
    <View style={styles.detailsCard}>
      <View style={styles.detailsHeader}>
        <ThemedText style={styles.detailsTitle}>Trial Information</ThemedText>
        <View style={styles.autoRenewBadge}>
          <Ionicons name="auto-repeat" size={14} color="#8B5CF6" />
          <ThemedText style={styles.autoRenewText}>Auto-renewal off</ThemedText>
        </View>
      </View>

      <View style={styles.detailsContent}>
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
          </View>
          <View style={styles.detailInfo}>
            <ThemedText style={styles.detailLabel}>Start Date</ThemedText>
            <ThemedText style={styles.detailValue}>
              {subscription?.startDate
                ? new Date(subscription.startDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
          </View>
          <View style={styles.detailInfo}>
            <ThemedText style={styles.detailLabel}>End Date</ThemedText>
            <ThemedText style={styles.detailValue}>
              {subscription?.endDate
                ? new Date(subscription.endDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons name="hourglass-outline" size={16} color="#8B5CF6" />
          </View>
          <View style={styles.detailInfo}>
            <ThemedText style={styles.detailLabel}>Duration</ThemedText>
            <ThemedText style={styles.detailValue}>7 days</ThemedText>
          </View>
        </View>

        {subscription?.autoRenew && (
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            </View>
            <View style={styles.detailInfo}>
              <ThemedText style={styles.detailLabel}>Auto Renewal</ThemedText>
              <ThemedText style={[styles.detailValue, { color: '#10B981' }]}>Enabled</ThemedText>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  // Benefits Showcase Section
  const renderBenefitsSection = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>What You're Getting</ThemedText>

      <BenefitShowcaseCard
        icon="cash"
        title="2x Cashback Multiplier"
        description="Earn double cashback on all your purchases during the trial"
        isActive
      />

      <BenefitShowcaseCard
        icon="bicycle"
        title="Free Delivery"
        description="Free delivery on select stores and orders above ₹500"
        isActive
      />

      <BenefitShowcaseCard
        icon="headset"
        title="Priority Support"
        description="Get instant support from our dedicated customer care team"
        isActive
      />

      <BenefitShowcaseCard
        icon="pricetag"
        title="Exclusive Deals"
        description="Access to exclusive offers and limited-time deals"
        isActive
      />

      <BenefitShowcaseCard
        icon="flash"
        title="Early Flash Sales"
        description="Get 1-hour early access to flash sales before others"
        isActive
      />
    </View>
  );

  // Usage Stats Section
  const renderUsageStats = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Your Trial So Far</ThemedText>

      <View style={styles.statsGrid}>
        <TrialStatCard
          icon="cart-outline"
          label="Orders Placed"
          value={stats?.usage?.ordersThisMonth || 0}
          change={8}
        />
        <TrialStatCard
          icon="wallet-outline"
          label="Cashback Earned"
          value={`₹${stats?.usage?.cashbackEarned || 0}`}
          change={12}
        />
      </View>

      <View style={styles.statsGrid}>
        <TrialStatCard
          icon="bicycle-outline"
          label="Delivery Fees Saved"
          value={`₹${stats?.usage?.deliveryFeesSaved || 0}`}
          change={15}
        />
        <TrialStatCard
          icon="trending-up-outline"
          label="ROI So Far"
          value={`+₹${(stats?.usage?.cashbackEarned || 0) + (stats?.usage?.deliveryFeesSaved || 0)}`}
          change={20}
        />
      </View>
    </View>
  );

  // Pricing Section
  const renderPricingSection = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Continue After Trial</ThemedText>

      <PricingToggle
        billingCycle={billingCycle}
        onChange={setBillingCycle}
        monthlyPrice={99}
        yearlyPrice={950}
        yearlySavings={20}
      />

      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, isSubscribing && styles.buttonDisabled]}
          onPress={() => handleSubscribeNow('premium')}
          disabled={isSubscribing}
          activeOpacity={0.8}
        >
          {isSubscribing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.primaryButtonText}>Subscribe Now</ThemedText>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRemindLater}
          disabled={isSubscribing}
          activeOpacity={0.8}
        >
          <Ionicons name="clock-outline" size={20} color="#8B5CF6" />
          <ThemedText style={styles.secondaryButtonText}>Remind Me Later</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Trial Terms Section
  const renderTrialTerms = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.termsHeader}
        onPress={() => setExpandedTerms(!expandedTerms)}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.termsTitle}>What Happens Next?</ThemedText>
        <Ionicons
          name={expandedTerms ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#8B5CF6"
        />
      </TouchableOpacity>

      {expandedTerms && (
        <View style={styles.termsContent}>
          <View style={styles.termItem}>
            <View style={styles.termBullet}>
              <ThemedText style={styles.termBulletText}>1</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.termTitle}>If you subscribe before trial ends</ThemedText>
              <ThemedText style={styles.termDescription}>
                Seamless transition to your chosen plan. Your benefits continue without interruption.
              </ThemedText>
            </View>
          </View>

          <View style={styles.termItem}>
            <View style={styles.termBullet}>
              <ThemedText style={styles.termBulletText}>2</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.termTitle}>If you don't subscribe</ThemedText>
              <ThemedText style={styles.termDescription}>
                Automatic downgrade to Free tier on trial end date. You'll lose premium benefits.
              </ThemedText>
            </View>
          </View>

          <View style={styles.termItem}>
            <View style={styles.termBullet}>
              <ThemedText style={styles.termBulletText}>3</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.termTitle}>Reactivation option</ThemedText>
              <ThemedText style={styles.termDescription}>
                Can reactivate your subscription anytime within 30 days of cancellation.
              </ThemedText>
            </View>
          </View>

          <View style={styles.termItem}>
            <View style={styles.termBullet}>
              <ThemedText style={styles.termBulletText}>4</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.termTitle}>Billing details</ThemedText>
              <ThemedText style={styles.termDescription}>
                First charge will be applied on trial end date if you subscribe.
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (!isOnTrial) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Trial Period</ThemedText>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.loadingContainer}>
            <Ionicons name="information-circle-outline" size={48} color="#8B5CF6" />
            <ThemedText style={styles.loadingText}>
              You are not on a trial period
            </ThemedText>
            <ThemedText style={styles.loadingSubtext}>
              Visit our plans page to start a trial
            </ThemedText>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/subscription/plans')}
            >
              <ThemedText style={styles.primaryButtonText}>View Plans</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Trial Ending Soon Banner */}
      {isTrialEnding && (
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.urgentBanner}
        >
          <View style={styles.urgentBannerContent}>
            <Ionicons name="warning-outline" size={20} color="#FFFFFF" />
            <View style={styles.urgentBannerText}>
              <ThemedText style={styles.urgentTitle}>
                Your trial ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}!
              </ThemedText>
              <ThemedText style={styles.urgentSubtitle}>
                Subscribe now to keep your premium benefits
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleSubscribeNow('premium')}
            style={styles.urgentButton}
          >
            <ThemedText style={styles.urgentButtonText}>Subscribe</ThemedText>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Your Trial Period</ThemedText>
          <View style={styles.headerRight}>
            {subscription?.tier && <TierBadge tier={subscription.tier} size="small" />}
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.scrollView, { transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Trial Countdown Circle */}
        <View style={styles.countdownSection}>
          <TrialCountdownCircle
            endDate={subscription?.endDate || new Date()}
            size={280}
            strokeWidth={8}
          />
        </View>

        {/* Trial Details */}
        {renderTrialDetails()}

        {/* Benefits Showcase */}
        {renderBenefitsSection()}

        {/* Usage Stats */}
        {stats && renderUsageStats()}

        {/* Pricing Section */}
        {renderPricingSection()}

        {/* Trial Terms */}
        {renderTrialTerms()}

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </Animated.ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 16,
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
    width: 60,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  urgentBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  urgentBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgentBannerText: {
    flex: 1,
  },
  urgentTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  urgentSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  urgentButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  urgentButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  countdownSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  detailsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  autoRenewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  autoRenewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  detailsContent: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  ctaContainer: {
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  termsHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  termsContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  termItem: {
    flexDirection: 'row',
    gap: 12,
  },
  termBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 28,
  },
  termBulletText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  termDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  footerSpacing: {
    height: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
