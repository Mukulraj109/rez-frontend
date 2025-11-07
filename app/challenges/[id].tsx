import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import ClaimRewardModal from '@/components/challenges/ClaimRewardModal';
import ChallengeTips from '@/components/challenges/ChallengeTips';
import ActivityTimeline from '@/components/challenges/ActivityTimeline';
import coinSyncService from '@/services/coinSyncService';

const { width } = Dimensions.get('window');

interface Challenge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: {
    action: string;
    target: number;
    stores?: string[];
    categories?: string[];
    minAmount?: number;
  };
  rewards: {
    coins: number;
    badges?: string[];
    multiplier?: number;
  };
  active: boolean;
  startDate: string;
  endDate: string;
}

interface UserProgress {
  _id: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardsClaimed: boolean;
  startDate: string;
  endDate: string;
}

interface ChallengeDetailData {
  challenge: Challenge;
  userProgress: UserProgress | null;
}

export default function ChallengeDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChallengeDetailData | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimData, setClaimData] = useState<{
    coins: number;
    beforeBalance: number;
    afterBalance: number;
  } | null>(null);
  const { state: authState } = useAuth();

  // Pulse animation for Claim Reward button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (authState.isAuthenticated && id) {
      loadChallengeDetail();
    }
  }, [authState.isAuthenticated, id]);

  // Start pulse animation when challenge is completed and ready to claim
  useEffect(() => {
    if (data?.userProgress?.completed && !data?.userProgress?.rewardsClaimed) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [data?.userProgress?.completed, data?.userProgress?.rewardsClaimed]);

  const loadChallengeDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 [Challenge Detail] Loading challenge:', id);

      // Fetch challenge and user progress
      const [challengeRes, progressRes] = await Promise.all([
        apiClient.get('/gamification/challenges'),
        apiClient.get('/gamification/challenges/my-progress?includeCompleted=true'),
      ]);

      const allChallenges = (challengeRes.data as any) || [];
      const allProgress = (progressRes.data as any)?.challenges || [];

      console.log('📊 [Challenge Detail] All challenges:', allChallenges.length);
      console.log('📊 [Challenge Detail] User progress:', allProgress.length);
      console.log('🎯 [Challenge Detail] Looking for ID:', id);

      // Find the specific challenge - first check user progress
      let progress = allProgress.find((p: any) => p._id === id);
      let challenge = progress?.challenge;

      // If not found in progress, check if it's an available challenge (not started yet)
      if (!challenge) {
        console.log('⚠️ [Challenge Detail] Not found in progress, checking available challenges...');
        challenge = allChallenges.find((c: any) => c._id === id);

        if (challenge) {
          console.log('✅ [Challenge Detail] Found available challenge:', challenge.title);
          setData({
            challenge,
            userProgress: null,
          });
          setLoading(false);
          return;
        }
      } else {
        console.log('✅ [Challenge Detail] Found in progress:', challenge.title);
      }

      if (!challenge) {
        console.error('❌ [Challenge Detail] Challenge not found anywhere. ID:', id);
        console.error('Available challenge IDs:', allChallenges.map((c: any) => c._id).slice(0, 5));
        console.error('Progress IDs:', allProgress.map((p: any) => p._id).slice(0, 5));
        showAlert('Error', 'Challenge not found', undefined, 'error');
        router.back();
        return;
      }

      setData({
        challenge,
        userProgress: progress || null,
      });
    } catch (error: any) {
      console.error('❌ [Challenge Detail] Error loading challenge:', error);
      showAlert('Error', 'Failed to load challenge details', undefined, 'error');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    if (!data) return;

    const action = data.challenge.requirements.action;
    navigateToAction(action);
  };

  const navigateToAction = (action: string) => {
    console.log('🧭 [Challenge Detail] Navigating to action:', action);

    // Special case: login_streak completes automatically
    if (action === 'login_streak') {
      showAlert(
        'Auto-Tracked Challenge! ✅',
        'This challenge completes automatically when you log in to the app. Just keep coming back daily to maintain your streak!',
        [{ text: 'Got it!' }],
        'success'
      );
      return;
    }

    const actionRoutes: Record<string, string> = {
      visit_stores: '/StoreListPage',
      upload_bills: '/bill-upload',
      refer_friends: '/referral',
      review_count: '/my-reviews',
      order_count: '/StoreListPage',
      share_deals: '/offers',
      explore_categories: '/category/all',
      add_favorites: '/wishlist',
      purchase_amount: '/StoreListPage',
    };

    const route = actionRoutes[action];
    if (route) {
      router.push(route as any);
    } else {
      showAlert('Info', 'Complete this challenge by using the app!', undefined, 'info');
    }
  };

  const handleClaimReward = async () => {
    if (!data?.userProgress) return;

    try {
      setClaiming(true);

      // Get current wallet balance
      const walletRes = await apiClient.get('/wallet/balance');
      const beforeBalance = (walletRes.data as any)?.balance || 0;

      // Claim the reward
      const response = await apiClient.post(`/gamification/challenges/${data.userProgress._id}/claim`);

      if ((response.data as any).success) {
        const coinsEarned = data.challenge.rewards.coins;

        // Sync coins to wallet
        const syncResult = await coinSyncService.handleChallengeReward(
          data.userProgress._id,
          'Challenge',
          coinsEarned
        );

        const afterBalance = syncResult.success ? syncResult.newWalletBalance : beforeBalance + coinsEarned;

        // Show celebration modal
        setClaimData({
          coins: coinsEarned,
          beforeBalance,
          afterBalance,
        });
        setShowClaimModal(true);
      }
    } catch (error: any) {
      console.error('❌ [Challenge Detail] Error claiming reward:', error);
      showAlert('Error', 'Failed to claim reward', undefined, 'error');
    } finally {
      setClaiming(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#8B5CF6';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      visit_stores: 'Visit Stores',
      upload_bills: 'Upload Bills',
      refer_friends: 'Refer Friends',
      review_count: 'Write Reviews',
      order_count: 'Place Orders',
      share_deals: 'Share Deals',
      explore_categories: 'Explore Categories',
      add_favorites: 'Add Favorites',
      login_streak: 'Daily Login',
      purchase_amount: 'Shop Now',
    };
    return labels[action] || 'Complete Action';
  };

  const getTimeRemaining = () => {
    if (!data?.userProgress?.endDate) return 'No deadline';

    const endDate = new Date(data.userProgress.endDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const generateMockActivities = () => {
    if (!data?.userProgress || data.userProgress.progress === 0) return [];

    const activities = [];
    const now = new Date();
    const action = data.challenge.requirements.action;
    const actionLabel = getActionLabel(action);

    for (let i = 0; i < data.userProgress.progress; i++) {
      const hoursAgo = (data.userProgress.progress - i) * 2; // 2 hours between each activity
      const activityTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

      activities.push({
        id: `activity-${i}`,
        action: action,
        description: `Completed: ${actionLabel} #${i + 1}`,
        timestamp: activityTime.toISOString(),
        progress: i + 1,
      });
    }

    return activities.reverse(); // Most recent first
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: 'Challenge Details',
            headerShown: true,
          }}
        />
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            title: 'Challenge Details',
            headerShown: true,
          }}
        />
        <Text style={styles.errorText}>Challenge not found</Text>
      </View>
    );
  }

  const { challenge, userProgress } = data;
  const progress = userProgress ? (userProgress.progress / userProgress.target) * 100 : 0;
  const isCompleted = userProgress?.completed || false;
  const canClaim = isCompleted && !userProgress?.rewardsClaimed;
  const isClaimed = userProgress?.rewardsClaimed || false;
  const isStarted = !!userProgress;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Challenge Details',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#8B5CF6',
          },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient colors={['#8B5CF6', '#7C3AED', '#6D28D9']} style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name={challenge.icon as any} size={60} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{challenge.title}</Text>
          <Text style={styles.heroDescription}>{challenge.description}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
              <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Ionicons name="calendar" size={16} color="#fff" />
              <Text style={styles.typeText}>{challenge.type.toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Section */}
        {isStarted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                {/* Milestone Markers */}
                {[25, 50, 75, 100].map((milestone) => {
                  const isPassed = progress >= milestone;
                  return (
                    <View
                      key={milestone}
                      style={[
                        styles.milestoneMarker,
                        { left: `${milestone}%` },
                        isPassed && styles.milestoneMarkerPassed,
                      ]}
                    >
                      <View style={[styles.milestoneDot, isPassed && styles.milestoneDotPassed]}>
                        {isPassed && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                      <Text style={[styles.milestoneLabel, isPassed && styles.milestoneLabelPassed]}>
                        {milestone}%
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.progressText}>
                {userProgress.progress}/{userProgress.target} ({Math.round(progress)}%)
              </Text>
            </View>
          </View>
        )}

        {/* Requirements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Do</Text>
          <View style={styles.requirementCard}>
            <View style={styles.requirementHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
              <Text style={styles.requirementTitle}>
                {getActionLabel(challenge.requirements.action)}
              </Text>
            </View>
            <Text style={styles.requirementDescription}>
              Complete {challenge.requirements.target} {getActionLabel(challenge.requirements.action).toLowerCase()} to
              finish this challenge
            </Text>

            {isStarted && (
              <View style={styles.checklistContainer}>
                {Array.from({ length: challenge.requirements.target }).map((_, index) => {
                  const isDone = index < (userProgress?.progress || 0);
                  return (
                    <View key={index} style={styles.checklistItem}>
                      <Ionicons
                        name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={isDone ? '#10B981' : '#9CA3AF'}
                      />
                      <Text style={[styles.checklistText, isDone && styles.checklistTextDone]}>
                        {getActionLabel(challenge.requirements.action)} #{index + 1}
                      </Text>
                      {isDone && <Text style={styles.checklistDone}>Done</Text>}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Challenge Tips */}
        <View style={styles.section}>
          <ChallengeTips action={challenge.requirements.action} difficulty={challenge.difficulty} />
        </View>

        {/* Rewards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <View style={styles.rewardsCard}>
            <View style={styles.rewardItem}>
              <Ionicons name="diamond" size={32} color="#8B5CF6" />
              <Text style={styles.rewardAmount}>{challenge.rewards.coins}</Text>
              <Text style={styles.rewardLabel}>Coins</Text>
            </View>
            {challenge.rewards.badges && challenge.rewards.badges.length > 0 && (
              <View style={styles.rewardItem}>
                <Ionicons name="trophy" size={32} color="#F59E0B" />
                <Text style={styles.rewardAmount}>{challenge.rewards.badges.length}</Text>
                <Text style={styles.rewardLabel}>Badge{challenge.rewards.badges.length > 1 ? 's' : ''}</Text>
              </View>
            )}
            {challenge.rewards.multiplier && (
              <View style={styles.rewardItem}>
                <Ionicons name="flash" size={32} color="#EF4444" />
                <Text style={styles.rewardAmount}>{challenge.rewards.multiplier}x</Text>
                <Text style={styles.rewardLabel}>Multiplier</Text>
              </View>
            )}
          </View>
        </View>

        {/* Activity Timeline */}
        {isStarted && userProgress && userProgress.progress > 0 && (
          <View style={styles.section}>
            <ActivityTimeline
              activities={generateMockActivities()}
              currentProgress={userProgress.progress}
              targetProgress={userProgress.target}
            />
          </View>
        )}

        {/* Time Remaining */}
        {isStarted && (
          <View style={styles.timeSection}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.timeText}>{getTimeRemaining()}</Text>
          </View>
        )}

        {/* Spacer for button and bottom nav */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        {isClaimed ? (
          <View style={styles.claimedButton}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.claimedText}>Rewards Claimed</Text>
          </View>
        ) : canClaim ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaimReward}
              disabled={claiming}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.claimButtonGradient}>
                {claiming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="gift" size={24} color="#fff" />
                    <Text style={styles.claimButtonText}>Claim Reward</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartChallenge}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.startButtonGradient}>
              <Text style={styles.startButtonText}>
                {isStarted ? `Continue: ${getActionLabel(challenge.requirements.action)}` : 'Start Challenge'}
              </Text>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Claim Reward Modal */}
      {claimData && (
        <ClaimRewardModal
          visible={showClaimModal}
          onClose={() => {
            setShowClaimModal(false);
            router.back();
          }}
          reward={{
            coins: claimData.coins,
            badges: data?.challenge.rewards.badges,
            multiplier: data?.challenge.rewards.multiplier,
          }}
          beforeStats={{
            coins: claimData.beforeBalance,
          }}
          afterStats={{
            coins: claimData.afterBalance,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  progressBarWrapper: {
    position: 'relative',
    marginBottom: 40,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
  },
  milestoneMarker: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
    transform: [{ translateX: -12 }],
  },
  milestoneMarkerPassed: {},
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneDotPassed: {
    backgroundColor: '#10B981',
    borderColor: '#fff',
  },
  milestoneLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  milestoneLabelPassed: {
    color: '#10B981',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  requirementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  requirementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  requirementDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  checklistDone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  rewardsCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  rewardItem: {
    alignItems: 'center',
    gap: 8,
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  claimedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  claimedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  claimButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
