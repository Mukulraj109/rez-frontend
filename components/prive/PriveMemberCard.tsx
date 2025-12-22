/**
 * PriveMemberCard - Premium credit card style member card
 * Luxury design with gold accents
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from './priveTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PriveMemberCardProps {
  memberName: string;
  tier: string;
  tierProgress: number;
  nextTier: string;
  pointsToNext: number;
  memberId: string;
  validThru: string;
  totalScore: number;
}

export const PriveMemberCard: React.FC<PriveMemberCardProps> = ({
  memberName,
  tier,
  tierProgress,
  nextTier,
  pointsToNext,
  memberId,
  validThru,
  totalScore,
}) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/prive/tier-progress' as any)}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={['#1A1A1A', '#0D0D0D', '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Card Background Pattern */}
        <View style={styles.cardPattern}>
          <View style={styles.cardPatternCircle1} />
          <View style={styles.cardPatternCircle2} />
        </View>

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardBrand}>
            <Text style={styles.cardLogo}>◈</Text>
            <View>
              <Text style={styles.cardBrandName}>REZ PRIVE</Text>
              <Text style={styles.cardBrandSub}>{tier.toUpperCase()} MEMBER</Text>
            </View>
          </View>
          <View style={styles.cardContactless}>
            <Text style={styles.contactlessIcon}>))))</Text>
          </View>
        </View>

        {/* Card Chip */}
        <View style={styles.cardChip}>
          <View style={styles.chipInner}>
            <View style={styles.chipLine} />
            <View style={styles.chipLine} />
            <View style={styles.chipLine} />
          </View>
        </View>

        {/* Card Number */}
        <Text style={styles.cardNumber}>{memberId}</Text>

        {/* Card Details */}
        <View style={styles.cardDetails}>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>MEMBER</Text>
            <Text style={styles.cardDetailValue}>{memberName.toUpperCase()}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>VALID THRU</Text>
            <Text style={styles.cardDetailValue}>{validThru}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailLabel}>SCORE</Text>
            <Text style={styles.cardScoreValue}>{totalScore.toFixed(1)}</Text>
          </View>
        </View>

        {/* Card Footer - Tier Progress */}
        <View style={styles.cardFooter}>
          <View style={styles.cardProgressContainer}>
            <View style={styles.cardProgressTrack}>
              <LinearGradient
                colors={[PRIVE_COLORS.gold.primary, PRIVE_COLORS.gold.dark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.cardProgressFill, { width: `${tierProgress * 100}%` }]}
              />
            </View>
            <View style={styles.cardProgressLabels}>
              <Text style={styles.cardProgressLabel}>{tier}</Text>
              <Text style={styles.cardProgressLabel}>
                {pointsToNext.toLocaleString()} pts to {nextTier}
              </Text>
            </View>
          </View>
        </View>

        {/* Gold Accent Line */}
        <LinearGradient
          colors={['transparent', PRIVE_COLORS.gold.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardAccentLine}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingTop: PRIVE_SPACING.lg,
  },
  card: {
    aspectRatio: 1.586, // Standard card ratio
    borderRadius: 20,
    padding: PRIVE_SPACING.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardPatternCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: PRIVE_COLORS.transparent.gold10,
  },
  cardPatternCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(201, 169, 98, 0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: PRIVE_SPACING.lg,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PRIVE_SPACING.md,
  },
  cardLogo: {
    fontSize: 28,
    color: PRIVE_COLORS.gold.primary,
  },
  cardBrandName: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIVE_COLORS.gold.primary,
    letterSpacing: 2,
  },
  cardBrandSub: {
    fontSize: 9,
    color: PRIVE_COLORS.text.tertiary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  cardContactless: {
    transform: [{ rotate: '90deg' }],
  },
  contactlessIcon: {
    fontSize: 16,
    color: PRIVE_COLORS.gold.primary,
    opacity: 0.7,
  },
  cardChip: {
    width: 45,
    height: 35,
    borderRadius: 6,
    backgroundColor: PRIVE_COLORS.gold.primary,
    marginBottom: PRIVE_SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 98, 0.5)',
  },
  chipInner: {
    flex: 1,
    padding: 4,
    justifyContent: 'space-between',
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginVertical: 3,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '500',
    color: PRIVE_COLORS.text.primary,
    letterSpacing: 3,
    marginBottom: PRIVE_SPACING.lg,
    fontFamily: 'monospace',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: PRIVE_SPACING.md,
  },
  cardDetailItem: {
    gap: 2,
  },
  cardDetailLabel: {
    fontSize: 8,
    color: PRIVE_COLORS.text.tertiary,
    letterSpacing: 1,
  },
  cardDetailValue: {
    fontSize: 11,
    color: PRIVE_COLORS.text.primary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardScoreValue: {
    fontSize: 14,
    color: PRIVE_COLORS.gold.primary,
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  cardProgressContainer: {
    gap: PRIVE_SPACING.sm,
  },
  cardProgressTrack: {
    height: 3,
    backgroundColor: PRIVE_COLORS.transparent.white10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardProgressLabel: {
    fontSize: 9,
    color: PRIVE_COLORS.text.tertiary,
  },
  cardAccentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});

export default PriveMemberCard;
