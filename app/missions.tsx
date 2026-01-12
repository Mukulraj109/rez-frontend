/**
 * Missions Screen - Improved UI
 * Uses DesignTokens for consistent styling
 * Tappable cards navigate to mission detail page
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { challengesApi, ChallengeProgress } from '@/services/challengesApi';
import streakApi from '@/services/streakApi';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '@/constants/DesignTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ReZ Coin image
const REZ_COIN_IMAGE = require('@/assets/images/rez-coin.png');

// Theme colors (extending DesignTokens for mission-specific colors)
const THEME = {
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  amber400: '#FBBF24',
  orange400: '#FB923C',
  orange600: '#EA580C',
  emerald500: '#10B981',
};

interface Mission {
  id: string;
  progressId: string;
  title: string;
  description: string;
  reward: { coins: number; cashback: number };
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  endsIn: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  special?: boolean;
  icon?: string;
}

// Helper to map API challenge to local Mission format
const mapChallengeToMission = (cp: ChallengeProgress): Mission => {
  const challenge = cp.challenge;
  return {
    id: challenge._id,
    progressId: cp._id,
    title: challenge.title,
    description: challenge.description,
    reward: {
      coins: challenge.rewards.coins,
      cashback: 0,
    },
    progress: cp.progress,
    target: cp.target,
    completed: cp.completed,
    claimed: cp.rewardsClaimed,
    difficulty: challenge.difficulty as Mission['difficulty'],
    endsIn: challengesApi.getTimeRemaining(challenge.endDate),
    type: challenge.type,
    special: challenge.type === 'special' || challenge.type === 'monthly',
    icon: challenge.icon,
  };
};

const tabs = [
  { id: 'daily', label: 'Daily', icon: 'calendar' as const },
  { id: 'weekly', label: 'Weekly', icon: 'flag' as const },
  { id: 'special', label: 'Special', icon: 'trophy' as const },
];

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return { bg: 'rgba(0, 192, 106, 0.15)', color: COLORS.primary[500], label: 'Easy' };
    case 'medium': return { bg: 'rgba(59, 130, 246, 0.15)', color: COLORS.info[500], label: 'Medium' };
    case 'hard': return { bg: 'rgba(139, 92, 246, 0.15)', color: THEME.purple500, label: 'Hard' };
    case 'legendary': return { bg: 'rgba(245, 158, 11, 0.15)', color: COLORS.warning[500], label: 'Legendary' };
    default: return { bg: COLORS.neutral[200], color: COLORS.neutral[600], label: difficulty };
  }
};

// Animated Mission Card Component
const MissionCard: React.FC<{
  mission: Mission;
  onPress: () => void;
  onClaim: () => void;
  isClaiming: boolean;
}> = ({ mission, onPress, onClaim, isClaiming }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const diffStyle = getDifficultyStyle(mission.difficulty);
  const progressPercent = Math.round((mission.progress / mission.target) * 100);
  const isClaimable = mission.completed && !mission.claimed;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.missionCard,
          mission.completed && styles.missionCardCompleted,
          mission.special && styles.missionCardSpecial,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.missionRow}>
          <View style={[
            styles.missionIconBox,
            mission.completed && styles.missionIconBoxCompleted
          ]}>
            {mission.completed ? (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.background.primary} />
            ) : (
              <Ionicons name="flag" size={24} color={THEME.purple500} />
            )}
          </View>

          <View style={styles.missionContent}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionTitle} numberOfLines={2}>{mission.title}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: diffStyle.bg }]}>
                <Text style={[styles.difficultyText, { color: diffStyle.color }]}>
                  {diffStyle.label}
                </Text>
              </View>
            </View>

            <Text style={styles.missionDesc} numberOfLines={2}>{mission.description}</Text>

            {/* Progress Bar */}
            {!mission.completed && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {mission.progress}/{mission.target}
                  </Text>
                  <Text style={styles.progressPercent}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={[THEME.purple500, THEME.indigo500]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]}
                  />
                </View>
              </View>
            )}

            {/* Rewards & Time */}
            <View style={styles.bottomRow}>
              <View style={styles.rewardsRow}>
                <View style={styles.rewardBadge}>
                  <Image source={REZ_COIN_IMAGE} style={styles.coinIcon} />
                  <Text style={styles.rewardText}>+{mission.reward.coins}</Text>
                </View>
                {mission.reward.cashback > 0 && (
                  <View style={[styles.rewardBadge, styles.cashbackBadge]}>
                    <Ionicons name="flash" size={12} color={COLORS.success[500]} />
                    <Text style={[styles.rewardText, { color: COLORS.success[600] }]}>
                      ₹{mission.reward.cashback}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={12} color={COLORS.neutral[500]} />
                <Text style={styles.endsIn}>{mission.endsIn}</Text>
              </View>
            </View>
          </View>

          {/* Arrow indicator */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.neutral[400]} />
          </View>
        </View>

        {/* Claim Button */}
        {isClaimable && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.claimButtonWrapper}
            onPress={(e) => {
              e.stopPropagation();
              onClaim();
            }}
            disabled={isClaiming}
          >
            <LinearGradient
              colors={[COLORS.primary[500], COLORS.success[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.claimButton}
            >
              {isClaiming ? (
                <ActivityIndicator size="small" color={COLORS.background.primary} />
              ) : (
                <>
                  <Image source={REZ_COIN_IMAGE} style={styles.claimCoinIcon} />
                  <Text style={styles.claimButtonText}>Claim Rewards</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Claimed Badge */}
        {mission.claimed && (
          <View style={styles.claimedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success[500]} />
            <Text style={styles.claimedText}>Rewards Claimed</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const MissionsScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');

  // API state
  const [allMissions, setAllMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({
    completed: 0,
    coinsEarned: 0,
    active: 0,
  });

  // Fetch missions from API
  const fetchMissions = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const [progressResponse, streakResponse] = await Promise.all([
        challengesApi.getMyProgressWithStats(),
        streakApi.getStreakStatus('login'),
      ]);

      if (progressResponse.success && progressResponse.data) {
        const { challenges, stats: challengeStats } = progressResponse.data;
        const mapped = challenges.map(mapChallengeToMission);
        setAllMissions(mapped);

        // Calculate coins earned from claimed missions locally
        // (backend might return 0 if not tracked properly)
        const localCoinsEarned = mapped
          .filter(m => m.claimed)
          .reduce((sum, m) => sum + m.reward.coins, 0);

        setStats({
          completed: challengeStats.totalCompleted || mapped.filter(m => m.completed).length,
          coinsEarned: challengeStats.totalCoinsEarned || localCoinsEarned,
          active: challengeStats.activeChallenges || mapped.filter(m => !m.completed).length,
        });
      } else {
        setError(progressResponse.error || 'Failed to load missions');
      }

      if (streakResponse.success && streakResponse.data) {
        setStreak(streakResponse.data.current);
      }
    } catch (err: any) {
      console.error('[MISSIONS] Error fetching:', err);
      setError(err.message || 'Failed to load missions');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMissions(true);
  }, [fetchMissions]);

  const handleClaimReward = async (progressId: string) => {
    setClaiming(progressId);
    try {
      const response = await challengesApi.claimReward(progressId);
      if (response.success && response.data) {
        setAllMissions(prev =>
          prev.map(m =>
            m.progressId === progressId ? { ...m, claimed: true } : m
          )
        );
        setStats(prev => ({
          ...prev,
          coinsEarned: prev.coinsEarned + (response.data?.coinsEarned || 0),
        }));
        Alert.alert(
          'Rewards Claimed!',
          `+${response.data.coinsEarned} coins added to your wallet!`,
          [{ text: 'Awesome!' }]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to claim rewards');
      }
    } catch (err: any) {
      console.error('[MISSIONS] Error claiming reward:', err);
      Alert.alert('Error', err.message || 'Failed to claim rewards');
    } finally {
      setClaiming(null);
    }
  };

  const handleMissionPress = (mission: Mission) => {
    // Special handling for Daily Check-In mission
    if (mission.title.toLowerCase().includes('daily check-in') ||
        mission.title.toLowerCase().includes('check in') ||
        mission.title.toLowerCase() === 'daily check-in') {
      router.push('/explore/daily-checkin');
      return;
    }

    // Default: go to mission detail page
    router.push({
      pathname: '/mission-detail',
      params: {
        id: mission.id,
        progressId: mission.progressId,
      },
    });
  };

  // Filter missions by type
  const dailyMissions = allMissions.filter(m => m.type === 'daily');
  const weeklyMissions = allMissions.filter(m => m.type === 'weekly');
  const specialMissions = allMissions.filter(m => m.type === 'special' || m.type === 'monthly');

  const getMissions = () => {
    switch (activeTab) {
      case 'daily': return dailyMissions;
      case 'weekly': return weeklyMissions;
      case 'special': return specialMissions;
      default: return dailyMissions;
    }
  };

  const missions = getMissions();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={[THEME.purple600, THEME.indigo600]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.background.primary} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <Ionicons name="flag" size={22} color={THEME.amber400} />
                <Text style={styles.headerTitle}>Missions</Text>
              </View>
              <Text style={styles.headerSubtitle}>Complete tasks, earn rewards</Text>
            </View>
            {streak > 0 ? (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color={THEME.orange400} />
                <Text style={styles.streakText}>{streak} day{streak > 1 ? 's' : ''}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.streakBadge}
                onPress={() => router.push('/explore/daily-checkin')}
                activeOpacity={0.7}
              >
                <Ionicons name="flame-outline" size={14} color={COLORS.background.primary} />
                <Text style={styles.streakText}>Check in</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const count = tab.id === 'daily' ? dailyMissions.length
                          : tab.id === 'weekly' ? weeklyMissions.length
                          : specialMissions.length;

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={isActive ? THEME.purple600 : COLORS.background.primary}
                  />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                      <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[THEME.purple600]}
              tintColor={THEME.purple600}
            />
          }
        >
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.purple600} />
              <Text style={styles.loadingText}>Loading missions...</Text>
            </View>
          )}

          {/* Error State */}
          {!loading && error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIconContainer}>
                <Ionicons name="cloud-offline-outline" size={48} color={COLORS.neutral[400]} />
              </View>
              <Text style={styles.errorTitle}>Unable to load missions</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => fetchMissions()}
                style={styles.retryButton}
                activeOpacity={0.8}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Stats */}
          {!loading && !error && (
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardGreen]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trophy" size={20} color={COLORS.success[500]} />
                </View>
                <Text style={[styles.statValue, { color: COLORS.success[600] }]}>
                  {stats.completed}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={[styles.statCard, styles.statCardGold]}>
                <View style={styles.statIconContainer}>
                  <Image source={REZ_COIN_IMAGE} style={styles.statCoinIcon} />
                </View>
                <Text style={[styles.statValue, { color: COLORS.secondary[700] }]}>
                  {formatNumber(stats.coinsEarned)}
                </Text>
                <Text style={styles.statLabel}>Coins Earned</Text>
              </View>
              <View style={[styles.statCard, styles.statCardBlue]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="flash" size={20} color={COLORS.info[500]} />
                </View>
                <Text style={[styles.statValue, { color: COLORS.info[700] }]}>
                  {stats.active}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
          )}

          {/* Missions List */}
          {!loading && !error && (
            <View style={styles.missionsList}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'daily' ? 'Daily Challenges'
                   : activeTab === 'weekly' ? 'Weekly Challenges'
                   : 'Special Challenges'}
                </Text>
                <Text style={styles.sectionCount}>{missions.length} available</Text>
              </View>

              {/* Empty State */}
              {missions.length === 0 && (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="flag-outline" size={48} color={COLORS.neutral[300]} />
                  </View>
                  <Text style={styles.emptyTitle}>No {activeTab} missions</Text>
                  <Text style={styles.emptyText}>
                    Check back later for new challenges!
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleRefresh}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={16} color={THEME.purple600} />
                    <Text style={styles.emptyButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Mission Cards */}
              {missions.map(mission => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onPress={() => handleMissionPress(mission)}
                  onClaim={() => handleClaimReward(mission.progressId)}
                  isClaiming={claiming === mission.progressId}
                />
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  streakText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabActive: {
    backgroundColor: COLORS.background.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
  tabTextActive: {
    color: THEME.purple600,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: THEME.purple600,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  tabBadgeTextActive: {
    color: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    ...Platform.select({
      ios: SHADOWS.sm,
      android: { elevation: 2 },
    }),
  },
  statCardGreen: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  statCardGold: {
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
  },
  statCardBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.h4.fontSize,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  missionsList: {
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  sectionCount: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.text.tertiary,
  },
  missionCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background.primary,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: SHADOWS.md,
      android: { elevation: 4 },
    }),
  },
  missionCardCompleted: {
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  missionCardSpecial: {
    backgroundColor: 'rgba(255, 200, 87, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 87, 0.3)',
  },
  missionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  missionIconBox: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIconBoxCompleted: {
    backgroundColor: COLORS.success[500],
  },
  missionContent: {
    flex: 1,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  missionTitle: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  missionDesc: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: COLORS.text.secondary,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: '600',
    color: THEME.purple600,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 200, 87, 0.2)',
  },
  cashbackBadge: {
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary[700],
  },
  coinIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  claimCoinIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  statCoinIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  endsIn: {
    fontSize: 11,
    color: COLORS.text.tertiary,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingLeft: SPACING.xs,
  },
  claimButtonWrapper: {
    marginTop: SPACING.sm,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  claimButtonText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: '700',
    color: COLORS.background.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.lg,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: THEME.purple600,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: '600',
    color: COLORS.background.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: THEME.purple600,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: '600',
    color: THEME.purple600,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
  },
  claimedText: {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: '600',
    color: COLORS.success[500],
  },
});

export default MissionsScreen;
