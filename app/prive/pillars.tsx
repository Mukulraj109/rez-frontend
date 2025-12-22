/**
 * Privé Pillars Page
 * Detailed view of all 6 pillars
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
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS, PILLAR_CONFIG } from '@/components/prive/priveTheme';

const PILLAR_DATA = [
  { id: 'engagement', score: 78, trend: 'up' },
  { id: 'trust', score: 92, trend: 'stable' },
  { id: 'influence', score: 65, trend: 'up' },
  { id: 'economic', score: 70, trend: 'stable' },
  { id: 'brand_affinity', score: 60, trend: 'down' },
  { id: 'network', score: 55, trend: 'stable' },
];

export default function PillarsScreen() {
  const router = useRouter();

  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'up':
        return { icon: '↑', color: '#4CAF50' };
      case 'down':
        return { icon: '↓', color: '#F44336' };
      default:
        return { icon: '→', color: '#9E9E9E' };
    }
  };

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
          <Text style={styles.headerTitle}>The 6 Pillars</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Intro Card */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Your Privé Score Breakdown</Text>
            <Text style={styles.introText}>
              Your Privé score is calculated from 6 weighted pillars. Each pillar
              contributes to your overall eligibility and tier status.
            </Text>
          </View>

          {/* Pillars List */}
          {PILLAR_DATA.map((pillarData) => {
            const config = PILLAR_CONFIG[pillarData.id as keyof typeof PILLAR_CONFIG];
            const trend = getTrendInfo(pillarData.trend);
            const weightPercent = (config.weight * 100).toFixed(0);

            return (
              <View key={pillarData.id} style={styles.pillarCard}>
                <View style={styles.pillarHeader}>
                  <View style={[styles.pillarIconBg, { backgroundColor: `${config.color}20` }]}>
                    <Text style={styles.pillarIcon}>{config.icon}</Text>
                  </View>
                  <View style={styles.pillarInfo}>
                    <Text style={styles.pillarName}>{config.name}</Text>
                    <Text style={styles.pillarDescription}>{config.description}</Text>
                  </View>
                  <View style={styles.pillarScoreContainer}>
                    <Text style={styles.pillarScore}>{pillarData.score}</Text>
                    <Text style={[styles.pillarTrend, { color: trend.color }]}>
                      {trend.icon}
                    </Text>
                  </View>
                </View>
                <View style={styles.pillarDetails}>
                  <View style={styles.pillarWeightBadge}>
                    <Text style={styles.pillarWeight}>{weightPercent}% weight</Text>
                  </View>
                  <View style={styles.pillarProgressContainer}>
                    <View style={styles.pillarProgressTrack}>
                      <View
                        style={[
                          styles.pillarProgressFill,
                          { width: `${pillarData.score}%`, backgroundColor: config.color },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Trust Warning */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Trust score below 60 will block Privé access regardless of your total score.
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
  introCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    marginBottom: PRIVE_SPACING.xl,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.gold.primary,
    marginBottom: PRIVE_SPACING.sm,
  },
  introText: {
    fontSize: 13,
    color: PRIVE_COLORS.text.secondary,
    lineHeight: 20,
  },
  pillarCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.md,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PRIVE_SPACING.md,
  },
  pillarIcon: {
    fontSize: 20,
  },
  pillarInfo: {
    flex: 1,
  },
  pillarName: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  pillarDescription: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
  },
  pillarScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarScore: {
    fontSize: 24,
    fontWeight: '300',
    color: PRIVE_COLORS.text.primary,
  },
  pillarTrend: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: PRIVE_SPACING.xs,
  },
  pillarDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: PRIVE_SPACING.md,
    gap: PRIVE_SPACING.md,
  },
  pillarWeightBadge: {
    backgroundColor: PRIVE_COLORS.transparent.white10,
    paddingHorizontal: PRIVE_SPACING.md,
    paddingVertical: PRIVE_SPACING.xs,
    borderRadius: PRIVE_RADIUS.sm,
  },
  pillarWeight: {
    fontSize: 11,
    color: PRIVE_COLORS.text.secondary,
  },
  pillarProgressContainer: {
    flex: 1,
  },
  pillarProgressTrack: {
    height: 6,
    backgroundColor: PRIVE_COLORS.border.primary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  pillarProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    marginTop: PRIVE_SPACING.md,
    marginBottom: PRIVE_SPACING.xxl,
    gap: PRIVE_SPACING.md,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: PRIVE_COLORS.text.secondary,
    lineHeight: 18,
  },
});
