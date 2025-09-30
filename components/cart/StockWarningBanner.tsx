// components/cart/StockWarningBanner.tsx
// Banner component for displaying stock warnings and validation issues

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import {
  StockWarningBannerProps,
  ValidationIssue,
  VALIDATION_ISSUE_ICONS,
  VALIDATION_ISSUE_COLORS,
} from '@/types/validation.types';

const { width } = Dimensions.get('window');

export default function StockWarningBanner({
  issues,
  onDismiss,
  onViewDetails,
  autoHide = false,
  autoHideDuration = 5000,
}: StockWarningBannerProps) {
  const [visible, setVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (issues.length > 0 && visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    }
  }, [issues, visible, autoHide, autoHideDuration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  if (issues.length === 0 || !visible) {
    return null;
  }

  // Categorize issues
  const errorIssues = issues.filter(issue => issue.severity === 'error');
  const warningIssues = issues.filter(issue => issue.severity === 'warning');
  const infoIssues = issues.filter(issue => issue.severity === 'info');

  // Determine banner type based on most severe issue
  const bannerType = errorIssues.length > 0
    ? 'error'
    : warningIssues.length > 0
    ? 'warning'
    : 'info';

  // Get primary issue to display
  const primaryIssue = errorIssues[0] || warningIssues[0] || infoIssues[0];

  const bannerStyles = getBannerStyles(bannerType);

  const getMessage = () => {
    const totalIssues = issues.length;

    if (totalIssues === 1) {
      return primaryIssue.message;
    }

    if (errorIssues.length > 0) {
      return `${errorIssues.length} item${errorIssues.length > 1 ? 's are' : ' is'} unavailable`;
    }

    if (warningIssues.length > 0) {
      return `${warningIssues.length} item${warningIssues.length > 1 ? 's have' : ' has'} low stock`;
    }

    if (infoIssues.length > 0) {
      return `${infoIssues.length} price change${infoIssues.length > 1 ? 's' : ''} detected`;
    }

    return `${totalIssues} issue${totalIssues > 1 ? 's' : ''} found in cart`;
  };

  const getIconName = () => {
    if (errorIssues.length > 0) return 'alert-circle';
    if (warningIssues.length > 0) return 'warning';
    return 'information-circle';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bannerStyles.bgColor,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: bannerStyles.iconBg }]}>
          <Ionicons
            name={getIconName() as keyof typeof Ionicons.glyphMap}
            size={20}
            color={bannerStyles.color}
          />
        </View>

        <View style={styles.messageContainer}>
          <ThemedText style={[styles.message, { color: bannerStyles.textColor }]} numberOfLines={2}>
            {getMessage()}
          </ThemedText>
          {issues.length > 1 && (
            <ThemedText style={[styles.subMessage, { color: bannerStyles.subTextColor }]}>
              Tap to view details
            </ThemedText>
          )}
        </View>

        <View style={styles.actions}>
          {onViewDetails && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onViewDetails}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={20} color={bannerStyles.color} />
            </TouchableOpacity>
          )}

          {onDismiss && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={bannerStyles.color} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress bar for auto-hide */}
      {autoHide && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: bannerStyles.color,
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
}

function getBannerStyles(type: 'error' | 'warning' | 'info') {
  switch (type) {
    case 'error':
      return {
        bgColor: '#FEE2E2',
        iconBg: '#DC2626',
        color: '#DC2626',
        textColor: '#991B1B',
        subTextColor: '#B91C1C',
      };
    case 'warning':
      return {
        bgColor: '#FEF3C7',
        iconBg: '#D97706',
        color: '#D97706',
        textColor: '#92400E',
        subTextColor: '#B45309',
      };
    case 'info':
      return {
        bgColor: '#DBEAFE',
        iconBg: '#2563EB',
        color: '#2563EB',
        textColor: '#1E40AF',
        subTextColor: '#2563EB',
      };
  }
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subMessage: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
  },
});

// Export compact version for inline warnings
export function CompactStockWarning({
  issue,
  onPress,
}: {
  issue: ValidationIssue;
  onPress?: () => void;
}) {
  const iconName = VALIDATION_ISSUE_ICONS[issue.type] as keyof typeof Ionicons.glyphMap;
  const colors = VALIDATION_ISSUE_COLORS[issue.type];

  const iconColor = issue.severity === 'error'
    ? colors.error
    : issue.severity === 'warning'
    ? colors.warning
    : colors.info;

  return (
    <TouchableOpacity
      style={[compactStyles.container, { backgroundColor: colors.bg }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Ionicons name={iconName} size={14} color={iconColor} />
      <ThemedText style={[compactStyles.text, { color: iconColor }]} numberOfLines={1}>
        {issue.message}
      </ThemedText>
    </TouchableOpacity>
  );
}

const compactStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});