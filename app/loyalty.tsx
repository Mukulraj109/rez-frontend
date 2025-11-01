/**
 * Loyalty Rewards & Redemption Page
 * Complete loyalty system with redemption, tier benefits, and gamification
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import useLoyaltyRedemption from '@/hooks/useLoyaltyRedemption';
import RewardCard from '@/components/loyalty/RewardCard';
import RedemptionModal from '@/components/loyalty/RedemptionModal';
import TierBenefitsCard from '@/components/loyalty/TierBenefitsCard';
import RewardCatalog from '@/components/loyalty/RewardCatalog';
import RedemptionHistory from '@/components/loyalty/RedemptionHistory';
import PointsExpiryBanner from '@/components/loyalty/PointsExpiryBanner';
import { RewardItem } from '@/types/loyaltyRedemption.types';

type TabType = 'rewards' | 'history' | 'challenges';

const LoyaltyPage = () => {
  const router = useRouter();
  const {
    balance,
    rewards,
    redemptions,
    tierConfig,
    loading,
    error,
    refreshing,
    catalog,
    expiryNotification,
    challenges,
    checkInStatus,
    refresh,
    redeemReward,
    canRedeemReward,
    filterRewards,
    searchRewards,
    dailyCheckIn,
    claimChallenge,
    getTierColor,
    getTierProgress,
  } = useLoyaltyRedemption();

  const [activeTab, setActiveTab] = useState<TabType>('rewards');
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [showAllTiersModal, setShowAllTiersModal] = useState(false);

  // Handle reward redemption
  const handleRedeemReward = (reward: RewardItem) => {
    setSelectedReward(reward);
    setShowRedemptionModal(true);
  };

  const handleConfirmRedemption = async (reward: RewardItem, quantity: number) => {
    try {
      const result = await redeemReward({
        rewardId: reward._id,
        points: reward.points * quantity,
        quantity,
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Handle daily check-in
  const handleDailyCheckIn = async () => {
    try {
      const result = await dailyCheckIn();
      Alert.alert(
        'Check-in Successful!',
        `You earned ${result.points} points!\n${result.bonus ? `Bonus: ${result.bonus.points} points - ${result.bonus.message}` : ''}`
      );
    } catch (error) {
      Alert.alert('Check-in Failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  // Handle challenge claim
  const handleClaimChallenge = async (challengeId: string) => {
    try {
      const result = await claimChallenge(challengeId);
      Alert.alert(
        'Challenge Completed!',
        `You earned ${result.points} points!${result.reward ? `\nBonus: ${result.reward.title}` : ''}`
      );
    } catch (error) {
      Alert.alert('Claim Failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  // Render tier benefits section
  const renderTierSection = () => {
    if (!balance || !tierConfig) return null;

    return (
      <View style={styles.section}>
        <TierBenefitsCard
          tierConfig={tierConfig}
          currentPoints={balance.currentPoints}
          pointsToNextTier={balance.pointsToNextTier}
          nextTier={balance.nextTier}
          onViewAllTiers={() => setShowAllTiersModal(true)}
        />
      </View>
    );
  };

  // Render quick actions
  const renderQuickActions = () => {
    const canCheckIn = checkInStatus ? true : false;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, !canCheckIn && styles.actionCardDisabled]}
            onPress={handleDailyCheckIn}
            disabled={!canCheckIn}
          >
            <Ionicons name="calendar" size={28} color={canCheckIn ? '#8B5CF6' : '#9CA3AF'} />
            <ThemedText style={styles.actionTitle}>Daily Check-in</ThemedText>
            {checkInStatus && (
              <ThemedText style={styles.actionSubtitle}>
                {checkInStatus.streak.currentStreak} day streak
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/scratch-card')}
          >
            <Ionicons name="gift" size={28} color="#F59E0B" />
            <ThemedText style={styles.actionTitle}>Scratch Card</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Win points</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/referral')}
          >
            <Ionicons name="people" size={28} color="#10B981" />
            <ThemedText style={styles.actionTitle}>Refer Friend</ThemedText>
            <ThemedText style={styles.actionSubtitle}>200 points</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/my-reviews')}
          >
            <Ionicons name="star" size={28} color="#EF4444" />
            <ThemedText style={styles.actionTitle}>Write Review</ThemedText>
            <ThemedText style={styles.actionSubtitle}>50 points</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render challenges section
  const renderChallenges = () => {
    if (challenges.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Active Challenges</ThemedText>

        {challenges.map(challenge => (
          <View key={challenge._id} style={styles.challengeCard}>
            <View style={styles.challengeIcon}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>

            <View style={styles.challengeContent}>
              <ThemedText style={styles.challengeTitle}>{challenge.title}</ThemedText>
              <ThemedText style={styles.challengeDescription}>{challenge.description}</ThemedText>

              <View style={styles.challengeProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(challenge.progress / challenge.maxProgress) * 100}%` },
                    ]}
                  />
                </View>
                <ThemedText style={styles.progressText}>
                  {challenge.progress}/{challenge.maxProgress}
                </ThemedText>
              </View>

              <View style={styles.challengeFooter}>
                <View style={styles.challengePoints}>
                  <Ionicons name="diamond" size={16} color="#F59E0B" />
                  <ThemedText style={styles.challengePointsText}>{challenge.points} pts</ThemedText>
                </View>

                {challenge.completed ? (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => handleClaimChallenge(challenge._id)}
                  >
                    <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
                  </TouchableOpacity>
                ) : challenge.expiresAt ? (
                  <ThemedText style={styles.expiryText}>
                    Expires {new Date(challenge.expiresAt).toLocaleDateString()}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render featured rewards
  const renderFeaturedRewards = () => {
    const featuredRewards = rewards.filter(r => r.featured).slice(0, 3);
    if (featuredRewards.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <ThemedText style={styles.sectionTitle}>Featured Rewards</ThemedText>
          </View>
          <TouchableOpacity onPress={() => setActiveTab('rewards')}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
          </TouchableOpacity>
        </View>

        {featuredRewards.map(reward => {
          const { canRedeem } = canRedeemReward(reward);
          return (
            <RewardCard
              key={reward._id}
              reward={reward}
              canRedeem={canRedeem}
              onRedeem={handleRedeemReward}
              userPoints={balance?.currentPoints || 0}
              tierColor={tierConfig ? tierConfig.color : '#8B5CF6'}
            />
          );
        })}
      </View>
    );
  };

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'rewards':
        return (
          <View style={styles.tabContent}>
            <RewardCatalog
              rewards={rewards}
              onRedeemReward={handleRedeemReward}
              canRedeemReward={canRedeemReward}
              userPoints={balance?.currentPoints || 0}
              tierColor={tierConfig?.color}
              onSearch={searchRewards}
              onFilter={category => filterRewards({ category: category || undefined })}
            />
          </View>
        );
      case 'history':
        return (
          <View style={styles.tabContent}>
            <RedemptionHistory redemptions={redemptions} />
          </View>
        );
      case 'challenges':
        return (
          <View style={styles.tabContent}>
            {renderChallenges()}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading && !balance) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Loyalty Rewards</ThemedText>
            <View style={styles.headerButton} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Ionicons name="diamond" size={64} color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading loyalty data...</ThemedText>
        </View>
      </View>
    );
  }

  if (error && !balance) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Loyalty Rewards</ThemedText>
            <View style={styles.headerButton} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!balance) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header with Points Card */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Loyalty Rewards</ThemedText>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/profile' as any)}
          >
            <Ionicons name="stats-chart" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Main Points Display */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsMain}>
            <Ionicons name="diamond" size={40} color="#F59E0B" />
            <ThemedText style={styles.pointsValue}>{balance.currentPoints}</ThemedText>
            <ThemedText style={styles.pointsLabel}>Available Points</ThemedText>
          </View>

          {balance.nextTier && (
            <View style={styles.tierProgress}>
              <View style={styles.tierProgressInfo}>
                <View style={styles.currentTierBadge}>
                  <Ionicons name="star" size={14} color={getTierColor(balance.tier)} />
                  <ThemedText style={[styles.tierBadgeText, { color: getTierColor(balance.tier) }]}>
                    {balance.tier}
                  </ThemedText>
                </View>
                <ThemedText style={styles.tierProgressText}>
                  {balance.pointsToNextTier} pts to {balance.nextTier}
                </ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${getTierProgress()}%` }]}
                />
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
          onPress={() => setActiveTab('rewards')}
        >
          <Ionicons
            name="gift"
            size={20}
            color={activeTab === 'rewards' ? '#8B5CF6' : '#9CA3AF'}
          />
          <ThemedText
            style={[styles.tabText, activeTab === 'rewards' && styles.tabTextActive]}
          >
            Rewards
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time"
            size={20}
            color={activeTab === 'history' ? '#8B5CF6' : '#9CA3AF'}
          />
          <ThemedText
            style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}
          >
            History
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Ionicons
            name="trophy"
            size={20}
            color={activeTab === 'challenges' ? '#8B5CF6' : '#9CA3AF'}
          />
          <ThemedText
            style={[styles.tabText, activeTab === 'challenges' && styles.tabTextActive]}
          >
            Challenges
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#8B5CF6" />}
      >
        {/* Expiry Warning */}
        {expiryNotification && expiryNotification.points > 0 && (
          <PointsExpiryBanner notification={expiryNotification} />
        )}

        {/* Tier Benefits */}
        {activeTab === 'rewards' && renderTierSection()}

        {/* Quick Actions */}
        {activeTab === 'rewards' && renderQuickActions()}

        {/* Featured Rewards */}
        {activeTab === 'rewards' && renderFeaturedRewards()}

        {/* Tab Content */}
        {renderContent()}
      </ScrollView>

      {/* Redemption Modal */}
      <RedemptionModal
        visible={showRedemptionModal}
        reward={selectedReward}
        userPoints={balance.currentPoints}
        onClose={() => {
          setShowRedemptionModal(false);
          setSelectedReward(null);
        }}
        onRedeem={handleConfirmRedemption}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
  },
  pointsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsMain: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tierProgress: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tierProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tierProgressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  challengeCard: {
    flexDirection: 'row',
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
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengePointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  claimButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expiryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default LoyaltyPage;
