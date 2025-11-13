// Upgrade Confirmation Screen
// Confirm subscription tier upgrade with prorated pricing

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import subscriptionAPI from '@/services/subscriptionApi';
import ProratedPriceDisplay from '@/components/subscription/ProratedPriceDisplay';
import FeatureComparisonTable from '@/components/subscription/FeatureComparisonTable';
import { SubscriptionTier, TIER_NAMES, TIER_COLORS } from '@/types/subscription.types';

type UpgradeTiming = 'immediate' | 'cycle_end';

export default function UpgradeConfirmationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, computed } = useSubscription();

  const currentTier = (params.currentTier as SubscriptionTier) || state.currentSubscription?.tier || 'free';
  const newTier = (params.newTier as SubscriptionTier) || 'premium';

  const [timing, setTiming] = useState<UpgradeTiming>('immediate');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [proratedAmount, setProratedAmount] = useState<number>(0);

  // Calculate prorated pricing
  useEffect(() => {
    calculateProration();
  }, [timing]);

  const calculateProration = () => {
    if (timing === 'cycle_end') {
      setProratedAmount(0);
      return;
    }

    // Simple prorated calculation
    const daysRemaining = computed.daysRemaining;
    const newTierMonthlyPrice = newTier === 'vip' ? 299 : 99;
    const currentTierMonthlyPrice = currentTier === 'premium' ? 99 : 0;

    const dailyRateNew = newTierMonthlyPrice / 30;
    const dailyRateOld = currentTierMonthlyPrice / 30;

    const proratedNew = dailyRateNew * daysRemaining;
    const creditFromOld = dailyRateOld * daysRemaining;

    setProratedAmount(Math.round(proratedNew - creditFromOld));
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);

      if (timing === 'cycle_end') {
        // Schedule upgrade for cycle end
        Alert.alert(
          'Upgrade Scheduled',
          `Your upgrade to ${TIER_NAMES[newTier]} will take effect at the end of your current billing cycle.`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/subscription/manage'),
            },
          ]
        );
        return;
      }

      // Process immediate upgrade with payment
      const result = await subscriptionAPI.upgradeSubscription(newTier as 'premium' | 'vip');

      // Navigate to payment confirmation
      router.push({
        pathname: '/subscription/payment-confirmation',
        params: {
          tier: newTier,
          amount: proratedAmount,
          status: 'success',
          billingCycle: state.currentSubscription?.billingCycle || 'monthly',
        },
      });
    } catch (error: any) {
      Alert.alert('Upgrade Failed', error.message || 'Failed to process upgrade');
    } finally {
      setIsUpgrading(false);
    }
  };

  const getTierPrice = (tier: SubscriptionTier) => {
    if (tier === 'vip') return 299;
    if (tier === 'premium') return 99;
    return 0;
  };

  const getUpgradeBenefits = () => {
    const benefits = [];

    if (newTier === 'vip') {
      benefits.push(
        { icon: 'cash', text: 'Upgrade from 2x to 3x cashback', color: '#10B981' },
        { icon: 'bicycle', text: 'Free delivery on ALL orders', color: '#3B82F6' },
        { icon: 'person', text: 'Personal shopper assistance', color: '#8B5CF6' },
        { icon: 'calendar', text: 'Access to premium events', color: '#F59E0B' },
        { icon: 'shield-checkmark', text: 'Dedicated concierge service', color: '#EC4899' }
      );
    } else if (newTier === 'premium') {
      benefits.push(
        { icon: 'cash', text: '2x cashback on all orders', color: '#10B981' },
        { icon: 'bicycle', text: 'Free delivery (orders above ₹500)', color: '#3B82F6' },
        { icon: 'headset', text: 'Priority customer support', color: '#8B5CF6' },
        { icon: 'pricetag', text: 'Exclusive deals & early access', color: '#F59E0B' }
      );
    }

    return benefits;
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED'] as any} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to cancel and return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Confirm Upgrade</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Upgrade Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.tierContainer}>
              <View style={[styles.tierBox, { backgroundColor: TIER_COLORS[currentTier] + '20' }]}>
                <ThemedText style={[styles.tierLabel, { color: TIER_COLORS[currentTier] }]}>
                  Current
                </ThemedText>
                <ThemedText style={[styles.tierName, { color: TIER_COLORS[currentTier] }]}>
                  {TIER_NAMES[currentTier]}
                </ThemedText>
              </View>

              <Ionicons name="arrow-forward" size={32} color="#8B5CF6" />

              <View style={[styles.tierBox, { backgroundColor: TIER_COLORS[newTier] + '20' }]}>
                <ThemedText style={[styles.tierLabel, { color: TIER_COLORS[newTier] }]}>
                  Upgrade to
                </ThemedText>
                <ThemedText style={[styles.tierName, { color: TIER_COLORS[newTier] }]}>
                  {TIER_NAMES[newTier]}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* New Benefits */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>New Benefits You'll Get</ThemedText>
          <View style={styles.benefitsContainer}>
            {getUpgradeBenefits().map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: `${benefit.color}20` }]}>
                  <Ionicons name={benefit.icon as any} size={20} color={benefit.color} />
                </View>
                <ThemedText style={styles.benefitText}>{benefit.text}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Upgrade Timing */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>When to Upgrade?</ThemedText>

          <TouchableOpacity
            style={[styles.timingOption, timing === 'immediate' && styles.timingOptionSelected]}
            onPress={() => setTiming('immediate')}
            accessibilityLabel={`Upgrade immediately. ${proratedAmount > 0 ? `Pay ${proratedAmount} rupees today` : 'No additional charge'}. ${timing === 'immediate' ? 'Selected' : ''}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: timing === 'immediate' }}
            accessibilityHint="Double tap to upgrade immediately and enjoy benefits instantly"
          >
            <View style={styles.radioButton}>
              {timing === 'immediate' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.timingContent}>
              <ThemedText style={styles.timingTitle}>Upgrade Immediately</ThemedText>
              <ThemedText style={styles.timingDescription}>
                Pay prorated amount now and enjoy benefits instantly
              </ThemedText>
              {proratedAmount > 0 && (
                <ThemedText style={styles.timingPrice}>Pay ₹{proratedAmount} today</ThemedText>
              )}
            </View>
            <Ionicons name="flash" size={24} color="#F59E0B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timingOption, timing === 'cycle_end' && styles.timingOptionSelected]}
            onPress={() => setTiming('cycle_end')}
            accessibilityLabel={`Upgrade at cycle end. Takes effect after ${computed.daysRemaining} days. ${getTierPrice(newTier)} rupees per month from next cycle. ${timing === 'cycle_end' ? 'Selected' : ''}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: timing === 'cycle_end' }}
            accessibilityHint="Double tap to schedule upgrade for the end of your current billing cycle"
          >
            <View style={styles.radioButton}>
              {timing === 'cycle_end' && <View style={styles.radioButtonInner} />}
            </View>
            <View style={styles.timingContent}>
              <ThemedText style={styles.timingTitle}>Upgrade at Cycle End</ThemedText>
              <ThemedText style={styles.timingDescription}>
                Upgrade takes effect after {computed.daysRemaining} days (no extra charge now)
              </ThemedText>
              <ThemedText style={styles.timingPrice}>₹{getTierPrice(newTier)}/month from next cycle</ThemedText>
            </View>
            <Ionicons name="calendar-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Prorated Price Display */}
        {timing === 'immediate' && proratedAmount > 0 && (
          <View style={styles.section}>
            <ProratedPriceDisplay
              originalPrice={getTierPrice(newTier)}
              creditFromCurrentPlan={getTierPrice(currentTier) * (computed.daysRemaining / 30)}
              finalAmount={proratedAmount}
              currentTier={TIER_NAMES[currentTier]}
              newTier={TIER_NAMES[newTier]}
              daysRemaining={computed.daysRemaining}
            />
          </View>
        )}

        {/* Feature Comparison */}
        <View style={styles.section}>
          <FeatureComparisonTable currentTier={currentTier} newTier={newTier} />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleUpgrade}
            disabled={isUpgrading}
            accessibilityLabel={isUpgrading ? 'Processing upgrade' : (timing === 'immediate' ? 'Confirm and pay' : 'Schedule upgrade')}
            accessibilityRole="button"
            accessibilityState={{ disabled: isUpgrading, busy: isUpgrading }}
            accessibilityHint={`Double tap to ${timing === 'immediate' ? 'proceed to payment' : 'schedule your upgrade'}`}
          >
            {isUpgrading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <ThemedText style={styles.confirmButtonText}>
                  {timing === 'immediate' ? 'Confirm & Pay' : 'Schedule Upgrade'}
                </ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isUpgrading}
            accessibilityLabel="Cancel upgrade"
            accessibilityRole="button"
            accessibilityState={{ disabled: isUpgrading }}
            accessibilityHint="Double tap to cancel and return to previous screen"
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  summaryCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryHeader: {
    alignItems: 'center',
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tierBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  tierLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  benefitsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  timingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  timingOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF605',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  timingContent: {
    flex: 1,
  },
  timingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  timingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
