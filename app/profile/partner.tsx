import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  Clipboard,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PartnerPageState, ClaimableOffer, RewardTask, OrderMilestone, JackpotMilestone } from '@/types/partner.types';
import { partnerLevels } from '@/data/partnerData';
import partnerApi from '@/services/partnerApi';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import toast from '@/utils/toast';

// Import all partner components
import JackpotTimeline from '@/components/partner/JackpotTimeline';
import MilestoneTracker from '@/components/partner/MilestoneTracker';
import RewardTasks from '@/components/partner/RewardTasks';
import BenefitsTable from '@/components/partner/BenefitsTable';
import FAQAccordion from '@/components/partner/FAQAccordion';
import OffersGrid from '@/components/partner/OffersGrid';
import LevelWarningBanner from '@/components/partner/LevelWarningBanner';
import PartnerStatsDashboard from '@/components/partner/PartnerStatsDashboard';
import LevelUpCelebration from '@/components/partner/LevelUpCelebration';

// ReZ Premium Design System Colors
const COLORS = {
  // Primary Green
  primary: '#00C06A',
  primaryDark: '#00796B',
  primaryLight: 'rgba(0, 192, 106, 0.1)',
  primaryGlow: 'rgba(0, 192, 106, 0.3)',

  // Gold (rewards)
  gold: '#FFC857',
  goldLight: 'rgba(255, 200, 87, 0.15)',
  goldGlow: 'rgba(255, 200, 87, 0.3)',

  // Dark Navy
  navy: '#0B2240',

  // Text
  textPrimary: '#0B2240',
  textSecondary: '#1F2D3D',
  textMuted: '#9AA7B2',

  // Surface
  surface: '#F7FAFC',
  white: '#FFFFFF',

  // Glass
  glassWhite: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',

  // Status
  success: '#10B981',
  warning: '#FF9F1C',
  error: '#EF4444',
  info: '#0EA5E9',
};

