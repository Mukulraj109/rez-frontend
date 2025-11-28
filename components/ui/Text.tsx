import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { TYPOGRAPHY, COLORS } from '@/constants/DesignTokens';

type TextVariant = keyof typeof TYPOGRAPHY;
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | 'warning' | 'info';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
  testID?: string;
}

export default function Text({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  numberOfLines,
  style,
  testID,
}: TextProps) {
  const textStyle = [
    TYPOGRAPHY[variant],
    styles[`color_${color}`],
    { textAlign: align },
    style,
  ];

  return (
    <RNText style={textStyle} numberOfLines={numberOfLines} testID={testID}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  color_primary: {
    color: COLORS.text.primary,
  },
  color_secondary: {
    color: COLORS.text.secondary,
  },
  color_tertiary: {
    color: COLORS.text.tertiary,
  },
  color_inverse: {
    color: COLORS.text.inverse,
  },
  color_error: {
    color: COLORS.error[500],
  },
  color_success: {
    color: COLORS.success[500],
  },
  color_warning: {
    color: COLORS.warning[500],
  },
  color_info: {
    color: COLORS.info[500],
  },
});
