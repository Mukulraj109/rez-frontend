// Subscription Benefits Page
// Showcase all benefits and usage tips for current subscription tier

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { TIER_COLORS, TIER_GRADIENTS, TIER_NAMES } from '@/types/subscription.types';

export default function BenefitsPage() {
  const router = useRouter();
  const { state, computed } = useSubscription();
  const currentTier = state.currentSubscription?.tier || 'free';
  const tierColor = TIER_COLORS[currentTier];
  const tierGradient = TIER_GRADIENTS[currentTier];

  const benefits = [
    {
      icon: 'cash',
      title: `${currentTier === 'vip' ? '3x' : currentTier === 'premium' ? '2x' : '1x'} Cashback`,
      description: 'Earn more rewards on every purchase',
      tip: 'Stack with store offers for maximum savings',
      color: '#10B981',
    },
    {
      icon: 'bicycle',
      title: currentTier === 'vip' ? 'Free Delivery (All Orders)' : 'Free Delivery',
      description: currentTier === 'vip' ? 'No minimum order value' : 'On orders above ₹500',
      tip: 'Save an average of ₹50-100 per order',
      color: '#3B82F6',
    },
    {
      icon: 'headset',
      title: currentTier !== 'free' ? 'Priority Support' : 'Email Support',
      description: currentTier !== 'free' ? '24/7 dedicated support team' : 'Response within 48 hours',
      tip: 'Get instant help via chat or phone',
      color: '#8B5CF6',
    },
    {
      icon: 'pricetag',
      title: 'Exclusive Deals',
      description: currentTier !== 'free' ? 'Access to member-only deals' : 'Limited deals',
      tip: 'Check the Offers section daily for new deals',
      color: '#F59E0B',
    },
  ];

  if (currentTier === 'vip') {
    benefits.push(
      {
        icon: 'person',
        title: 'Personal Shopper',
        description: 'Dedicated assistant for your shopping needs',
        tip: 'Book appointments via the profile section',
        color: '#EC4899',
      },
      {
        icon: 'calendar',
        title: 'Premium Events',
        description: 'Exclusive access to VIP shopping events',
        tip: 'Get early access to sales and product launches',
        color: '#6366F1',
      }
    );
  }

  const usageTips = [
    {
      title: 'Shop regularly to maximize savings',
      description: 'Your cashback multiplier applies to every purchase',
    },
    {
      title: 'Combine offers for best value',
      description: 'Stack your membership benefits with store promotions',
    },
    {
      title: 'Use wishlists strategically',
      description: 'Get notified when items go on sale',
    },
    {
      title: 'Refer friends to earn more',
      description: 'Get bonus cashback for every successful referral',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={tierColor} />

      {/* Header */}
      <LinearGradient colors={tierGradient as any} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Your Benefits</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Tier Badge */}
        <View style={styles.tierBadgeContainer}>
          <LinearGradient colors={tierGradient as any} style={styles.tierBadge}>
            <Ionicons
              name={currentTier === 'vip' ? 'diamond' : currentTier === 'premium' ? 'star' : 'person-outline'}
              size={32}
              color="#FFFFFF"
            />
            <ThemedText style={styles.tierBadgeText}>{TIER_NAMES[currentTier]} Member</ThemedText>
          </LinearGradient>
        </View>

        {/* Savings Summary */}
        {currentTier !== 'free' && computed.roi && (
          <View style={styles.savingsCard}>
            <ThemedText style={styles.savingsTitle}>Your Total Savings</ThemedText>
            <ThemedText style={styles.savingsAmount}>₹{computed.roi.totalSavings || 0}</ThemedText>
            <ThemedText style={styles.savingsSubtitle}>
              {computed.roi.roiPercentage || 0}% ROI on your subscription
            </ThemedText>
          </View>
        )}

        {/* Benefits List */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Active Benefits</ThemedText>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={[styles.benefitIconContainer, { backgroundColor: `${benefit.color}20` }]}>
                <Ionicons name={benefit.icon as any} size={28} color={benefit.color} />
              </View>
              <View style={styles.benefitContent}>
                <ThemedText style={styles.benefitTitle}>{benefit.title}</ThemedText>
                <ThemedText style={styles.benefitDescription}>{benefit.description}</ThemedText>
                <View style={styles.benefitTip}>
                  <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                  <ThemedText style={styles.benefitTipText}>{benefit.tip}</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Usage Tips */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tips to Maximize Your Savings</ThemedText>
          {usageTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={styles.tipNumber}>
                <ThemedText style={styles.tipNumberText}>{index + 1}</ThemedText>
              </View>
              <View style={styles.tipContent}>
                <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                <ThemedText style={styles.tipDescription}>{tip.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Upgrade CTA */}
        {currentTier !== 'vip' && (
          <View style={styles.upgradeSection}>
            <ThemedText style={styles.upgradeSectionTitle}>Want Even More Benefits?</ThemedText>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/subscription/plans')}
            >
              <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.upgradeButtonGradient}>
                <ThemedText style={styles.upgradeButtonText}>
                  {currentTier === 'free' ? 'Upgrade to Premium' : 'Upgrade to VIP'}
                </ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  tierBadgeContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  savingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  savingsTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  savingsSubtitle: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  benefitTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  benefitTipText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  upgradeSection: {
    margin: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  upgradeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
