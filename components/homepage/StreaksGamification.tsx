import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useStreaksGamification } from '@/hooks/useStreaksGamification';
import { useAuth } from '@/contexts/AuthContext';
import { Mission } from '@/types/streaksGamification.types';

interface StreaksGamificationProps {
  onViewAllPress?: () => void;
}

const StreaksGamification: React.FC<StreaksGamificationProps> = ({
  onViewAllPress,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Fetch real data from gamification API (only if authenticated)
  const { streak, missions, loading, error } = useStreaksGamification();

  const streakPercentage = streak.target > 0 ? (streak.current / streak.target) * 100 : 0;
  const daysRemaining = Math.max(0, streak.target - streak.current);

  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      router.push('/missions');
    }
  };

  // Auth loading state
  if (isAuthLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F97316" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.loginPromptContainer}>
            <View style={styles.loginIconContainer}>
              <Ionicons name="flame" size={32} color="#F97316" />
            </View>
            <View style={styles.loginPromptContent}>
              <Text style={styles.loginPromptTitle}>Track Your Saving Streaks</Text>
              <Text style={styles.loginPromptSubtitle}>
                Login to earn bonus coins and complete weekly missions
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Login to Start</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Loading state - show skeleton
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F97316" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Error state - hide section if no data
  if (error && missions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Streak Section */}
        <View style={styles.streakSection}>
          <View style={styles.streakIconContainer}>
            <View style={styles.streakIconBackground}>
              <Ionicons name="flame" size={32} color="#F97316" />
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>{streak.current}</Text>
            </View>
          </View>
          <View style={styles.streakContent}>
            <Text style={styles.streakTitle}>
              🔥 {streak.current}-day saving streak!
            </Text>
            <Text style={styles.streakSubtitle}>
              {daysRemaining} more days to unlock +{streak.nextReward} bonus coins
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={['#F97316', '#EF4444']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${streakPercentage}%` }]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Missions Header */}
        <View style={styles.missionsHeader}>
          <View style={styles.missionsHeaderLeft}>
            <Ionicons name="ellipse-outline" size={16} color="#A855F7" />
            <Text style={styles.missionsTitle}>Weekly Missions</Text>
          </View>
          <TouchableOpacity
            onPress={handleViewAll}
            activeOpacity={0.7}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color="#00C06A" />
          </TouchableOpacity>
        </View>

        {/* Missions List */}
        <View style={styles.missionsList}>
          {missions.map((mission) => {
            const progressPercent = (mission.progress / mission.target) * 100;
            return (
              <View
                key={mission.id}
                style={[
                  styles.missionCard,
                  mission.completed && styles.missionCardCompleted,
                ]}
              >
                <View style={styles.missionContent}>
                  <View
                    style={[
                      styles.missionIconContainer,
                      mission.completed && styles.missionIconContainerCompleted,
                    ]}
                  >
                    {mission.completed ? (
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    ) : (
                      <Ionicons
                        name={mission.icon}
                        size={16}
                        color={mission.completed ? '#10B981' : '#6B7280'}
                      />
                    )}
                  </View>
                  <View style={styles.missionDetails}>
                    <View style={styles.missionHeaderRow}>
                      <Text
                        style={[
                          styles.missionTitle,
                          mission.completed && styles.missionTitleCompleted,
                        ]}
                      >
                        {mission.title}
                      </Text>
                      <View style={styles.rewardContainer}>
                        <Ionicons name="gift-outline" size={12} color="#FBBF24" />
                        <Text style={styles.rewardText}>+{mission.reward}</Text>
                      </View>
                    </View>
                    {!mission.completed && (
                      <View style={styles.missionProgressRow}>
                        <View style={styles.missionProgressBarContainer}>
                          <View style={styles.missionProgressBarBackground}>
                            <View
                              style={[
                                styles.missionProgressBarFill,
                                { width: `${progressPercent}%` },
                              ]}
                            />
                          </View>
                        </View>
                        <Text style={styles.missionProgressText}>
                          {mission.progress}/{mission.target}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  streakIconContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  streakIconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    marginTop: -8,
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  streakSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  missionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00C06A',
  },
  missionsList: {
    gap: 8,
  },
  missionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 12,
  },
  missionCardCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  missionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  missionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIconContainerCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  missionDetails: {
    flex: 1,
  },
  missionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0B2240',
    flex: 1,
  },
  missionTitleCompleted: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FBBF24',
  },
  missionProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionProgressBarContainer: {
    flex: 1,
  },
  missionProgressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  missionProgressBarFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 2,
  },
  missionProgressText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 30,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  loginPromptContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  loginIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptContent: {
    flex: 1,
  },
  loginPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 4,
  },
  loginPromptSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StreaksGamification;

