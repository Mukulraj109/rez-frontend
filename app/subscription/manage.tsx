// Subscription Management Page
// Manage current subscription, view usage statistics, and handle upgrades/cancellations

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import subscriptionAPI from '@/services/subscriptionApi';
import { TIER_COLORS, TIER_GRADIENTS, TIER_ICONS, SubscriptionTier } from '@/types/subscription.types';

export default function SubscriptionManagePage() {
  const router = useRouter();
  const { state, actions, computed } = useSubscription();
  // BUG FIX #6: Changed default from 'BASIC' to 'free' (valid SubscriptionTier)
  const currentTier = (state.currentSubscription?.tier || 'free') as SubscriptionTier;
  const isActive = state.currentSubscription?.status === 'active';
  const daysRemaining = computed.daysRemaining;
  const benefits = state.currentSubscription?.benefits || [];
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  // Fetch usage statistics
  const fetchUsageStats = async () => {
    try {
      setIsLoading(true);
      const response = await subscriptionAPI.getSubscriptionUsage();
      if (response) {
        setStats(response);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = () => {
    // Navigate to cancellation feedback flow
    router.push('/subscription/cancel-feedback');
  };

  // Handle upgrade
  const handleUpgrade = () => {
    // Navigate to upgrade confirmation with current tier context
    router.push({
      pathname: '/subscription/upgrade-confirmation',
      params: {
        currentTier: currentTier,
        newTier: currentTier === 'premium' ? 'vip' : 'premium',
      },
    });
  };

  // Render usage stat card
  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        <ThemedText style={styles.statTitle}>{title}</ThemedText>
      </View>
    </View>
  );

  // Render benefit item
  const renderBenefit = (title: string, isActive: boolean, icon: string) => (
    <View style={styles.benefitRow}>
      <View style={[styles.benefitIcon, { backgroundColor: isActive ? '#10B98120' : '#E5E7EB' }]}>
        <Ionicons name={icon as any} size={20} color={isActive ? '#10B981' : '#9CA3AF'} />
      </View>
      <ThemedText style={[styles.benefitText, !isActive && styles.benefitTextInactive]}>
        {title}
      </ThemedText>
      {isActive && (
        <View style={styles.activeBadge}>
          <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
        </View>
      )}
    </View>
  );

  const tierColor = TIER_COLORS[currentTier];
  const tierGradient = TIER_GRADIENTS[currentTier];
  const tierIcon = TIER_ICONS[currentTier];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={tierColor} />

      {/* Header */}
      <LinearGradient colors={tierGradient as any} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Manage Subscription</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Plan Card */}
        <View style={styles.currentPlanCard}>
          <LinearGradient colors={tierGradient as any} style={styles.planHeaderGradient}>
            <Ionicons name={tierIcon as any} size={48} color="#FFFFFF" />
            <ThemedText style={styles.planTierName}>
              {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
            </ThemedText>
            {isActive && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <ThemedText style={styles.statusText}>Active</ThemedText>
              </View>
            )}
          </LinearGradient>

          <View style={styles.planDetails}>
            {currentTier !== 'free' && (
              <>
                <View style={styles.planDetailRow}>
                  <ThemedText style={styles.planDetailLabel}>Billing Cycle</ThemedText>
                  <ThemedText style={styles.planDetailValue}>
                    {state.currentSubscription?.billingCycle || 'Monthly'}
                  </ThemedText>
                </View>
                <View style={styles.planDetailRow}>
                  <ThemedText style={styles.planDetailLabel}>Days Remaining</ThemedText>
                  <ThemedText style={styles.planDetailValue}>{daysRemaining} days</ThemedText>
                </View>
                <View style={styles.planDetailRow}>
                  <ThemedText style={styles.planDetailLabel}>Auto Renewal</ThemedText>
                  <ThemedText style={styles.planDetailValue}>
                    {state.currentSubscription?.autoRenew ? 'On' : 'Off'}
                  </ThemedText>
                </View>
              </>
            )}

            {currentTier === 'free' && (
              <View style={styles.upgradePrompt}>
                <ThemedText style={styles.upgradePromptText}>
                  Upgrade to Premium or VIP to unlock exclusive benefits!
                </ThemedText>
                <TouchableOpacity style={styles.upgradePromptButton} onPress={handleUpgrade}>
                  <ThemedText style={styles.upgradePromptButtonText}>View Plans</ThemedText>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Usage Statistics */}
        {stats && currentTier !== 'free' && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Usage Statistics</ThemedText>
            <View style={styles.statsGrid}>
              {renderStatCard(
                'Total Savings',
                `₹${stats.usage?.totalSavings || 0}`,
                'cash-outline',
                '#10B981'
              )}
              {renderStatCard(
                'Orders This Month',
                stats.usage?.ordersThisMonth || 0,
                'cart-outline',
                '#8B5CF6'
              )}
              {renderStatCard(
                'Cashback Earned',
                `₹${stats.usage?.cashbackEarned || 0}`,
                'wallet-outline',
                '#F59E0B'
              )}
              {renderStatCard(
                'Delivery Saved',
                `₹${stats.usage?.deliveryFeesSaved || 0}`,
                'bicycle-outline',
                '#3B82F6'
              )}
            </View>

            {/* ROI Card */}
            {stats.roi && (
              <View style={styles.roiCard}>
                <ThemedText style={styles.roiTitle}>Return on Investment</ThemedText>
                <View style={styles.roiContent}>
                  <View style={styles.roiRow}>
                    <ThemedText style={styles.roiLabel}>Subscription Cost</ThemedText>
                    <ThemedText style={styles.roiValue}>₹{stats.roi.subscriptionCost}</ThemedText>
                  </View>
                  <View style={styles.roiRow}>
                    <ThemedText style={styles.roiLabel}>Total Savings</ThemedText>
                    <ThemedText style={[styles.roiValue, { color: '#10B981' }]}>
                      ₹{stats.roi.totalSavings}
                    </ThemedText>
                  </View>
                  <View style={[styles.roiRow, styles.roiTotalRow]}>
                    <ThemedText style={styles.roiTotalLabel}>Net Savings</ThemedText>
                    <ThemedText style={styles.roiTotalValue}>
                      ₹{stats.roi.netSavings}
                    </ThemedText>
                  </View>
                  <View style={styles.roiPercentage}>
                    <ThemedText style={styles.roiPercentageText}>
                      {stats.roi.roiPercentage}% ROI
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Active Benefits */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Benefits</ThemedText>
          <View style={styles.benefitsContainer}>
            {renderBenefit(
              `${benefits?.cashbackMultiplier || 1}x Cashback Multiplier`,
              true,
              'cash'
            )}
            {renderBenefit('Free Delivery', benefits?.freeDelivery || false, 'bicycle')}
            {renderBenefit('Priority Support', benefits?.prioritySupport || false, 'headset')}
            {renderBenefit('Exclusive Deals', benefits?.exclusiveDeals || false, 'pricetag')}
            {renderBenefit(
              'Unlimited Wishlists',
              benefits?.unlimitedWishlists || false,
              'heart'
            )}
            {renderBenefit(
              'Early Flash Sales',
              benefits?.earlyFlashSaleAccess || false,
              'flash'
            )}
            {currentTier === 'vip' && (
              <>
                {renderBenefit('Personal Shopper', true, 'person')}
                {renderBenefit('Premium Events', true, 'calendar')}
                {renderBenefit('Concierge Service', true, 'shield-checkmark')}
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        {currentTier !== 'free' && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Manage Plan</ThemedText>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/subscription/billing')}
            >
              <Ionicons name="receipt-outline" size={24} color="#3B82F6" />
              <View style={styles.actionContent}>
                <ThemedText style={styles.actionTitle}>View Billing History</ThemedText>
                <ThemedText style={styles.actionSubtitle}>
                  See payments and download invoices
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            {currentTier === 'premium' && (
              <TouchableOpacity style={styles.actionButton} onPress={handleUpgrade}>
                <Ionicons name="arrow-up-circle-outline" size={24} color="#F59E0B" />
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Upgrade to VIP</ThemedText>
                  <ThemedText style={styles.actionSubtitle}>
                    Get 3x cashback and exclusive benefits
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                  <View style={styles.actionContent}>
                    <ThemedText style={[styles.actionTitle, { color: '#EF4444' }]}>
                      Cancel Subscription
                    </ThemedText>
                    <ThemedText style={styles.actionSubtitle}>
                      You'll keep benefits until period ends
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  currentPlanCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  planHeaderGradient: {
    padding: 24,
    alignItems: 'center',
  },
  planTierName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planDetails: {
    padding: 20,
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  planDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  planDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  upgradePrompt: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  upgradePromptText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradePromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  upgradePromptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  roiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  roiContent: {
    gap: 8,
  },
  roiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  roiLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  roiValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  roiTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  roiTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  roiTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  roiPercentage: {
    backgroundColor: '#10B98120',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  roiPercentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  benefitsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#111827',
    fontWeight: '500',
  },
  benefitTextInactive: {
    color: '#9CA3AF',
  },
  activeBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
});
