/**
 * EarnCoinsCard Component
 *
 * Displays earnable ReZ coins with orange gradient background
 * Shows: "Earn X ReZ Coins" + "Use on your next purchase"
 *
 * Based on reference design from ProductPage redesign
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface EarnCoinsCardProps {
  /** Number of coins user will earn */
  earnableCoins: number;
  /** Subtitle text */
  subtitle?: string;
  /** Custom style */
  style?: any;
}

/**
 * Format number with locale
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

export const EarnCoinsCard: React.FC<EarnCoinsCardProps> = ({
  earnableCoins,
  subtitle = 'Use on your next purchase',
  style,
}) => {
  return (
    <LinearGradient
      colors={['#F97316', '#EA580C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, style]}
    >
      {/* Coin Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require('@/assets/images/rez-coin.png')}
          style={styles.coinImage}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Earn {formatNumber(earnableCoins)} ReZ Coins
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  coinImage: {
    width: 28,
    height: 28,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // Decorative elements
  decorCircle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  decorCircle2: {
    position: 'absolute',
    right: 20,
    bottom: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default EarnCoinsCard;
