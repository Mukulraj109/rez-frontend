/**
 * Privé Tier Progress Page
 * Shows tier details and progress towards next tier
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

const TIERS = [
  { name: 'Entry', minScore: 70, icon: '◇' },
  { name: 'Signature', minScore: 75, icon: '◈' },
  { name: 'Elite', minScore: 85, icon: '✦' },
];

export default function TierProgressScreen() {
  const router = useRouter();
  const currentScore = 74.5;
  const currentTier = 'Entry';

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
          <Text style={styles.headerTitle}>Tier Progress</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Tier Card */}
          <View style={styles.currentTierCard}>
            <Text style={styles.currentTierLabel}>Current Tier</Text>
            <Text style={styles.currentTierName}>{currentTier}</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{currentScore.toFixed(1)}</Text>
              <Text style={styles.scoreLabel}>Privé Score</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Progress to Elite</Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[PRIVE_COLORS.gold.primary, PRIVE_COLORS.gold.dark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${(currentScore / 85) * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {(85 - currentScore).toFixed(1)} points to Elite
            </Text>
          </View>

          {/* All Tiers */}
          <View style={styles.tiersCard}>
            <Text style={styles.sectionTitle}>All Tiers</Text>
            {TIERS.map((tier, index) => (
              <View
                key={tier.name}
                style={[
                  styles.tierRow,
                  currentScore >= tier.minScore && styles.tierRowActive,
                ]}
              >
                <Text style={styles.tierIcon}>{tier.icon}</Text>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierMinScore}>Min {tier.minScore} score</Text>
                </View>
                {currentScore >= tier.minScore && (
                  <Text style={styles.tierCheck}>✓</Text>
                )}
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
  currentTierCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    marginBottom: PRIVE_SPACING.xl,
  },
  currentTierLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    letterSpacing: 1,
    marginBottom: PRIVE_SPACING.sm,
  },
  currentTierName: {
    fontSize: 32,
    fontWeight: '300',
    color: PRIVE_COLORS.gold.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
  },
  progressCard: {
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
  progressBar: {
    height: 8,
    backgroundColor: PRIVE_COLORS.border.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: PRIVE_SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: PRIVE_COLORS.text.secondary,
    textAlign: 'center',
  },
  tiersCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.xxl,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: PRIVE_COLORS.transparent.white08,
    opacity: 0.5,
  },
  tierRowActive: {
    opacity: 1,
  },
  tierIcon: {
    fontSize: 24,
    color: PRIVE_COLORS.gold.primary,
    marginRight: PRIVE_SPACING.lg,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  tierMinScore: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
  },
  tierCheck: {
    fontSize: 18,
    color: PRIVE_COLORS.status.success,
  },
});
