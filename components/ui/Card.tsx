import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { SPACING, BORDER_RADIUS, SHADOWS, COLORS } from '@/constants/DesignTokens';

type CardVariant = 'elevated' | 'outlined' | 'filled';
type SpacingKey = keyof typeof SPACING;

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: SpacingKey;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export default function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  testID,
}: CardProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    { padding: SPACING[padding] },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...containerStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background.primary,
  },
  elevated: {
    ...SHADOWS.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  filled: {
    backgroundColor: COLORS.background.secondary,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
});
