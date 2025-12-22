/**
 * PriveHabitLoops - Daily check-in, progress, weekly earnings
 * Habit loop cards for engagement
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from './priveTheme';

interface HabitLoop {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  progress: number;
}

interface PriveHabitLoopsProps {
  isCheckedIn: boolean;
  streak: number;
  weeklyEarnings: number;
  loops?: HabitLoop[];
  onCheckIn?: () => void;
  onLoopPress?: (loopId: string) => void;
}

const DEFAULT_LOOPS: HabitLoop[] = [
  { id: 'smart_spend', name: 'Smart Spend', icon: '💰', completed: true, progress: 100 },
  { id: 'influence', name: 'Influence', icon: '📢', completed: false, progress: 60 },
  { id: 'redemption_pride', name: 'Redemption', icon: '🎁', completed: false, progress: 30 },
  { id: 'network', name: 'Network', icon: '🔗', completed: true, progress: 100 },
];

export const PriveHabitLoops: React.FC<PriveHabitLoopsProps> = ({
  isCheckedIn = false,
  streak = 7,
  weeklyEarnings = 2840,
  loops = DEFAULT_LOOPS,
  onCheckIn,
  onLoopPress,
}) => {
  const completedLoops = loops.filter(l => l.completed).length;
  const totalLoops = loops.length;

  return (
    <View style={styles.container}>
      {/* Daily Check-In Card */}
      <TouchableOpacity
        style={[styles.checkInCard, isCheckedIn && styles.checkInCardDone]}
        onPress={onCheckIn}
        disabled={isCheckedIn}
        activeOpacity={0.8}
      >
        <View style={styles.checkInContent}>
          <View style={styles.checkInLeft}>
            <View style={[styles.checkInIcon, isCheckedIn && styles.checkInIconDone]}>
              <Text style={styles.checkInEmoji}>{isCheckedIn ? '✓' : '☀️'}</Text>
            </View>
            <View>
              <Text style={styles.checkInTitle}>
                {isCheckedIn ? 'Checked In!' : 'Daily Check-In'}
              </Text>
              <Text style={styles.checkInSubtitle}>
                {isCheckedIn ? `${streak} day streak` : 'Tap to check in'}
              </Text>
            </View>
          </View>
          {!isCheckedIn && (
            <View style={styles.checkInReward}>
              <Text style={styles.checkInRewardText}>+10</Text>
            </View>
          )}
        </View>
        {isCheckedIn && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak} days</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressCount}>{completedLoops}/{totalLoops}</Text>
        </View>
        <View style={styles.loopsGrid}>
          {loops.map((loop) => (
            <TouchableOpacity
              key={loop.id}
              style={[styles.loopItem, loop.completed && styles.loopItemCompleted]}
              onPress={() => onLoopPress?.(loop.id)}
              activeOpacity={0.7}
            >
              <View style={styles.loopIconContainer}>
                <Text style={styles.loopIcon}>{loop.icon}</Text>
                {loop.completed && (
                  <View style={styles.loopCheckmark}>
                    <Text style={styles.loopCheckmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.loopName}>{loop.name}</Text>
              <View style={styles.loopProgressBar}>
                <View style={[styles.loopProgressFill, { width: `${loop.progress}%` }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weekly Earnings Card */}
      <TouchableOpacity style={styles.earningsCard} activeOpacity={0.9}>
        <LinearGradient
          colors={[PRIVE_COLORS.transparent.gold15, PRIVE_COLORS.transparent.gold10]}
          style={styles.earningsGradient}
        >
          <View style={styles.earningsContent}>
            <View>
              <Text style={styles.earningsLabel}>Weekly Earnings</Text>
              <Text style={styles.earningsValue}>+{weeklyEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.earningsIcon}>
              <Text style={styles.earningsEmoji}>📈</Text>
            </View>
          </View>
          <View style={styles.earningsTrend}>
            <Text style={styles.earningsTrendText}>↑ 12% from last week</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingTop: PRIVE_SPACING.lg,
    gap: PRIVE_SPACING.md,
  },
  // Check-In Card
  checkInCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  checkInCardDone: {
    borderColor: PRIVE_COLORS.status.success,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  checkInContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PRIVE_SPACING.md,
  },
  checkInIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIVE_COLORS.transparent.gold15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInIconDone: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  checkInEmoji: {
    fontSize: 20,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  checkInSubtitle: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginTop: 2,
  },
  checkInReward: {
    backgroundColor: PRIVE_COLORS.transparent.gold20,
    paddingHorizontal: PRIVE_SPACING.md,
    paddingVertical: PRIVE_SPACING.sm,
    borderRadius: PRIVE_RADIUS.md,
  },
  checkInRewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.gold.primary,
  },
  streakBadge: {
    marginTop: PRIVE_SPACING.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: PRIVE_SPACING.md,
    paddingVertical: PRIVE_SPACING.xs,
    borderRadius: PRIVE_RADIUS.full,
  },
  streakText: {
    fontSize: 12,
    color: '#FF9800',
  },
  // Progress Card
  progressCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PRIVE_SPACING.md,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  progressCount: {
    fontSize: 14,
    color: PRIVE_COLORS.gold.primary,
  },
  loopsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loopItem: {
    alignItems: 'center',
    flex: 1,
    padding: PRIVE_SPACING.sm,
  },
  loopItemCompleted: {
    opacity: 0.8,
  },
  loopIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIVE_COLORS.transparent.white10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: PRIVE_SPACING.xs,
  },
  loopIcon: {
    fontSize: 18,
  },
  loopCheckmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PRIVE_COLORS.status.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopCheckmarkText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loopName: {
    fontSize: 10,
    color: PRIVE_COLORS.text.secondary,
    marginBottom: PRIVE_SPACING.xs,
  },
  loopProgressBar: {
    width: '80%',
    height: 3,
    backgroundColor: PRIVE_COLORS.border.primary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loopProgressFill: {
    height: '100%',
    backgroundColor: PRIVE_COLORS.gold.primary,
    borderRadius: 2,
  },
  // Earnings Card
  earningsCard: {
    borderRadius: PRIVE_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
  },
  earningsGradient: {
    padding: PRIVE_SPACING.lg,
  },
  earningsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.secondary,
    marginBottom: PRIVE_SPACING.xs,
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: '300',
    color: PRIVE_COLORS.gold.primary,
  },
  earningsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIVE_COLORS.transparent.gold20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsEmoji: {
    fontSize: 24,
  },
  earningsTrend: {
    marginTop: PRIVE_SPACING.sm,
  },
  earningsTrendText: {
    fontSize: 12,
    color: PRIVE_COLORS.status.success,
  },
});

export default PriveHabitLoops;
