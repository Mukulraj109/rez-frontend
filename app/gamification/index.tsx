import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/services/apiClient';
import walletApi from '@/services/walletApi';
import coinSyncService from '@/services/coinSyncService';

export default function GamificationDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'leaderboards'>('challenges');

  const [challenges, setChallenges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  // ✅ NEW: Store coin balance from wallet API (single source of truth)
  const [coinBalance, setCoinBalance] = useState<number>(0);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);

      // ✅ UPDATED: Fetch coin balance from wallet API (single source of truth)
      const [challengesRes, achievementsRes, streaksRes, statsRes, walletRes] = await Promise.all([
        apiClient.get('/challenges/my-progress'),
        apiClient.get('/achievements'),
        apiClient.get('/streaks'),
        apiClient.get('/gamification/stats'),
        walletApi.getBalance(),
      ]);

      setChallenges((challengesRes.data as any)?.data || []);
      setAchievements((achievementsRes.data as any)?.data || []);
      setStreaks((streaksRes.data as any)?.data || {});
      setStats((statsRes.data as any)?.data || {});

      // ✅ Extract coin balance from wallet
      if (walletRes.success && walletRes.data) {
        const rezCoin = walletRes.data.coins.find((c: any) => c.type === 'rez');
        const walletCoins = rezCoin?.amount || 0;
        setCoinBalance(walletCoins);
        console.log(`✅ [GAMIFICATION] Wallet balance loaded: ${walletCoins}`);
      } else {
        console.warn('⚠️ [GAMIFICATION] Could not load wallet balance');
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGamificationData();
  };

  const handleClaimChallenge = async (challengeId: string) => {
    try {
      const response = await apiClient.post(`/challenges/${challengeId}/claim`);

      if ((response.data as any).success) {
        const coinsEarned = (response.data as any).data.rewards.coins;

        // ✅ UPDATED: Sync claimed coins to wallet
        console.log(`🏆 [GAMIFICATION] Challenge claimed, syncing ${coinsEarned} coins to wallet...`);

        const syncResult = await coinSyncService.handleChallengeReward(
          challengeId,
          (response.data as any).data.challenge?.title || 'Challenge',
          coinsEarned
        );

        if (syncResult.success) {
          alert(`Claimed ${coinsEarned} coins! New balance: ${syncResult.newWalletBalance}`);
          setCoinBalance(syncResult.newWalletBalance);
        } else {
          alert(`Claimed ${coinsEarned} coins!`);
        }

        loadGamificationData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to claim rewards');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Modern Gradient Header */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Gamification Hub</Text>
              <Text style={styles.subtitle}>Complete challenges, earn rewards!</Text>
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
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.coinsText}>{coinBalance.toLocaleString()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Modern Streak Section */}
        <View style={styles.streakContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Streaks</Text>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
          </View>
          <View style={styles.streakRow}>
            {Object.entries(streaks).map(([type, data]: [string, any]) => (
              <TouchableOpacity
                key={type}
                style={styles.streakCard}
                onPress={() => router.push('/gamification/streaks' as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    type === 'login'
                      ? ['#667EEA', '#764BA2']
                      : type === 'order'
                      ? ['#F093FB', '#F5576C']
                      : ['#4FACFE', '#00F2FE']
                  }
                  style={styles.streakGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.streakIconContainer}>
                    <Text style={styles.streakIcon}>
                      {type === 'login' ? '📅' : type === 'order' ? '🛒' : '⭐'}
                    </Text>
                  </View>
                  <Text style={styles.streakCount}>{data.current}</Text>
                  <Text style={styles.streakLabel}>{type}</Text>
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakBadgeText}>+{data.current} days</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            Achievements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboards' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboards')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboards' && styles.activeTabText]}>
            Leaderboards
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'challenges' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              onClaim={handleClaimChallenge}
            />
          ))}

          {challenges.length === 0 && (
            <Text style={styles.emptyText}>No active challenges</Text>
          )}
        </View>
      )}

      {activeTab === 'achievements' && (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievements.slice(0, 10).map((achievement) => (
            <AchievementCard key={achievement._id} achievement={achievement} />
          ))}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/gamification/achievements' as any)}
          >
            <Text style={styles.viewAllText}>View All Achievements</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'leaderboards' && (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.leaderboardCard}
            onPress={() => router.push('/gamification/leaderboards' as any)}
          >
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.leaderboardTitle}>View Leaderboards</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}

        {/* Modern Mini Games Section */}
        <View style={styles.quickAccess}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mini Games</Text>
            <Ionicons name="game-controller" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.gameRow}>
            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/games/spin-wheel' as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B6B', '#EE5A6F']}
                style={styles.gameGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gameIconBg}>
                  <Text style={styles.gameIcon}>🎡</Text>
                </View>
                <Text style={styles.gameTitle}>Spin Wheel</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/scratch-card' as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.gameGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gameIconBg}>
                  <Text style={styles.gameIcon}>🎫</Text>
                </View>
                <Text style={styles.gameTitle}>Scratch Card</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gameCard}
              onPress={() => router.push('/games/quiz' as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#A8E6CF', '#88D4AB']}
                style={styles.gameGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.gameIconBg}>
                  <Text style={styles.gameIcon}>🧠</Text>
                </View>
                <Text style={styles.gameTitle}>Quiz</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function ChallengeCard({ challenge, onClaim }: any) {
  const progress = (challenge.progress / challenge.target) * 100;
  const isCompleted = challenge.completed;
  const canClaim = isCompleted && !challenge.rewardsClaimed;

  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeIcon}>{challenge.challenge?.icon || '🎯'}</Text>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.challenge?.title}</Text>
          <Text style={styles.challengeDesc}>{challenge.challenge?.description}</Text>
        </View>
      </View>

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
      <View style={styles.rewardsContainer}>
        <Text style={styles.rewardText}>
          💰 {challenge.challenge?.rewards.coins} coins
        </Text>
        {canClaim && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => onClaim(challenge._id)}
          >
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>
        )}
        {challenge.rewardsClaimed && (
          <Text style={styles.claimedText}>✅ Claimed</Text>
        )}
      </View>
    </View>
  );
}

function AchievementCard({ achievement }: any) {
  const progress = (achievement.progress / achievement.target) * 100;

  return (
    <View style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDesc}>{achievement.description}</Text>
        </View>
        {achievement.unlocked && <Text style={styles.unlockedBadge}>✅</Text>}
      </View>

      {!achievement.unlocked && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.target}
          </Text>
        </View>
      )}

      <View style={styles.achievementRewards}>
        <Text style={styles.tierBadge}>{achievement.tier.toUpperCase()}</Text>
        <Text style={styles.rewardText}>💰 {achievement.rewards.coins}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  coinsBadge: {
    borderRadius: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  coinsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  streakContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  streakCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  streakGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  streakIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  streakIcon: {
    fontSize: 32,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  streakBadgeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  challengeCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    minWidth: 50,
    textAlign: 'right',
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    color: '#666',
  },
  claimButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  claimButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  claimedText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  achievementCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  achievementHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  unlockedBadge: {
    fontSize: 24,
  },
  achievementRewards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  leaderboardCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  quickAccess: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 8,
    marginBottom: 16,
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gameCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  gameGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  gameIconBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gameIcon: {
    fontSize: 36,
  },
  gameTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 32,
  },
  viewAllButton: {
    backgroundColor: '#8B5CF6',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewAllText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
