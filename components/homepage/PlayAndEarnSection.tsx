import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import gamificationApi from '@/services/gamificationApi';

// Import card components
import DailySpinCard from './cards/DailySpinCard';
import ChallengesCard from './cards/ChallengesCard';
import StreakRewardsCard from './cards/StreakRewardsCard';
import SurpriseCoinDropCard from './cards/SurpriseCoinDropCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with padding

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  primaryLight: '#26C97D',
  gold: '#FFC857',
  goldDark: '#F5A623',
  goldLight: '#FFD87A',
  white: '#FFFFFF',
  textDark: '#0B2240',
  textMuted: '#6B7280',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  background: '#F9FAFB',
};

interface PlayAndEarnData {
  dailySpin: {
    spinsRemaining: number;
    maxSpins: number;
    canSpin: boolean;
    lastSpinAt: string | null;
    nextSpinAt: string | null;
  };
  challenges: {
    active: Array<{
      id: string;
      title: string;
      progress: {
        current: number;
        target: number;
        percentage: number;
      };
      reward: number;
      expiresAt: string;
    }>;
    totalActive: number;
    completedToday: number;
  };
  streak: {
    type: string;
    currentStreak: number;
    longestStreak: number;
    nextMilestone: { day: number; coins: number };
    todayCheckedIn: boolean;
  };
  surpriseDrop: {
    id?: string;
    available: boolean;
    coins: number;
    message: string | null;
    expiresAt: string | null;
    reason?: string;
  };
  coinBalance: number;
}

const PlayAndEarnSection: React.FC = () => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [data, setData] = useState<PlayAndEarnData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = authState?.isAuthenticated ?? false;

  const fetchPlayAndEarnData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await gamificationApi.getPlayAndEarnData();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch play and earn data:', err);
      setError('Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPlayAndEarnData();
  }, [fetchPlayAndEarnData]);

  const handleSpinPress = () => {
    router.push('/games/spin-wheel');
  };

  const handleChallengesPress = () => {
    router.push('/challenges');
  };

  const handleStreakPress = async () => {
    // Check in for streak if not already done
    if (data && !data.streak.todayCheckedIn) {
      try {
        await gamificationApi.streakCheckin();
        fetchPlayAndEarnData(); // Refresh data
      } catch (err) {
        console.error('Failed to check in:', err);
      }
    }
    router.push('/gamification');
  };

  const handleSurpriseDropPress = async () => {
    if (data?.surpriseDrop?.available && data.surpriseDrop.id) {
      try {
        await gamificationApi.claimSurpriseDrop(data.surpriseDrop.id);
        fetchPlayAndEarnData(); // Refresh data
      } catch (err) {
        console.error('Failed to claim drop:', err);
      }
    }
  };

  const handleViewAll = () => {
    router.push('/gamification');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.headerIconGradient}
            >
              <Ionicons name="game-controller" size={18} color={COLORS.white} />
            </LinearGradient>
          </View>
          <View>
            <Text style={styles.headerTitle}>Play & Earn More</Text>
            <Text style={styles.headerSubtitle}>Daily rewards & challenges</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Cards Grid */}
      <View style={styles.cardsGrid}>
        <View style={styles.cardRow}>
          <DailySpinCard
            spinsRemaining={data.dailySpin.spinsRemaining}
            maxSpins={data.dailySpin.maxSpins}
            canSpin={data.dailySpin.canSpin}
            onPress={handleSpinPress}
          />
          <ChallengesCard
            totalActive={data.challenges.totalActive}
            completedToday={data.challenges.completedToday}
            topChallenge={data.challenges.active[0]}
            onPress={handleChallengesPress}
          />
        </View>
        <View style={styles.cardRow}>
          <StreakRewardsCard
            currentStreak={data.streak.currentStreak}
            nextMilestone={data.streak.nextMilestone}
            todayCheckedIn={data.streak.todayCheckedIn}
            onPress={handleStreakPress}
          />
          <SurpriseCoinDropCard
            available={data.surpriseDrop.available}
            coins={data.surpriseDrop.coins}
            message={data.surpriseDrop.message}
            onPress={handleSurpriseDropPress}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  headerIconContainer: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardsGrid: {
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default PlayAndEarnSection;
