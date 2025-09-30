import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RewardTask } from '@/types/partner.types';

interface RewardTasksProps {
  tasks: RewardTask[];
  onCompleteTask?: (taskId: string) => void;
  onClaimReward?: (taskId: string) => void;
}

export default function RewardTasks({ 
  tasks, 
  onCompleteTask,
  onClaimReward 
}: RewardTasksProps) {
  const getTaskIcon = (type: RewardTask['type']) => {
    switch (type) {
      case 'review':
        return 'star';
      case 'purchase':
        return 'bag';
      case 'referral':
        return 'people';
      case 'social':
        return 'share-social';
      default:
        return 'trophy';
    }
  };

  const getTaskColor = (type: RewardTask['type']) => {
    switch (type) {
      case 'review':
        return ['#F59E0B', '#FBBF24'];
      case 'purchase':
        return ['#8B5CF6', '#A78BFA'];
      case 'referral':
        return ['#10B981', '#34D399'];
      case 'social':
        return ['#EF4444', '#F87171'];
      default:
        return ['#6B7280', '#9CA3AF'];
    }
  };

  const handleTaskPress = (task: RewardTask) => {
    if (task.isCompleted && task.reward.isClaimed) {
      Alert.alert('Already Claimed', 'This reward has already been claimed.');
      return;
    }

    if (task.isCompleted && !task.reward.isClaimed) {
      Alert.alert(
        'Claim Reward',
        `Claim ${task.reward.title}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Claim', 
            onPress: () => onClaimReward?.(task.id),
            style: 'default'
          }
        ]
      );
      return;
    }

    // Task not completed - show progress or action
    Alert.alert(
      task.title,
      task.description + (task.progress ? `\n\nProgress: ${task.progress.current}/${task.progress.target}` : ''),
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Start Task', 
          onPress: () => onCompleteTask?.(task.id),
          style: 'default'
        }
      ]
    );
  };

  const renderProgressBar = (task: RewardTask) => {
    if (!task.progress) return null;

    const progressPercentage = (task.progress.current / task.progress.target) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Progress: {task.progress.current}/{task.progress.target}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={getTaskColor(task.type)}
            style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]}
          />
        </View>
      </View>
    );
  };

  const renderTaskCard = (task: RewardTask) => {
    const colors = getTaskColor(task.type);
    const isCompleted = task.isCompleted;
    const isClaimed = task.reward.isClaimed;

    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.taskCard,
          isCompleted && styles.completedTaskCard,
          isClaimed && styles.claimedTaskCard
        ]}
        onPress={() => handleTaskPress(task)}
        activeOpacity={0.7}
      >
        {/* Task Icon */}
        <View style={styles.taskIconContainer}>
          <LinearGradient
            colors={isCompleted ? ['#10B981', '#059669'] : colors}
            style={styles.taskIconGradient}
          >
            <Ionicons 
              name={isCompleted ? 'checkmark' : getTaskIcon(task.type)} 
              size={20} 
              color="white" 
            />
          </LinearGradient>
        </View>

        {/* Task Content */}
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={[
              styles.taskTitle,
              isCompleted && styles.completedTaskTitle
            ]}>
              {task.title}
            </Text>
            <View style={[
              styles.taskTypeBadge,
              { backgroundColor: colors[0] + '20' }
            ]}>
              <Text style={[styles.taskTypeBadgeText, { color: colors[0] }]}>
                {task.type.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.taskDescription}>
            {task.description}
          </Text>

          {/* Progress Bar for incomplete tasks */}
          {!isCompleted && renderProgressBar(task)}

          {/* Reward Info */}
          <View style={styles.rewardInfo}>
            <View style={styles.rewardDetails}>
              <Text style={styles.rewardLabel}>Reward:</Text>
              <Text style={[
                styles.rewardTitle,
                isCompleted && styles.completedRewardTitle
              ]}>
                {task.reward.title}
              </Text>
              <Text style={styles.rewardDescription}>
                {task.reward.description}
              </Text>
            </View>

            {/* Reward Value */}
            <View style={[
              styles.rewardValueContainer,
              isCompleted && styles.completedRewardValueContainer
            ]}>
              <Text style={[
                styles.rewardValue,
                isCompleted && styles.completedRewardValue
              ]}>
                {typeof task.reward.value === 'number' ? `₹${task.reward.value}` : task.reward.value}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          {isClaimed ? (
            <View style={styles.claimedStatus}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.claimedStatusText}>Claimed</Text>
            </View>
          ) : isCompleted ? (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => handleTaskPress(task)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.claimButtonGradient}
              >
                <Ionicons name="gift" size={16} color="white" />
                <Text style={styles.claimButtonText}>Claim</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.pendingStatus}>
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text style={styles.pendingStatusText}>In Progress</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const completedTasks = tasks.filter(task => task.isCompleted);
  const pendingTasks = tasks.filter(task => !task.isCompleted);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.headerIconGradient}
          >
            <Ionicons name="trophy" size={20} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.headerTitle}>Ready to claim</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {completedTasks.length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
            {pendingTasks.length}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>
            {completedTasks.filter(t => !t.reward.isClaimed).length}
          </Text>
          <Text style={styles.statLabel}>Ready to Claim</Text>
        </View>
      </View>

      {/* Tasks List */}
      <ScrollView 
        style={styles.tasksContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Ready to Claim Section */}
        {completedTasks.filter(t => !t.reward.isClaimed).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 Ready to Claim</Text>
            {completedTasks
              .filter(t => !t.reward.isClaimed)
              .map(renderTaskCard)}
          </View>
        )}

        {/* In Progress Section */}
        {pendingTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏳ In Progress</Text>
            {pendingTasks.map(renderTaskCard)}
          </View>
        )}

        {/* Completed Section */}
        {completedTasks.filter(t => t.reward.isClaimed).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Completed & Claimed</Text>
            {completedTasks
              .filter(t => t.reward.isClaimed)
              .map(renderTaskCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tasksContainer: {
    maxHeight: 600,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedTaskCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  claimedTaskCard: {
    opacity: 0.7,
  },
  taskIconContainer: {
    marginRight: 12,
  },
  taskIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  completedTaskTitle: {
    color: '#059669',
  },
  taskTypeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  taskTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  rewardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rewardDetails: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  completedRewardTitle: {
    color: '#059669',
  },
  rewardDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  rewardValueContainer: {
    backgroundColor: '#8B5CF620',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  completedRewardValueContainer: {
    backgroundColor: '#10B98120',
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  completedRewardValue: {
    color: '#10B981',
  },
  statusContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  claimedStatus: {
    alignItems: 'center',
  },
  claimedStatusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  claimButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  claimButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  claimButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  pendingStatus: {
    alignItems: 'center',
  },
  pendingStatusText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 4,
  },
});