export default function PartnerProfilePage() {
  const { goBack } = useSafeNavigation();
  const [partnerState, setPartnerState] = useState<PartnerPageState>({
    profile: null,
    milestones: [],
    tasks: [],
    jackpotProgress: [],
    claimableOffers: [],
    faqs: [],
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{
    visible: boolean;
    oldLevel: number;
    newLevel: number;
    levelName: string;
    benefits: any[];
    bonusAmount: number;
  }>({
    visible: false,
    oldLevel: 1,
    newLevel: 1,
    levelName: '',
    benefits: [],
    bonusAmount: 0,
  });
  const previousLevelRef = React.useRef<number | null>(null);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      setPartnerState(prev => ({ ...prev, loading: true, error: null }));

      const [dashboardResponse, benefitsResponse] = await Promise.all([
        partnerApi.getDashboard(),
        partnerApi.getBenefits()
      ]);

      if (dashboardResponse.success && dashboardResponse.data) {
        const levelsWithBenefits = benefitsResponse.success && benefitsResponse.data
          ? benefitsResponse.data.allLevels
          : [];

        setPartnerState({
          profile: dashboardResponse.data.profile,
          milestones: dashboardResponse.data.milestones,
          tasks: dashboardResponse.data.tasks,
          jackpotProgress: dashboardResponse.data.jackpotProgress,
          claimableOffers: dashboardResponse.data.claimableOffers,
          faqs: dashboardResponse.data.faqs,
          levels: levelsWithBenefits,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(dashboardResponse.error || 'Failed to load partner data');
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
      setPartnerState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load partner data',
      }));
    }
  };

  // Level-up detection effect
  useEffect(() => {
    const currentLevel = partnerState.profile?.level?.level;
    if (currentLevel && previousLevelRef.current !== null) {
      if (currentLevel > previousLevelRef.current) {
        // Level up detected!
        const levelName = partnerState.profile?.level?.name || `Level ${currentLevel}`;
        const levelBenefits = partnerState.levels?.find(l => l.level === currentLevel)?.benefits || [];
        const bonusAmount = currentLevel * 500; // ₹500, ₹1000, ₹1500 based on level

        setLevelUpModal({
          visible: true,
          oldLevel: previousLevelRef.current,
          newLevel: currentLevel,
          levelName,
          benefits: levelBenefits,
          bonusAmount,
        });
      }
    }
    if (currentLevel) {
      previousLevelRef.current = currentLevel;
    }
  }, [partnerState.profile?.level?.level, partnerState.levels]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPartnerData();
    setRefreshing(false);
  }, []);

  // Close level-up modal
  const closeLevelUpModal = () => {
    setLevelUpModal(prev => ({ ...prev, visible: false }));
  };

  const handleGoBack = () => {
    goBack('/profile' as any);
  };

  const handleClaimReward = async (milestoneId: string) => {
    try {
      const response = await partnerApi.claimMilestoneReward(milestoneId);

      if (response.success) {
        Alert.alert('🎉 Reward Claimed!', response.data?.message || 'Your reward has been successfully claimed.', [
          { text: 'OK', onPress: () => loadPartnerData() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    Alert.alert('Task Started!', 'Keep completing this task to earn your reward.', [
      { text: 'OK', onPress: () => console.log('Task started:', taskId) }
    ]);
  };

  const handleClaimTaskReward = async (taskId: string) => {
    try {
      const response = await partnerApi.claimTaskReward(taskId);

      if (response.success) {
        Alert.alert('🎉 Task Reward Claimed!', response.data?.message || 'Congratulations! Your task reward has been claimed.', [
          { text: 'OK', onPress: () => loadPartnerData() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to claim task reward');
      }
    } catch (error) {
      console.error('Error claiming task reward:', error);
      Alert.alert('Error', 'Failed to claim task reward. Please try again.');
    }
  };

  const handleClaimOffer = async (offerId: string) => {
    try {
      const response = await partnerApi.claimOffer(offerId);

      if (response.success && response.data) {
        const voucherCode = response.data.voucher.code;
        const expiryDate = new Date(response.data.voucher.expiryDate).toLocaleDateString();

        await loadPartnerData();

        if (Platform.OS === 'web') {
          navigator.clipboard.writeText(voucherCode).then(() => {
            toast.success(
              `Voucher Code: ${voucherCode} (Copied!)\n\nUse this code during checkout. Expires: ${expiryDate}`,
              { duration: 8000 }
            );
          }).catch(() => {
            toast.success(
              `Voucher Code: ${voucherCode}\n\nUse this code during checkout. Expires: ${expiryDate}`,
              { duration: 8000 }
            );
          });
        } else {
          Alert.alert(
            '🎉 Offer Claimed!',
            `Your exclusive offer has been activated.\n\nVoucher Code: ${voucherCode}\nExpires: ${expiryDate}\n\nUse this code during checkout to get your discount!`,
            [
              { text: 'Copy Code', onPress: () => Clipboard.setString(voucherCode) },
              { text: 'OK', style: 'default' }
            ]
          );
        }
      } else {
        const errorMsg = response.error || 'Failed to claim offer';
        if (Platform.OS === 'web') {
          toast.error(errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = 'Failed to claim offer. Please try again.';
      if (Platform.OS === 'web') {
        toast.error(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const handleViewOfferTerms = (offer: ClaimableOffer) => {
    Alert.alert('Terms & Conditions', offer.termsAndConditions.join('\n\n'), [
      { text: 'Close', style: 'default' }
    ]);
  };

  const handleContactSupport = () => {
    router.push('/help/chat' as any);
  };

  const handleJackpotMilestonePress = async (milestone: JackpotMilestone) => {
    if (milestone.claimedAt) {
      Alert.alert(
        'Already Claimed',
        `You claimed this jackpot reward on ${new Date(milestone.claimedAt).toLocaleDateString()}`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (!milestone.achieved) {
      const remaining = milestone.spendAmount - (partnerState.profile?.totalSpent || 0);
      Alert.alert(
        milestone.title,
        `${milestone.description}\n\nSpend ₹${remaining.toLocaleString()} more to unlock this jackpot!`,
        [{ text: 'Close', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Claim Jackpot Reward?',
      `${milestone.title}\n\nReward: ${milestone.reward.title}\nValue: ₹${milestone.reward.value}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim Now',
          onPress: async () => {
            try {
              const response = await partnerApi.claimJackpotReward(milestone.spendAmount);

              if (response.success) {
                Alert.alert(
                  '🎉 Jackpot Claimed!',
                  `Congratulations! ₹${milestone.reward.value} has been added to your wallet!`,
                  [{ text: 'Awesome!', onPress: () => loadPartnerData() }]
                );
              } else {
                Alert.alert('Error', response.error || 'Failed to claim jackpot reward');
              }
            } catch (error) {
              console.error('Error claiming jackpot reward:', error);
              Alert.alert('Error', 'Failed to claim jackpot reward. Please try again.');
            }
          },
          style: 'default'
        }
      ]
    );
  };

  const handleUpgradeLevel = (targetLevel: any) => {
    Alert.alert(
      'Upgrade to ' + targetLevel.name,
      `Requirements: ${targetLevel.requirements.orders} orders in ${targetLevel.requirements.timeframe} days`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Safe computed values with fallbacks
  const profile = partnerState.profile;
  const ordersRequired = profile?.level?.requirements?.orders ?? 0;
  const ordersThisLevel = profile?.ordersThisLevel ?? 0;
  const daysRemaining = profile?.daysRemaining ?? 0;
  const levelName = profile?.level?.name ?? 'Partner';
  const currentLevelNumber = profile?.level?.level ?? 1;

  // Format validity date properly
  const formatValidityDate = () => {
    if (profile?.validUntil) {
      const date = new Date(profile.validUntil);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    }
    return 'N/A';
  };

  // Get dynamic level data from backend or use defaults
  const getLevelCards = () => {
    if (partnerState.levels && partnerState.levels.length > 0) {
      return partnerState.levels.map((level: any, index: number) => ({
        level: level.level || index + 1,
        name: level.name || `Level ${index + 1}`,
        orders: level.requirements?.orders || 0,
        days: level.requirements?.timeframe || 0,
        current: (level.level || index + 1) === currentLevelNumber,
        locked: (level.level || index + 1) > currentLevelNumber,
        future: (level.level || index + 1) > currentLevelNumber + 1,
      }));
    }
    // Fallback to basic structure from backend profile
    return [
      { level: 1, name: 'Partner', orders: profile?.level?.requirements?.orders || 15, days: profile?.level?.requirements?.timeframe || 44, current: currentLevelNumber === 1, locked: false, future: false },
      { level: 2, name: 'Influencer', orders: 45, days: 44, current: currentLevelNumber === 2, locked: currentLevelNumber < 2, future: currentLevelNumber < 1 },
      { level: 3, name: 'Ambassador', orders: 100, days: 44, current: currentLevelNumber === 3, locked: currentLevelNumber < 3, future: currentLevelNumber < 2 }
    ];
  };

  if (partnerState.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="trophy" size={32} color={COLORS.gold} />
            </View>
            <Text style={styles.loadingText}>Loading Partner Profile...</Text>
            <Text style={styles.loadingSubtext}>Fetching your rewards</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (partnerState.error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{partnerState.error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadPartnerData}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.retryButtonGradient}>
              <Ionicons name="refresh" size={18} color="white" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Premium Header with Green/Gold Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Glass overlay */}
        <View style={styles.headerGlassOverlay} />

        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Partner Profile</Text>
            <Text style={styles.headerSubtitle}>Rewards & Benefits Dashboard</Text>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                'Partner Menu',
                'Choose an option',
                [
                  { text: 'View Statistics', onPress: () => router.push('/profile/activity' as any) },
                  { text: 'Refer Friends', onPress: () => router.push('/referral' as any) },
                  { text: 'Help Center', onPress: () => router.push('/help' as any) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={styles.menuButtonInner}>
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Partner Card with Premium Glass Effect */}
        <View style={styles.partnerCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.partnerCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Glass overlay */}
            <View style={styles.cardGlassOverlay} />

            <View style={styles.partnerInfo}>
              {/* Avatar with gold ring */}
              <View style={styles.avatarWrapper}>
                <LinearGradient
                  colors={[COLORS.gold, '#FF9F1C']}
                  style={styles.avatarRing}
                >
                  {profile?.avatar ? (
                    <Image
                      source={{ uri: profile.avatar, cache: 'reload' }}
                      style={styles.avatar}
                      key={profile.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>
                        {profile?.name?.substring(0, 2).toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
                {/* Level badge */}
                <View style={styles.levelBadge}>
                  <LinearGradient colors={[COLORS.gold, '#FF9F1C']} style={styles.levelBadgeGradient}>
                    <Text style={styles.levelBadgeText}>{levelName}</Text>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>{profile?.name || 'User'}</Text>
                <Text style={styles.partnerValidity}>Valid till {formatValidityDate()}</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile?.totalOrders?.toLocaleString() || '0'}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>₹{profile?.totalSpent?.toLocaleString() || '0'}</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{daysRemaining}</Text>
                <Text style={styles.statLabel}>Days Left</Text>
              </View>
            </View>

            {/* Benefits Button */}
            <TouchableOpacity
              style={styles.benefitsButton}
              activeOpacity={0.8}
              onPress={() => {
                const benefits = profile?.level?.benefits || profile?.currentBenefits || [];
                const benefitsList = Array.isArray(benefits) ? benefits.join('\n• ') : 'No benefits available';
                Alert.alert(
                  '🎁 Your Current Benefits',
                  `As a ${levelName}, you enjoy:\n\n• ${benefitsList}`,
                  [{ text: 'Great!', style: 'default' }]
                );
              }}
            >
              <View style={styles.benefitsButtonInner}>
                <Ionicons name="gift" size={18} color={COLORS.gold} />
                <Text style={styles.benefitsButtonText}>View My Benefits</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Level Warning Banner - Shows when level is at risk */}
        {daysRemaining <= 7 && daysRemaining > 0 && ordersThisLevel < ordersRequired && (
          <LevelWarningBanner
            daysRemaining={daysRemaining}
            ordersNeeded={ordersRequired - ordersThisLevel}
            currentLevel={levelName}
            onShopNow={() => router.push('/(tabs)')}
          />
        )}

        {/* Partner Statistics Dashboard - Shows ranking and leaderboard preview */}
        <PartnerStatsDashboard
          compact={true}
          onViewLeaderboard={() => router.push('/partner/leaderboard')}
        />

        {/* Level Criteria Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.sectionIcon}>
                <Ionicons name="trophy" size={16} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Level Criteria</Text>
              <Text style={styles.sectionSubtitle}>Track your progress and unlock rewards</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.upgradeButton}
              activeOpacity={0.8}
              onPress={() => {
                const nextLevel = currentLevelNumber + 1;
                const levelNames = ['Partner', 'Influencer', 'Ambassador'];
                const nextLevelName = levelNames[nextLevel - 1] || 'Next Level';
                const ordersNeeded = Math.max(0, ordersRequired - ordersThisLevel);
                Alert.alert(
                  `🚀 Upgrade to ${nextLevelName}`,
                  `Complete ${ordersNeeded} more orders within ${daysRemaining} days to upgrade and unlock exclusive benefits!`,
                  [{ text: 'Got It!', style: 'default' }]
                );
              }}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.upgradeButtonGradient}>
                <Ionicons name="trending-up" size={16} color="white" />
                <Text style={styles.upgradeButtonText}>Upgrade Level</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.maintainButton}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  '🛡️ Maintain Your Level',
                  `To maintain your ${levelName} status, complete ${ordersRequired} orders every ${profile?.level?.requirements?.timeframe || 44} days.\n\nKeep shopping to retain your benefits!`,
                  [{ text: 'Understood', style: 'default' }]
                );
              }}
            >
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.maintainButtonText}>Maintain Level</Text>
            </TouchableOpacity>
          </View>

          {/* Level Cards */}
          <View style={styles.levelCards}>
            {getLevelCards().map((level) => (
              <View
                key={level.level}
                style={[
                  styles.levelCard,
                  level.current && styles.currentLevelCard,
                  level.locked && styles.lockedLevelCard
                ]}
              >
                {level.current && <View style={styles.currentIndicator} />}

                <Text style={[styles.levelCardLabel, level.current && styles.currentLevelText]}>
                  Level {level.level}
                </Text>
                <Text style={[styles.levelCardName, level.current && styles.currentLevelText]}>
                  {level.name}
                </Text>

                {!level.future ? (
                  <View style={styles.levelRequirements}>
                    <Text style={[styles.levelOrderCount, level.current && styles.currentLevelText]}>
                      {level.orders}
                    </Text>
                    <Text style={[styles.levelDays, level.current && styles.currentLevelSubtext]}>
                      {level.days} days
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.futureLevelText}>
                    Unlock{'\n'}this level
                  </Text>
                )}

                {level.locked && !level.future && (
                  <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} style={styles.lockIcon} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Important Information */}
        <View style={styles.infoSection}>
          <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.infoGradient}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.infoTitle}>Important Information</Text>
                <Text style={styles.infoSubtitle}>Level maintenance requirements</Text>
              </View>
            </View>
            <View style={styles.infoContent}>
              <View style={styles.infoPoint}>
                <View style={[styles.bullet, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.infoText}>
                  Level progress resets when upgrading - maintain your achievements through consistent activity.
                </Text>
              </View>
              <View style={styles.infoPoint}>
                <View style={[styles.bullet, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.infoText}>
                  Failure to meet requirements within the timeframe will automatically revert you to the previous level.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Jackpot Timeline */}
        <JackpotTimeline
          milestones={partnerState.jackpotProgress}
          currentSpent={profile?.totalSpent || 0}
          onMilestonePress={handleJackpotMilestonePress}
        />

        {/* Milestone Tracker */}
        <MilestoneTracker
          milestones={partnerState.milestones}
          currentOrders={profile?.totalOrders ?? 0}
          onClaimReward={handleClaimReward}
        />

        {/* Reward Tasks */}
        <RewardTasks
          tasks={partnerState.tasks}
          onCompleteTask={handleCompleteTask}
          onClaimReward={handleClaimTaskReward}
        />

        {/* Benefits Comparison Table */}
        <BenefitsTable
          levels={partnerState.levels || partnerLevels}
          currentLevel={currentLevelNumber}
          onUpgradePress={handleUpgradeLevel}
        />

        {/* Claimable Offers */}
        <OffersGrid
          offers={partnerState.claimableOffers}
          onClaimOffer={handleClaimOffer}
          onViewTerms={handleViewOfferTerms}
        />

        {/* FAQ Section */}
        <FAQAccordion
          faqs={partnerState.faqs}
          onContactPress={handleContactSupport}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Level Up Celebration Modal */}
      <LevelUpCelebration
        visible={levelUpModal.visible}
        oldLevel={levelUpModal.oldLevel}
        newLevel={levelUpModal.newLevel}
        levelName={levelUpModal.levelName}
        benefits={levelUpModal.benefits}
        bonusAmount={levelUpModal.bonusAmount}
        onClose={closeLevelUpModal}
        onShopNow={() => {
          closeLevelUpModal();
          router.push('/(tabs)');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.surface,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 35,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 60,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: -20,
    right: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 200, 87, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  backButton: {
    zIndex: 3,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  menuButton: {
    zIndex: 3,
  },
  menuButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Partner Card
  partnerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 192, 106, 0.2)',
      },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
      },
    }),
  },
  partnerCardGradient: {
    padding: 24,
    position: 'relative',
  },
  cardGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: 'white',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  levelBadgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelBadgeText: {
    color: COLORS.navy,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  partnerValidity: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 4,
  },

  // Benefits Button
  benefitsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  benefitsButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  benefitsButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },

  // Section
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconWrapper: {
    marginRight: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  upgradeButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  maintainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  maintainButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Level Cards
  levelCards: {
    flexDirection: 'row',
    gap: 10,
  },
  levelCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    position: 'relative',
  },
  currentLevelCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(0, 192, 106, 0.3)',
      },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  lockedLevelCard: {
    opacity: 0.5,
  },
  currentIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.gold,
    borderWidth: 2,
    borderColor: 'white',
  },
  levelCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  levelCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  currentLevelText: {
    color: 'white',
  },
  currentLevelSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  levelRequirements: {
    alignItems: 'center',
  },
  levelOrderCount: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  levelDays: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  futureLevelText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  lockIcon: {
    marginTop: 4,
  },

  // Info Section
  infoSection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoGradient: {
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoContent: {
    gap: 12,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    flex: 1,
  },

  bottomSpacer: {
    height: 40,
  },
});
