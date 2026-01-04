import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import socialImpactApi, { SocialImpactEvent, UserImpactStats } from '@/services/socialImpactApi';

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

// Helper function for event type icon background colors
const getEventTypeIconBg = (eventType?: string): string => {
  const bgMap: Record<string, string> = {
    'blood-donation': 'rgba(239, 68, 68, 0.15)',
    'tree-plantation': 'rgba(16, 185, 129, 0.15)',
    'beach-cleanup': 'rgba(59, 130, 246, 0.15)',
    'digital-literacy': 'rgba(99, 102, 241, 0.15)',
    'food-drive': 'rgba(249, 115, 22, 0.15)',
    'health-camp': 'rgba(6, 182, 212, 0.15)',
    'skill-training': 'rgba(236, 72, 153, 0.15)',
    'women-empowerment': 'rgba(236, 72, 153, 0.15)',
    'education': 'rgba(99, 102, 241, 0.15)',
    'environment': 'rgba(16, 185, 129, 0.15)',
  };
  return bgMap[eventType || ''] || 'rgba(139, 92, 246, 0.15)';
};

// Helper function for event type emoji
const getEventTypeEmoji = (eventType?: string): string => {
  const emojiMap: Record<string, string> = {
    'blood-donation': '🩸',
    'tree-plantation': '🌳',
    'beach-cleanup': '🏖️',
    'digital-literacy': '💻',
    'food-drive': '🍛',
    'health-camp': '🏥',
    'skill-training': '👩‍💼',
    'women-empowerment': '👩‍💼',
    'education': '📚',
    'environment': '🌍',
  };
  return emojiMap[eventType || ''] || '✨';
};

// Format event time for display
const formatEventTime = (eventTime?: { start: string; end: string }): string => {
  if (!eventTime) return 'TBD';
  return `${eventTime.start} - ${eventTime.end}`;
};

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
];

// Default empty stats
const defaultStats: UserImpactStats = {
  totalEventsRegistered: 0,
  totalEventsCompleted: 0,
  totalEventsAttended: 0,
  livesImpacted: 0,
  treesPlanted: 0,
  hoursContributed: 0,
  mealsServed: 0,
  totalRezCoinsEarned: 0,
  totalBrandCoinsEarned: 0,
  currentStreak: 0,
  longestStreak: 0,
};

