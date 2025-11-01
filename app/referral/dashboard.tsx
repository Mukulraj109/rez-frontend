import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import referralTierApi from '../../services/referralTierApi';
import {
  REFERRAL_TIERS,
  TIER_COLORS,
  TIER_GRADIENTS,
  ReferralStats,
  ReferralProgress,
  ReferralReward,
  LeaderboardEntry
} from '../../types/referral.types';

const { width } = Dimensions.get('window');

export default function ReferralDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [progress, setProgress] = useState<ReferralProgress | null>(null);
  const [rewards, setRewards] = useState<{
    claimable: ReferralReward[];
    claimed: ReferralReward[];
    totalClaimableValue: number;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; totalReferrals: number } | null>(null);
  const [qrData, setQrData] = useState<{
    qrCode: string;
    referralLink: string;
    referralCode: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [tierData, rewardsData, leaderboardData, qrCodeData] = await Promise.all([
        referralTierApi.getTier(),
        referralTierApi.getRewards(),
        referralTierApi.getLeaderboard(10),
        referralTierApi.generateQR()
      ]);

      setStats(tierData.stats);
      setProgress(tierData.progress);
      setRewards(rewardsData);
      setLeaderboard(leaderboardData.leaderboard);
      setUserRank(leaderboardData.userRank);
      setQrData(qrCodeData);
    } catch (error) {
      console.error('Error loading referral data:', error);
      Alert.alert('Error', 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClaimReward = async (referralId: string, rewardIndex: number) => {
    try {
      await referralTierApi.claimReward(referralId, rewardIndex);
      Alert.alert('Success', 'Reward claimed successfully!');
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to claim reward');
    }
  };

  const handleShare = () => {
    router.push('/referral/share' as any);
  };

  const handleViewLeaderboard = () => {
    router.push('/referral/leaderboard' as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  const currentTier = stats?.currentTier || 'STARTER';
  const currentTierData = REFERRAL_TIERS[currentTier];
  const tierGradient = TIER_GRADIENTS[currentTier];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Tier Badge */}
      <LinearGradient colors={tierGradient as any} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.tierBadge}>
            <Ionicons name="ribbon" size={32} color="#fff" />
            <Text style={styles.tierName}>{currentTierData.name}</Text>
            <Text style={styles.tierBadgeText}>{currentTierData.badge}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.qualifiedReferrals || 0}</Text>
              <Text style={styles.statLabel}>Qualified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{stats?.lifetimeEarnings || 0}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.successRate.toFixed(0) || 0}%</Text>
              <Text style={styles.statLabel}>Success</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Progress to Next Tier */}
      {progress?.nextTier && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              Progress to {REFERRAL_TIERS[progress.nextTier].name}
            </Text>
            <Text style={styles.progressSubtitle}>
              {progress.referralsNeeded} more referrals needed
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={TIER_GRADIENTS[progress.nextTier] as any}
                style={[styles.progressBarFill, { width: `${progress.progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressPercentage}>{progress.progress.toFixed(0)}%</Text>
          </View>

          {progress.nextTierData && (
            <View style={styles.nextTierRewards}>
              <Text style={styles.nextTierRewardsTitle}>Unlock Rewards:</Text>
              <View style={styles.rewardsList}>
                {progress.nextTierData.rewards.tierBonus && (
                  <View style={styles.rewardItem}>
                    <Ionicons name="cash" size={16} color="#7c3aed" />
                    <Text style={styles.rewardText}>
                      ₹{progress.nextTierData.rewards.tierBonus} Tier Bonus
                    </Text>
                  </View>
                )}
                {progress.nextTierData.rewards.voucher && (
                  <View style={styles.rewardItem}>
                    <Ionicons name="gift" size={16} color="#7c3aed" />
                    <Text style={styles.rewardText}>
                      {progress.nextTierData.rewards.voucher.type} ₹
                      {progress.nextTierData.rewards.voucher.amount} Voucher
                    </Text>
                  </View>
                )}
                {progress.nextTierData.rewards.lifetimePremium && (
                  <View style={styles.rewardItem}>
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text style={styles.rewardText}>Lifetime Premium</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Share Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share & Earn</Text>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <LinearGradient colors={['#7c3aed', '#a78bfa']} style={styles.shareButtonGradient}>
            <Ionicons name="share-social" size={24} color="#fff" />
            <View style={styles.shareButtonText}>
              <Text style={styles.shareButtonTitle}>Invite Friends</Text>
              <Text style={styles.shareButtonSubtitle}>
                Earn ₹{currentTierData.rewards.perReferral} per referral
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.referralCodeBox}>
          <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
          <Text style={styles.referralCode}>{qrData?.referralCode}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={20} color="#7c3aed" />
            <Text style={styles.copyButtonText}>Copy Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Claimable Rewards */}
      {rewards && rewards.claimable.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claimable Rewards</Text>

          {rewards.claimable.map((reward, index) => (
            <View key={index} style={styles.rewardCard}>
              <View style={styles.rewardCardLeft}>
                <Ionicons
                  name={
                    reward.type === 'coins'
                      ? 'cash'
                      : reward.type === 'voucher'
                      ? 'gift'
                      : 'star'
                  }
                  size={32}
                  color="#7c3aed"
                />
                <View style={styles.rewardCardInfo}>
                  <Text style={styles.rewardCardTitle}>{reward.description}</Text>
                  <Text style={styles.rewardCardAmount}>
                    {reward.type === 'coins' && `₹${reward.amount}`}
                    {reward.type === 'voucher' &&
                      `${reward.voucherType} ₹${reward.amount}`}
                    {reward.type === 'premium' && 'Lifetime Premium'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.claimButton}
                onPress={() =>
                  handleClaimReward(reward.referralId!, reward.rewardIndex!)
                }
              >
                <Text style={styles.claimButtonText}>Claim</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.totalClaimable}>
            <Text style={styles.totalClaimableText}>
              Total Claimable: ₹{rewards.totalClaimableValue}
            </Text>
          </View>
        </View>
      )}

      {/* Leaderboard Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          <TouchableOpacity onPress={handleViewLeaderboard}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {userRank && (
          <View style={styles.userRankCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <View style={styles.userRankInfo}>
              <Text style={styles.userRankText}>Your Rank</Text>
              <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
            </View>
            <Text style={styles.userRankReferrals}>
              {userRank.totalReferrals} referrals
            </Text>
          </View>
        )}

        {leaderboard.slice(0, 5).map((entry) => (
          <View key={entry.userId} style={styles.leaderboardItem}>
            <View style={styles.leaderboardRank}>
              <Text style={styles.leaderboardRankText}>#{entry.rank}</Text>
            </View>
            <View style={styles.leaderboardInfo}>
              <Text style={styles.leaderboardName}>
                {entry.fullName || entry.username}
              </Text>
              <Text style={styles.leaderboardStats}>
                {entry.totalReferrals} referrals · ₹{entry.lifetimeEarnings}
              </Text>
            </View>
            <View style={styles.leaderboardTierBadge}>
              <Text style={styles.leaderboardTierText}>
                {REFERRAL_TIERS[entry.tier]?.badge || 'Starter'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20
  },
  headerContent: {
    alignItems: 'center'
  },
  tierBadge: {
    alignItems: 'center',
    marginBottom: 20
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8
  },
  tierBadgeText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#fff',
    opacity: 0.3
  },
  progressSection: {
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  progressHeader: {
    marginBottom: 16
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  progressBarContainer: {
    marginBottom: 16
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6
  },
  progressPercentage: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'right'
  },
  nextTierRewards: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16
  },
  nextTierRewardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12
  },
  rewardsList: {
    gap: 8
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rewardText: {
    fontSize: 14,
    color: '#475569'
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16
  },
  viewAllButton: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600'
  },
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  shareButtonText: {
    flex: 1
  },
  shareButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  shareButtonSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2
  },
  referralCodeBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  referralCodeLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8
  },
  referralCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    letterSpacing: 4,
    marginBottom: 12
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ede9fe',
    borderRadius: 8
  },
  copyButtonText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600'
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12
  },
  rewardCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  rewardCardInfo: {
    flex: 1
  },
  rewardCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4
  },
  rewardCardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  claimButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  totalClaimable: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  totalClaimableText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center'
  },
  userRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    marginBottom: 16,
    gap: 12
  },
  userRankInfo: {
    flex: 1
  },
  userRankText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 2
  },
  userRankNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e'
  },
  userRankReferrals: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600'
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  },
  leaderboardInfo: {
    flex: 1
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2
  },
  leaderboardStats: {
    fontSize: 12,
    color: '#64748b'
  },
  leaderboardTierBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#ede9fe',
    borderRadius: 12
  },
  leaderboardTierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed'
  }
});
