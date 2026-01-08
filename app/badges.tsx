/**
 * Badges/Achievements Screen - Converted from V2 Web
 * Exact match to Rez_v-2-main/src/pages/earn/Achievements.jsx
 * Now integrated with achievementApi for real data
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { achievementApi, AchievementType, Achievement as ApiAchievement } from '@/services/achievementApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  green500: '#22C55E',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  pink500: '#EC4899',
  blue500: '#3B82F6',
  cyan500: '#06B6D4',
  teal500: '#14B8A6',
  emerald500: '#10B981',
};

interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  coins: number;
  category: string;
  progress?: number;
}

// Helper function to get category from achievement type
const getCategoryFromType = (type: string): string => {
  if (type.includes('ORDER') || type.includes('SPENT') || type.includes('VOUCHER') || type.includes('OFFERS')) return 'Shopping';
  if (type.includes('REFERRAL')) return 'Social';
  if (type.includes('REVIEW')) return 'Engagement';
  if (type.includes('VIDEO') || type.includes('PROJECT')) return 'Content';
  if (type.includes('STREAK') || type.includes('ACTIVITY') || type.includes('EARLY') || type.includes('YEAR')) return 'Engagement';
  return 'General';
};

// Helper function to get icon from achievement type
const getIconFromType = (type: string, existingIcon?: string): string => {
  if (existingIcon && existingIcon.length <= 2) return existingIcon; // Already an emoji

  const iconMap: Record<string, string> = {
    FIRST_ORDER: '🎯',
    ORDERS_10: '🛒',
    ORDERS_50: '🛍️',
    ORDERS_100: '🏆',
    FREQUENT_BUYER: '⭐',
    SPENT_1000: '💸',
    SPENT_5000: '💰',
    SPENT_10000: '👑',
    BIG_SPENDER: '💎',
    FIRST_REVIEW: '📝',
    REVIEWS_10: '✍️',
    REVIEWS_25: '📚',
    REVIEW_MASTER: '⭐',
    FIRST_VIDEO: '🎬',
    VIDEOS_10: '📹',
    VIEWS_1000: '👁️',
    VIEWS_10000: '🔥',
    INFLUENCER: '🌟',
    FIRST_PROJECT: '🎨',
    PROJECTS_10: '🖼️',
    PROJECT_APPROVED: '✅',
    TOP_EARNER: '🏅',
    VOUCHER_REDEEMED: '🎟️',
    OFFERS_10: '🎪',
    CASHBACK_EARNED: '💵',
    FIRST_REFERRAL: '🤝',
    REFERRALS_5: '👥',
    REFERRALS_10: '🦋',
    REFERRAL_MASTER: '👑',
    EARLY_BIRD: '🌅',
    ONE_YEAR: '🎂',
    ACTIVITY_100: '⚡',
    ACTIVITY_500: '🚀',
    SUPER_USER: '🦸',
  };

  return iconMap[type] || '🏅';
};

const categories = ['All', 'Shopping', 'Social', 'Engagement', 'Content', 'General'];

const BadgesScreen: React.FC = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    unlocked: 0,
    total: 0,
    totalCoins: 0,
    completionPercent: 0,
  });
  const fetchingRef = React.useRef(false); // Prevent duplicate API calls

  // Fetch achievements from API
  const fetchAchievements = useCallback(async (isRefresh = false) => {
    // Prevent duplicate concurrent API calls
    if (fetchingRef.current && !isRefresh) return;
    fetchingRef.current = true;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // First recalculate achievements to get latest progress
      try {
        await achievementApi.recalculateAchievements();
      } catch (recalcError) {
        console.warn('Failed to recalculate achievements:', recalcError);
        // Continue anyway - will just show potentially stale progress
      }

      const response = await achievementApi.getAchievementProgress();

      if (response.success && response.data) {
        // Coin rewards mapping based on achievement type (from backend ACHIEVEMENT_DEFINITIONS)
        const coinRewardMap: Record<string, number> = {
          'FIRST_ORDER': 50, 'ORDERS_10': 100, 'ORDERS_50': 500, 'FREQUENT_BUYER': 1000,
          'SPENT_1000': 50, 'SPENT_5000': 200, 'BIG_SPENDER': 500,
          'FIRST_REVIEW': 25, 'REVIEWS_25': 250,
          'FIRST_VIDEO': 100, 'VIEWS_10000': 1000,
          'FIRST_PROJECT': 50, 'TOP_EARNER': 500,
          'FIRST_REFERRAL': 100, 'REFERRALS_10': 1000,
          'EARLY_BIRD': 200, 'ACTIVITY_100': 500, 'SUPER_USER': 2000
        };

        // Map API response to local interface
        const mapped: Achievement[] = response.data.achievements.map((a: ApiAchievement) => ({
          id: a.id,
          title: a.title,
          desc: a.description,
          icon: getIconFromType(a.type, a.icon),
          unlocked: a.unlocked,
          coins: coinRewardMap[a.type] || a.targetValue, // Use actual reward, fallback to targetValue
          category: getCategoryFromType(a.type),
          progress: a.unlocked ? 100 : a.progress,
        }));

        setAchievements(mapped);
        setStats({
          unlocked: response.data.summary.unlocked,
          total: response.data.summary.total,
          totalCoins: mapped.filter(a => a.unlocked).reduce((sum, a) => sum + a.coins, 0),
          completionPercent: Math.round(response.data.summary.completionPercentage),
        });
      } else {
        setError(response.error || 'Failed to load achievements');
      }
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const onRefresh = useCallback(() => {
    fetchAchievements(true);
  }, [fetchAchievements]);

  const filteredAchievements = activeCategory === 'All'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Achievements</Text>
            <Text style={styles.headerSubtitle}>Unlock badges & earn coins</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple500} />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error && achievements.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Achievements</Text>
            <Text style={styles.headerSubtitle}>Unlock badges & earn coins</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={COLORS.gray400} />
          <Text style={styles.errorTitle}>Unable to load achievements</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchAchievements()}>
            <LinearGradient
              colors={[COLORS.purple500, COLORS.purple600]}
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>Unlock badges & earn coins</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.purple500]}
            tintColor={COLORS.purple500}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{stats.unlocked}/{stats.total}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.2)', 'rgba(234, 179, 8, 0.2)']}
            style={styles.statCard}
          >
            <Text style={[styles.statValue, { color: COLORS.amber400 }]}>{stats.totalCoins}</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
            style={styles.statCard}
          >
            <Text style={[styles.statValue, { color: COLORS.green500 }]}>{stats.completionPercent}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </LinearGradient>
        </View>

        {/* Empty State */}
        {achievements.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏅</Text>
            <Text style={styles.emptyTitle}>No Achievements Yet</Text>
            <Text style={styles.emptyText}>Start shopping and engaging to unlock your first badge!</Text>
          </View>
        )}

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                activeCategory === cat && styles.categoryButtonActive
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements Grid */}
        <View style={styles.achievementsGrid}>
          {filteredAchievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementCardUnlocked
              ]}
            >
              {!achievement.unlocked && (
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={14} color={COLORS.gray400} />
                </View>
              )}

              <View style={styles.achievementHeader}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                {achievement.unlocked && <Text style={styles.checkIcon}>✅</Text>}
              </View>

              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.desc}</Text>
              <Text style={styles.achievementCoins}>+{achievement.coins} coins</Text>

              {!achievement.unlocked && achievement.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={[COLORS.emerald500, COLORS.teal500]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${achievement.progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{achievement.progress}% complete</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* CTAs Section */}
        <View style={styles.ctasSection}>
          <Text style={styles.ctasTitle}>Quick Actions to Unlock More</Text>

          {/* Shopping CTA */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/mall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Ionicons name="bag-handle" size={20} color={COLORS.purple600} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Shop & Unlock Deals</Text>
                <Text style={styles.ctaSubtitle}>Complete shopping achievements</Text>
              </View>
              <Ionicons name="trending-up" size={20} color={COLORS.purple600} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Referral CTA */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/refer')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="people" size={20} color={COLORS.blue500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Refer Friends</Text>
                <Text style={styles.ctaSubtitle}>Unlock social achievements & earn</Text>
              </View>
              <Ionicons name="trending-up" size={20} color={COLORS.blue500} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Games CTA */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/games')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <Ionicons name="game-controller" size={20} color={COLORS.green500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Play Games</Text>
                <Text style={styles.ctaSubtitle}>Complete gaming challenges</Text>
              </View>
              <Ionicons name="trending-up" size={20} color={COLORS.green500} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Daily Check-in CTA */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/explore/daily-checkin')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.2)', 'rgba(234, 179, 8, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Ionicons name="ribbon" size={20} color={COLORS.amber500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Daily Check-in</Text>
                <Text style={styles.ctaSubtitle}>Build streaks & unlock rewards</Text>
              </View>
              <LinearGradient
                colors={[COLORS.amber500, '#EAB308']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkInButton}
              >
                <Text style={styles.checkInText}>Check In</Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  emptyText: {
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.green500,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  achievementCard: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    position: 'relative',
  },
  achievementCardUnlocked: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 36,
  },
  checkIcon: {
    fontSize: 18,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 11,
    color: COLORS.gray500,
    marginBottom: 8,
  },
  achievementCoins: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.amber400,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.gray500,
    marginTop: 4,
  },
  ctasSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  ctasTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 16,
  },
  ctaCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  checkInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checkInText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BadgesScreen;
