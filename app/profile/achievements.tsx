// Achievements Screen
// Displays user badges and achievements with progress tracking

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAchievements } from '@/hooks/useAchievements';
import { Achievement } from '@/services/achievementApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

type FilterType = 'all' | 'unlocked' | 'locked';

export default function AchievementsPage() {
  const router = useRouter();
  const {
    achievements,
    progress,
    isLoading,
    refetch,
    recalculateAchievements,
  } = useAchievements(true);

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    const success = await recalculateAchievements();
    setIsRecalculating(false);
    if (success) {
      console.log('Achievements recalculated successfully');
    }
  };

  const filteredAchievements = achievements.filter(ach => {
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return true;
  });

  const renderAchievementCard = (achievement: Achievement) => {
    const isLocked = !achievement.unlocked;

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementCard,
          isLocked && styles.achievementCardLocked,
        ]}
        onPress={() => setSelectedAchievement(achievement)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.iconContainer,
          { backgroundColor: isLocked ? '#F3F4F6' : `${achievement.color}20` }
        ]}>
          <Ionicons
            name={achievement.icon as any}
            size={32}
            color={isLocked ? '#9CA3AF' : achievement.color}
          />
        </View>

        <ThemedText style={[
          styles.achievementTitle,
          isLocked && styles.achievementTitleLocked
        ]} numberOfLines={2}>
          {achievement.title}
        </ThemedText>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${achievement.progress}%`,
                  backgroundColor: isLocked ? '#D1D5DB' : achievement.color,
                }
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {achievement.progress}%
          </ThemedText>
        </View>

        {achievement.unlocked && achievement.unlockedDate && (
          <View style={styles.unlockedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <ThemedText style={styles.unlockedText}>Unlocked</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>Achievements</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {progress?.summary.unlocked || 0} of {progress?.summary.total || 0} unlocked
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.recalculateButton}
            onPress={handleRecalculate}
            disabled={isRecalculating}
          >
            <Ionicons
              name="refresh"
              size={22}
              color="white"
              style={isRecalculating ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Summary */}
        {progress && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryNumber}>
                {progress.summary.completionPercentage.toFixed(0)}%
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Complete</ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryNumber}>
                {progress.summary.unlocked}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Unlocked</ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryNumber}>
                {progress.summary.inProgress}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>In Progress</ThemedText>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <ThemedText style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({achievements.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unlocked' && styles.filterTabActive]}
          onPress={() => setFilter('unlocked')}
        >
          <ThemedText style={[styles.filterText, filter === 'unlocked' && styles.filterTextActive]}>
            Unlocked ({achievements.filter(a => a.unlocked).length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'locked' && styles.filterTabActive]}
          onPress={() => setFilter('locked')}
        >
          <ThemedText style={[styles.filterText, filter === 'locked' && styles.filterTextActive]}>
            Locked ({achievements.filter(a => !a.unlocked).length})
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Achievements Grid */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isLoading && achievements.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading achievements...</ThemedText>
          </View>
        ) : filteredAchievements.length > 0 ? (
          <View style={styles.achievementsGrid}>
            {filteredAchievements.map(renderAchievementCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>
              {filter === 'unlocked'
                ? 'No achievements unlocked yet'
                : filter === 'locked'
                ? 'All achievements unlocked!'
                : 'No achievements found'}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Achievement Detail Modal */}
      <Modal
        visible={selectedAchievement !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedAchievement(null)}
        >
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <View
                  style={[
                    styles.modalIconContainer,
                    { backgroundColor: `${selectedAchievement.color}20` }
                  ]}
                >
                  <Ionicons
                    name={selectedAchievement.icon as any}
                    size={48}
                    color={selectedAchievement.color}
                  />
                </View>

                <ThemedText style={styles.modalTitle}>
                  {selectedAchievement.title}
                </ThemedText>

                <ThemedText style={styles.modalDescription}>
                  {selectedAchievement.description}
                </ThemedText>

                {/* Progress Details */}
                <View style={styles.modalProgressContainer}>
                  <View style={styles.modalProgressBar}>
                    <View
                      style={[
                        styles.modalProgressFill,
                        {
                          width: `${selectedAchievement.progress}%`,
                          backgroundColor: selectedAchievement.color,
                        }
                      ]}
                    />
                  </View>
                  <ThemedText style={styles.modalProgressText}>
                    {selectedAchievement.currentValue || 0} / {selectedAchievement.targetValue} ({selectedAchievement.progress}%)
                  </ThemedText>
                </View>

                {selectedAchievement.unlocked && selectedAchievement.unlockedDate && (
                  <View style={styles.modalUnlockedInfo}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <ThemedText style={styles.modalUnlockedText}>
                      Unlocked on {new Date(selectedAchievement.unlockedDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedAchievement(null)}
                >
                  <ThemedText style={styles.modalCloseText}>Close</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  recalculateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotating: {
    // Animation would be added via Animated API
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  achievementCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 36,
  },
  achievementTitleLocked: {
    color: '#9CA3AF',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: '600',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  unlockedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalProgressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalUnlockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalUnlockedText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});