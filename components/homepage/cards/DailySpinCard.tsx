import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const COLORS = {
  white: '#FFFFFF',
  textDark: '#0B2240',
};

interface DailySpinCardProps {
  spinsRemaining: number;
  maxSpins: number;
  canSpin: boolean;
  onPress: () => void;
}

const DailySpinCard: React.FC<DailySpinCardProps> = ({
  spinsRemaining,
  maxSpins,
  canSpin,
  onPress,
}) => {
  const gradientColors: readonly [string, string, string] = ['#00C06A', '#00A859', '#008F4A'];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.glassOverlay}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="disc" size={24} color={COLORS.white} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.cardTitle}>Daily Spin</Text>
            <Text style={styles.cardSubtitle}>Win up to 500 coins</Text>
          </View>

          {/* Spin Count Badge */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, canSpin ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={styles.badgeText}>
                {spinsRemaining}/{maxSpins}
              </Text>
            </View>
          </View>

          {/* Action Indicator */}
          {canSpin && (
            <View style={styles.actionIndicator}>
              <Text style={styles.actionText}>Spin Now!</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    minHeight: 140,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default DailySpinCard;
