import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SPACING, BORDER_RADIUS, COLORS, TYPOGRAPHY } from '@/constants/DesignTokens';
import Text from './Text';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  testID?: string;
}

export default function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  testID,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        style,
      ]}
      testID={testID}
    >
      <Text
        variant={size === 'small' ? 'caption' : 'bodySmall'}
        color="inverse"
        style={styles.text}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary[500],
  },
  secondary: {
    backgroundColor: COLORS.secondary[500],
  },
  success: {
    backgroundColor: COLORS.success[500],
  },
  error: {
    backgroundColor: COLORS.error[500],
  },
  warning: {
    backgroundColor: COLORS.warning[500],
  },
  info: {
    backgroundColor: COLORS.info[500],
  },
  neutral: {
    backgroundColor: COLORS.neutral[500],
  },

  // Sizes
  size_small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    minHeight: 20,
  },
  size_medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: 24,
  },
  size_large: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 32,
  },

  text: {
    fontWeight: '600',
  },
});
