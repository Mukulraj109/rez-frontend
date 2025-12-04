/**
 * ReZCoin Component
 *
 * Displays the branded ReZ coin with:
 * - Green gradient ring (#00C06A → #00A16B)
 * - Inner gold circle (#FFC857)
 * - 'R' mark in center (#0B2240)
 * - Balance display in pill format
 * - Tappable with navigation support
 *
 * Based on TASK.md brand guidelines - Section 8: Coin Visual Language
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

// Brand colors from TASK.md
const BRAND_COLORS = {
  primaryGreen: '#00C06A',
  deepGreen: '#00A16B',
  sunGold: '#FFC857',
  goldDark: '#FFB830',
  midnightNavy: '#0B2240',
};

interface ReZCoinProps {
  /** User's coin balance */
  balance: number;
  /** Size variant: small (header), medium (card), large (wallet) */
  size?: 'small' | 'medium' | 'large';
  /** Callback when coin is pressed */
  onPress?: () => void;
  /** Whether to show the balance number */
  showBalance?: boolean;
  /** Custom style for the container */
  style?: any;
}

// Size configurations
const SIZES = {
  small: { coin: 22, fontSize: 14, pillPadding: 8, pillHeight: 28 },
  medium: { coin: 32, fontSize: 16, pillPadding: 10, pillHeight: 36 },
  large: { coin: 44, fontSize: 20, pillPadding: 14, pillHeight: 48 },
};

/**
 * ReZCoin Component
 *
 * Renders the branded ReZ coin with gradient ring and R mark
 */
export const ReZCoin: React.FC<ReZCoinProps> = ({
  balance,
  size = 'small',
  onPress,
  showBalance = true,
  style,
}) => {
  const config = SIZES[size];

  /**
   * CoinIcon - SVG coin with gradient ring and R mark
   */
  const CoinIcon = () => (
    <Svg
      width={config.coin}
      height={config.coin}
      viewBox="0 0 44 44"
      style={styles.coinSvg}
    >
      <Defs>
        {/* Green gradient ring */}
        <SvgLinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={BRAND_COLORS.primaryGreen} />
          <Stop offset="100%" stopColor={BRAND_COLORS.deepGreen} />
        </SvgLinearGradient>
        {/* Gold inner gradient */}
        <SvgLinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={BRAND_COLORS.sunGold} />
          <Stop offset="100%" stopColor={BRAND_COLORS.goldDark} />
        </SvgLinearGradient>
      </Defs>

      {/* Outer green ring */}
      <Circle cx="22" cy="22" r="21" fill="url(#ringGradient)" />

      {/* Inner gold circle */}
      <Circle cx="22" cy="22" r="16" fill="url(#goldGradient)" />

      {/* R mark in center */}
      <SvgText
        x="22"
        y="28"
        textAnchor="middle"
        fill={BRAND_COLORS.midnightNavy}
        fontSize="18"
        fontWeight="700"
        fontFamily={Platform.select({
          ios: 'Poppins-Bold',
          android: 'Poppins-Bold',
          default: 'System',
        })}
      >
        R
      </SvgText>
    </Svg>
  );

  /**
   * Format balance with thousands separator
   */
  const formatBalance = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  const content = (
    <View
      style={[
        styles.pill,
        {
          paddingHorizontal: config.pillPadding,
          height: config.pillHeight,
        },
        style,
      ]}
    >
      <CoinIcon />
      {showBalance && (
        <Text
          style={[
            styles.balance,
            {
              fontSize: config.fontSize,
              fontFamily: Platform.select({
                ios: 'Inter-SemiBold',
                android: 'Inter-SemiBold',
                default: undefined,
              }),
            },
          ]}
        >
          {formatBalance(balance)}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={`ReZ coins: ${balance}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view your coin details and rewards"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 4,
    gap: 6,
  },
  coinSvg: {
    // Ensure crisp rendering
  },
  balance: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ReZCoin;
