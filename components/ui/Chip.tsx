import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { SPACING, BORDER_RADIUS, COLORS } from '@/constants/DesignTokens';
import Text from './Text';

type ChipVariant = 'filled' | 'outlined' | 'soft';
type ChipSize = 'small' | 'medium';

interface ChipProps {
  label: string;
  onPress?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export default function Chip({
  label,
  onPress,
  variant = 'filled',
  size = 'medium',
  selected = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  testID,
}: ChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        selected && styles[`${variant}_selected`],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      testID={testID}
    >
      {leftIcon && <>{leftIcon}</>}
      <Text
        variant={size === 'small' ? 'caption' : 'bodySmall'}
        color={selected ? 'inverse' : 'primary'}
        style={styles.text}
      >
        {label}
      </Text>
      {rightIcon && <>{rightIcon}</>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },

  // Variants
  filled: {
    backgroundColor: COLORS.background.tertiary,
  },
  filled_selected: {
    backgroundColor: COLORS.primary[500],
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  outlined_selected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[500],
  },
  soft: {
    backgroundColor: COLORS.primary[50],
  },
  soft_selected: {
    backgroundColor: COLORS.primary[100],
  },

  // Sizes
  size_small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 28,
  },
  size_medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
  },

  // States
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },

  text: {
    fontWeight: '500',
  },
});
