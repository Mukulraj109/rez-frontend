// Payment Success Page
import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import toast, { Toaster } from 'react-hot-toast';
import { Platform } from 'react-native';
import subscriptionAPI from '@/services/subscriptionApi';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state, actions } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // Hide the default header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    // Reload subscription data to get updated status
    const loadSubscription = async () => {
      try {
        console.log('[PAYMENT SUCCESS] Loading subscription data...');

        // CRITICAL: After Stripe redirect, ensure token is restored first
        const authStorage = require('@/utils/authStorage');
        const token = await authStorage.getAuthToken();
        console.log('[PAYMENT SUCCESS] Token check:', { hasToken: !!token });

        if (!token) {
          console.error('[PAYMENT SUCCESS] No token available! Waiting...');
          // Wait for token to be restored from localStorage
          await new Promise(resolve => setTimeout(resolve, 500));

          const tokenNow = await authStorage.getAuthToken();
          if (!tokenNow) {
            throw new Error('Token not available after waiting');
          }
          console.log('[PAYMENT SUCCESS] Token now available after waiting');
        }

        // Retry mechanism: Try up to 3 times with delays
        let freshSubscription = null;
        let retries = 3;

        for (let i = 0; i < retries; i++) {
          console.log(`[PAYMENT SUCCESS] Attempt ${i + 1}/${retries} to fetch subscription...`);

          freshSubscription = await subscriptionAPI.getCurrentSubscription();
          console.log('[PAYMENT SUCCESS] API response:', freshSubscription);

          // Check if we got real data (not free-default fallback)
          if (freshSubscription && freshSubscription._id !== 'free-default') {
            console.log('[PAYMENT SUCCESS] Got real subscription:', {
              id: freshSubscription._id,
              tier: freshSubscription.tier,
              price: freshSubscription.price,
            });
            break;
          }

          // If we got free-default, wait and retry
          if (i < retries - 1) {
            console.warn(`[PAYMENT SUCCESS] Got free-default fallback, retrying in ${(i + 1) * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
          }
        }

        if (!freshSubscription || freshSubscription._id === 'free-default') {
          console.error('[PAYMENT SUCCESS] Failed to get real subscription after retries');
        }

        setSubscriptionData(freshSubscription);

        // Also update context
        await actions.loadSubscription(true);

        setLoading(false);

        if (Platform.OS === 'web') {
          toast.success('Payment successful! Your subscription is now active.', {
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('[PAYMENT SUCCESS] Error loading subscription:', error);
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const handleContinue = () => {
    router.replace('/');
  };

  const handleViewSubscription = () => {
    router.replace('/subscription/plans');
  };

  // Use fresh subscription data if available, otherwise fall back to context
  const subscription = subscriptionData || state.currentSubscription;
  const tier = subscription?.tier || 'premium';
  const tierName = tier === 'vip' ? 'VIP' : tier === 'premium' ? 'Premium' : 'Free';
  const amount = subscription?.price || 0;

  // Debug logging
  console.log('[PAYMENT SUCCESS] Displaying subscription:', {
    tier,
    tierName,
    amount,
    status: subscription?.status,
    billingCycle: subscription?.billingCycle,
    fullSubscription: subscription,
  });

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />

      {/* Success Header */}
      <LinearGradient colors={['#10B981', '#059669'] as const} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.headerTitle}>Payment Successful!</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {loading ? 'Loading subscription details...' : `Your ${tierName} subscription is now active`}
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <ThemedText style={styles.loadingText}>Loading subscription details...</ThemedText>
          </View>
        ) : (
          <>
            {/* Subscription Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsHeader}>
                <Ionicons name="star" size={24} color="#10B981" />
                <ThemedText style={styles.detailsTitle}>Subscription Details</ThemedText>
              </View>

              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Plan:</ThemedText>
                <ThemedText style={styles.detailValue}>{tierName}</ThemedText>
              </View>

              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                <View style={styles.statusBadge}>
                  <ThemedText style={styles.statusText}>
                    {subscription?.status === 'trial' ? 'Trial Active' : 'Active'}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Billing:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {subscription?.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                </ThemedText>
              </View>

              {subscription?.trialEndDate && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Trial Ends:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {new Date(subscription.trialEndDate).toLocaleDateString()}
                  </ThemedText>
                </View>
              )}

              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Next Billing:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {subscription?.endDate
                    ? new Date(subscription.endDate).toLocaleDateString()
                    : 'N/A'}
                </ThemedText>
              </View>

              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Amount:</ThemedText>
                <ThemedText style={styles.detailValueHighlight}>
                  ₹{amount}
                </ThemedText>
              </View>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsCard}>
              <View style={styles.benefitsHeader}>
                <Ionicons name="gift" size={24} color="#8B5CF6" />
                <ThemedText style={styles.benefitsTitle}>Your Benefits</ThemedText>
              </View>

              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <ThemedText style={styles.benefitText}>
                    {tier === 'vip' ? '3x' : '2x'} cashback on all orders
                  </ThemedText>
                </View>

                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <ThemedText style={styles.benefitText}>
                    Free delivery on {tier === 'vip' ? 'all orders' : 'orders above ₹500'}
                  </ThemedText>
                </View>

                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <ThemedText style={styles.benefitText}>
                    Priority customer support
                  </ThemedText>
                </View>

                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <ThemedText style={styles.benefitText}>
                    Exclusive deals & early access
                  </ThemedText>
                </View>

                {tier === 'vip' && (
                  <>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <ThemedText style={styles.benefitText}>
                        Personal shopping assistant
                      </ThemedText>
                    </View>

                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <ThemedText style={styles.benefitText}>
                        Premium events access
                      </ThemedText>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Trial Info */}
            {subscription?.status === 'trial' && (
              <View style={styles.trialInfoCard}>
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <View style={styles.trialInfoContent}>
                  <ThemedText style={styles.trialInfoTitle}>7-Day Free Trial</ThemedText>
                  <ThemedText style={styles.trialInfoText}>
                    Your trial is active! You won't be charged until {' '}
                    {subscription.trialEndDate
                      ? new Date(subscription.trialEndDate).toLocaleDateString()
                      : '7 days from now'}
                    . Cancel anytime before then for a full refund.
                  </ThemedText>
                </View>
              </View>
            )}

            {/* What's Next */}
            <View style={styles.nextStepsCard}>
              <ThemedText style={styles.nextStepsTitle}>What's Next?</ThemedText>

              <TouchableOpacity style={styles.nextStepItem}>
                <View style={styles.nextStepIcon}>
                  <Ionicons name="cart" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.nextStepContent}>
                  <ThemedText style={styles.nextStepTitle}>Start Shopping</ThemedText>
                  <ThemedText style={styles.nextStepText}>
                    Explore stores and start earning cashback
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextStepItem}>
                <View style={styles.nextStepIcon}>
                  <Ionicons name="wallet" size={24} color="#10B981" />
                </View>
                <View style={styles.nextStepContent}>
                  <ThemedText style={styles.nextStepTitle}>Track Savings</ThemedText>
                  <ThemedText style={styles.nextStepText}>
                    Monitor your cashback and savings in your wallet
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextStepItem}>
                <View style={styles.nextStepIcon}>
                  <Ionicons name="settings" size={24} color="#F59E0B" />
                </View>
                <View style={styles.nextStepContent}>
                  <ThemedText style={styles.nextStepTitle}>Manage Subscription</ThemedText>
                  <ThemedText style={styles.nextStepText}>
                    Update billing, cancel, or upgrade anytime
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <ThemedText style={styles.primaryButtonText}>Continue Shopping</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewSubscription}>
          <ThemedText style={styles.secondaryButtonText}>View Subscription</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Toast Notifications (Web Only) */}
      {Platform.OS === 'web' && <Toaster position="top-center" />}
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
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  detailValueHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  trialInfoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trialInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  trialInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  trialInfoText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  nextStepsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 100,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  nextStepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepContent: {
    flex: 1,
    marginLeft: 16,
  },
  nextStepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  nextStepText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
