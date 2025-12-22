/**
 * PriveQuickActions - 4 quick action buttons
 * Wallet, Earnings, Redeem, Invite
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from './priveTheme';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'wallet', label: 'Wallet', icon: '◈', route: '/prive/wallet' },
  { id: 'earnings', label: 'Earnings', icon: '↑', route: '/prive/earnings' },
  { id: 'redeem', label: 'Redeem', icon: '◇', route: '/prive/redeem' },
  { id: 'invite', label: 'Invite', icon: '✦', route: '/referral' },
];

export const PriveQuickActions: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {QUICK_ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionItem}
          onPress={() => router.push(action.route as any)}
          activeOpacity={0.7}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>{action.icon}</Text>
          </View>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingVertical: PRIVE_SPACING.xl,
  },
  actionItem: {
    alignItems: 'center',
    gap: PRIVE_SPACING.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIVE_COLORS.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  actionIconText: {
    fontSize: 22,
    color: PRIVE_COLORS.gold.primary,
  },
  actionLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.secondary,
  },
});

export default PriveQuickActions;
