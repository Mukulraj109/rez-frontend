// SettingsItem Component
// Individual settings category item

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { SettingsItemProps } from '@/types/account.types';
import { ACCOUNT_COLORS } from '@/types/account.types';

export default function SettingsItem({
  category,
  onPress,
  style,
}: SettingsItemProps) {
  
  const handlePress = () => {
    if (category.isEnabled) {
      onPress(category);
    }
  };

  const renderBadge = () => {
    if (!category.badge) return null;

    const isNumeric = typeof category.badge === 'number' || !isNaN(Number(category.badge));
    const badgeStyle = isNumeric ? styles.numericBadge : styles.textBadge;
    const badgeTextStyle = isNumeric ? styles.numericBadgeText : styles.textBadgeText;

    return (
      <View style={badgeStyle}>
        <ThemedText style={badgeTextStyle}>
          {category.badge}
        </ThemedText>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !category.isEnabled && styles.disabledContainer,
        style,
      ]}
      onPress={handlePress}
      disabled={!category.isEnabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={[
          styles.iconContainer,
          !category.isEnabled && styles.disabledIconContainer,
        ]}>
          <Ionicons
            name={category.icon as any}
            size={24}
            color={category.isEnabled ? ACCOUNT_COLORS.primary : ACCOUNT_COLORS.textSecondary}
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText style={[
            styles.title,
            !category.isEnabled && styles.disabledText,
          ]}>
            {category.title}
          </ThemedText>
          
          {category.description && (
            <ThemedText style={[
              styles.description,
              !category.isEnabled && styles.disabledText,
            ]}>
              {category.description}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.rightContent}>
        {renderBadge()}
        
        {category.showArrow && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={category.isEnabled ? ACCOUNT_COLORS.textSecondary : ACCOUNT_COLORS.border}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: ACCOUNT_COLORS.border,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${ACCOUNT_COLORS.primary}15`, // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  disabledIconContainer: {
    backgroundColor: ACCOUNT_COLORS.surface,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCOUNT_COLORS.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: ACCOUNT_COLORS.textSecondary,
    lineHeight: 18,
  },
  disabledText: {
    color: ACCOUNT_COLORS.textSecondary,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Badge Styles
  numericBadge: {
    backgroundColor: ACCOUNT_COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  textBadge: {
    backgroundColor: ACCOUNT_COLORS.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  numericBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  textBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});