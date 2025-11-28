import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { TYPOGRAPHY, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  testID,
}: ButtonProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    size === 'small' ? TYPOGRAPHY.buttonSmall : TYPOGRAPHY.button,
    (disabled || loading) && styles.textDisabled,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...containerStyle,
        pressed && !disabled && !loading && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' || variant === 'danger' ? COLORS.text.inverse : COLORS.primary[500]}
          size={size === 'small' ? 'small' : 'large'}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary[500],
  },
  secondary: {
    backgroundColor: COLORS.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary[500],
    shadowOpacity: 0, // Remove shadow for outline
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0, // Remove shadow for ghost
    elevation: 0,
  },
  danger: {
    backgroundColor: COLORS.error[500],
  },

  // Sizes
  size_small: {
    height: 36,
    paddingHorizontal: SPACING.md,
  },
  size_medium: {
    height: 44,
    paddingHorizontal: SPACING.lg,
  },
  size_large: {
    height: 52,
    paddingHorizontal: SPACING.xl,
  },

  // States
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    textAlign: 'center',
  },
  text_primary: {
    color: COLORS.text.inverse,
  },
  text_secondary: {
    color: COLORS.text.inverse,
  },
  text_outline: {
    color: COLORS.primary[500],
  },
  text_ghost: {
    color: COLORS.primary[500],
  },
  text_danger: {
    color: COLORS.text.inverse,
  },
  textDisabled: {
    color: COLORS.text.disabled,
  },
});
