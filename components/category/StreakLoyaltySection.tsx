/**
 * StreakLoyaltySection Component
 * Display user's daily streak, brand loyalty, and missions
 * Adapted from Rez_v-2-main StreakLoyaltySection
 */

import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import userLoyaltyApi, { UserLoyalty } from '@/services/userLoyaltyApi';
import { loyaltyData, LoyaltyData } from '@/data/categoryDummyData';
import CoinIcon from '@/components/ui/CoinIcon';

interface StreakLoyaltySectionProps {
  data?: LoyaltyData;
  onMissionPress?: (missionId: string) => void;
}

// Helper to convert API loyalty data to component format
const convertApiToLoyaltyData = (apiData: UserLoyalty): LoyaltyData => ({
  streak: {
    current: apiData.streak.current,
    target: apiData.streak.target,
  },
  brandLoyalty: apiData.brandLoyalty.map(b => ({
    brandId: b.brandId,
    brandName: b.brandName,
    purchaseCount: b.purchaseCount,
    tier: b.tier,
    progress: b.progress,
    nextTierAt: b.nextTierAt,
  })),
  missions: apiData.missions.map(m => ({
    id: m.missionId,
    title: m.title,
    progress: m.progress,
    target: m.target,
    reward: m.reward,
    icon: m.icon,
  })),
  coins: {
    available: apiData.coins.available,
    expiring: apiData.coins.expiring,
    expiryDate: apiData.coins.expiryDate || '',
  },
});

const StreakLoyaltySection: React.FC<StreakLoyaltySectionProps> = ({
  data,
  onMissionPress,
}) => {
  const router = useRouter();
  const [apiData, setApiData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setApiData(data);
      setLoading(false);
      return;
    }

    const fetchLoyalty = async () => {
      try {
        setLoading(true);
        const response = await userLoyaltyApi.getLoyalty();
        if (response.success && response.data?.loyalty) {
          const converted = convertApiToLoyaltyData(response.data.loyalty);
          setApiData(converted);
        } else {
          // Fallback to dummy data
          setApiData(loyaltyData);
        }
      } catch (err) {
        console.error('Error fetching loyalty data:', err);
        // Fallback to dummy data on error
        setApiData(loyaltyData);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyalty();
  }, [data]);

  const displayData = data || apiData || loyaltyData;

  const handleMissionPress = (missionId: string) => {
    if (onMissionPress) {
      onMissionPress(missionId);
    } else {
      // Navigate to missions list page - mission detail requires both id and progressId
      // which we don't have in the loyalty context, so redirect to missions list
      router.push('/missions' as any);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#00C06A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Daily Streak */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.sectionTitle}>Daily Streak</Text>
        </View>
        <View style={styles.streakRow}>
          {[...Array(displayData.streak.target)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.streakDot,
                i < displayData.streak.current && styles.streakDotActive,
              ]}
            >
              {i < displayData.streak.current && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.streakText}>
          {displayData.streak.current}/{displayData.streak.target} days - Keep going!
        </Text>
      </View>

      {/* Brand Loyalty */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.crownEmoji}>👑</Text>
          <Text style={styles.sectionTitle}>Brand Loyalty</Text>
        </View>
        <View style={styles.loyaltyList}>
          {displayData.brandLoyalty.slice(0, 3).map((brand) => (
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
          {displayData.missions.slice(0, 3).map((mission) => (
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
                <CoinIcon size={14} />
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
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