export default function SocialImpactPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [events, setEvents] = useState<SocialImpactEvent[]>([]);
  const [stats, setStats] = useState<UserImpactStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch events and stats
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      // Fetch events and stats in parallel
      const [eventsResponse, statsResponse] = await Promise.all([
        socialImpactApi.getEvents(),
        socialImpactApi.getMyStats()
      ]);

      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (err: any) {
      console.error('Error fetching social impact data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // Filter events based on active tab
  const filteredActivities =
    activeTab === 'all'
      ? events
      : events.filter((e) => e.eventStatus === activeTab);

  // Get count for each tab
  const getTabCount = (tabId: string) => {
    if (tabId === 'all') return events.length;
    return events.filter((e) => e.eventStatus === tabId).length;
  };

  // Loading skeleton
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Social Impact</Text>
              <Text style={styles.headerSubtitle}>Earn while making a difference</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading events...</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Social Impact</Text>
          <Text style={styles.headerSubtitle}>Earn while making a difference</Text>
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
        {/* Hero - CSR Focus */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.08)', 'rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.08)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroIcon}>
              <Ionicons name="business" size={28} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Corporate CSR Meets Social Impact</Text>
            <Text style={styles.heroDesc}>
              Companies sponsor events as CSR activities. You participate, make an impact, and earn both{' '}
              <Text style={styles.heroHighlight}>ReZ Coins</Text> +{' '}
              <Text style={styles.heroHighlightPurple}>Brand Coins</Text>
            </Text>

            {/* CSR Benefits */}
            <View style={styles.csrBenefits}>
              <View style={styles.csrBenefitItem}>
                <Text style={styles.csrEmoji}>🏢</Text>
                <Text style={styles.csrBenefitText}>Corporate CSR</Text>
              </View>
              <View style={styles.csrBenefitItem}>
                <Text style={styles.csrEmoji}>🤝</Text>
                <Text style={styles.csrBenefitText}>Social Good</Text>
              </View>
              <View style={styles.csrBenefitItem}>
                <Text style={styles.csrEmoji}>💰</Text>
                <Text style={styles.csrBenefitText}>Dual Rewards</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* My Impact Stats */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={18} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Your Impact</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text style={styles.statLabel}>Lives Impacted</Text>
              </View>
              <Text style={styles.statValue}>{stats.livesImpacted.toLocaleString()}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="leaf" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>Trees Planted</Text>
              </View>
              <Text style={styles.statValue}>{stats.treesPlanted}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="wallet" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>ReZ Coins</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalRezCoinsEarned.toLocaleString()}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.2)' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                <Text style={styles.statLabel}>Branded Coins</Text>
              </View>
              <Text style={styles.statValue}>{stats.totalBrandCoinsEarned.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label} ({getTabCount(tab.id)})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activities List */}
        <View style={styles.activitiesContainer}>
          {filteredActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyStateTitle}>No events found</Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'all'
                  ? 'Check back later for new social impact events'
                  : `No ${activeTab} events at the moment`}
              </Text>
            </View>
          ) : (
            filteredActivities.map((event) => (
              <View key={event._id} style={styles.activityCard}>
                {/* Event Image Banner */}
                {event.image && (
                  <View style={styles.eventImageContainer}>
                    <Image
                      source={{ uri: event.image }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                    {event.eventStatus === 'ongoing' && (
                      <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Header */}
                <View style={styles.activityHeader}>
                  <View style={[styles.activityIcon, { backgroundColor: getEventTypeIconBg(event.eventType) }]}>
                    <Text style={styles.activityEmoji}>{getEventTypeEmoji(event.eventType)}</Text>
                  </View>
                  <View style={styles.activityHeaderContent}>
                    <View style={styles.activityTitleRow}>
                      <Text style={styles.activityTitle}>{event.name}</Text>
                      {event.eventStatus === 'completed' && (
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                      )}
                      {event.isEnrolled && (
                        <View style={styles.enrolledBadge}>
                          <Text style={styles.enrolledBadgeText}>Enrolled</Text>
                        </View>
                      )}
                      {event.isCsrActivity && (
                        <View style={styles.csrBadge}>
                          <Text style={styles.csrBadgeText}>CSR</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.organizerRow}>
                      {event.organizer?.logo && event.organizer.logo.startsWith('http') ? (
                        <Image
                          source={{ uri: event.organizer.logo }}
                          style={styles.organizerLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.organizerEmoji}>🏢</Text>
                      )}
                      <Text style={styles.organizerText}>{event.organizer?.name || 'Unknown Organizer'}</Text>
                    </View>
                    {event.sponsor && (
                      <View style={styles.sponsorRow}>
                        <Ionicons name="business" size={12} color="#8B5CF6" />
                        <Text style={styles.sponsorText}>Sponsored by {event.sponsor.name}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleDateString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : 'TBD'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{formatEventTime(event.eventTime)}</Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>
                    {event.location?.address || 'Location TBD'}
                    {event.location?.city ? ` • ${event.location.city}` : ''}
                  </Text>
                </View>

                {/* Impact & Progress */}
                {(event.impact || event.capacity) && (
                  <View style={styles.impactSection}>
                    {event.impact?.description && (
                      <View style={styles.impactHeader}>
                        <Ionicons name="trending-up" size={14} color="#3B82F6" />
                        <Text style={styles.impactText}>{event.impact.description}</Text>
                      </View>
                    )}
                    {event.capacity && event.capacity.goal > 0 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${Math.min((event.capacity.enrolled / event.capacity.goal) * 100, 100)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {event.capacity.enrolled}/{event.capacity.goal}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Rewards */}
                {event.rewards && (event.rewards.rezCoins > 0 || event.rewards.brandCoins > 0) && (
                  <View style={styles.rewardsSection}>
                    <Text style={styles.rewardsTitle}>Participation Rewards</Text>
                    <View style={styles.rewardsGrid}>
                      {event.rewards.rezCoins > 0 && (
                        <View style={styles.rewardCard}>
                          <View style={styles.rewardHeader}>
                            <Ionicons name="wallet" size={14} color={COLORS.primary} />
                            <Text style={styles.rewardLabel}>ReZ Coins</Text>
                          </View>
                          <Text style={styles.rewardValue}>+{event.rewards.rezCoins}</Text>
                        </View>
                      )}
                      {event.rewards.brandCoins > 0 && event.sponsor && (
                        <View style={[styles.rewardCard, styles.rewardCardPurple]}>
                          <View style={styles.rewardHeader}>
                            <Ionicons name="sparkles" size={14} color="#8B5CF6" />
                            <Text style={styles.rewardLabel}>Brand Coins</Text>
                          </View>
                          <Text style={[styles.rewardValue, { color: '#8B5CF6' }]}>
                            +{event.rewards.brandCoins}
                          </Text>
                          <Text style={styles.brandName}>{event.sponsor.brandCoinName}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* CTA */}
                {event.eventStatus === 'completed' ? (
                  <View style={styles.completedButton}>
                    <Ionicons name="checkmark" size={16} color={COLORS.textMuted} />
                    <Text style={styles.completedButtonText}>Completed</Text>
                  </View>
                ) : event.isEnrolled ? (
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => router.push(`/social-impact/${event._id}` as any)}
                  >
                    <Text style={styles.viewDetailsButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => router.push(`/social-impact/${event._id}` as any)}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, '#14B8A6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.registerButtonGradient}
                    >
                      <Text style={styles.registerButtonText}>Register Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.08)', 'rgba(59, 130, 246, 0.08)']}
            style={styles.bottomCTAGradient}
          >
            <Text style={styles.bottomCTATitle}>Every Action Counts</Text>
            <Text style={styles.bottomCTADesc}>
              Join thousands making an impact while earning dual rewards
            </Text>
            <View style={styles.bottomCTAStats}>
              <View style={styles.bottomCTAStat}>
                <Ionicons name="people" size={14} color={COLORS.textMuted} />
                <Text style={styles.bottomCTAStatText}>
                  {stats.totalEventsCompleted > 0 ? `${stats.totalEventsCompleted} completed` : 'Join now'}
                </Text>
              </View>
              <View style={styles.bottomCTAStat}>
                <Ionicons name="heart" size={14} color={COLORS.textMuted} />
                <Text style={styles.bottomCTAStatText}>{events.length} events</Text>
              </View>
              <View style={styles.bottomCTAStat}>
                <Ionicons name="business" size={14} color={COLORS.textMuted} />
                <Text style={styles.bottomCTAStatText}>
                  {new Set(events.filter(e => e.sponsor).map(e => e.sponsor?._id)).size || 0} CSR Partners
                </Text>
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
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
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
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heroGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  heroHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroHighlightPurple: {
    fontWeight: '700',
    color: '#8B5CF6',
  },
  csrBenefits: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  csrBenefitItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  csrEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  csrBenefitText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  activitiesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
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
  eventImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  liveIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activityHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  activityIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 26,
  },
  activityHeaderContent: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  csrBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  csrBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3B82F6',
  },
  enrolledBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  enrolledBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  organizerLogo: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  organizerEmoji: {
    fontSize: 14,
  },
  organizerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sponsorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  impactSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  impactText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  rewardsSection: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  rewardsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  rewardsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  rewardCardPurple: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  brandName: {
    fontSize: 9,
    color: '#8B5CF6',
    marginTop: 2,
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  completedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  registerButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
  bottomCTAStats: {
    flexDirection: 'row',
    gap: 16,
  },
  bottomCTAStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomCTAStatText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
