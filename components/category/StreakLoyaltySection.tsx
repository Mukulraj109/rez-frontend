/**
 * StreakLoyaltySection Component
 * Display user's daily streak, brand loyalty, and missions
 * Adapted from Rez_v-2-main StreakLoyaltySection
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loyaltyData, LoyaltyData } from '@/data/categoryDummyData';

interface StreakLoyaltySectionProps {
  data?: LoyaltyData;
  onMissionPress?: (missionId: string) => void;
}

const StreakLoyaltySection: React.FC<StreakLoyaltySectionProps> = ({
  data = loyaltyData,
  onMissionPress,
}) => {
  const router = useRouter();

  const handleMissionPress = (missionId: string) => {
    if (onMissionPress) {
      onMissionPress(missionId);
    } else {
      router.push(`/missions/${missionId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Daily Streak */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.sectionTitle}>Daily Streak</Text>
        </View>
        <View style={styles.streakRow}>
          {[...Array(data.streak.target)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.streakDot,
                i < data.streak.current && styles.streakDotActive,
              ]}
            >
              {i < data.streak.current && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.streakText}>
          {data.streak.current}/{data.streak.target} days - Keep going!
        </Text>
      </View>

      {/* Brand Loyalty */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.crownEmoji}>👑</Text>
          <Text style={styles.sectionTitle}>Brand Loyalty</Text>
        </View>
        <View style={styles.loyaltyList}>
          {data.brandLoyalty.slice(0, 3).map((brand) => (
            <View key={brand.brandId} style={styles.loyaltyItem}>
              <View style={styles.loyaltyInfo}>
                <Text style={styles.loyaltyBrand}>{brand.brandName}</Text>
                <Text style={styles.loyaltyTier}>{brand.tier}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${brand.progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {brand.purchaseCount}/{brand.nextTierAt}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Missions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.targetEmoji}>🎯</Text>
          <Text style={styles.sectionTitle}>Weekly Missions</Text>
        </View>
        <View style={styles.missionsList}>
          {data.missions.slice(0, 3).map((mission) => (
            <TouchableOpacity
              key={mission.id}
              style={styles.missionItem}
              onPress={() => handleMissionPress(mission.id)}
              activeOpacity={0.8}
            >
              <View style={styles.missionIcon}>
                <Text style={styles.missionEmoji}>{mission.icon}</Text>
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <View style={styles.missionProgress}>
                  <View style={styles.missionProgressBar}>
                    <View
                      style={[
                        styles.missionProgressFill,
                        { width: `${(mission.progress / mission.target) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.missionProgressText}>
                    {mission.progress}/{mission.target}
                  </Text>
                </View>
              </View>
              <View style={styles.missionReward}>
                <Text style={styles.coinSmall}>🪙</Text>
                <Text style={styles.rewardText}>{mission.reward}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0B2240',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(11, 34, 64, 0.04), 0 8px 24px rgba(11, 34, 64, 0.06)',
      },
    }),
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fireEmoji: {
    fontSize: 18,
  },
  crownEmoji: {
    fontSize: 18,
  },
  targetEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  streakRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDotActive: {
    backgroundColor: '#00C06A',
  },
  streakText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loyaltyList: {
    gap: 12,
  },
  loyaltyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loyaltyInfo: {
    width: 80,
  },
  loyaltyBrand: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  loyaltyTier: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00C06A',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#9CA3AF',
    width: 30,
    textAlign: 'right',
  },
  missionsList: {
    gap: 10,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  missionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionEmoji: {
    fontSize: 18,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  missionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  missionProgressFill: {
    height: '100%',
    backgroundColor: '#00C06A',
    borderRadius: 2,
  },
  missionProgressText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  missionReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  coinSmall: {
    fontSize: 10,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
});

export default memo(StreakLoyaltySection);
