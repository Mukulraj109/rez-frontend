// Navigation Shortcuts Component
// Horizontal scrollable shortcuts for quick access to key features

import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface Shortcut {
  icon: string;
  label: string;
  route: string;
  badge?: string;
}

const shortcuts: Shortcut[] = [
  { icon: '👑', label: 'Premium', route: '/subscription/plans', badge: 'NEW' },
  { icon: '📄', label: 'Upload', route: '/bill-upload', badge: 'HOT' },
  { icon: '🎁', label: 'Refer', route: '/referral' },
  { icon: '🎮', label: 'Games', route: '/games' },
  { icon: '🎯', label: 'Tasks', route: '/challenges' },
  { icon: '💳', label: 'Voucher', route: '/my-vouchers' },
  { icon: '⭐', label: 'Reviews', route: '/my-reviews' },
  { icon: '🏆', label: 'Badges', route: '/profile/achievements' },
];

export default function NavigationShortcuts() {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {shortcuts.map((shortcut, index) => (
        <TouchableOpacity
          key={index}
          style={styles.shortcut}
          onPress={() => router.push(shortcut.route as any)}
          activeOpacity={0.7}
        >
          {shortcut.badge && (
            <View style={[
              styles.badge,
              shortcut.badge === 'HOT' ? styles.hotBadge : styles.newBadge
            ]}>
              <ThemedText style={styles.badgeText}>{shortcut.badge}</ThemedText>
            </View>
          )}
          <View style={styles.iconContainer}>
            <ThemedText style={styles.icon}>{shortcut.icon}</ThemedText>
          </View>
          <ThemedText style={styles.label}>{shortcut.label}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 12,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 12,
  },
  shortcut: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  newBadge: {
    backgroundColor: '#8B5CF6',
  },
  hotBadge: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
});
