import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

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

interface ImpactActivity {
  id: number;
  type: string;
  title: string;
  icon: string;
  iconBg: string;
  organizer: string;
  logo: string;
  sponsor: string | null;
  csrActivity: boolean;
  date: string;
  time: string;
  location: string;
  distance: string;
  rewards: {
    rezCoins: number;
    brandCoins: number;
    brandName: string | null;
  };
  enrolled: number;
  goal: number;
  impact: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const impactActivities: ImpactActivity[] = [
  {
    id: 1,
    type: 'blood-donation',
    title: 'Blood Donation Drive',
    icon: '🩸',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    organizer: 'Apollo Hospitals',
    logo: '🏥',
    sponsor: 'Tata Group',
    csrActivity: true,
    date: 'Dec 28, 2024',
    time: '9:00 AM - 5:00 PM',
    location: 'Apollo Hospital, Sector 18',
    distance: '2.3 km',
    rewards: { rezCoins: 200, brandCoins: 300, brandName: 'Tata Coins' },
    enrolled: 234,
    goal: 500,
    impact: 'Save 3 lives per donation',
    status: 'upcoming',
  },
  {
    id: 2,
    type: 'tree-plantation',
    title: 'Green India Mission',
    icon: '🌳',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    organizer: 'Green Earth Foundation',
    logo: '🌍',
    sponsor: 'Reliance Industries',
    csrActivity: true,
    date: 'Dec 30, 2024',
    time: '7:00 AM - 11:00 AM',
    location: 'City Park, Botanical Gardens',
    distance: '4.1 km',
    rewards: { rezCoins: 150, brandCoins: 250, brandName: 'Reliance Coins' },
    enrolled: 156,
    goal: 200,
    impact: 'Plant 1000+ saplings',
    status: 'upcoming',
  },
  {
    id: 3,
    type: 'cleanup',
    title: 'Swachh Bharat - Beach Cleanup',
    icon: '🏖️',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    organizer: 'Clean Beaches Initiative',
    logo: '🌊',
    sponsor: 'Infosys Foundation',
    csrActivity: true,
    date: 'Jan 2, 2025',
    time: '6:00 AM - 9:00 AM',
    location: 'Marina Beach',
    distance: '8.5 km',
    rewards: { rezCoins: 120, brandCoins: 180, brandName: 'Infosys Coins' },
    enrolled: 89,
    goal: 150,
    impact: 'Clean 5 km of coastline',
    status: 'upcoming',
  },
  {
    id: 4,
    type: 'education',
    title: 'Digital Literacy Program',
    icon: '📚',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    organizer: 'Teach India Initiative',
    logo: '✏️',
    sponsor: 'Wipro',
    csrActivity: true,
    date: 'Jan 5, 2025',
    time: '2:00 PM - 5:00 PM',
    location: 'Government School, Whitefield',
    distance: '5.2 km',
    rewards: { rezCoins: 180, brandCoins: 220, brandName: 'Wipro Coins' },
    enrolled: 67,
    goal: 100,
    impact: 'Teach 50+ students',
    status: 'upcoming',
  },
  {
    id: 5,
    type: 'food-drive',
    title: 'Hunger-Free India Campaign',
    icon: '🍲',
    iconBg: 'rgba(249, 115, 22, 0.15)',
    organizer: 'Feed the Need NGO',
    logo: '🤝',
    sponsor: 'ITC Limited',
    csrActivity: true,
    date: 'Every Sunday',
    time: '11:00 AM - 2:00 PM',
    location: 'Community Center, MG Road',
    distance: '3.7 km',
    rewards: { rezCoins: 100, brandCoins: 150, brandName: 'ITC Coins' },
    enrolled: 145,
    goal: 200,
    impact: 'Feed 200+ people',
    status: 'ongoing',
  },
  {
    id: 6,
    type: 'skill-training',
    title: 'Women Empowerment Workshop',
    icon: '💪',
    iconBg: 'rgba(236, 72, 153, 0.15)',
    organizer: 'Skill India Mission',
    logo: '👩',
    sponsor: 'HDFC Bank',
    csrActivity: true,
    date: 'Jan 8, 2025',
    time: '10:00 AM - 4:00 PM',
    location: 'HDFC Training Center, HSR Layout',
    distance: '6.4 km',
    rewards: { rezCoins: 200, brandCoins: 300, brandName: 'HDFC Coins' },
    enrolled: 78,
    goal: 120,
    impact: 'Empower 60+ women',
    status: 'upcoming',
  },
  {
    id: 7,
    type: 'health-camp',
    title: 'Free Health Checkup Camp',
    icon: '⚕️',
    iconBg: 'rgba(6, 182, 212, 0.15)',
    organizer: 'Healthcare for All',
    logo: '🏥',
    sponsor: 'Sun Pharma',
    csrActivity: true,
    date: 'Jan 12, 2025',
    time: '8:00 AM - 12:00 PM',
    location: 'Community Hall, JP Nagar',
    distance: '7.1 km',
    rewards: { rezCoins: 170, brandCoins: 230, brandName: 'Sun Pharma Coins' },
    enrolled: 112,
    goal: 180,
    impact: 'Serve 300+ patients',
    status: 'upcoming',
  },
  {
    id: 8,
    type: 'blood-donation',
    title: 'Emergency Blood Camp',
    icon: '🩸',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    organizer: 'Red Cross Society',
    logo: '❤️',
    sponsor: null,
    csrActivity: false,
    date: 'Dec 26, 2024',
    time: 'Completed',
    location: 'City Hospital',
    distance: '1.8 km',
    rewards: { rezCoins: 200, brandCoins: 0, brandName: null },
    enrolled: 312,
    goal: 300,
    impact: 'Saved 900+ lives',
    status: 'completed',
  },
];

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
];

