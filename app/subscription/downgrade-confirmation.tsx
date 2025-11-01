// Downgrade Confirmation Screen
// Warning screen before downgrading subscription tier

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSubscription } from '@/contexts/SubscriptionContext';
import subscriptionAPI from '@/services/subscriptionApi';
import { SubscriptionTier, TIER_NAMES, TIER_COLORS } from '@/types/subscription.types';

export default function DowngradeConfirmationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, computed, actions } = useSubscription();

  const currentTier = (params.currentTier as SubscriptionTier) || state.currentSubscription?.tier || 'premium';
  const newTier = (params.newTier as SubscriptionTier) || 'free';

  const [understood, setUnderstood] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);

  const calculateCredit = () => {
    const daysRemaining = computed.daysRemaining;
    const currentPrice = currentTier === 'vip' ? 299 : currentTier === 'premium' ? 99 : 0;
    const dailyRate = currentPrice / 30;
    return Math.round(dailyRate * daysRemaining);
  };

  const getEffectiveDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + computed.daysRemaining);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getLostFeatures = () => {
    if (currentTier === 'vip' && newTier === 'premium') {
      return [
        { icon: 'cash', text: '3x cashback (downgrade to 2x)' },
        { icon: 'bicycle', text: 'Free delivery on ALL orders' },
        { icon: 'person', text: 'Personal shopper assistance' },
        { icon: 'calendar', text: 'Premium events access' },
        { icon: 'shield-checkmark', text: 'Dedicated concierge service' },
      ];
    } else if (currentTier === 'vip' && newTier === 'free') {
      return [
        { icon: 'cash', text: '3x cashback multiplier' },
        { icon: 'bicycle', text: 'Free delivery on all orders' },
        { icon: 'headset', text: 'Priority customer support' },
        { icon: 'person', text: 'Personal shopper assistance' },
        { icon: 'calendar', text: 'Premium events access' },
        { icon: 'shield-checkmark', text: 'Concierge service' },
        { icon: 'pricetag', text: 'Exclusive deals & early access' },
        { icon: 'flash', text: 'Early flash sale access' },
      ];
    } else if (currentTier === 'premium' && newTier === 'free') {
      return [
        { icon: 'cash', text: '2x cashback multiplier' },
        { icon: 'bicycle', text: 'Free delivery (orders above ₹500)' },
        { icon: 'headset', text: 'Priority customer support' },
        { icon: 'pricetag', text: 'Exclusive deals & early access' },
        { icon: 'heart', text: 'Unlimited wishlists' },
        { icon: 'gift', text: 'Birthday & anniversary offers' },
      ];
    }
    return [];
  };

  const getRetainedFeatures = () => {
    if (newTier === 'premium') {
      return [
        { icon: 'cash', text: '2x cashback on all orders' },
        { icon: 'bicycle', text: 'Free delivery (orders above ₹500)' },
        { icon: 'headset', text: 'Priority customer support' },
        { icon: 'pricetag', text: 'Exclusive deals' },
      ];
    } else if (newTier === 'free') {
      return [
        { icon: 'cash', text: 'Basic cashback' },
        { icon: 'home', text: 'Access to all stores' },
        { icon: 'mail', text: 'Email support' },
      ];
    }
    return [];
  };

  const handleDowngrade = async () => {
    if (!understood) {
      Alert.alert('Confirmation Required', 'Please confirm that you understand the consequences of downgrading.');
      return;
    }

    try {
      setIsDowngrading(true);

      const result = await subscriptionAPI.downgradeSubscription(newTier as 'free' | 'premium');

      await actions.refreshSubscription();

      Alert.alert(
        'Downgrade Scheduled',
        `Your plan will change to ${TIER_NAMES[newTier]} on ${getEffectiveDate()}. ${calculateCredit() > 0 ? `₹${calculateCredit()} will be added to your wallet.` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/subscription/manage'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Downgrade Failed', error.message || 'Failed to process downgrade');
    } finally {
      setIsDowngrading(false);
    }
  };

  const creditAmount = calculateCredit();

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />

      {/* Header */}
      <LinearGradient colors={['#F59E0B', '#D97706'] as any} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Confirm Downgrade</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={32} color="#F59E0B" />
          <ThemedText style={styles.warningTitle}>You're about to lose benefits</ThemedText>
          <ThemedText style={styles.warningMessage}>
            Downgrading to {TIER_NAMES[newTier]} will remove several premium features from your account
          </ThemedText>
        </View>

        {/* Plan Comparison */}
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonRow}>
            <View style={[styles.planBox, { borderColor: TIER_COLORS[currentTier] }]}>
              <ThemedText style={styles.planLabel}>Current Plan</ThemedText>
              <ThemedText style={[styles.planName, { color: TIER_COLORS[currentTier] }]}>
                {TIER_NAMES[currentTier]}
              </ThemedText>
            </View>

            <Ionicons name="arrow-forward" size={32} color="#6B7280" />

            <View style={[styles.planBox, { borderColor: TIER_COLORS[newTier] }]}>
              <ThemedText style={styles.planLabel}>New Plan</ThemedText>
              <ThemedText style={[styles.planName, { color: TIER_COLORS[newTier] }]}>
                {TIER_NAMES[newTier]}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Features You'll Lose */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Features You'll Lose</ThemedText>
          <View style={styles.featuresContainer}>
            {getLostFeatures().map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.lostIcon}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </View>
                <ThemedText style={styles.lostFeatureText}>{feature.text}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Features You'll Keep */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Features You'll Keep</ThemedText>
          <View style={styles.featuresContainer}>
            {getRetainedFeatures().map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.retainedIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <ThemedText style={styles.retainedFeatureText}>{feature.text}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Credit Info */}
        {creditAmount > 0 && (
          <View style={styles.creditCard}>
            <Ionicons name="wallet" size={32} color="#10B981" />
            <View style={styles.creditContent}>
              <ThemedText style={styles.creditTitle}>Wallet Credit</ThemedText>
              <ThemedText style={styles.creditMessage}>
                We'll add ₹{creditAmount} to your wallet for unused days on your current plan
              </ThemedText>
            </View>
          </View>
        )}

        {/* Effective Date */}
        <View style={styles.dateCard}>
          <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
          <View style={styles.dateContent}>
            <ThemedText style={styles.dateLabel}>Effective Date</ThemedText>
            <ThemedText style={styles.dateValue}>{getEffectiveDate()}</ThemedText>
            <ThemedText style={styles.dateNote}>
              You'll keep {TIER_NAMES[currentTier]} benefits until then
            </ThemedText>
          </View>
        </View>

        {/* Confirmation Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setUnderstood(!understood)}
        >
          <View style={[styles.checkbox, understood && styles.checkboxChecked]}>
            {understood && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
          </View>
          <ThemedText style={styles.checkboxLabel}>
            I understand I will lose these benefits and want to proceed with the downgrade
          </ThemedText>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.downgradeButton, !understood && styles.downgradeButtonDisabled]}
            onPress={handleDowngrade}
            disabled={!understood || isDowngrading}
          >
            {isDowngrading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.downgradeButtonText}>Confirm Downgrade</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keepPlanButton}
            onPress={() => router.back()}
            disabled={isDowngrading}
          >
            <ThemedText style={styles.keepPlanButtonText}>Keep My Current Plan</ThemedText>
          </TouchableOpacity>
        </View>
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
  warningBanner: {
    margin: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginTop: 12,
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
  comparisonCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  planBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 110,
  },
  planLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  lostIcon: {
    marginRight: 12,
  },
  retainedIcon: {
    marginRight: 12,
  },
  lostFeatureText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  retainedFeatureText: {
    flex: 1,
    fontSize: 14,
    color: '#10B981',
  },
  creditCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  creditContent: {
    flex: 1,
  },
  creditTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  creditMessage: {
    fontSize: 13,
    color: '#15803D',
    lineHeight: 18,
  },
  dateCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  dateNote: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkboxContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  downgradeButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  downgradeButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  downgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keepPlanButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  keepPlanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
