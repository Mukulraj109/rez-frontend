/**
 * Privé Redeem Page
 * Coin redemption options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from '@/components/prive/priveTheme';
import { usePriveSection } from '@/hooks/usePriveSection';

const REDEEM_OPTIONS = [
  { id: 'gift-cards', title: 'Gift Cards', description: 'Amazon, Flipkart, Swiggy & more', icon: '🎁', minCoins: 500, route: '/prive/redeem/gift-cards' },
  { id: 'bill-pay', title: 'Bill Pay', description: 'Use coins at checkout', icon: '🧾', minCoins: 100, route: '/prive/redeem/bill-pay' },
  { id: 'experiences', title: 'Experiences', description: 'Exclusive Privé experiences', icon: '✨', minCoins: 1000, route: '/prive/redeem/experiences' },
  { id: 'charity', title: 'Charity', description: 'Donate to causes', icon: '💝', minCoins: 100, route: '/prive/redeem/charity' },
];

export default function RedeemScreen() {
  const router = useRouter();
  const { userData, isLoading } = usePriveSection();
  const availableCoins = userData?.totalCoins || 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={PRIVE_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem Coins</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available to Redeem</Text>
            <Text style={styles.balanceAmount}>{availableCoins.toLocaleString()}</Text>
            <Text style={styles.balanceSubtext}>coins</Text>
          </View>

          {/* Redeem Options */}
          <Text style={styles.sectionTitle}>Redeem Options</Text>
          {REDEEM_OPTIONS.map((option) => {
            const hasEnoughCoins = availableCoins >= option.minCoins;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, !hasEnoughCoins && styles.optionCardDisabled]}
                activeOpacity={hasEnoughCoins ? 0.8 : 1}
                onPress={() => {
                  if (hasEnoughCoins) {
                    router.push(option.route as any);
                  }
                }}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>{option.icon}</Text>
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, !hasEnoughCoins && styles.optionTitleDisabled]}>
                    {option.title}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={styles.optionRight}>
                  <Text style={[styles.optionMinCoins, !hasEnoughCoins && styles.optionMinCoinsInsufficient]}>
                    {hasEnoughCoins ? `Min ${option.minCoins}` : `Need ${option.minCoins - availableCoins} more`}
                  </Text>
                  <Ionicons
                    name={hasEnoughCoins ? "chevron-forward" : "lock-closed"}
                    size={20}
                    color={hasEnoughCoins ? PRIVE_COLORS.text.tertiary : PRIVE_COLORS.text.disabled}
                  />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              ReZ and Privé coins can be redeemed universally. Branded coins
              are specific to their issuing brand.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingVertical: PRIVE_SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: PRIVE_SPACING.xl,
  },
  balanceCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    marginBottom: PRIVE_SPACING.xl,
  },
  balanceLabel: {
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.sm,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '200',
    color: PRIVE_COLORS.gold.primary,
  },
  balanceSubtext: {
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.md,
  },
  optionCardDisabled: {
    opacity: 0.6,
    borderColor: PRIVE_COLORS.border.secondary,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIVE_COLORS.transparent.gold15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PRIVE_SPACING.lg,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  optionTitleDisabled: {
    color: PRIVE_COLORS.text.tertiary,
  },
  optionDescription: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginTop: 2,
  },
  optionRight: {
    alignItems: 'flex-end',
  },
  optionMinCoins: {
    fontSize: 11,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: 4,
  },
  optionMinCoinsInsufficient: {
    color: PRIVE_COLORS.status.warning,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PRIVE_COLORS.transparent.gold10,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    marginTop: PRIVE_SPACING.lg,
    marginBottom: PRIVE_SPACING.xxl,
    gap: PRIVE_SPACING.md,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: PRIVE_COLORS.text.secondary,
    lineHeight: 18,
  },
});