const myImpactStats = {
  totalActivities: 12,
  livesImpacted: 2340,
  treesPlanted: 45,
  rezCoinsEarned: 2400,
  brandedCoinsEarned: 1650,
};

export default function SocialImpactPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  const filteredActivities =
    activeTab === 'all'
      ? impactActivities
      : impactActivities.filter((a) => a.status === activeTab);

  const getTabCount = (tabId: string) => {
    if (tabId === 'all') return impactActivities.length;
    return impactActivities.filter((a) => a.status === tabId).length;
  };

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

      <ScrollView showsVerticalScrollIndicator={false}>
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
              <Text style={styles.statValue}>{myImpactStats.livesImpacted.toLocaleString()}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="leaf" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>Trees Planted</Text>
              </View>
              <Text style={styles.statValue}>{myImpactStats.treesPlanted}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="wallet" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>ReZ Coins</Text>
              </View>
              <Text style={styles.statValue}>{myImpactStats.rezCoinsEarned.toLocaleString()}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.2)' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                <Text style={styles.statLabel}>Branded Coins</Text>
              </View>
              <Text style={styles.statValue}>{myImpactStats.brandedCoinsEarned.toLocaleString()}</Text>
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
          {filteredActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              {/* Header */}
              <View style={styles.activityHeader}>
                <View style={[styles.activityIcon, { backgroundColor: activity.iconBg }]}>
                  <Text style={styles.activityEmoji}>{activity.icon}</Text>
                </View>
                <View style={styles.activityHeaderContent}>
                  <View style={styles.activityTitleRow}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    {activity.status === 'completed' && (
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    )}
                    {activity.csrActivity && (
                      <View style={styles.csrBadge}>
                        <Text style={styles.csrBadgeText}>CSR</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.organizerRow}>
                    <Text>{activity.logo}</Text>
                    <Text style={styles.organizerText}>{activity.organizer}</Text>
                  </View>
                  {activity.sponsor && (
                    <View style={styles.sponsorRow}>
                      <Ionicons name="business" size={12} color="#8B5CF6" />
                      <Text style={styles.sponsorText}>Sponsored by {activity.sponsor}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{activity.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{activity.time}</Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.detailText}>
                  {activity.location} • {activity.distance} away
                </Text>
              </View>

              {/* Impact & Progress */}
              <View style={styles.impactSection}>
                <View style={styles.impactHeader}>
                  <Ionicons name="trending-up" size={14} color="#3B82F6" />
                  <Text style={styles.impactText}>{activity.impact}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(activity.enrolled / activity.goal) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {activity.enrolled}/{activity.goal}
                  </Text>
                </View>
              </View>

              {/* Rewards */}
              <View style={styles.rewardsSection}>
                <Text style={styles.rewardsTitle}>Participation Rewards</Text>
                <View style={styles.rewardsGrid}>
                  <View style={styles.rewardCard}>
                    <View style={styles.rewardHeader}>
                      <Ionicons name="wallet" size={14} color={COLORS.primary} />
                      <Text style={styles.rewardLabel}>ReZ Coins</Text>
                    </View>
                    <Text style={styles.rewardValue}>+{activity.rewards.rezCoins}</Text>
                  </View>
                  {activity.rewards.brandCoins > 0 && (
                    <View style={[styles.rewardCard, styles.rewardCardPurple]}>
                      <View style={styles.rewardHeader}>
                        <Ionicons name="sparkles" size={14} color="#8B5CF6" />
                        <Text style={styles.rewardLabel}>Brand Coins</Text>
                      </View>
                      <Text style={[styles.rewardValue, { color: '#8B5CF6' }]}>
                        +{activity.rewards.brandCoins}
                      </Text>
                      <Text style={styles.brandName}>{activity.rewards.brandName}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* CTA */}
              {activity.status === 'completed' ? (
                <View style={styles.completedButton}>
                  <Ionicons name="checkmark" size={16} color={COLORS.textMuted} />
                  <Text style={styles.completedButtonText}>Completed</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => router.push(`/social-impact/${activity.id}` as any)}
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
          ))}
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
                <Text style={styles.bottomCTAStatText}>5,234 members</Text>
              </View>
              <View style={styles.bottomCTAStat}>
                <Ionicons name="heart" size={14} color={COLORS.textMuted} />
                <Text style={styles.bottomCTAStatText}>234 events</Text>
              </View>
              <View style={styles.bottomCTAStat}>
                <Ionicons name="business" size={14} color={COLORS.textMuted} />
                <Text style={styles.bottomCTAStatText}>60+ CSR Partners</Text>
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
    padding: 16,
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
  activityHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  organizerText: {
    fontSize: 11,
    color: COLORS.textMuted,
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
