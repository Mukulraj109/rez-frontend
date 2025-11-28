/**
 * GlassCard - Modern glassmorphism card component
 *
 * Features:
 * - Translucent background with blur effect
 * - Subtle border with transparency
 * - Multiple variants (light, medium, dark, purple)
 * - Customizable shadow and border radius
 * - Supports press interactions
 *
 * @example
 * <GlassCard variant="light" onPress={() => console.log('Pressed')}>
 *   <Text>Glass content</Text>
 * </GlassCard>
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/DesignSystem';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'dark' | 'purple';
  intensity?: number; // Blur intensity (0-100)
  borderRadius?: number;
  shadow?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
}

/**
 * GlassCard Component with Glassmorphism Effect
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'light',
  intensity = 80,
  borderRadius = BorderRadius.lg,
  shadow = true,
  style,
  onPress,
  activeOpacity = 0.8,
  disabled = false,
}) => {
  // Get variant-specific styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'light':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
      case 'medium':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      case 'dark':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        };
      case 'purple':
        return {
          backgroundColor: 'rgba(124, 58, 237, 0.15)',
          borderColor: 'rgba(124, 58, 237, 0.3)',
        };
      default:
        return {};
    }
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...getVariantStyles(),
    borderRadius,
    ...(shadow && Shadows.medium),
    ...style,
  };

  // On web, we can't use BlurView, so use simple background
  if (Platform.OS === 'web') {
    const Container = onPress ? TouchableOpacity : View;
    return (
      <Container
        style={containerStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
        disabled={disabled}
      >
        {children}
      </Container>
    );
  }

  // On native, use BlurView for true glassmorphism
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.wrapper, { borderRadius }, shadow && Shadows.medium, style]}
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={disabled}
    >
      <BlurView
        intensity={intensity}
        style={[
          styles.blurContainer,
          { borderRadius },
          getVariantStyles(),
        ]}
        tint={variant === 'dark' ? 'dark' : 'light'}
      >
        {children}
      </BlurView>
    </Container>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default GlassCard;
