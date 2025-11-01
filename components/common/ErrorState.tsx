// components/common/ErrorState.tsx - Reusable error display component

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface ErrorStateProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Callback function when retry button is pressed
   */
  onRetry: () => void;

  /**
   * Optional icon name (defaults to 'alert-circle')
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Optional custom styles
   */
  style?: object;
}

/**
 * ErrorState Component
 *
 * Displays error message with retry button
 * Used throughout the app for consistent error handling UX
 *
 * @example
 * <ErrorState
 *   message="Failed to load data"
 *   onRetry={() => fetchData()}
 * />
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  icon = 'alert-circle',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={64} color="#EF4444" style={styles.icon} />

      <ThemedText style={styles.message}>{message}</ThemedText>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={18} color="white" style={styles.retryIcon} />
        <ThemedText style={styles.retryButtonText}>Tap to Retry</ThemedText>
      </TouchableOpacity>
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
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: '80%',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9333EA',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  retryIcon: {
    marginRight: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorState;
