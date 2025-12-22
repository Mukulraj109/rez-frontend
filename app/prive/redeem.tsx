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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from '@/components/prive/priveTheme';

const REDEEM_OPTIONS = [
  { id: '1', title: 'Gift Cards', description: 'Amazon, Flipkart, Swiggy & more', icon: '🎁', minCoins: 500 },
  { id: '2', title: 'Bill Pay', description: 'Use coins at checkout', icon: '🧾', minCoins: 100 },
  { id: '3', title: 'Experiences', description: 'Exclusive Privé experiences', icon: '✨', minCoins: 1000 },
  { id: '4', title: 'Charity', description: 'Donate to causes', icon: '💝', minCoins: 100 },
];

export default function RedeemScreen() {
  const router = useRouter();
  const availableCoins = 12450;

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
          {REDEEM_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              activeOpacity={0.8}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionEmoji}>{option.icon}</Text>
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionMinCoins}>Min {option.minCoins}</Text>
                <Ionicons name="chevron-forward" size={20} color={PRIVE_COLORS.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))}

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
