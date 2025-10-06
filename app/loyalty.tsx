// Loyalty Points & Rewards Page
// Earn and redeem loyalty points

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  value: number;
  icon: string;
  category: 'voucher' | 'discount' | 'cashback' | 'freebie';
  available: boolean;
}

interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: string;
}

const LoyaltyPage = () => {
  const router = useRouter();

  // Mock data - should come from backend
  const [loyaltyData] = useState({
    currentPoints: 2450,
    tier: 'Gold',
    nextTier: 'Platinum',
    pointsToNextTier: 550,
    lifetimePoints: 5670,
    expiringPoints: 200,
    expiryDate: '2025-12-31',
  });

  const rewards: Reward[] = [
    {
      id: '1',
      title: '₹100 Off Voucher',
      description: 'On orders above ₹1000',
      points: 1000,
      value: 100,
      icon: 'ticket',
      category: 'voucher',
      available: true,
    },
    {
      id: '2',
      title: '₹250 Off Voucher',
      description: 'On orders above ₹2500',
      points: 2000,
      value: 250,
      icon: 'ticket',
      category: 'voucher',
      available: true,
    },
    {
      id: '3',
      title: '10% Cashback',
      description: 'Up to ₹500 cashback',
      points: 1500,
      value: 500,
      icon: 'cash',
      category: 'cashback',
      available: true,
    },
    {
      id: '4',
      title: 'Free Delivery',
      description: '5 free delivery vouchers',
      points: 800,
      value: 250,
      icon: 'bicycle',
      category: 'freebie',
      available: true,
    },
    {
      id: '5',
      title: '₹500 Off Voucher',
      description: 'On orders above ₹5000',
      points: 3500,
      value: 500,
      icon: 'gift',
      category: 'voucher',
      available: false,
    },
  ];

  const recentTransactions: PointsTransaction[] = [
    {
      id: '1',
      type: 'earned',
      points: 150,
      description: 'Order #12345 completed',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'earned',
      points: 50,
      description: 'Product review submitted',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      type: 'redeemed',
      points: -1000,
      description: 'Redeemed ₹100 voucher',
      date: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Silver':
        return '#9CA3AF';
      case 'Gold':
        return '#F59E0B';
      case 'Platinum':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const handleRedeemReward = (reward: Reward) => {
    if (loyaltyData.currentPoints < reward.points) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.points - loyaltyData.currentPoints} more points to redeem this reward.`
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem ${reward.title} for ${reward.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            // TODO: Call API to redeem
            Alert.alert('Success!', 'Reward added to your account');
          },
        },
      ]
    );
  };

  const renderReward = (reward: Reward) => {
    const canRedeem = loyaltyData.currentPoints >= reward.points && reward.available;

    return (
      <TouchableOpacity
        key={reward.id}
        style={[styles.rewardCard, !canRedeem && styles.rewardCardDisabled]}
        onPress={() => canRedeem && handleRedeemReward(reward)}
        activeOpacity={0.7}
        disabled={!canRedeem}
      >
        <View style={[styles.rewardIcon, { backgroundColor: `${getTierColor(loyaltyData.tier)}20` }]}>
          <Ionicons
            name={reward.icon as any}
            size={28}
            color={getTierColor(loyaltyData.tier)}
          />
        </View>

        <View style={styles.rewardInfo}>
          <ThemedText style={styles.rewardTitle}>{reward.title}</ThemedText>
          <ThemedText style={styles.rewardDescription}>{reward.description}</ThemedText>

          <View style={styles.rewardFooter}>
            <View style={styles.rewardPoints}>
              <Ionicons name="diamond" size={14} color="#F59E0B" />
              <ThemedText style={styles.rewardPointsText}>{reward.points} pts</ThemedText>
            </View>

            {!reward.available && (
              <View style={styles.comingSoonBadge}>
                <ThemedText style={styles.comingSoonText}>Coming Soon</ThemedText>
              </View>
            )}
          </View>
        </View>

        {canRedeem && (
          <TouchableOpacity
            style={styles.redeemButton}
            onPress={() => handleRedeemReward(reward)}
          >
            <ThemedText style={styles.redeemButtonText}>Redeem</ThemedText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Loyalty Rewards</ThemedText>
          <TouchableOpacity style={styles.historyButton} onPress={() => {}}>
            <Ionicons name="time-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <View style={styles.tierBadge}>
              <Ionicons name="star" size={16} color={getTierColor(loyaltyData.tier)} />
              <ThemedText style={[styles.tierText, { color: getTierColor(loyaltyData.tier) }]}>
                {loyaltyData.tier}
              </ThemedText>
            </View>
          </View>

          <View style={styles.pointsMain}>
            <Ionicons name="diamond" size={32} color="#F59E0B" />
            <ThemedText style={styles.pointsValue}>{loyaltyData.currentPoints}</ThemedText>
            <ThemedText style={styles.pointsLabel}>Available Points</ThemedText>
          </View>

          <View style={styles.pointsProgress}>
            <View style={styles.progressInfo}>
              <ThemedText style={styles.progressText}>
                {loyaltyData.pointsToNextTier} pts to {loyaltyData.nextTier}
              </ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((loyaltyData.currentPoints % 3000) / 3000) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {loyaltyData.expiringPoints > 0 && (
            <View style={styles.expiryWarning}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <ThemedText style={styles.expiryText}>
                {loyaltyData.expiringPoints} points expiring on {loyaltyData.expiryDate}
              </ThemedText>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* How to Earn */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>How to Earn Points</ThemedText>

          <View style={styles.earnGrid}>
            <View style={styles.earnCard}>
              <Ionicons name="cart" size={24} color="#8B5CF6" />
              <ThemedText style={styles.earnTitle}>Shop</ThemedText>
              <ThemedText style={styles.earnPoints}>1 pt = ₹10</ThemedText>
            </View>

            <View style={styles.earnCard}>
              <Ionicons name="star" size={24} color="#8B5CF6" />
              <ThemedText style={styles.earnTitle}>Review</ThemedText>
              <ThemedText style={styles.earnPoints}>50 pts</ThemedText>
            </View>

            <View style={styles.earnCard}>
              <Ionicons name="people" size={24} color="#8B5CF6" />
              <ThemedText style={styles.earnTitle}>Refer</ThemedText>
              <ThemedText style={styles.earnPoints}>200 pts</ThemedText>
            </View>

            <View style={styles.earnCard}>
              <Ionicons name="videocam" size={24} color="#8B5CF6" />
              <ThemedText style={styles.earnTitle}>Video</ThemedText>
              <ThemedText style={styles.earnPoints}>100 pts</ThemedText>
            </View>
          </View>
        </View>

        {/* Available Rewards */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Available Rewards</ThemedText>
          {rewards.map(renderReward)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  historyButton: {
    padding: 8,
  },
  pointsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pointsMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  pointsProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  expiryText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  earnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  earnCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  earnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  earnPoints: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 4,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  rewardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardPointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  comingSoonBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  redeemButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default LoyaltyPage;
