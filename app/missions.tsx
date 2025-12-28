/**
 * Missions Screen - Converted from V2 Web
 * Exact match to Rez_v-2-main/src/pages/Missions.jsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray700: '#374151',
  green500: '#22C55E',
  green600: '#16A34A',
  green400: '#4ADE80',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber400: '#FBBF24',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  purple400: '#A78BFA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue400: '#60A5FA',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  orange400: '#FB923C',
  orange600: '#EA580C',
  emerald500: '#10B981',
};

interface Mission {
  id: number;
  title: string;
  description: string;
  reward: { coins: number; cashback: number };
  progress: number;
  target: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  endsIn: string;
  special?: boolean;
}

const dailyMissions: Mission[] = [
  { id: 1, title: 'Morning Shopper', description: 'Make a purchase before 12 PM', reward: { coins: 50, cashback: 10 }, progress: 0, target: 1, completed: false, difficulty: 'easy', endsIn: '8h 24m' },
  { id: 2, title: 'Product Explorer', description: 'Browse 10 products', reward: { coins: 30, cashback: 0 }, progress: 7, target: 10, completed: false, difficulty: 'easy', endsIn: '8h 24m' },
  { id: 3, title: 'Social Butterfly', description: 'Share 3 products with friends', reward: { coins: 40, cashback: 5 }, progress: 1, target: 3, completed: false, difficulty: 'medium', endsIn: '8h 24m' },
  { id: 4, title: 'Review Master', description: 'Write 2 product reviews', reward: { coins: 100, cashback: 20 }, progress: 2, target: 2, completed: true, difficulty: 'medium', endsIn: '8h 24m' },
];

const weeklyMissions: Mission[] = [
  { id: 5, title: 'Shopping Spree', description: 'Complete 5 purchases this week', reward: { coins: 500, cashback: 100 }, progress: 3, target: 5, completed: false, difficulty: 'hard', endsIn: '4d 12h' },
  { id: 6, title: 'Category Champion', description: 'Shop from 3 different categories', reward: { coins: 300, cashback: 50 }, progress: 2, target: 3, completed: false, difficulty: 'medium', endsIn: '4d 12h' },
];

const specialMissions: Mission[] = [
  { id: 7, title: 'New Year Bonanza', description: 'Spend ₹5,000 in January', reward: { coins: 1000, cashback: 250 }, progress: 3200, target: 5000, completed: false, difficulty: 'legendary', endsIn: '7 days', special: true },
  { id: 8, title: 'Refer 5 Friends', description: 'Invite 5 friends to ReZ', reward: { coins: 2000, cashback: 500 }, progress: 2, target: 5, completed: false, difficulty: 'legendary', endsIn: '15 days', special: true },
];

const tabs = [
  { id: 'daily', label: 'Daily', icon: 'calendar' as const },
  { id: 'weekly', label: 'Weekly', icon: 'flag' as const },
  { id: 'special', label: 'Special', icon: 'trophy' as const },
];

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return { bg: 'rgba(34, 197, 94, 0.2)', color: COLORS.green500 };
    case 'medium': return { bg: 'rgba(59, 130, 246, 0.2)', color: COLORS.blue500 };
    case 'hard': return { bg: 'rgba(139, 92, 246, 0.2)', color: COLORS.purple500 };
    case 'legendary': return { bg: 'rgba(245, 158, 11, 0.2)', color: COLORS.orange600 };
    default: return { bg: COLORS.gray200, color: COLORS.gray600 };
  }
};

const MissionsScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');

  const getMissions = () => {
    switch (activeTab) {
      case 'daily': return dailyMissions;
      case 'weekly': return weeklyMissions;
      case 'special': return specialMissions;
      default: return dailyMissions;
    }
  };

  const missions = getMissions();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.purple600, COLORS.indigo600]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="flag" size={20} color={COLORS.amber400} />
              <Text style={styles.headerTitle}>Missions</Text>
            </View>
            <Text style={styles.headerSubtitle}>Complete tasks, earn rewards</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color={COLORS.orange400} />
            <Text style={styles.streakText}>7 Day Streak</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? COLORS.purple600 : COLORS.white}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.2)', 'rgba(34, 197, 94, 0.2)']}
            style={styles.statCard}
          >
            <Ionicons name="trophy" size={20} color={COLORS.emerald500} />
            <Text style={[styles.statValue, { color: COLORS.green600 }]}>24</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.2)', 'rgba(249, 115, 22, 0.2)']}
            style={styles.statCard}
          >
            <Ionicons name="gift" size={20} color={COLORS.amber500} />
            <Text style={[styles.statValue, { color: COLORS.amber600 }]}>2.4K</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.2)']}
            style={styles.statCard}
          >
            <Ionicons name="flash" size={20} color={COLORS.blue500} />
            <Text style={[styles.statValue, { color: COLORS.blue600 }]}>12</Text>
            <Text style={styles.statLabel}>Active</Text>
          </LinearGradient>
        </View>

        {/* Missions List */}
        <View style={styles.missionsList}>
          {missions.map(mission => {
            const diffStyle = getDifficultyStyle(mission.difficulty);
            const progressPercent = Math.round((mission.progress / mission.target) * 100);

            return (
              <View
                key={mission.id}
                style={[
                  styles.missionCard,
                  mission.completed && styles.missionCardCompleted,
                  mission.special && styles.missionCardSpecial,
                ]}
              >
                <View style={styles.missionRow}>
                  <View style={[
                    styles.missionIconBox,
                    mission.completed && styles.missionIconBoxCompleted
                  ]}>
                    {mission.completed ? (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                    ) : (
                      <Ionicons name="flag" size={24} color={COLORS.purple500} />
                    )}
                  </View>

                  <View style={styles.missionContent}>
                    <View style={styles.missionHeader}>
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: diffStyle.bg }]}>
                        <Text style={[styles.difficultyText, { color: diffStyle.color }]}>
                          {mission.difficulty}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.missionDesc}>{mission.description}</Text>

                    {/* Progress Bar */}
                    {!mission.completed && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>
                            Progress: {mission.progress}/{mission.target}
                          </Text>
                          <Text style={styles.progressPercent}>{progressPercent}%</Text>
                        </View>
                        <View style={styles.progressTrack}>
                          <LinearGradient
                            colors={[COLORS.purple500, COLORS.indigo500]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${progressPercent}%` }]}
                          />
                        </View>
                      </View>
                    )}

                    {/* Rewards */}
                    <View style={styles.rewardsRow}>
                      <View style={styles.rewardBadge}>
                        <Ionicons name="gift" size={12} color={COLORS.amber500} />
                        <Text style={styles.rewardText}>+{mission.reward.coins} coins</Text>
                      </View>
                      {mission.reward.cashback > 0 && (
                        <View style={[styles.rewardBadge, styles.cashbackBadge]}>
                          <Ionicons name="flash" size={12} color={COLORS.emerald500} />
                          <Text style={[styles.rewardText, { color: COLORS.green600 }]}>
                            ₹{mission.reward.cashback} cashback
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.endsIn}>
                      Ends in: <Text style={styles.endsInValue}>{mission.endsIn}</Text>
                    </Text>
                  </View>
                </View>

                {/* Claim Button */}
                {mission.completed && (
                  <TouchableOpacity activeOpacity={0.8} style={styles.claimButtonWrapper}>
                    <LinearGradient
                      colors={[COLORS.emerald500, COLORS.green500]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.claimButton}
                    >
                      <Text style={styles.claimButtonText}>Claim Rewards</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabActive: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.white,
  },
  tabTextActive: {
    color: COLORS.purple600,
  },
  scrollView: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray700,
    marginTop: 2,
  },
  missionsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  missionCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  missionCardCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  missionCardSpecial: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  missionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  missionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIconBoxCompleted: {
    backgroundColor: COLORS.emerald500,
  },
  missionContent: {
    flex: 1,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  missionDesc: {
    fontSize: 13,
    color: COLORS.gray600,
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.blue600,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  cashbackBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.amber600,
  },
  endsIn: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  endsInValue: {
    fontWeight: '600',
  },
  claimButtonWrapper: {
    marginTop: 12,
  },
  claimButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default MissionsScreen;
