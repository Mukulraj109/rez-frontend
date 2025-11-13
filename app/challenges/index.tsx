import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/services/apiClient';
import walletApi from '@/services/walletApi';
import coinSyncService from '@/services/coinSyncService';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import logger from '@/utils/logger';

const { width } = Dimensions.get('window');

interface Challenge {
  _id: string;
  challenge: {
    _id: string;
    title: string;
    description: string;
    icon: string;
    type: 'daily' | 'weekly' | 'monthly' | 'special';
    difficulty: 'easy' | 'medium' | 'hard';
    requirements: {
      action: string;
      target: number;
      stores?: string[];
      categories?: string[];
      minAmount?: number;
    };
    rewards: {
      coins: number;
      badges?: string[];
      multiplier?: number;
    };
    durationDays?: number;
  };
  progress: number;
  target: number;
  completed: boolean;
  rewardsClaimed: boolean;
  startDate: string;
  endDate: string;
}

interface ChallengeStats {
  totalCompleted: number;
  totalCoinsEarned: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

type TabType = 'daily' | 'weekly' | 'monthly' | 'completed';

export default function ChallengesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats>({
    totalCompleted: 0,
    totalCoinsEarned: 0,
    currentStreak: 0,
    bestStreak: 0,
    completionRate: 0,
  });
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadChallengesData();
    } else if (!authState.isLoading && !authState.isAuthenticated) {
      router.replace({
        pathname: '/sign-in',
        params: { returnTo: '/challenges' },
      } as any);
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.user]);

  const loadChallengesData = async () => {
    try {
      setLoading(true);

      logger.debug('🔍 [Challenges] Loading challenges data...');

      const [allChallengesRes, progressRes, statsRes, walletRes] = await Promise.all([
        apiClient.get('/gamification/challenges'),
        apiClient.get('/gamification/challenges/my-progress?includeCompleted=true'),
        apiClient.get('/gamification/stats'),
        walletApi.getBalance(),
      ]);

      logger.debug('📡 [Challenges] API Response:', {
        allChallengesRes: allChallengesRes.data,
        progressRes: progressRes.data,
      });

      // Get all available challenges
      // apiClient returns { success, data, message } where data is the array
      const availableChallenges = (allChallengesRes.data as any) || [];
      logger.debug(`✅ [Challenges] Available challenges: ${availableChallenges.length}`);
      logger.debug('📋 [Challenges] Challenges:', availableChallenges);

      // Get user's progress
      // progressRes.data is { challenges: [], stats: {} }
      const userProgress = (progressRes.data as any)?.challenges || [];
      logger.debug(`📊 [Challenges] User progress: ${userProgress.length}`);

      // Merge available challenges with user progress
      const mergedChallenges = availableChallenges.map((challenge: any) => {
        const progress = userProgress.find((p: any) => p.challenge._id === challenge._id);

        if (progress) {
          // User has started this challenge
          return {
            _id: progress._id,
            challenge: challenge,
            progress: progress.progress,
            target: progress.target || challenge.requirements.target,
            completed: progress.completed,
            rewardsClaimed: progress.rewardsClaimed,
            startDate: progress.startDate,
            endDate: progress.endDate || challenge.endDate,
          };
        } else {
          // User hasn't started this challenge yet
          return {
            _id: challenge._id,
            challenge: challenge,
            progress: 0,
            target: challenge.requirements.target,
            completed: false,
            rewardsClaimed: false,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
          };
        }
      });

      // Separate completed and active challenges
      const completed = mergedChallenges.filter((c: Challenge) => c.rewardsClaimed);
      const active = mergedChallenges.filter((c: Challenge) => !c.rewardsClaimed);

      logger.debug(`🎯 [Challenges] Merged challenges: ${mergedChallenges.length}`);
      logger.debug(`✅ [Challenges] Active: ${active.length}, Completed: ${completed.length}`);

      setChallenges(active);
      setCompletedChallenges(completed);

      // Map API stats to our interface and calculate completion rate
      const apiStats = (statsRes.data as any) || {};
      const totalChallenges = (apiStats.challengesCompleted || 0) + (apiStats.challengesActive || 0);
      const completionRate = totalChallenges > 0
        ? ((apiStats.challengesCompleted || 0) / totalChallenges) * 100
        : 0;

      setStats({
        totalCompleted: apiStats.challengesCompleted || 0,
        totalCoinsEarned: apiStats.totalCoins || 0,
        currentStreak: apiStats.streak || 0,
        activeChallenges: apiStats.challengesActive || 0,
        completionRate: completionRate,
      });

      // Get coin balance from wallet
      if (walletRes.success && walletRes.data) {
        const wasilCoin = walletRes.data.coins.find((c: any) => c.type === 'wasil');
        setCoinBalance(wasilCoin?.amount || 0);
      }
    } catch (error) {
      logger.error('Error loading challenges data:', error);
      showAlert('Error', 'Failed to load challenges. Please try again.', undefined, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChallengesData();
  };

  const handleJoinChallenge = async (challengeId: string, challengeTitle: string) => {
    try {
      // For now, since join endpoint might not exist, we'll just show a message
      // The challenge will auto-join when user completes an action
      showAlert(
        'Challenge Accepted! 🎯',
        `Start completing "${challengeTitle}" to earn rewards!`,
        [
          {
            text: 'Got it!',
            onPress: () => loadChallengesData(),
          },
        ],
        'success'
      );
    } catch (error: any) {
      showAlert('Error', error.response?.data?.message || 'Failed to join challenge', undefined, 'error');
    }
  };

  const handleClaimReward = async (challengeId: string) => {
    if (claimingId) return; // Prevent double-click

    try {
      setClaimingId(challengeId);
      logger.debug('🎁 [Claim Reward] ========== STARTING CLAIM PROCESS ==========');
      logger.debug('🎁 [Claim Reward] Challenge ID:', challengeId);
      logger.debug('🎁 [Claim Reward] Current wallet balance:', coinBalance);

      const response = await apiClient.post(`/gamification/challenges/${challengeId}/claim`);
      logger.debug('🎁 [Claim Reward] Raw response:', response);
      logger.debug('🎁 [Claim Reward] Response.data:', response.data);
      logger.debug('🎁 [Claim Reward] Response.data.success:', (response.data as any).success);
      logger.debug('🎁 [Claim Reward] Response.success:', (response as any).success);

      // Handle both wrapped and unwrapped responses
      const responseData = (response as any).success ? response : response.data;
      const isSuccess = responseData.success === true;

      logger.debug('🎁 [Claim Reward] Is success:', isSuccess);

      if (isSuccess) {
        const coinsEarned = responseData.data?.rewards?.coins || 10;
        const backendWalletBalance = responseData.data?.walletBalance;

        logger.debug('🎁 [Claim Reward] ✅ Coins earned:', coinsEarned);
        logger.debug('🎁 [Claim Reward] Previous balance:', coinBalance);
        logger.debug('🎁 [Claim Reward] Expected new balance:', coinBalance + coinsEarned);
        logger.debug('🎁 [Claim Reward] Backend wallet balance:', backendWalletBalance);

        // Backend now handles wallet updates directly, so we use that balance if available
        if (backendWalletBalance !== undefined) {
          logger.debug('✅ [Claim Reward] Using wallet balance from backend:', backendWalletBalance);

          showAlert(
            'Reward Claimed! 🎉',
            `+${coinsEarned} coins added to your wallet!\nNew balance: ${backendWalletBalance} coins`,
            [{ text: 'Awesome!', style: 'default' }],
            'success'
          );
          setCoinBalance(backendWalletBalance);
          logger.debug('✅ [Claim Reward] Local state updated to:', backendWalletBalance);
        } else {
          // Fallback: Try syncing via coin sync service (for backwards compatibility)
          logger.debug('⚠️ [Claim Reward] Backend did not return wallet balance, trying coin sync service...');

          const syncResult = await coinSyncService.handleChallengeReward(
            challengeId,
            'Challenge',
            coinsEarned
          );
          logger.debug('💰 [Claim Reward] Sync result:', JSON.stringify(syncResult, null, 2));

          if (syncResult.success) {
            logger.debug('✅ [Claim Reward] Sync successful!');
            logger.debug('✅ [Claim Reward] New wallet balance from sync:', syncResult.newWalletBalance);

            showAlert(
              'Reward Claimed! 🎉',
              `+${coinsEarned} coins added to your wallet!\nNew balance: ${syncResult.newWalletBalance} coins`,
              [{ text: 'Awesome!', style: 'default' }],
              'success'
            );
            setCoinBalance(syncResult.newWalletBalance);
          } else {
            logger.error('⚠️ [Claim Reward] Sync failed but claim succeeded');
            logger.error('⚠️ [Claim Reward] Sync error:', syncResult.error);

            showAlert(
              'Reward Claimed! 🎉',
              `+${coinsEarned} coins earned! Check your wallet for the updated balance.`,
              [{ text: 'Great!', style: 'default' }],
              'success'
            );
          }
        }

        // Wait a moment before reloading to ensure everything is synced
        logger.debug('⏳ [Claim Reward] Waiting 500ms before reload...');
        await new Promise(resolve => setTimeout(resolve, 500));

        logger.debug('🔄 [Claim Reward] Reloading challenges data...');
        await loadChallengesData();
        logger.debug('✅ [Claim Reward] Challenges reloaded. Final balance in state:', coinBalance);
        logger.debug('🎁 [Claim Reward] ========== CLAIM PROCESS COMPLETE ==========');
      } else {
        logger.error('❌ [Claim Reward] API returned success: false');
        showAlert('Error', 'Failed to claim reward. Please try again.', undefined, 'error');
      }
    } catch (error: any) {
      logger.error('❌ [Claim Reward] Error:', error);
      logger.error('❌ [Claim Reward] Error response:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || 'Failed to claim reward';

      // Special handling for "already claimed" error
      if (errorMessage.toLowerCase().includes('already claimed')) {
        showAlert(
          'Already Claimed! ✅',
          'You have already claimed this reward. The page will refresh to show the correct status.',
          [{ text: 'OK', onPress: () => loadChallengesData() }],
          'success'
        );
        // Force reload to get correct state
        await loadChallengesData();
      } else {
        showAlert(
          'Error',
          errorMessage,
          undefined,
          'error'
        );
      }
    } finally {
      setClaimingId(null);
    }
  };

  const getFilteredChallenges = () => {
    if (activeTab === 'completed') {
      return completedChallenges;
    }
    return challenges.filter((c) => c.challenge.type === activeTab);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return ['#4ECDC4', '#44A08D'];
      case 'medium':
        return ['#F093FB', '#F5576C'];
      case 'hard':
        return ['#FA709A', '#FEE140'];
      default:
        return ['#667EEA', '#764BA2'];
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return 'calendar';
      case 'weekly':
        return 'calendar-outline';
      case 'monthly':
        return 'calendar-sharp';
      default:
        return 'star';
    }
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const progress = (challenge.progress / challenge.target) * 100;
    const isCompleted = challenge.completed;
    const canClaim = isCompleted && !challenge.rewardsClaimed;
    const isClaimed = challenge.rewardsClaimed;
    const difficultyColors = getDifficultyColor(challenge.challenge.difficulty);

    return (
      <TouchableOpacity
        key={challenge._id}
        style={styles.challengeCard}
        activeOpacity={0.9}
        onPress={() => {
          // Navigate to challenge detail page
          router.push(`/challenges/${challenge._id}` as any);
        }}
      >
        <LinearGradient
          colors={isClaimed ? ['#E5E7EB', '#D1D5DB'] : difficultyColors}
          style={styles.challengeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIconContainer}>
              <Text style={styles.challengeIcon}>{challenge.challenge.icon}</Text>
            </View>

            <View style={styles.challengeInfo}>
              <View style={styles.challengeTitleRow}>
                <Text style={styles.challengeTitle}>{challenge.challenge.title}</Text>
                <View style={[styles.typeBadge, isClaimed && styles.typeBadgeClaimed]}>
                  <Ionicons
                    name={getTypeIcon(challenge.challenge.type) as any}
                    size={12}
                    color="white"
                  />
                  <Text style={styles.typeBadgeText}>
                    {challenge.challenge.type}
                  </Text>
                </View>
              </View>

              <Text style={styles.challengeDescription}>
                {challenge.challenge.description}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>

              {/* Rewards */}
              <View style={styles.rewardRow}>
                <View style={styles.rewardInfo}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rewardText}>
                    {challenge.challenge.rewards.coins} coins
                  </Text>
                  {challenge.challenge.rewards.multiplier && (
                    <Text style={styles.multiplierText}>
                      {challenge.challenge.rewards.multiplier}x
                    </Text>
                  )}
                </View>

                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>
                    {challenge.challenge.difficulty}
                  </Text>
                </View>
              </View>

              {/* Status Indicator */}
              {challenge.progress === 0 && !isClaimed && (
                <View style={styles.statusIndicator}>
                  <Ionicons name="play-circle-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.statusText}>Tap to start</Text>
                </View>
              )}

              {canClaim && (
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={() => handleClaimReward(challenge._id)}
                  disabled={claimingId === challenge._id}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.claimGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {claimingId === challenge._id ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.claimButtonText}>Claiming...</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.claimButtonText}>Claim Reward</Text>
                        <Ionicons name="gift" size={20} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {isClaimed && (
                <View style={styles.claimedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.claimedText}>Completed</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  const filteredChallenges = getFilteredChallenges();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        {/* Modern Gradient Header */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Daily Challenges</Text>
              <Text style={styles.headerSubtitle}>Complete tasks, earn rewards!</Text>
            </View>

            <TouchableOpacity
              style={styles.coinsBadge}
              onPress={() => router.push('/WalletScreen' as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']}
                style={styles.coinsBadgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.coinsText}>{coinBalance.toLocaleString()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.completionRate)}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {(['daily', 'weekly', 'monthly', 'completed'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    activeTab === tab
                      ? ['#8B5CF6', '#7C3AED']
                      : ['transparent', 'transparent']
                  }
                  style={styles.tabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={tab === 'completed' ? 'checkmark-circle' : (getTypeIcon(tab) as any)}
                    size={18}
                    color={activeTab === tab ? 'white' : '#6B7280'}
                  />
                  <Text
                    style={[styles.tabText, activeTab === tab && styles.activeTabText]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Challenges List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
            />
          }
        >
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge) => renderChallengeCard(challenge))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No {activeTab} challenges</Text>
              <Text style={styles.emptyDescription}>
                {activeTab === 'completed'
                  ? 'Complete challenges to see them here'
                  : 'New challenges will appear soon!'}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.refreshGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  coinsBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coinsBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabs: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  challengeCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: 'row',
  },
  challengeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeIcon: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeBadgeClaimed: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 12,
    minWidth: 50,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  multiplierText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderStyle: 'dashed',
  },
  statusText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  claimButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  claimGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
    gap: 8,
  },
  claimedText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  refreshGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
