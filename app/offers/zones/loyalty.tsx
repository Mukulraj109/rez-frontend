/**
 * Loyalty Rewards Page
 * Redesigned loyalty progress and rewards page
 * Based on Rez_v-2-main design, adapted for rez-frontend theme
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography, Gradients } from '@/constants/DesignSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoyaltyDeal {
  id: string;
  store: string;
  reward: string;
  rewardValue: string;
  currentVisits?: number;
  requiredVisits?: number;
  currentSpend?: number;
  requiredSpend?: number;
  progress: number;
  nextMilestone: string;
  storeLogo?: string;
  history?: string[];
}

const DUMMY_LOYALTY_DEALS: LoyaltyDeal[] = [
  {
    id: 'loyal1',
    store: 'Starbucks',
    reward: 'Free Grande Beverage',
    rewardValue: '₹350',
    currentVisits: 4,
    requiredVisits: 5,
    progress: 80,
    nextMilestone: '1 more visit',
    storeLogo: 'https://logo.clearbit.com/starbucks.in',
    history: ['Visit 1: Dec 10', 'Visit 2: Dec 12', 'Visit 3: Dec 15', 'Visit 4: Dec 18'],
  },
  {
    id: 'loyal2',
    store: 'Wow Momo',
    reward: '50% OFF next order',
    rewardValue: '₹200',
    currentSpend: 800,
    requiredSpend: 1000,
    progress: 80,
    nextMilestone: 'Spend ₹200 more',
    storeLogo: 'https://logo.clearbit.com/wowmomo.com',
    history: ['Order 1: ₹300', 'Order 2: ₹250', 'Order 3: ₹250'],
  },
  {
    id: 'loyal3',
    store: "Domino's",
    reward: 'Free Large Pizza',
    rewardValue: '₹600',
    currentVisits: 7,
    requiredVisits: 10,
    progress: 70,
    nextMilestone: '3 more orders',
    storeLogo: 'https://logo.clearbit.com/dominos.co.in',
    history: ['Order 1', 'Order 2', 'Order 3', 'Order 4', 'Order 5', 'Order 6', 'Order 7'],
  },
  {
    id: 'loyal4',
    store: 'Cult.fit',
    reward: 'Free Month Extension',
    rewardValue: '₹1500',
    currentVisits: 15,
    requiredVisits: 20,
    progress: 75,
    nextMilestone: '5 more sessions',
    storeLogo: 'https://logo.clearbit.com/cult.fit',
  },
];

const COMPLETED_REWARDS = [
  { id: '1', store: 'Starbucks', reward: 'Free Coffee', date: 'Dec 15' },
  { id: '2', store: 'McDonald\'s', reward: 'Free Burger', date: 'Dec 10' },
  { id: '3', store: 'PVR', reward: 'Free Popcorn', date: 'Dec 5' },
];

export default function LoyaltyRewardsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const totalProgress =
    DUMMY_LOYALTY_DEALS.reduce((acc, deal) => acc + deal.progress, 0) /
    DUMMY_LOYALTY_DEALS.length;
  
  // Bottom padding = Fixed CTA height (80px) + Bottom nav bar (70px) + Safe area bottom
  const bottomPadding = 80 + 70 + insets.bottom;

  const handleDealPress = (deal: LoyaltyDeal) => {
    // TODO: Navigate to deal detail
    console.log('Deal pressed:', deal.id);
  };

  const renderLoyaltyCard = (deal: LoyaltyDeal) => (
    <TouchableOpacity
      key={deal.id}
      style={styles.loyaltyCard}
      onPress={() => handleDealPress(deal)}
      activeOpacity={0.7}
    >
      <View style={styles.loyaltyContent}>
        {deal.storeLogo ? (
          <Image
            source={{ uri: deal.storeLogo }}
            style={styles.storeLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.storeLogoPlaceholder}>
            <Ionicons name="storefront" size={24} color={Colors.primary[600]} />
          </View>
        )}

        <View style={styles.loyaltyInfo}>
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyStoreInfo}>
              <ThemedText style={styles.loyaltyStore}>{deal.store}</ThemedText>
              <ThemedText style={styles.loyaltyReward}>{deal.reward}</ThemedText>
            </View>
            <View style={styles.rewardValueContainer}>
              <ThemedText style={styles.rewardValueLabel}>Worth</ThemedText>
              <ThemedText style={styles.rewardValue}>{deal.rewardValue}</ThemedText>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressLabel}>
                {deal.currentVisits !== undefined
                  ? `${deal.currentVisits}/${deal.requiredVisits} visits`
                  : `₹${deal.currentSpend}/₹${deal.requiredSpend} spent`}
              </ThemedText>
              <ThemedText style={styles.progressPercentage}>{deal.progress}%</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${deal.progress}%` },
                ]}
              />
            </View>
          </View>

          {/* Next Milestone */}
          <View style={styles.milestoneContainer}>
            <View style={styles.milestoneBadge}>
              <Ionicons name="flag" size={12} color={Colors.text.secondary} />
              <ThemedText style={styles.milestoneText}>{deal.nextMilestone}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
          </View>

          {/* History */}
          {deal.history && deal.history.length > 0 && (
            <View style={styles.historyContainer}>
              <ThemedText style={styles.historyTitle}>Recent activity</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.historyScroll}
              >
                {deal.history.slice(-4).map((item, i) => (
                  <View key={i} style={styles.historyItem}>
                    <ThemedText style={styles.historyItemText}>{item}</ThemedText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#059669', '#047857', '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Loyalty Rewards</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Complete challenges, earn rewards</ThemedText>
            </View>

            <View style={styles.headerIcon}>
              <ThemedText style={styles.emoji}>🎯</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Progress */}
        <View style={styles.progressBanner}>
          <LinearGradient
            colors={['rgba(5, 150, 105, 0.3)', 'rgba(20, 184, 166, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          >
            <View style={styles.progressHeaderContent}>
              <View style={styles.progressIconContainer}>
                <Ionicons name="flag" size={32} color="#10B981" />
              </View>
              <View style={styles.progressTextContainer}>
                <ThemedText style={styles.progressTitle}>Your Progress</ThemedText>
                <ThemedText style={styles.progressSubtitle}>
                  {DUMMY_LOYALTY_DEALS.length} active rewards in progress
                </ThemedText>
              </View>
            </View>

            {/* Overall progress bar */}
            <View style={styles.overallProgressContainer}>
              <View style={styles.overallProgressHeader}>
                <ThemedText style={styles.overallProgressLabel}>Overall completion</ThemedText>
                <ThemedText style={styles.overallProgressValue}>
                  {Math.round(totalProgress)}%
                </ThemedText>
              </View>
              <View style={styles.overallProgressBar}>
                <View
                  style={[
                    styles.overallProgressFill,
                    { width: `${totalProgress}%` },
                  ]}
                />
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <ThemedText style={[styles.statValue, { color: '#10B981' }]}>
                  {DUMMY_LOYALTY_DEALS.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Active</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={[styles.statValue, { color: '#F59E0B' }]}>3</ThemedText>
                <ThemedText style={styles.statLabel}>Almost Done</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={[styles.statValue, { color: '#A78BFA' }]}>12</ThemedText>
                <ThemedText style={styles.statLabel}>Completed</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Almost There Section */}
        <View style={styles.almostThereSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="trending-up" size={20} color="#F59E0B" />
              <ThemedText style={styles.sectionTitle}>Almost There!</ThemedText>
            </View>
            <ThemedText style={styles.sectionSubtitle}>Complete these to unlock rewards</ThemedText>
          </View>

          {DUMMY_LOYALTY_DEALS.map((deal) => renderLoyaltyCard(deal))}
        </View>

        {/* Completed Rewards */}
        <View style={styles.completedSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="star" size={20} color="#A78BFA" />
              <ThemedText style={styles.sectionTitle}>Completed Rewards</ThemedText>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.completedScroll}
          >
            {COMPLETED_REWARDS.map((reward) => (
              <View key={reward.id} style={styles.completedCard}>
                <View style={styles.completedHeader}>
                  <ThemedText style={styles.completedEmoji}>🎁</ThemedText>
                  <View style={styles.completedBadge}>
                    <ThemedText style={styles.completedBadgeText}>Claimed</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.completedReward}>{reward.reward}</ThemedText>
                <ThemedText style={styles.completedStore}>
                  {reward.store} • {reward.date}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorks}>
          <ThemedText style={styles.howItWorksTitle}>How Loyalty Rewards Work</ThemedText>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <ThemedText style={styles.stepText}>
                Visit or spend at participating stores
              </ThemedText>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <ThemedText style={styles.stepText}>
                Pay with ReZ Wallet for automatic tracking
              </ThemedText>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <ThemedText style={styles.stepText}>
                Complete milestones and claim rewards!
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed CTA Button */}
      <View style={styles.fixedCTA}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name="gift" size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
            <ThemedText style={styles.ctaButtonText}>Find More Loyalty Programs</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  safeHeader: {
    paddingBottom: Spacing.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150, // Will be overridden by dynamic padding
  },
  progressBanner: {
    margin: Spacing.base,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.medium,
  },
  progressGradient: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    borderRadius: BorderRadius['2xl'],
  },
  progressHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  progressIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  overallProgressContainer: {
    marginBottom: Spacing.base,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  overallProgressLabel: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  overallProgressValue: {
    ...Typography.label,
    color: '#10B981',
    fontWeight: '600',
  },
  overallProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: BorderRadius.full,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  almostThereSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  loyaltyCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  loyaltyContent: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  storeLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
  },
  storeLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loyaltyInfo: {
    flex: 1,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  loyaltyStoreInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  loyaltyStore: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  loyaltyReward: {
    ...Typography.bodySmall,
    color: '#10B981',
  },
  rewardValueContainer: {
    alignItems: 'flex-end',
  },
  rewardValueLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  rewardValue: {
    ...Typography.label,
    color: '#F59E0B',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  progressPercentage: {
    ...Typography.labelSmall,
    color: '#10B981',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: BorderRadius.full,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  milestoneText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  historyContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  historyTitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  historyScroll: {
    gap: Spacing.xs,
  },
  historyItem: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyItemText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  completedSection: {
    marginBottom: Spacing.lg,
  },
  completedScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  completedCard: {
    minWidth: 160,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  completedEmoji: {
    fontSize: 24,
  },
  completedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  completedBadgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  completedReward: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedStore: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  howItWorks: {
    margin: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.subtle,
  },
  howItWorksTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  stepsContainer: {
    gap: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...Typography.caption,
    color: '#059669',
    fontWeight: '700',
  },
  stepText: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
    paddingTop: 2,
  },
  fixedCTA: {
    position: 'absolute',
    bottom: 70, // Above bottom nav bar (70px height)
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadows.medium,
  },
  ctaButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

