import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import partnerApi, { PartnerStats } from '@/services/partnerApi';

const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  navy: '#0B2240',
  surface: '#F7FAFC',
  white: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

interface TopPerformer {
  _id: string;
  name: string;
  totalOrders: number;
  currentLevel: {
    name: string;
  };
  avatar?: string;
}

export default function PartnerLeaderboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const response = await partnerApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load leaderboard data');
      }
    } catch (err) {
      console.error('Error fetching partner stats:', err);
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return COLORS.gold;
      case 2: return COLORS.silver;
      case 3: return COLORS.bronze;
      default: return COLORS.textSecondary;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'ribbon';
      default: return 'star';
    }
  };

  const renderTopPerformer = (performer: TopPerformer, index: number) => {
    const rank = index + 1;
    const isTop3 = rank <= 3;

    return (
      <View
        key={performer._id}
        style={[
          styles.performerCard,
          isTop3 && styles.topPerformerCard,
          rank === 1 && styles.firstPlaceCard,
        ]}
      >
        {/* Rank Badge */}
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) + '20' }]}>
          {isTop3 ? (
            <Ionicons
              name={getRankIcon(rank) as any}
              size={20}
              color={getRankColor(rank)}
            />
          ) : (
            <Text style={[styles.rankNumber, { color: getRankColor(rank) }]}>
              #{rank}
            </Text>
          )}
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {performer.avatar ? (
            <Image source={{ uri: performer.avatar }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.avatarPlaceholder}
            >
              <Text style={styles.avatarInitial}>
                {performer.name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </LinearGradient>
          )}
          {rank === 1 && (
            <View style={styles.crownBadge}>
              <Text style={styles.crownEmoji}>👑</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.performerInfo}>
          <Text style={styles.performerName} numberOfLines={1}>
            {performer.name || 'Partner'}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {performer.currentLevel?.name || 'Partner'}
            </Text>
          </View>
        </View>

        {/* Orders Count */}
        <View style={styles.ordersContainer}>
          <Text style={styles.ordersCount}>{performer.totalOrders}</Text>
          <Text style={styles.ordersLabel}>orders</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {/* Show info modal */}}
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
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
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Your Rank Card */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.yourRankCard}
            >
              <View style={styles.yourRankContent}>
                <View style={styles.yourRankLeft}>
                  <Text style={styles.yourRankLabel}>Your Rank</Text>
                  <View style={styles.yourRankRow}>
                    <Text style={styles.yourRankNumber}>
                      #{stats?.userRank || '-'}
                    </Text>
                    <Text style={styles.yourRankTotal}>
                      of {stats?.totalPartners || 0} partners
                    </Text>
                  </View>
                </View>
                <View style={styles.yourRankRight}>
                  <Ionicons name="podium" size={48} color="rgba(255,255,255,0.3)" />
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{stats?.totalPartners || 0}</Text>
                  <Text style={styles.quickStatLabel}>Total Partners</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{stats?.averageOrders || 0}</Text>
                  <Text style={styles.quickStatLabel}>Avg Orders</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Top Performers Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Performers</Text>
                <View style={styles.trophyIcon}>
                  <Text style={styles.trophyEmoji}>🏆</Text>
                </View>
              </View>

              {stats?.topPerformers && stats.topPerformers.length > 0 ? (
                stats.topPerformers.map((performer, index) =>
                  renderTopPerformer(performer, index)
                )
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyStateText}>No performers yet</Text>
                  <Text style={styles.emptyStateSubtext}>Be the first to climb the ranks!</Text>
                </View>
              )}
            </View>

            {/* How to Climb Section */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>How to Climb the Ranks</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="cart" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.tipText}>Complete more orders to earn points</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.tipText}>Finish reward tasks for bonus rankings</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="trending-up" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.tipText}>Level up to unlock higher multipliers</Text>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(tabs)')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.ctaButtonGradient}
              >
                <Text style={styles.ctaButtonText}>Shop Now & Climb Ranks</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  yourRankCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  yourRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  yourRankLeft: {
    flex: 1,
  },
  yourRankLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  yourRankRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  yourRankNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
  },
  yourRankTotal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  yourRankRight: {
    opacity: 0.8,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  quickStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  trophyIcon: {
    marginLeft: 8,
  },
  trophyEmoji: {
    fontSize: 24,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  topPerformerCard: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  firstPlaceCard: {
    borderWidth: 2,
    borderColor: COLORS.gold + '40',
    backgroundColor: COLORS.gold + '08',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
  },
  crownEmoji: {
    fontSize: 16,
  },
  performerInfo: {
    flex: 1,
    marginRight: 12,
  },
  performerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  levelBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ordersContainer: {
    alignItems: 'flex-end',
  },
  ordersCount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ordersLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tipsSection: {
    margin: 16,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  ctaButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
