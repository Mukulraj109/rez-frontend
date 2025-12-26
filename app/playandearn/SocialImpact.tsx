import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SocialImpact = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = false; // Force white theme
  const [activeTab, setActiveTab] = useState('all');

  const impactActivities = [
    {
      id: 1,
      type: 'blood-donation',
      title: 'Blood Donation Drive',
      icon: '🩸',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#EF4444',
      organizer: 'Apollo Hospitals',
      logo: '🏥',
      date: 'Dec 28, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Apollo Hospital, Sector 18',
      distance: '2.3 km',
      rewards: {
        rezCoins: 200,
        brandedCoins: 150,
        brandName: 'Apollo'
      },
      enrolled: 234,
      goal: 500,
      impact: 'Save 3 lives per donation',
      status: 'upcoming'
    },
    {
      id: 2,
      type: 'tree-plantation',
      title: 'Tree Plantation Drive',
      icon: '🌳',
      iconBg: 'rgba(34, 197, 94, 0.2)',
      iconColor: '#22C55E',
      organizer: 'Green Earth Foundation',
      logo: '🌍',
      date: 'Dec 30, 2024',
      time: '7:00 AM - 11:00 AM',
      location: 'City Park, Botanical Gardens',
      distance: '4.1 km',
      rewards: {
        rezCoins: 150,
        brandedCoins: 100,
        brandName: 'Green Earth'
      },
      enrolled: 156,
      goal: 200,
      impact: 'Plant 1000+ saplings',
      status: 'upcoming'
    },
    {
      id: 3,
      type: 'cleanup',
      title: 'Beach Cleanup Drive',
      icon: '🏖️',
      iconBg: 'rgba(59, 130, 246, 0.2)',
      iconColor: '#3B82F6',
      organizer: 'Clean Beaches Initiative',
      logo: '🌊',
      date: 'Jan 2, 2025',
      time: '6:00 AM - 9:00 AM',
      location: 'Marina Beach',
      distance: '8.5 km',
      rewards: {
        rezCoins: 120,
        brandedCoins: 80,
        brandName: 'Clean Beaches'
      },
      enrolled: 89,
      goal: 150,
      impact: 'Clean 5 km of coastline',
      status: 'upcoming'
    },
    {
      id: 4,
      type: 'ngo-volunteer',
      title: 'Community Kitchen Volunteering',
      icon: '🍲',
      iconBg: 'rgba(249, 115, 22, 0.2)',
      iconColor: '#F97316',
      organizer: 'Feed the Need NGO',
      logo: '🤝',
      date: 'Every Sunday',
      time: '11:00 AM - 2:00 PM',
      location: 'Community Center, MG Road',
      distance: '3.7 km',
      rewards: {
        rezCoins: 100,
        brandedCoins: 0
      },
      enrolled: 45,
      goal: 100,
      impact: 'Feed 200+ people',
      status: 'ongoing'
    },
    {
      id: 5,
      type: 'blood-donation',
      title: 'Emergency Blood Camp',
      icon: '🩸',
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#EF4444',
      organizer: 'Red Cross Society',
      logo: '❤️',
      date: 'Dec 26, 2024',
      time: 'Completed',
      location: 'City Hospital',
      distance: '1.8 km',
      rewards: {
        rezCoins: 200,
        brandedCoins: 0
      },
      enrolled: 312,
      goal: 300,
      impact: 'Saved 900+ lives',
      status: 'completed'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All', count: impactActivities.length },
    { id: 'upcoming', label: 'Upcoming', count: impactActivities.filter(a => a.status === 'upcoming').length },
    { id: 'ongoing', label: 'Ongoing', count: impactActivities.filter(a => a.status === 'ongoing').length },
    { id: 'completed', label: 'Completed', count: impactActivities.filter(a => a.status === 'completed').length }
  ];

  const filteredActivities = activeTab === 'all'
    ? impactActivities
    : impactActivities.filter(a => a.status === activeTab);

  const myImpactStats = {
    totalActivities: 12,
    livesImpacted: 2340,
    treesPlanted: 45,
    rezCoinsEarned: 2400,
    brandedCoinsEarned: 1650
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#111827'} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111827' }]}>Social Impact</Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Earn while making a difference</Text>
            </View>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={isDark ? ['rgba(16, 185, 129, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)'] : ['rgba(16, 185, 129, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
            style={[styles.heroCard, { borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)' }]}
          >
            <LinearGradient colors={['#10B981', '#3B82F6']} style={styles.heroIconContainer}>
              <Ionicons name="heart" size={32} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.heroTitle, { color: isDark ? '#FFF' : '#111827' }]}>Powerful Differentiator</Text>
            <Text style={[styles.heroText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Do good, earn ReZ Coins + Branded Coins from sponsors
            </Text>
          </LinearGradient>
        </View>

        {/* My Impact Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsHeader}>
            <Ionicons name="ribbon" size={20} color="#F59E0B" />
            <Text style={[styles.statsTitle, { color: isDark ? '#FFF' : '#111827' }]}>Your Impact</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="heart" size={20} color="#EF4444" />
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Lives Impacted</Text>
              </View>
              <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myImpactStats.livesImpacted.toLocaleString()}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4', borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#BBF7D0' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="leaf" size={20} color="#22C55E" />
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Trees Planted</Text>
              </View>
              <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myImpactStats.treesPlanted}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="cash" size={20} color="#10B981" />
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>ReZ Coins</Text>
              </View>
              <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myImpactStats.rezCoinsEarned.toLocaleString()}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : '#FAF5FF', borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#E9D5FF' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="sparkles" size={20} color="#A855F7" />
                <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Branded Coins</Text>
              </View>
              <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111827' }]}>{myImpactStats.brandedCoinsEarned.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                { backgroundColor: activeTab === tab.id ? '#10B981' : isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }
              ]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#FFF' : (isDark ? '#9CA3AF' : '#6B7280') }]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activities List */}
        <View style={styles.content}>
          {filteredActivities.map((activity) => (
            <View key={activity.id} style={[styles.activityCard, { backgroundColor: isDark ? '#1F2937' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityIconContainer, { backgroundColor: activity.iconBg }]}>
                  <Text style={styles.activityIcon}>{activity.icon}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <View style={styles.activityTitleRow}>
                    <Text style={[styles.activityTitle, { color: isDark ? '#FFF' : '#111827' }]}>{activity.title}</Text>
                    {activity.status === 'completed' && (
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    )}
                  </View>
                  <View style={styles.organizerRow}>
                    <Text style={styles.organizerLogo}>{activity.logo}</Text>
                    <Text style={[styles.organizerName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{activity.organizer}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{activity.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{activity.time}</Text>
                </View>
                <View style={[styles.detailItem, styles.detailItemFull]}>
                  <Ionicons name="location" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {activity.location} • {activity.distance} away
                  </Text>
                </View>
              </View>

              <View style={[styles.impactContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}>
                <View style={styles.impactHeader}>
                  <Ionicons name="trending-up" size={16} color="#3B82F6" />
                  <Text style={[styles.impactText, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>{activity.impact}</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]}>
                    <LinearGradient
                      colors={['#3B82F6', '#10B981']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${(activity.enrolled / activity.goal) * 100}%` }]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {activity.enrolled}/{activity.goal}
                  </Text>
                </View>
              </View>

              <View style={styles.rewardsRow}>
                <View style={styles.rewardItem}>
                  <Text style={styles.rewardEmoji}>💰</Text>
                  <Text style={[styles.rewardValue, { color: '#10B981' }]}>+{activity.rewards.rezCoins}</Text>
                </View>
                {activity.rewards.brandedCoins > 0 && (
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardEmoji}>🏪</Text>
                    <Text style={[styles.rewardValue, { color: '#A855F7' }]}>+{activity.rewards.brandedCoins}</Text>
                    <Text style={[styles.brandName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                      ({activity.rewards.brandName})
                    </Text>
                  </View>
                )}
              </View>

              {activity.status === 'completed' ? (
                <TouchableOpacity style={[styles.ctaButton, styles.ctaButtonDisabled, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }]} disabled>
                  <Text style={[styles.ctaButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>✓ Completed</Text>
                </TouchableOpacity>
              ) : (
                <Link href={`/playandearn/SocialImpactEventDetail?id=${activity.id}`} asChild>
                  <TouchableOpacity style={styles.ctaButton}>
                    <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.ctaButtonGradient}>
                      <Text style={styles.ctaButtonText}>Register Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.footerSection}>
          <LinearGradient
            colors={isDark ? ['rgba(16, 185, 129, 0.1)', 'rgba(59, 130, 246, 0.1)'] : ['#ECFDF5', '#EFF6FF']}
            style={[styles.footerCard, { borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0' }]}
          >
            <Text style={[styles.footerTitle, { color: isDark ? '#FFF' : '#111827' }]}>Every Action Counts</Text>
            <Text style={[styles.footerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Join thousands making an impact while earning rewards
            </Text>
            <View style={styles.footerStats}>
              <View style={styles.footerStat}>
                <Ionicons name="people" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.footerStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>5,234 members</Text>
              </View>
              <View style={styles.footerStat}>
                <Ionicons name="heart" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.footerStatText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>234 events</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  heroSection: {
    padding: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  activityCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  activityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 28,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  organizerLogo: {
    fontSize: 16,
  },
  organizerName: {
    fontSize: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: (width - 80) / 2,
  },
  detailItemFull: {
    width: '100%',
  },
  detailText: {
    fontSize: 14,
  },
  impactContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardEmoji: {
    fontSize: 18,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 12,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  footerSection: {
    padding: 16,
  },
  footerCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  footerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerStatText: {
    fontSize: 12,
  },
});

export default SocialImpact;

