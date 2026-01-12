import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import leaderboardApi, { LeaderboardEntry } from '../../services/leaderboardApi';
import { useLeaderboardRealtime } from '@/hooks/useLeaderboardRealtime';
import { useAuth } from '@/contexts/AuthContext';
import TierBadge from '@/components/subscription/TierBadge';

const { width } = Dimensions.get('window');

// Color theme matching leaderboard/index.tsx
const COLORS = {
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  white: '#FFFFFF',
  background: '#F9FAFB',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  green500: '#22C55E',
  greenDark: '#16A34A',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  blue500: '#3B82F6',
};

type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';

interface DisplayEntry {
  rank: number;
  userId: string;
  name: string;
  coins: number;
  avatar?: string;
  tier?: string;
  isCurrentUser?: boolean;
}

const Leaderboard = () => {
  const router = useRouter();
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('weekly');
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [myRank, setMyRank] = useState<DisplayEntry | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Convert entries for real-time hook
  const realtimeInitialEntries = entries.map(e => ({
    rank: e.rank,
    userId: e.userId,
    username: e.name,
    fullName: e.name,
    coins: e.coins,
    level: 1,
    tier: (e.tier || 'free') as 'free' | 'plus' | 'premium' | 'elite',
    achievements: 0,
    isCurrentUser: e.isCurrentUser || false,
  }));

  // Real-time leaderboard updates
  const {
    entries: realtimeEntries,
    userRank: realtimeUserRank,
    isConnected,
    isUpdating,
    hasRecentRankUp,
  } = useLeaderboardRealtime(
    realtimeInitialEntries,
    state.user?.id,
    {
      onRankUp: (userId, newRank, oldRank) => {
        if (userId === state.user?.id) {
          triggerCelebration(`You ranked up from #${oldRank} to #${newRank}!`);
        }
      },
      onLeaderboardUpdate: () => {
        // Pulse animation on update
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }
  );

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch spending leaderboard with current period
      const leaderboardResponse = await leaderboardApi.getSpendingLeaderboard(selectedPeriod, 50);

      if (leaderboardResponse.success && leaderboardResponse.data) {
        const displayEntries: DisplayEntry[] = leaderboardResponse.data.map((entry, index) => ({
          rank: entry.rank,
          userId: entry.user._id,
          name: entry.user.name,
          coins: entry.value,
          avatar: entry.user.avatar,
          tier: 'free',
          isCurrentUser: entry.user._id === state.user?.id,
        }));
        setEntries(displayEntries);
      } else {
        throw new Error(leaderboardResponse.error || 'Failed to load leaderboard');
      }

      // Fetch my rank
      const myRankResponse = await leaderboardApi.getMyRank(selectedPeriod);
      if (myRankResponse.success && myRankResponse.data?.spending) {
        setMyRank({
          rank: myRankResponse.data.spending.rank,
          userId: state.user?.id || '',
          name: state.user?.name || 'You',
          coins: myRankResponse.data.spending.value,
          tier: 'free',
          isCurrentUser: true,
        });
      } else {
        setMyRank(null);
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Unable to load leaderboard. Please try again.');
      setEntries([]);
      setMyRank(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod, state.user?.id, state.user?.name]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  // Trigger celebration animation
  const triggerCelebration = (message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);

    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCelebration(false);
    });
  };

  // Get medal color for top 3
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return COLORS.gold;
      case 2: return COLORS.silver;
      case 3: return COLORS.bronze;
      default: return COLORS.gray500;
    }
  };

  // Render medal for top 3
  const renderMedal = (rank: number) => {
    if (rank > 3) return null;

    return (
      <View style={[styles.medalContainer, { backgroundColor: `${getMedalColor(rank)}20` }]}>
        <Ionicons name="medal" size={24} color={getMedalColor(rank)} />
      </View>
    );
  };

  // Render period filter button
  const renderPeriodButton = (period: Period, label: string) => (
    <TouchableOpacity
      style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
      onPress={() => setSelectedPeriod(period)}
      accessibilityLabel={`${label} leaderboard`}
      accessibilityRole="button"
      accessibilityState={{ selected: selectedPeriod === period }}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render leaderboard entry
  const renderEntry = (entry: DisplayEntry, index: number) => {
    const isTopThree = entry.rank <= 3;
    const hasRankedUp = hasRecentRankUp(entry.userId, 10);

    return (
      <Animated.View
        key={entry.userId}
        style={[
          styles.entryCard,
          entry.isCurrentUser && styles.currentUserCard,
          isTopThree && styles.topThreeCard,
          hasRankedUp && styles.rankedUpCard,
          { transform: [{ scale: entry.isCurrentUser ? pulseAnim : 1 }] },
        ]}
        accessibilityLabel={`Rank ${entry.rank}. ${entry.name}${entry.isCurrentUser ? ' - You' : ''}. ${entry.coins.toLocaleString()} rupees spent`}
        accessibilityRole="text"
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {isTopThree ? (
            renderMedal(entry.rank)
          ) : (
            <Text style={styles.rankText}>#{entry.rank}</Text>
          )}
        </View>

        {/* Avatar */}
        <View style={[styles.avatar, isTopThree && styles.topThreeAvatar]}>
          {entry.avatar ? (
            <Image source={{ uri: entry.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {entry.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {entry.name} {entry.isCurrentUser && '(You)'}
          </Text>
          <View style={styles.userStats}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <Text style={styles.coinsText}>{entry.coins.toLocaleString()}</Text>
          </View>
        </View>

        {/* Tier Badge */}
        {entry.tier && (
          <TierBadge tier={entry.tier as any} size="small" showIcon={false} />
        )}

        {/* Rank Up Indicator */}
        {hasRankedUp && (
          <View style={styles.rankUpBadge}>
            <Ionicons name="trending-up" size={12} color="#FFF" />
          </View>
        )}
      </Animated.View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Spending Leaderboard</Text>
              <View style={styles.headerRight} />
            </View>
          </LinearGradient>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Spending Leaderboard</Text>
              <View style={styles.headerRight} />
            </View>
          </LinearGradient>
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color={COLORS.gray400} />
            <Text style={styles.errorTitle}>Unable to load leaderboard</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchLeaderboard()}
              accessibilityLabel="Retry loading"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Header with Gradient */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Spending Leaderboard</Text>
              {isConnected && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              {isUpdating && (
                <ActivityIndicator size="small" color={COLORS.white} />
              )}
            </View>
          </View>

          {/* Period Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {renderPeriodButton('daily', 'Daily')}
            {renderPeriodButton('weekly', 'Weekly')}
            {renderPeriodButton('monthly', 'Monthly')}
            {renderPeriodButton('all-time', 'All Time')}
          </ScrollView>
        </LinearGradient>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Prize Banner */}
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
              style={styles.prizeBanner}
            >
              <Ionicons name="trophy" size={48} color={COLORS.amber500} />
              <Text style={styles.prizeTitle}>
                {selectedPeriod === 'weekly' ? 'Weekly' : selectedPeriod === 'daily' ? 'Daily' : selectedPeriod === 'monthly' ? 'Monthly' : 'All Time'} Prizes
              </Text>
              <View style={styles.prizeGrid}>
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeLabel}>1st Place</Text>
                  <Text style={[styles.prizeValue, { color: COLORS.gold }]}>
                    ₹{selectedPeriod === 'weekly' ? '5,000' : selectedPeriod === 'daily' ? '500' : selectedPeriod === 'monthly' ? '20,000' : '50,000'}
                  </Text>
                </View>
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeLabel}>2-10th</Text>
                  <Text style={[styles.prizeValue, { color: COLORS.primary }]}>
                    ₹{selectedPeriod === 'weekly' ? '1,000' : selectedPeriod === 'daily' ? '100' : selectedPeriod === 'monthly' ? '5,000' : '10,000'}
                  </Text>
                </View>
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeLabel}>11-100th</Text>
                  <Text style={[styles.prizeValue, { color: COLORS.blue500 }]}>
                    ₹{selectedPeriod === 'weekly' ? '500' : selectedPeriod === 'daily' ? '50' : selectedPeriod === 'monthly' ? '1,000' : '2,000'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Your Rank Section */}
          {myRank && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rank</Text>
              <LinearGradient
                colors={[COLORS.green500, COLORS.greenDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.myRankCard}
              >
                <View style={styles.myRankPosition}>
                  <Text style={styles.myRankNumber}>#{myRank.rank}</Text>
                </View>
                <View style={styles.myRankAvatar}>
                  <Text style={styles.myRankAvatarText}>
                    {myRank.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.myRankInfo}>
                  <Text style={styles.myRankName}>{myRank.name}</Text>
                  <Text style={styles.myRankCoins}>₹{myRank.coins.toLocaleString()} spent</Text>
                </View>
                <Ionicons name="trending-up" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
              <Text style={styles.motivationText}>
                {myRank.rank <= 10
                  ? "Amazing! You're in the Top 10!"
                  : myRank.rank <= 100
                  ? "Great job! You're in the Top 100!"
                  : `Keep going to reach Top 100!`}
              </Text>
            </View>
          )}

          {/* No Rank State */}
          {!myRank && (
            <View style={styles.section}>
              <View style={styles.noRankCard}>
                <Ionicons name="cart-outline" size={48} color={COLORS.gray400} />
                <Text style={styles.noRankTitle}>Start shopping to join the leaderboard!</Text>
                <Text style={styles.noRankText}>Make your first purchase to appear on the rankings</Text>
              </View>
            </View>
          )}

          {/* Top 3 Podium */}
          {entries.length >= 3 && (
            <View style={styles.podiumContainer}>
              {/* 2nd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatar, styles.podiumSecond]}>
                  {entries[1].avatar ? (
                    <Image source={{ uri: entries[1].avatar }} style={styles.podiumAvatarImage} />
                  ) : (
                    <Text style={styles.podiumAvatarText}>
                      {entries[1].name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{entries[1].name.split(' ')[0]}</Text>
                <Text style={styles.podiumCoins}>₹{entries[1].coins.toLocaleString()}</Text>
                <View style={[styles.podiumBar, { height: 80, backgroundColor: `${COLORS.silver}30` }]}>
                  <Ionicons name="medal" size={28} color={COLORS.silver} />
                  <Text style={styles.podiumRank}>2</Text>
                </View>
              </View>

              {/* 1st Place */}
              <View style={styles.podiumItem}>
                <Ionicons name="trophy" size={28} color={COLORS.gold} style={{ marginBottom: 4 }} />
                <View style={[styles.podiumAvatar, styles.podiumFirst]}>
                  {entries[0].avatar ? (
                    <Image source={{ uri: entries[0].avatar }} style={styles.podiumAvatarImageLarge} />
                  ) : (
                    <Text style={styles.podiumAvatarTextLarge}>
                      {entries[0].name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={[styles.podiumName, { fontWeight: '700' }]} numberOfLines={1}>{entries[0].name.split(' ')[0]}</Text>
                <Text style={[styles.podiumCoins, { color: COLORS.gold, fontWeight: 'bold' }]}>
                  ₹{entries[0].coins.toLocaleString()}
                </Text>
                <LinearGradient
                  colors={[`${COLORS.gold}40`, `${COLORS.gold}20`]}
                  style={[styles.podiumBar, { height: 112 }]}
                >
                  <Ionicons name="trophy" size={32} color={COLORS.gold} />
                  <Text style={[styles.podiumRank, { color: COLORS.gold }]}>1</Text>
                </LinearGradient>
              </View>

              {/* 3rd Place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumAvatar, styles.podiumThird]}>
                  {entries[2].avatar ? (
                    <Image source={{ uri: entries[2].avatar }} style={styles.podiumAvatarImage} />
                  ) : (
                    <Text style={styles.podiumAvatarText}>
                      {entries[2].name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{entries[2].name.split(' ')[0]}</Text>
                <Text style={styles.podiumCoins}>₹{entries[2].coins.toLocaleString()}</Text>
                <View style={[styles.podiumBar, { height: 64, backgroundColor: `${COLORS.bronze}30` }]}>
                  <Ionicons name="medal" size={24} color={COLORS.bronze} />
                  <Text style={styles.podiumRank}>3</Text>
                </View>
              </View>
            </View>
          )}

          {/* Full Rankings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Rankings</Text>
            {entries.map((entry, index) => renderEntry(entry, index))}

            {entries.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={64} color={COLORS.gray200} />
                <Text style={styles.emptyText}>No leaderboard data yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to make a purchase and claim the top spot!
                </Text>
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Rankings are based on total spending. The more you shop, the higher you climb! Top spenders win exciting prizes.
              </Text>
            </View>
          </View>

          {/* CTAs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Climb the Leaderboard!</Text>
            <Text style={styles.sectionSubtitle}>Shop more to increase your rank</Text>

            <TouchableOpacity
              onPress={() => router.push('/mall' as any)}
              accessibilityLabel="Browse mall"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.15)', 'rgba(6, 182, 212, 0.1)']}
                style={styles.ctaCard}
              >
                <View style={[styles.ctaIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Ionicons name="storefront" size={20} color={COLORS.blue500} />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Browse Mall</Text>
                  <Text style={styles.ctaDesc}>Explore top brands and exclusive deals</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/offers' as any)}
              accessibilityLabel="View offers"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.15)', 'rgba(234, 179, 8, 0.1)']}
                style={styles.ctaCard}
              >
                <View style={[styles.ctaIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Ionicons name="pricetag" size={20} color={COLORS.amber500} />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Hot Offers</Text>
                  <Text style={styles.ctaDesc}>Get amazing discounts on your purchases</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/refer' as any)}
              accessibilityLabel="Refer friends"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.1)']}
                style={styles.ctaCard}
              >
                <View style={[styles.ctaIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Ionicons name="people" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Refer Friends</Text>
                  <Text style={styles.ctaDesc}>Invite friends and earn rewards together</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom spacer */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Celebration Overlay */}
        {showCelebration && (
          <Animated.View
            style={[
              styles.celebrationOverlay,
              {
                opacity: celebrationAnim,
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.gold, COLORS.amber500]}
              style={styles.celebrationCard}
            >
              <Ionicons name="trophy" size={48} color={COLORS.white} />
              <Text style={styles.celebrationText}>{celebrationMessage}</Text>
            </LinearGradient>
          </Animated.View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green500,
  },
  liveText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    marginTop: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodButtonActive: {
    backgroundColor: COLORS.white,
  },
  periodButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: COLORS.primary,
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 16,
    marginTop: -8,
  },
  prizeBanner: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
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
    marginBottom: 4,
  },
  prizeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  myRankPosition: {
    width: 48,
    alignItems: 'center',
  },
  myRankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  myRankAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myRankAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  myRankInfo: {
    flex: 1,
  },
  myRankName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  myRankCoins: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  motivationText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 12,
  },
  noRankCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
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
    overflow: 'hidden',
  },
  podiumFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.gold}30`,
    borderWidth: 4,
    borderColor: COLORS.gold,
  },
  podiumSecond: {
    backgroundColor: `${COLORS.silver}30`,
    borderWidth: 2,
    borderColor: COLORS.silver,
  },
  podiumThird: {
    backgroundColor: `${COLORS.bronze}30`,
    borderWidth: 2,
    borderColor: COLORS.bronze,
  },
  podiumAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  podiumAvatarImageLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  podiumAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
  },
  podiumAvatarTextLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.navy,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
  },
  podiumCoins: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 8,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  podiumRank: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#F5F3FF',
  },
  topThreeCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  rankedUpCard: {
    borderWidth: 2,
    borderColor: COLORS.green500,
    backgroundColor: '#F0FFF4',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  medalContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  topThreeAvatar: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinsText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  rupeeSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.green500,
  },
  rankUpBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.green500,
    padding: 4,
    borderRadius: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray500,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray400,
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4F46E5',
    lineHeight: 18,
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
    color: COLORS.white,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  celebrationCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default Leaderboard;
