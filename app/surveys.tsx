import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import surveyApiService, { Survey, SurveyCategory, UserSurveyStats } from '@/services/surveyApi';

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
  background: '#F9FAFB',
  border: 'rgba(0, 0, 0, 0.08)',
};

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  'Shopping': '📦',
  'Food': '🍔',
  'Fashion': '👗',
  'Finance': '🏦',
  'Health': '💊',
  'Technology': '📱',
  'Travel': '✈️',
  'Entertainment': '🎬',
  'Lifestyle': '🏡',
  'Education': '📚',
  'Sports': '⚽',
  'General': '📋',
};

// Category colors
const categoryColors: Record<string, { bg: string; border: string }> = {
  'Shopping': { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)' },
  'Food': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
  'Fashion': { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)' },
  'Finance': { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
  'Health': { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
  'Technology': { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)' },
  'Travel': { bg: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.3)' },
  'Entertainment': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
  'Lifestyle': { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)' },
  'General': { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)' },
};

const difficultyColors = {
  easy: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', border: 'rgba(16, 185, 129, 0.3)' },
  medium: { bg: 'rgba(249, 115, 22, 0.1)', text: '#EA580C', border: 'rgba(249, 115, 22, 0.3)' },
  hard: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626', border: 'rgba(239, 68, 68, 0.3)' },
};

export default function SurveysPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [categories, setCategories] = useState<SurveyCategory[]>([]);
  const [userStats, setUserStats] = useState<UserSurveyStats>({
    totalEarned: 0,
    surveysCompleted: 0,
    averageTime: 0,
    completionRate: 100,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load all data
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [surveysData, categoriesData, statsData] = await Promise.all([
        surveyApiService.getSurveys(activeCategory !== 'All' ? activeCategory : undefined),
        surveyApiService.getCategories(),
        surveyApiService.getUserStats(),
      ]);
      setSurveys(surveysData);
      setCategories(categoriesData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Reload when category changes
  useEffect(() => {
    loadData();
  }, [activeCategory]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Navigate to survey detail
  const handleStartSurvey = (surveyId: string) => {
    router.push(`/survey/${surveyId}`);
  };

  // Get category display info
  const getCategoryInfo = (subcategory?: string) => {
    const cat = subcategory || 'General';
    return {
      emoji: categoryEmojis[cat] || '📋',
      colors: categoryColors[cat] || categoryColors['General'],
    };
  };

  // Format time display
  const formatTime = (minutes: number) => {
    if (minutes < 1) return '< 1 min';
    return `${minutes} mins`;
  };

  // Format average time for stats
  const formatAvgTime = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading surveys...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Surveys</Text>
            <Text style={styles.headerSubtitle}>Share opinions, earn rewards</Text>
          </View>
          <View style={styles.coinBadge}>
            <Ionicons name="wallet" size={14} color={COLORS.primary} />
            <Text style={styles.coinBadgeText}>{userStats.totalEarned}</Text>
          </View>
        </View>

        <ScrollView
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
          {/* Hero Stats */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.08)', 'rgba(236, 72, 153, 0.08)']}
              style={styles.heroGradient}
            >
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="wallet" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statValue}>{userStats.totalEarned}</Text>
                  <Text style={styles.statLabel}>Earned</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                  </View>
                  <Text style={styles.statValue}>{userStats.surveysCompleted}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                    <Ionicons name="time" size={18} color="#F97316" />
                  </View>
                  <Text style={styles.statValue}>{formatAvgTime(userStats.averageTime)}</Text>
                  <Text style={styles.statLabel}>Avg Time</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                    <Ionicons name="trending-up" size={18} color="#EC4899" />
                  </View>
                  <Text style={styles.statValue}>{userStats.completionRate}%</Text>
                  <Text style={styles.statLabel}>Success</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryButton,
                  activeCategory === cat.name && styles.categoryButtonActive,
                ]}
                onPress={() => handleCategoryChange(cat.name)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === cat.name && styles.categoryTextActive,
                  ]}
                >
                  {cat.name} ({cat.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
              style={styles.infoBannerGradient}
            >
              <Ionicons name="document-text" size={32} color="#8B5CF6" />
              <View style={styles.infoBannerText}>
                <Text style={styles.infoBannerTitle}>Earn While You Share</Text>
                <Text style={styles.infoBannerDesc}>
                  Your opinions help brands improve. Get rewarded for every completed survey!
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Surveys List */}
          <View style={styles.surveysContainer}>
            {surveys.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyStateText}>No surveys available</Text>
                <Text style={styles.emptyStateSubtext}>Check back later for new surveys</Text>
              </View>
            ) : (
              surveys.map((survey) => {
                const catInfo = getCategoryInfo(survey.subcategory);
                const difficulty = survey.difficulty || 'easy';
                const diffColors = difficultyColors[difficulty] || difficultyColors.easy;
                const completionPercent = survey.targetResponses > 0
                  ? Math.round((survey.completedCount / survey.targetResponses) * 100)
                  : 0;

                return (
                  <TouchableOpacity
                    key={survey._id}
                    style={styles.surveyCard}
                    activeOpacity={0.9}
                    onPress={() => handleStartSurvey(survey._id)}
                  >
                    {/* Header */}
                    <View style={styles.surveyHeader}>
                      <View
                        style={[
                          styles.surveyIcon,
                          { backgroundColor: catInfo.colors.bg, borderColor: catInfo.colors.border },
                        ]}
                      >
                        <Text style={styles.surveyEmoji}>{catInfo.emoji}</Text>
                      </View>
                      <View style={styles.surveyHeaderContent}>
                        <View style={styles.surveyBadges}>
                          <View
                            style={[
                              styles.difficultyBadge,
                              {
                                backgroundColor: diffColors.bg,
                                borderColor: diffColors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.difficultyText,
                                { color: diffColors.text },
                              ]}
                            >
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </Text>
                          </View>
                          {survey.isFeatured && (
                            <View style={styles.trendingBadge}>
                              <Ionicons name="sparkles" size={10} color="#F97316" />
                              <Text style={styles.trendingText}>Featured</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.surveyTitle}>{survey.title}</Text>
                        <View style={styles.sponsorRow}>
                          <Ionicons name="pricetag" size={12} color={COLORS.textMuted} />
                          <Text style={styles.sponsorText}>{survey.subcategory || 'General'}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Details Grid */}
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{formatTime(survey.estimatedTime)}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{survey.questionsCount} questions</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{survey.completedCount.toLocaleString()}</Text>
                      </View>
                    </View>

                    {/* Completion Rate */}
                    <View style={styles.completionSection}>
                      <View style={styles.completionHeader}>
                        <Text style={styles.completionLabel}>Responses</Text>
                        <Text style={styles.completionValue}>
                          {survey.completedCount}/{survey.targetResponses}
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(completionPercent, 100)}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Reward & CTA */}
                    <View style={styles.surveyFooter}>
                      <View style={styles.rewardSection}>
                        <Ionicons name="wallet" size={20} color={COLORS.primary} />
                        <View>
                          <Text style={styles.rewardValue}>+{survey.reward}</Text>
                          <Text style={styles.rewardLabel}>ReZ Coins</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => handleStartSurvey(survey._id)}
                      >
                        <LinearGradient
                          colors={['#3B82F6', '#8B5CF6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.startButtonGradient}
                        >
                          <Text style={styles.startButtonText}>Start Now</Text>
                          <Ionicons name="chevron-forward" size={16} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Bottom CTA */}
          <View style={styles.bottomCTA}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.08)', 'rgba(59, 130, 246, 0.08)']}
              style={styles.bottomCTAGradient}
            >
              <View style={styles.bottomCTAIcon}>
                <Ionicons name="bar-chart" size={28} color="#fff" />
              </View>
              <Text style={styles.bottomCTATitle}>New Surveys Daily</Text>
              <Text style={styles.bottomCTADesc}>
                Check back often for fresh surveys from top brands
              </Text>
              <View style={styles.bottomCTAFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="trophy" size={14} color={COLORS.textMuted} />
                  <Text style={styles.featureText}>High Rewards</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="time" size={14} color={COLORS.textMuted} />
                  <Text style={styles.featureText}>Quick Surveys</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.textMuted} />
                  <Text style={styles.featureText}>Easy Tasks</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  coinBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heroGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  infoBanner: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  infoBannerDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  surveysContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  surveyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  surveyHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  surveyIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  surveyEmoji: {
    fontSize: 26,
  },
  surveyHeaderContent: {
    flex: 1,
  },
  surveyBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F97316',
  },
  surveyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sponsorText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  completionSection: {
    marginBottom: 12,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  completionLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  completionValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  surveyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rewardLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  bottomCTA: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  bottomCTAGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  bottomCTAIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomCTATitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  bottomCTADesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomCTAFeatures: {
    flexDirection: 'row',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
