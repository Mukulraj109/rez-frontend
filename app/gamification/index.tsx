import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/services/apiClient';

export default function GamificationDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'leaderboards'>('challenges');

  const [challenges, setChallenges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any>({});
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);

      const [challengesRes, achievementsRes, streaksRes, statsRes] = await Promise.all([
        apiClient.get('/challenges/my-progress'),
        apiClient.get('/achievements'),
        apiClient.get('/streaks'),
        apiClient.get('/gamification/stats'),
      ]);

      setChallenges((challengesRes.data as any)?.data || []);
      setAchievements((achievementsRes.data as any)?.data || []);
      setStreaks((streaksRes.data as any)?.data || {});
      setStats((statsRes.data as any)?.data || {});
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
        // Show success message
        alert(`Claimed ${(response.data as any).data.rewards.coins} coins!`);
        loadGamificationData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to claim rewards');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gamification Hub</Text>
        <Text style={styles.subtitle}>Complete challenges, earn rewards!</Text>
      </View>

      {/* Streak Section */}
      <View style={styles.streakContainer}>
        <Text style={styles.sectionTitle}>Your Streaks 🔥</Text>
        <View style={styles.streakRow}>
          {Object.entries(streaks).map(([type, data]: [string, any]) => (
            <TouchableOpacity
              key={type}
              style={styles.streakCard}
              onPress={() => router.push('/gamification/streaks' as any)}
            >
              <Text style={styles.streakIcon}>
                {type === 'login' ? '📅' : type === 'order' ? '🛒' : '⭐'}
              </Text>
              <Text style={styles.streakCount}>{data.current}</Text>
              <Text style={styles.streakLabel}>{type}</Text>
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

      {/* Quick Access */}
      <View style={styles.quickAccess}>
        <Text style={styles.sectionTitle}>Mini Games</Text>
        <View style={styles.gameRow}>
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => router.push('/games/spin-wheel' as any)}
          >
            <Text style={styles.gameIcon}>🎡</Text>
            <Text style={styles.gameTitle}>Spin Wheel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => router.push('/games/scratch-card' as any)}
          >
            <Text style={styles.gameIcon}>🎫</Text>
            <Text style={styles.gameTitle}>Scratch Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => router.push('/games/quiz' as any)}
          >
            <Text style={styles.gameIcon}>🧠</Text>
            <Text style={styles.gameTitle}>Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 4,
  },
  streakContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakCard: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    width: 100,
  },
  streakIcon: {
    fontSize: 32,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  challengeCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: '#4F46E5',
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
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  leaderboardCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  quickAccess: {
    padding: 16,
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 32,
  },
  viewAllButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  viewAllText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
