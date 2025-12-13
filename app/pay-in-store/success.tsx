/**
 * Pay In Store - Success Screen
 *
 * Payment success confirmation with:
 * - Transaction summary
 * - Rewards earned (cashback, coins)
 * - Loyalty progress
 * - Social share prompt
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';
import { SuccessScreenParams, PaymentRewards } from '@/types/storePayment.types';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<SuccessScreenParams>();
  const { paymentId, storeId, storeName, amount, rewards: rewardsParam } = params;

  const rewards: PaymentRewards = rewardsParam
    ? JSON.parse(rewardsParam)
    : { cashbackEarned: 0, coinsEarned: 0, loyaltyProgress: { currentVisits: 0, nextMilestone: 0, milestoneReward: '' } };

  const billAmount = parseFloat(amount || '0');

  // Animations
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const rewardsSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Run animations
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(rewardsSlide, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      const message = `I just paid ₹${billAmount.toFixed(0)} at ${storeName} via ReZ and earned ${
        rewards.coinsEarned
      } coins! 🎉\n\nDownload ReZ to start earning rewards on your purchases: https://rez.app/download`;

      await Share.share({
        message,
        title: 'Share your ReZ payment',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleViewReceipt = () => {
    router.push({
      pathname: '/transactions/[id]',
      params: { id: paymentId },
    });
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  const loyaltyProgress = rewards.loyaltyProgress || {
    currentVisits: 0,
    nextMilestone: 5,
    milestoneReward: 'Bonus 50 Coins',
  };
  const progressPercent =
    loyaltyProgress.nextMilestone > 0
      ? (loyaltyProgress.currentVisits / loyaltyProgress.nextMilestone) * 100
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <Animated.View
          style={[styles.successIconContainer, { transform: [{ scale: checkmarkScale }] }]}
        >
          <LinearGradient
            colors={[COLORS.success[400], COLORS.success[600]]}
            style={styles.successIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark" size={64} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* Success Text */}
        <Animated.View style={[styles.successTextContainer, { opacity: contentOpacity }]}>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Paid ₹{billAmount.toFixed(0)} to {storeName}
          </Text>
          <Text style={styles.transactionId}>Transaction ID: {paymentId?.slice(-8).toUpperCase()}</Text>
        </Animated.View>

        {/* Rewards Card */}
        <Animated.View
          style={[
            styles.rewardsCard,
            { opacity: contentOpacity, transform: [{ translateY: rewardsSlide }] },
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary[500], COLORS.primary[700]]}
            style={styles.rewardsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.rewardsTitle}>🎉 Rewards Earned</Text>

            <View style={styles.rewardsGrid}>
              <View style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Ionicons name="cash-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.rewardValue}>₹{rewards.cashbackEarned}</Text>
                <Text style={styles.rewardLabel}>Cashback</Text>
              </View>

              <View style={styles.rewardDivider} />

              <View style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Ionicons name="diamond-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.rewardValue}>{rewards.coinsEarned}</Text>
                <Text style={styles.rewardLabel}>ReZ Coins</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Loyalty Progress */}
        {loyaltyProgress.nextMilestone > 0 && (
          <Animated.View style={[styles.loyaltyCard, { opacity: contentOpacity }]}>
            <View style={styles.loyaltyHeader}>
              <Ionicons name="trophy-outline" size={20} color={COLORS.warning[500]} />
              <Text style={styles.loyaltyTitle}>Loyalty Progress</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {loyaltyProgress.currentVisits} / {loyaltyProgress.nextMilestone} visits
              </Text>
            </View>

            {loyaltyProgress.milestoneReward && (
              <View style={styles.milestoneContainer}>
                <Ionicons name="gift" size={16} color={COLORS.secondary[500]} />
                <Text style={styles.milestoneText}>
                  Next reward: {loyaltyProgress.milestoneReward}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Share Section */}
        <Animated.View style={[styles.shareSection, { opacity: contentOpacity }]}>
          <Text style={styles.shareTitle}>Share & Earn More!</Text>
          <Text style={styles.shareSubtitle}>
            Share your payment on social media and earn bonus coins
          </Text>

          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social" size={20} color={COLORS.primary[500]} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, styles.instagramButton]}
              onPress={handleShare}
            >
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              <Text style={[styles.shareButtonText, { color: '#E4405F' }]}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* What's Next */}
        <Animated.View style={[styles.whatsNextSection, { opacity: contentOpacity }]}>
          <Text style={styles.whatsNextTitle}>What's Next?</Text>

          <TouchableOpacity style={styles.whatsNextItem} onPress={() => router.push('/WalletScreen')}>
            <View style={[styles.whatsNextIcon, { backgroundColor: COLORS.primary[50] }]}>
              <Ionicons name="wallet" size={20} color={COLORS.primary[500]} />
            </View>
            <View style={styles.whatsNextContent}>
              <Text style={styles.whatsNextItemTitle}>Check Your Wallet</Text>
              <Text style={styles.whatsNextItemDesc}>
                See your updated coin balance and cashback
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whatsNextItem}
            onPress={() => router.push(`/ReviewPage?storeId=${storeId}&storeName=${storeName}`)}
          >
            <View style={[styles.whatsNextIcon, { backgroundColor: COLORS.warning[50] }]}>
              <Ionicons name="star" size={20} color={COLORS.warning[500]} />
            </View>
            <View style={styles.whatsNextContent}>
              <Text style={styles.whatsNextItemTitle}>Rate Your Experience</Text>
              <Text style={styles.whatsNextItemDesc}>
                Earn bonus coins by leaving a review
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.receiptButton} onPress={handleViewReceipt}>
          <Ionicons name="receipt-outline" size={20} color={COLORS.primary[500]} />
          <Text style={styles.receiptButtonText}>View Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  successTextContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  transactionId: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    marginTop: SPACING.sm,
  },
  rewardsCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  rewardsGradient: {
    padding: SPACING.lg,
  },
  rewardsTitle: {
    ...TYPOGRAPHY.h4,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rewardsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardItem: {
    flex: 1,
    alignItems: 'center',
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rewardValue: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
  },
  rewardLabel: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  rewardDivider: {
    width: 1,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.md,
  },
  loyaltyCard: {
    width: '100%',
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  loyaltyTitle: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 4,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.warning[500],
    borderRadius: 4,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.secondary[50],
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  milestoneText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary[700],
  },
  shareSection: {
    width: '100%',
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  shareTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  shareSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    backgroundColor: COLORS.primary[50],
    gap: SPACING.sm,
  },
  instagramButton: {
    borderColor: '#E4405F20',
    backgroundColor: '#E4405F10',
  },
  shareButtonText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.primary[500],
  },
  whatsNextSection: {
    width: '100%',
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  whatsNextTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  whatsNextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  whatsNextIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsNextContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  whatsNextItemTitle: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  whatsNextItemDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.md,
  },
  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
    gap: SPACING.sm,
  },
  receiptButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary[500],
  },
  homeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary[500],
  },
  homeButtonText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
});
