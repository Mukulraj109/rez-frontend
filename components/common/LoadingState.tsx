// components/common/LoadingState.tsx - Reusable loading indicator component

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface LoadingStateProps {
  /**
   * Optional loading message to display
   */
  message?: string;

  /**
   * Size of the activity indicator
   */
  size?: 'small' | 'large';

  /**
   * Color of the loading indicator
   */
  color?: string;

  /**
   * Optional custom styles
   */
  style?: object;
}

/**
 * LoadingState Component
 *
 * Displays loading indicator with optional message
 * Used throughout the app for consistent loading UX
 *
 * @example
 * <LoadingState message="Loading vouchers..." />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  color = '#9333EA',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />

      {message && (
        <ThemedText style={styles.message}>{message}</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LoadingState;
