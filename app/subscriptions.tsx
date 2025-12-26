/**
 * OTT Subscriptions Page
 * Buy OTT subscriptions with cashback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E5E7EB',
};

const OTT_PLATFORMS = [
  {
    id: 'netflix',
    name: 'Netflix',
    color: '#E50914',
    plans: [
      { id: 'mobile', name: 'Mobile', price: 149, duration: 'month', cashback: 10 },
      { id: 'basic', name: 'Basic', price: 199, duration: 'month', cashback: 12 },
      { id: 'standard', name: 'Standard', price: 499, duration: 'month', cashback: 15 },
      { id: 'premium', name: 'Premium', price: 649, duration: 'month', cashback: 18 },
    ],
  },
  {
    id: 'disney',
    name: 'Disney+ Hotstar',
    color: '#0063E5',
    plans: [
      { id: 'mobile', name: 'Mobile', price: 499, duration: 'year', cashback: 15 },
      { id: 'super', name: 'Super', price: 899, duration: 'year', cashback: 18 },
      { id: 'premium', name: 'Premium', price: 1499, duration: 'year', cashback: 20 },
    ],
  },
  {
    id: 'prime',
    name: 'Amazon Prime',
    color: '#00A8E1',
    plans: [
      { id: 'monthly', name: 'Monthly', price: 179, duration: 'month', cashback: 10 },
      { id: 'quarterly', name: 'Quarterly', price: 459, duration: '3 months', cashback: 12 },
      { id: 'annual', name: 'Annual', price: 1499, duration: 'year', cashback: 15 },
    ],
  },
  {
    id: 'hotstar',
    name: 'JioCinema',
    color: '#E72276',
    plans: [
      { id: 'premium', name: 'Premium', price: 999, duration: 'year', cashback: 20 },
    ],
  },
  {
    id: 'sony',
    name: 'SonyLIV',
    color: '#000000',
    plans: [
      { id: 'mobile', name: 'Mobile', price: 599, duration: 'year', cashback: 15 },
      { id: 'premium', name: 'Premium', price: 999, duration: 'year', cashback: 18 },
    ],
  },
  {
    id: 'zee5',
    name: 'ZEE5',
    color: '#8230C6',
    plans: [
      { id: 'monthly', name: 'Monthly', price: 99, duration: 'month', cashback: 10 },
      { id: 'annual', name: 'Annual', price: 599, duration: 'year', cashback: 15 },
    ],
  },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialPlatform = params.platform as string || '';

  const [selectedPlatform, setSelectedPlatform] = useState(
    OTT_PLATFORMS.find((p) => p.id === initialPlatform) || null
  );
  const [selectedPlan, setSelectedPlan] = useState<typeof OTT_PLATFORMS[0]['plans'][0] | null>(null);

  const handleBuyPlan = () => {
    if (!selectedPlatform || !selectedPlan) return;
    router.push(`/payment?type=subscription&platform=${selectedPlatform.id}&plan=${selectedPlan.id}&amount=${selectedPlan.price}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTT Subscriptions</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cashback Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.15)', 'rgba(139, 92, 246, 0.15)']}
            style={styles.bannerGradient}
          >
            <Text style={styles.bannerEmoji}>📺</Text>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Stream & Earn Rewards</Text>
              <Text style={styles.bannerSubtitle}>Get up to 20% cashback on OTT subscriptions</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Platform Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Platform</Text>
          <View style={styles.platformsGrid}>
            {OTT_PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformCard,
                  selectedPlatform?.id === platform.id && styles.platformCardActive,
                ]}
                onPress={() => {
                  setSelectedPlatform(platform);
                  setSelectedPlan(null);
                }}
              >
                <View style={[styles.platformIcon, { backgroundColor: platform.color + '20' }]}>
                  <Text style={styles.platformInitial}>{platform.name[0]}</Text>
                </View>
                <Text style={styles.platformName}>{platform.name}</Text>
                <Text style={styles.platformCashback}>
                  Up to {Math.max(...platform.plans.map((p) => p.cashback))}% cashback
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Plan Selection */}
        {selectedPlatform && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{selectedPlatform.name} Plans</Text>
            <View style={styles.plansList}>
              {selectedPlatform.plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan?.id === plan.id && styles.planCardActive,
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <View style={styles.planHeader}>
                    <View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDuration}>/{plan.duration}</Text>
                    </View>
                    <View style={styles.planPricing}>
                      <Text style={styles.planPrice}>₹{plan.price}</Text>
                      <View style={styles.planCashback}>
                        <Text style={styles.planCashbackText}>{plan.cashback}% cashback</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.planSavings}>
                    <Ionicons name="gift" size={16} color={COLORS.primaryGold} />
                    <Text style={styles.planSavingsText}>
                      You save ₹{Math.round(plan.price * plan.cashback / 100)}
                    </Text>
                  </View>
                  {selectedPlan?.id === plan.id && (
                    <View style={styles.planSelected}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryGreen} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Active Subscriptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Active Subscriptions</Text>
          <View style={styles.activeList}>
            {[
              { platform: 'Netflix', plan: 'Standard', expiresIn: '15 days', color: '#E50914' },
              { platform: 'Prime', plan: 'Annual', expiresIn: '120 days', color: '#00A8E1' },
            ].map((sub, index) => (
              <View key={index} style={styles.activeCard}>
                <View style={[styles.activeIcon, { backgroundColor: sub.color + '20' }]}>
                  <Text style={[styles.activeInitial, { color: sub.color }]}>
                    {sub.platform[0]}
                  </Text>
                </View>
                <View style={styles.activeInfo}>
                  <Text style={styles.activePlatform}>{sub.platform}</Text>
                  <Text style={styles.activePlan}>{sub.plan}</Text>
                </View>
                <View style={styles.activeExpiry}>
                  <Text style={styles.activeExpiryLabel}>Expires in</Text>
                  <Text style={styles.activeExpiryValue}>{sub.expiresIn}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Buy on ReZ?</Text>
          <View style={styles.benefitsGrid}>
            {[
              { icon: 'cash-outline', title: 'Best Cashback' },
              { icon: 'flash-outline', title: 'Instant Activation' },
              { icon: 'shield-checkmark-outline', title: 'Secure Payment' },
              { icon: 'gift-outline', title: 'Bonus Coins' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <Ionicons name={benefit.icon as any} size={24} color={COLORS.primaryGreen} />
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {selectedPlan && selectedPlatform && (
        <View style={styles.bottomCta}>
          <View style={styles.summary}>
            <Text style={styles.summaryPlatform}>{selectedPlatform.name} - {selectedPlan.name}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryPrice}>₹{selectedPlan.price}</Text>
              <Text style={styles.summarySavings}>
                Save ₹{Math.round(selectedPlan.price * selectedPlan.cashback / 100)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={handleBuyPlan}>
            <Text style={styles.buyButtonText}>Subscribe Now</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  banner: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  bannerEmoji: {
    fontSize: 32,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCard: {
    width: '31%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  platformCardActive: {
    borderColor: COLORS.primaryGreen,
  },
  platformIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  platformName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  platformCashback: {
    fontSize: 10,
    color: COLORS.primaryGreen,
    fontWeight: '500',
    textAlign: 'center',
  },
  plansList: {
    gap: 12,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardActive: {
    borderColor: COLORS.primaryGreen,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  planDuration: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planCashback: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  planCashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  planSavings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planSavingsText: {
    fontSize: 13,
    color: COLORS.primaryGold,
    fontWeight: '500',
  },
  planSelected: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  activeList: {
    gap: 12,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  activeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  activeInfo: {
    flex: 1,
  },
  activePlatform: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  activePlan: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  activeExpiry: {
    alignItems: 'flex-end',
  },
  activeExpiryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  activeExpiryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGold,
  },
  benefitsSection: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 100,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitCard: {
    width: '50%',
    alignItems: 'center',
    padding: 16,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  bottomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summary: {},
  summaryPlatform: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summarySavings: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
