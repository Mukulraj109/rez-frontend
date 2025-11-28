/**
 * EmptyState Component
 *
 * Reusable component for displaying empty states with optional actions.
 * Provides a consistent UX across the app when no data is available.
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { SPACING, TYPOGRAPHY, COLORS, BORDER_RADIUS, SHADOWS } from '@/constants/DesignTokens';

interface EmptyStateProps {
  /**
   * Title text to display
   */
  title: string;

  /**
   * Descriptive message explaining the empty state
   */
  message: string;

  /**
   * Emoji or icon to display (defaults to 📦)
   */
  icon?: string;

  /**
   * Optional image source (overrides icon)
   */
  imageSource?: ImageSourcePropType;

  /**
   * Label for the action button
   */
  actionLabel?: string;

  /**
   * Callback when action button is pressed
   */
  onAction?: () => void;

  /**
   * Custom container style
   */
  style?: any;
}

/**
 * EmptyState displays a friendly message when there's no content to show
 *
 * @example
 * <EmptyState
 *   icon="🔍"
 *   title="No Results Found"
 *   message="Try adjusting your search or filters"
 *   actionLabel="Clear Filters"
 *   onAction={clearFilters}
 * />
 */
export default function EmptyState({
  title,
  message,
  icon = '📦',
  actionLabel,
  onAction,
  imageSource,
  style,
}: EmptyStateProps) {
  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${title}. ${message}`}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
          accessible={false}
        />
      ) : (
        <Text
          style={styles.icon}
          accessible={false}
          aria-hidden={true}
        >
          {icon}
        </Text>
      )}

      <Text
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <Text
        style={styles.message}
        accessible={true}
        accessibilityRole="text"
      >
        {message}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityHint="Double tap to perform this action"
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.background.secondary,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    maxWidth: 320,
  },
  button: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary[500],
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
  },
});
