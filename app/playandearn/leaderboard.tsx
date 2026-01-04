import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import leaderboardApi, { LeaderboardEntry, UserRank } from '../../services/leaderboardApi';

const { width } = Dimensions.get('window');

// White theme colors
const COLORS = {
  white: '#FFFFFF',
  background: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  green500: '#22C55E',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  purple500: '#A855F7',
  blue500: '#3B82F6',
  orange500: '#F97316',
};

const avatarEmojis = ['👑', '🥈', '🥉', '🎯', '⭐', '🔥', '💎', '🚀', '✨', '⚡'];

const Leaderboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topUsers, setTopUsers] = useState<Array<{
    rank: number;
    name: string;
    coins: number;
    avatar: string;
    trend: string;
  }>>([]);
  const [myRank, setMyRank] = useState<{ rank: number; name: string; coins: number; trend: string } | null>(null);

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch spending leaderboard
      const leaderboardResponse = await leaderboardApi.getSpendingLeaderboard('week');
      if (leaderboardResponse.success && leaderboardResponse.data) {
        const users = leaderboardResponse.data.map((entry, index) => ({
          rank: entry.rank,
          name: entry.user.name,
          coins: entry.value,
          avatar: avatarEmojis[index] || '🏅',
          trend: `+${Math.floor(Math.random() * 200) + 100}` // Trend would come from API
        }));
        setTopUsers(users);
      } else {
        throw new Error(leaderboardResponse.error || 'Failed to load leaderboard');
      }

      // Fetch my rank (using same period as leaderboard)
      const myRankResponse = await leaderboardApi.getMyRank('week');
      if (myRankResponse.success && myRankResponse.data?.spending) {
        setMyRank({
          rank: myRankResponse.data.spending.rank,
          name: 'You',
          coins: myRankResponse.data.spending.value,
          trend: `+${Math.floor(Math.random() * 100) + 50}`
        });
      } else {
        // User might not be on leaderboard yet
        setMyRank(null);
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Unable to load leaderboard. Please try again.');
      setTopUsers([]);
      setMyRank(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Ionicons name="trophy" size={24} color={COLORS.amber500} />;
    if (rank === 2) return <Ionicons name="medal" size={24} color={COLORS.gray400} />;
    if (rank === 3) return <Ionicons name="medal" size={24} color={COLORS.orange500} />;
    return <Text style={styles.rankNumber}>#{rank}</Text>;
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Weekly Leaderboard</Text>
            <Text style={styles.headerSubtitle}>Top earners this week</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple500} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error && topUsers.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Weekly Leaderboard</Text>
              <Text style={styles.headerSubtitle}>Top earners this week</Text>
            </View>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color={COLORS.gray400} />
            <Text style={styles.errorTitle}>Unable to load leaderboard</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchLeaderboard()}>
              <LinearGradient
                colors={[COLORS.purple500, '#7C3AED']}
                style={styles.retryButtonGradient}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Weekly Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top earners this week</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.purple500]}
            tintColor={COLORS.purple500}
          />
        }
      >
        {/* Prize Banner */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(168, 85, 247, 0.15)', 'rgba(236, 72, 153, 0.15)']}
            style={styles.prizeBanner}
          >
            <Ionicons name="trophy" size={48} color={COLORS.amber500} />
            <Text style={styles.prizeTitle}>Weekly Prizes</Text>
            <View style={styles.prizeGrid}>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeLabel}>1st Place</Text>
                <Text style={[styles.prizeValue, { color: COLORS.amber500 }]}>₹5,000</Text>
              </View>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeLabel}>2-10th</Text>
                <Text style={[styles.prizeValue, { color: COLORS.purple500 }]}>₹1,000</Text>
              </View>
              <View style={styles.prizeItem}>
                <Text style={styles.prizeLabel}>11-100th</Text>
                <Text style={[styles.prizeValue, { color: COLORS.blue500 }]}>500 coins</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Top 3 Podium */}
        {topUsers.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={styles.podiumItem}>
              <View style={[styles.podiumAvatar, styles.podiumSecond]}>
                <Text style={styles.podiumAvatarText}>{topUsers[1].avatar}</Text>
              </View>
              <Text style={styles.podiumName}>{topUsers[1].name.split(' ')[0]}</Text>
              <Text style={styles.podiumCoins}>{topUsers[1].coins.toLocaleString()}</Text>
              <View style={[styles.podiumBar, { height: 80, backgroundColor: 'rgba(156,163,175,0.2)' }]}>
                <Text style={styles.podiumMedal}>🥈</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View style={styles.podiumItem}>
              <Ionicons name="trophy" size={24} color={COLORS.amber500} style={{ marginBottom: 4 }} />
              <View style={[styles.podiumAvatar, styles.podiumFirst]}>
                <Text style={styles.podiumAvatarTextLarge}>{topUsers[0].avatar}</Text>
              </View>
              <Text style={styles.podiumName}>{topUsers[0].name.split(' ')[0]}</Text>
              <Text style={[styles.podiumCoins, { color: COLORS.amber500, fontWeight: 'bold' }]}>
                {topUsers[0].coins.toLocaleString()}
              </Text>
              <LinearGradient
                colors={['rgba(245,158,11,0.3)', 'rgba(245,158,11,0.15)']}
                style={[styles.podiumBar, { height: 112 }]}
              >
                <Text style={styles.podiumTrophy}>🏆</Text>
              </LinearGradient>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumItem}>
              <View style={[styles.podiumAvatar, styles.podiumThird]}>
                <Text style={styles.podiumAvatarText}>{topUsers[2].avatar}</Text>
              </View>
              <Text style={styles.podiumName}>{topUsers[2].name.split(' ')[0]}</Text>
              <Text style={styles.podiumCoins}>{topUsers[2].coins.toLocaleString()}</Text>
              <View style={[styles.podiumBar, { height: 64, backgroundColor: 'rgba(249,115,22,0.2)' }]}>
                <Text style={styles.podiumMedal}>🥉</Text>
              </View>
            </View>
          </View>
        )}

        {/* Full Rankings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Rankings</Text>
          {topUsers.map((user) => (
            <View key={user.rank} style={styles.rankCard}>
              <View style={styles.rankPosition}>
                {getRankDisplay(user.rank)}
              </View>
              <Text style={styles.rankAvatar}>{user.avatar}</Text>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{user.name}</Text>
                <Text style={styles.rankCoinsText}>{user.coins.toLocaleString()} coins</Text>
              </View>
              <View style={styles.trendContainer}>
                <Ionicons name="trending-up" size={16} color={COLORS.green500} />
                <Text style={styles.trendText}>{user.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Your Rank */}
        <View style={styles.section}>
          {myRank ? (
            <>
              <LinearGradient
                colors={['#00C06A', '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.myRankCard}
              >
                <View style={styles.rankPosition}>
                  <Text style={styles.myRankNumber}>#{myRank.rank}</Text>
                </View>
                <Text style={styles.rankAvatar}>👤</Text>
                <View style={styles.rankInfo}>
                  <Text style={styles.myRankName}>{myRank.name}</Text>
                  <Text style={styles.myRankCoins}>{myRank.coins.toLocaleString()} coins</Text>
                </View>
                <View style={styles.trendContainer}>
                  <Ionicons name="trending-up" size={16} color="#FFF" />
                  <Text style={styles.myTrendText}>{myRank.trend}</Text>
                </View>
              </LinearGradient>
              <Text style={styles.motivationText}>
                {myRank.rank <= 100
                  ? "You're in the Top 100! Keep it up!"
                  : `Earn ${(11280 - myRank.coins).toLocaleString()} more to reach Top 100!`}
              </Text>
            </>
          ) : (
            <View style={styles.noRankCard}>
              <Ionicons name="person-circle-outline" size={48} color={COLORS.gray400} />
              <Text style={styles.noRankTitle}>Start earning to join the leaderboard!</Text>
              <Text style={styles.noRankText}>Complete purchases and challenges to earn coins</Text>
            </View>
          )}
        </View>

        {/* Motivational CTAs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Climb the Leaderboard!</Text>
          <Text style={styles.sectionSubtitle}>Complete these actions to earn more coins</Text>

          <TouchableOpacity onPress={() => router.push('/playandearn' as any)}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.15)', 'rgba(234, 179, 8, 0.1)']}
              style={styles.ctaCard}
            >
              <View style={[styles.ctaIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Ionicons name="locate" size={20} color={COLORS.amber500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Daily Challenges</Text>
                <Text style={styles.ctaDesc}>Complete tasks & earn up to 500 coins/day</Text>
              </View>
              <View style={[styles.ctaBadge, { backgroundColor: COLORS.amber500 }]}>
                <Text style={styles.ctaBadgeText}>+500</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/refer' as any)}>
            <LinearGradient
              colors={['rgba(168, 85, 247, 0.15)', 'rgba(236, 72, 153, 0.1)']}
              style={styles.ctaCard}
            >
              <View style={[styles.ctaIcon, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                <Ionicons name="gift" size={20} color={COLORS.purple500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Refer & Earn Big</Text>
                <Text style={styles.ctaDesc}>Get 1000 coins for each friend you invite</Text>
              </View>
              <View style={[styles.ctaBadge, { backgroundColor: COLORS.purple500 }]}>
                <Text style={styles.ctaBadgeText}>+1000</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/mall' as any)}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.15)', 'rgba(6, 182, 212, 0.1)']}
              style={styles.ctaCard}
            >
              <View style={[styles.ctaIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="rocket" size={20} color={COLORS.blue500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Shop & Earn</Text>
                <Text style={styles.ctaDesc}>Earn coins on every purchase you make</Text>
              </View>
              <View style={[styles.ctaBadge, { backgroundColor: COLORS.blue500 }]}>
                <Text style={styles.ctaBadgeText}>Up to 10%</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Motivational Message */}
          <LinearGradient
            colors={['rgba(0, 192, 106, 0.1)', 'rgba(20, 184, 166, 0.1)']}
            style={styles.motivationalCard}
          >
            <Ionicons name="trophy" size={48} color={COLORS.amber500} />
            <Text style={styles.motivationalTitle}>You're on Your Way! 🚀</Text>
            <Text style={styles.motivationalText2}>
              Complete daily tasks, refer friends, and shop smart to climb the ranks!
            </Text>
            <LinearGradient
              colors={['#00C06A', '#14B8A6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.keepGoingButton}
            >
              <Text style={styles.keepGoingText}>Keep Going!</Text>
              <Ionicons name="trending-up" size={16} color="#FFF" />
            </LinearGradient>
          </LinearGradient>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray500,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  noRankCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  noRankTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginTop: 12,
    marginBottom: 4,
  },
  noRankText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 16,
  },
  prizeBanner: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  prizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginTop: 12,
    marginBottom: 16,
  },
  prizeGrid: {
    flexDirection: 'row',
    gap: 32,
  },
  prizeItem: {
    alignItems: 'center',
  },
  prizeLabel: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  prizeValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 4,
    borderColor: 'rgba(245,158,11,0.5)',
  },
  podiumSecond: {
    backgroundColor: 'rgba(156,163,175,0.2)',
  },
  podiumThird: {
    backgroundColor: 'rgba(249,115,22,0.2)',
  },
  podiumAvatarText: {
    fontSize: 28,
  },
  podiumAvatarTextLarge: {
    fontSize: 36,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  podiumCoins: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumMedal: {
    fontSize: 24,
  },
  podiumTrophy: {
    fontSize: 28,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.gray50,
    marginBottom: 8,
    gap: 16,
  },
  rankPosition: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray500,
  },
  rankAvatar: {
    fontSize: 28,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  rankCoinsText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.green500,
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  myRankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  myRankName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  myRankCoins: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  myTrendText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  motivationText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 8,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 2,
  },
  ctaDesc: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  ctaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ctaBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  motivationalCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,192,106,0.2)',
  },
  motivationalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginTop: 12,
    marginBottom: 8,
  },
  motivationalText2: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 16,
  },
  keepGoingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  keepGoingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default Leaderboard;
