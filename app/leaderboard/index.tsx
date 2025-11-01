// Leaderboard Page
// Display top users by coins with ranking and filters with real-time updates

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TierBadge from '@/components/subscription/TierBadge';
import gamificationAPI from '@/services/gamificationApi';
import { useLeaderboardRealtime } from '@/hooks/useLeaderboardRealtime';
import { useAuth } from '@/contexts/AuthContext';
import type { LeaderboardData, LeaderboardEntry } from '@/types/gamification.types';

type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';

export default function LeaderboardPage() {
  const router = useRouter();
  const { state } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Real-time leaderboard updates
  const {
    entries: realtimeEntries,
    userRank: realtimeUserRank,
    isConnected,
    isUpdating,
    lastUpdate,
    hasRecentRankUp,
  } = useLeaderboardRealtime(
    leaderboardData?.entries || [],
    state.user?.id,
    {
      onRankUp: (userId, newRank, oldRank) => {
        if (userId === state.user?.id) {
          triggerCelebration(`You ranked up from #${oldRank} to #${newRank}!`);
          scrollToUserPosition();
        }
      },
      onPointsEarned: (userId, points, source) => {
        if (userId === state.user?.id) {

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

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedPeriod]);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await gamificationAPI.getLeaderboard(selectedPeriod, 50);

      if (response.success && response.data) {
        setLeaderboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLeaderboard();
  };

  // Trigger celebration animation
  const triggerCelebration = (message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);

    // Animate celebration
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

  // Scroll to user's position
  const scrollToUserPosition = () => {
    if (scrollViewRef.current && realtimeUserRank) {
      // Scroll after a small delay to ensure layout is updated
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: realtimeUserRank.rank * 80, // Approximate card height
          animated: true,
        });
      }, 500);
    }
  };

  // Use real-time entries if available, otherwise use static data
  const displayEntries = realtimeEntries.length > 0 ? realtimeEntries : leaderboardData?.entries || [];
  const displayUserRank = realtimeUserRank || leaderboardData?.userRank;

  // Render medal for top 3
  const renderMedal = (rank: number) => {
    const medals = {
      1: { icon: 'medal', color: '#FFD700' }, // Gold
      2: { icon: 'medal', color: '#C0C0C0' }, // Silver
      3: { icon: 'medal', color: '#CD7F32' }, // Bronze
    };

    const medal = medals[rank as keyof typeof medals];
    if (!medal) return null;

    return (
      <View style={[styles.medalContainer, { backgroundColor: `${medal.color}20` }]}>
        <Ionicons name={medal.icon as any} size={24} color={medal.color} />
      </View>
    );
  };

  // Render leaderboard entry
  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isCurrentUser = entry.isCurrentUser;
    const isTopThree = entry.rank <= 3;
    const hasRankedUp = hasRecentRankUp(entry.userId, 10);

    return (
      <Animated.View
        key={entry.userId}
        style={[
          styles.entryCard,
          isCurrentUser && styles.currentUserCard,
          isTopThree && styles.topThreeCard,
          hasRankedUp && styles.rankedUpCard,
          { transform: [{ scale: isCurrentUser ? pulseAnim : 1 }] },
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {isTopThree ? (
            renderMedal(entry.rank)
          ) : (
            <ThemedText style={styles.rankText}>#{entry.rank}</ThemedText>
          )}
        </View>

        {/* Avatar */}
        <View style={[styles.avatar, isTopThree && styles.topThreeAvatar]}>
          {entry.avatar ? (
            <View style={styles.avatarPlaceholder}>
              <ThemedText style={styles.avatarText}>
                {entry.fullName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#6B7280" />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {entry.fullName} {isCurrentUser && '(You)'}
          </ThemedText>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Ionicons name="diamond" size={12} color="#F59E0B" />
              <ThemedText style={styles.statText}>{entry.coins.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={12} color="#8B5CF6" />
              <ThemedText style={styles.statText}>{entry.achievements}</ThemedText>
            </View>
          </View>
        </View>

        {/* Tier Badge */}
        <TierBadge tier={entry.tier} size="small" showIcon={false} />

        {/* Rank Up Indicator */}
        {hasRankedUp && (
          <View style={styles.rankUpBadge}>
            <Ionicons name="trending-up" size={12} color="#4CD964" />
            <ThemedText style={styles.rankUpText}>Ranked Up!</ThemedText>
          </View>
        )}
      </Animated.View>
    );
  };

  // Render period filter
  const renderPeriodButton = (period: Period, label: string) => (
    <TouchableOpacity
      style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
      onPress={() => setSelectedPeriod(period)}
    >
      <ThemedText
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Leaderboard</ThemedText>
            {isConnected && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveText}>LIVE</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            {isUpdating && (
              <ActivityIndicator size="small" color="#FFFFFF" />
            )}
          </View>
        </View>

        {/* Period Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.periodFilters}>
            {renderPeriodButton('daily', 'Daily')}
            {renderPeriodButton('weekly', 'Weekly')}
            {renderPeriodButton('monthly', 'Monthly')}
            {renderPeriodButton('all-time', 'All Time')}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading leaderboard...</ThemedText>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* User Rank Card */}
          {displayUserRank && (
            <View style={styles.userRankSection}>
              <ThemedText style={styles.sectionTitle}>Your Rank</ThemedText>
              {renderLeaderboardEntry(displayUserRank, -1)}
            </View>
          )}

          {/* Leaderboard List */}
          <View style={styles.leaderboardSection}>
            <ThemedText style={styles.sectionTitle}>
              Top {displayEntries.length || 50} Users
            </ThemedText>
            {displayEntries.map((entry, index) => renderLeaderboardEntry(entry, index))}

            {leaderboardData?.entries.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={64} color="#E5E7EB" />
                <ThemedText style={styles.emptyText}>No leaderboard data yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Start earning coins to appear on the leaderboard!
                </ThemedText>
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#8B5CF6" />
            <ThemedText style={styles.infoText}>
              Rankings update every hour. Earn coins through purchases, games, and challenges to
              climb the leaderboard!
            </ThemedText>
          </View>
        </ScrollView>
      )}

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
            colors={['#FFD700', '#FFA500']}
            style={styles.celebrationCard}
          >
            <Ionicons name="trophy" size={48} color="#FFFFFF" />
            <ThemedText style={styles.celebrationText}>{celebrationMessage}</ThemedText>
          </LinearGradient>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
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
    backgroundColor: '#4CD964',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    paddingLeft: 20,
  },
  periodFilters: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  periodButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#8B5CF6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  userRankSection: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  leaderboardSection: {
    padding: 20,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  topThreeCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
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
    marginRight: 12,
    overflow: 'hidden',
  },
  topThreeAvatar: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4F46E5',
    lineHeight: 18,
  },
  rankedUpCard: {
    borderWidth: 2,
    borderColor: '#4CD964',
    backgroundColor: '#F0FFF4',
  },
  rankUpBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CD964',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rankUpText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
