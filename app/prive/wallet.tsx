/**
 * Privé Wallet Page
 * Shows detailed coin balance and transaction history
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

export default function PriveWalletScreen() {
  const router = useRouter();

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
          <Text style={styles.headerTitle}>Privé Wallet</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>12,450</Text>
            <Text style={styles.balanceSubtext}>coins</Text>
          </View>

          {/* Coin Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.sectionTitle}>Coin Breakdown</Text>
            <View style={styles.coinRow}>
              <View style={[styles.coinDot, { backgroundColor: PRIVE_COLORS.gold.primary }]} />
              <Text style={styles.coinLabel}>ReZ Coins</Text>
              <Text style={styles.coinValue}>8,200</Text>
            </View>
            <View style={styles.coinRow}>
              <View style={[styles.coinDot, { backgroundColor: '#B8860B' }]} />
              <Text style={styles.coinLabel}>Privé Coins</Text>
              <Text style={styles.coinValue}>3,150</Text>
            </View>
            <View style={styles.coinRow}>
              <View style={[styles.coinDot, { backgroundColor: '#64B5F6' }]} />
              <Text style={styles.coinLabel}>Branded Coins</Text>
              <Text style={styles.coinValue}>1,100</Text>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsCard}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text style={styles.comingSoon}>Transaction history coming soon</Text>
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
  breakdownCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: PRIVE_COLORS.transparent.white08,
  },
  coinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: PRIVE_SPACING.md,
  },
  coinLabel: {
    flex: 1,
    fontSize: 14,
    color: PRIVE_COLORS.text.secondary,
  },
  coinValue: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  transactionsCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.xxl,
  },
  comingSoon: {
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
    textAlign: 'center',
    paddingVertical: PRIVE_SPACING.xxl,
  },
});
