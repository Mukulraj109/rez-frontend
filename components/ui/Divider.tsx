import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SPACING, COLORS } from '@/constants/DesignTokens';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: keyof typeof SPACING;
  color?: string;
  thickness?: number;
  style?: ViewStyle;
}

export default function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  color = COLORS.border.light,
  thickness = 1,
  style,
}: DividerProps) {
  const marginValue = SPACING[spacing];

  return (
    <View
      style={[
        styles.base,
        orientation === 'horizontal'
          ? {
              height: thickness,
              width: '100%',
              marginVertical: marginValue,
            }
          : {
              width: thickness,
              height: '100%',
              marginHorizontal: marginValue,
            },
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {},
});
