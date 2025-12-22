// Coin Expiry Tracker Page
// Enhanced expiry tracking with timeline

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface ExpiringCoins {
  id: string;
  amount: number;
  expiryDate: string;
  daysLeft: number;
  coinType: 'rez' | 'promo' | 'store';
}

const EXPIRING_COINS: ExpiringCoins[] = [
  { id: '1', amount: 150, expiryDate: '2024-12-22', daysLeft: 2, coinType: 'rez' },
  { id: '2', amount: 300, expiryDate: '2024-12-31', daysLeft: 11, coinType: 'promo' },
  { id: '3', amount: 200, expiryDate: '2025-01-15', daysLeft: 26, coinType: 'rez' },
  { id: '4', amount: 100, expiryDate: '2025-01-31', daysLeft: 42, coinType: 'store' },
];

export default function ExpiryTrackerPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [coins, setCoins] = useState(EXPIRING_COINS);

  const totalExpiringSoon = coins
    .filter(c => c.daysLeft <= 7)
    .reduce((sum, c) => sum + c.amount, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getProgressWidth = (daysLeft: number) => {
    const maxDays = 30;
    const progress = Math.max(0, Math.min(100, ((maxDays - daysLeft) / maxDays) * 100));
    return `${progress}%`;
  };

  const getProgressColor = (daysLeft: number) => {
    if (daysLeft <= 3) return Colors.error;
    if (daysLeft <= 7) return Colors.warning;
    return Colors.primary[600];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCoinIcon = (type: string) => {
    switch (type) {
      case 'promo': return 'gift';
      case 'store': return 'storefront';
      default: return 'diamond';
    }
  };

  const groupByPeriod = () => {
    const thisWeek = coins.filter(c => c.daysLeft <= 7);
    const thisMonth = coins.filter(c => c.daysLeft > 7 && c.daysLeft <= 30);
    const nextMonth = coins.filter(c => c.daysLeft > 30);

    return { thisWeek, thisMonth, nextMonth };
  };

  const { thisWeek, thisMonth, nextMonth } = groupByPeriod();

  const renderCoinCard = (coin: ExpiringCoins) => (
    <View key={coin.id} style={styles.coinCard}>
      <View style={styles.coinCardHeader}>
        <View style={styles.coinTypeIcon}>
          <Ionicons
            name={getCoinIcon(coin.coinType) as any}
            size={20}
            color={Colors.primary[600]}
          />
        </View>
        <View style={styles.coinInfo}>
          <ThemedText style={styles.coinAmount}>{coin.amount} RC</ThemedText>
          <ThemedText style={styles.coinExpiry}>
            Expires {formatDate(coin.expiryDate)}
          </ThemedText>
        </View>
        <View style={styles.daysLeftBadge}>
          <ThemedText style={[
            styles.daysLeftText,
            coin.daysLeft <= 3 && styles.daysLeftUrgent,
          ]}>
            {coin.daysLeft}d left
          </ThemedText>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: getProgressWidth(coin.daysLeft) as any,
              backgroundColor: getProgressColor(coin.daysLeft),
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Coin Expiry</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Alert Banner */}
        {totalExpiringSoon > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={24} color={Colors.warning} />
            <View style={styles.alertContent}>
              <ThemedText style={styles.alertTitle}>
                {totalExpiringSoon} RC expiring soon!
              </ThemedText>
              <ThemedText style={styles.alertSubtitle}>
                Use before they expire
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.useNowButton}
              onPress={() => router.push('/(tabs)' as any)}
            >
              <ThemedText style={styles.useNowText}>Use Now</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* This Week */}
        {thisWeek.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <ThemedText style={styles.sectionTitle}>This Week</ThemedText>
              <ThemedText style={styles.sectionCount}>
                {thisWeek.reduce((sum, c) => sum + c.amount, 0)} RC
              </ThemedText>
            </View>
            {thisWeek.map(renderCoinCard)}
          </View>
        )}

        {/* This Month */}
        {thisMonth.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: Colors.warning }]} />
              <ThemedText style={styles.sectionTitle}>This Month</ThemedText>
              <ThemedText style={styles.sectionCount}>
                {thisMonth.reduce((sum, c) => sum + c.amount, 0)} RC
              </ThemedText>
            </View>
            {thisMonth.map(renderCoinCard)}
          </View>
        )}

        {/* Next Month */}
        {nextMonth.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: Colors.primary[600] }]} />
              <ThemedText style={styles.sectionTitle}>Next Month</ThemedText>
              <ThemedText style={styles.sectionCount}>
                {nextMonth.reduce((sum, c) => sum + c.amount, 0)} RC
              </ThemedText>
            </View>
            {nextMonth.map(renderCoinCard)}
          </View>
        )}

        {/* Quick Spend Suggestions */}
        <View style={styles.suggestionsSection}>
          <ThemedText style={styles.sectionTitle}>Quick Spend Suggestions</ThemedText>
          <View style={styles.suggestionsGrid}>
            <TouchableOpacity
              style={styles.suggestionCard}
              onPress={() => router.push('/search' as any)}
            >
              <Ionicons name="location" size={24} color={Colors.primary[600]} />
              <ThemedText style={styles.suggestionText}>Nearby Stores</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.suggestionCard}
              onPress={() => router.push('/offers' as any)}
            >
              <Ionicons name="pricetag" size={24} color={Colors.gold} />
              <ThemedText style={styles.suggestionText}>Online Deals</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Ionicons name="bulb-outline" size={24} color={Colors.info} />
          <View style={styles.tipsContent}>
            <ThemedText style={styles.tipsTitle}>Tips to Maximize Your Coins</ThemedText>
            <ThemedText style={styles.tipsText}>
              • Enable notifications for expiry reminders{'\n'}
              • Use older coins first{'\n'}
              • Combine with offers for bigger savings
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...Typography.label,
    color: Colors.warning,
  },
  alertSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  useNowButton: {
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  useNowText: {
    ...Typography.labelSmall,
    color: '#FFF',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    flex: 1,
  },
  sectionCount: {
    ...Typography.label,
    color: Colors.text.tertiary,
  },
  coinCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  coinCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  coinTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinInfo: {
    flex: 1,
  },
  coinAmount: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  coinExpiry: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  daysLeftBadge: {
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  daysLeftText: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
  },
  daysLeftUrgent: {
    color: Colors.error,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  suggestionsSection: {
    marginBottom: Spacing.lg,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  suggestionCard: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.subtle,
  },
  suggestionText: {
    ...Typography.label,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    ...Typography.label,
    color: Colors.secondary[700],
    marginBottom: Spacing.sm,
  },
  tipsText: {
    ...Typography.bodySmall,
    color: Colors.secondary[600],
    lineHeight: 20,
  },
});
