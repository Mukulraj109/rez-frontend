/**
 * Privé Earnings Page
 * Shows earnings history and breakdown
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

const EARNINGS_DATA = [
  { id: '1', type: 'campaign', title: 'Brand Campaign Completed', amount: '+500', date: 'Today' },
  { id: '2', type: 'purchase', title: 'Purchase at StyleHub', amount: '+120', date: 'Yesterday' },
  { id: '3', type: 'referral', title: 'Friend Joined Privé', amount: '+200', date: '2 days ago' },
  { id: '4', type: 'content', title: 'Content Bonus', amount: '+75', date: '3 days ago' },
];

export default function EarningsScreen() {
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
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>This Week</Text>
              <Text style={styles.summaryValue}>+2,840</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryValue}>+8,450</Text>
            </View>
          </View>

          {/* Earnings List */}
          <View style={styles.listCard}>
            <Text style={styles.sectionTitle}>Recent Earnings</Text>
            {EARNINGS_DATA.map((item) => (
              <View key={item.id} style={styles.earningRow}>
                <View style={styles.earningIcon}>
                  <Text style={styles.earningEmoji}>
                    {item.type === 'campaign' ? '📢' :
                     item.type === 'purchase' ? '🛍️' :
                     item.type === 'referral' ? '👥' : '✍️'}
                  </Text>
                </View>
                <View style={styles.earningInfo}>
                  <Text style={styles.earningTitle}>{item.title}</Text>
                  <Text style={styles.earningDate}>{item.date}</Text>
                </View>
                <Text style={styles.earningAmount}>{item.amount}</Text>
              </View>
            ))}
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    marginBottom: PRIVE_SPACING.xl,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.sm,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '300',
    color: PRIVE_COLORS.gold.primary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: PRIVE_COLORS.transparent.white10,
  },
  listCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: PRIVE_COLORS.transparent.white08,
  },
  earningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIVE_COLORS.transparent.white10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PRIVE_SPACING.md,
  },
  earningEmoji: {
    fontSize: 18,
  },
  earningInfo: {
    flex: 1,
  },
  earningTitle: {
    fontSize: 14,
    color: PRIVE_COLORS.text.primary,
  },
  earningDate: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.status.success,
  },
});
