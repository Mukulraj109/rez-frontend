import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import exploreApi, { ExploreStats } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

const LiveStatsStrip = () => {
  const router = useRouter();
  const [stats, setStats] = useState<ExploreStats>({
    activeUsers: 0,
    earnedToday: 0,
    dealsLive: 0,
    peopleNearby: 0,
    peopleEarnedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const fetchLiveStats = async () => {
    try {
      const response = await exploreApi.getLiveStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('[LiveStatsStrip] Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}k`;
    }
    return `₹${amount}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <View style={styles.bannerLeft}>
          <View style={styles.liveDot} />
          <View style={styles.trendIcon}>
            <Ionicons name="trending-up" size={20} color="#00C06A" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {stats.peopleEarnedToday > 0
                ? `${stats.peopleEarnedToday} people near you earned rewards today`
                : `${stats.peopleNearby} people near you earned rewards today`}
            </Text>
            <Text style={styles.bannerSubtitle}>Join them and start saving</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.seeHowButton}
          onPress={() => navigateTo('/playandearn')}
        >
          <Text style={styles.seeHowText}>See How →</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="people" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>{stats.activeUsers}</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="wallet" size={18} color="#D97706" />
          </View>
          <Text style={styles.statValue}>
            {formatCurrency(stats.earnedToday)}
          </Text>
          <Text style={styles.statLabel}>Earned Today</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="flash" size={18} color="#00C06A" />
          </View>
          <Text style={styles.statValue}>{stats.dealsLive}</Text>
          <Text style={styles.statLabel}>Deals Live</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C06A',
  },
  trendIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  seeHowButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeHowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});

export default LiveStatsStrip;
