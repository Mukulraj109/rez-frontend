/**
 * WalletQuickActions Component
 *
 * Displays quick action buttons for wallet features like P2P transfer,
 * gift coins, expiry tracker, gift cards, and scheduled drops.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface WalletQuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
  description?: string;
}

const WALLET_ACTIONS: WalletQuickAction[] = [
  {
    id: 'transfer',
    icon: 'swap-horizontal',
    label: 'Transfer',
    route: '/wallet/transfer',
    color: '#6366F1',
    description: 'Send coins to friends',
  },
  {
    id: 'gift',
    icon: 'gift',
    label: 'Gift Coins',
    route: '/wallet/gift',
    color: '#EC4899',
    description: 'Gift coins to others',
  },
  {
    id: 'expiry',
    icon: 'time',
    label: 'Expiry',
    route: '/wallet/expiry-tracker',
    color: '#F59E0B',
    description: 'Track coin expiry',
  },
  {
    id: 'gift-cards',
    icon: 'card',
    label: 'Gift Cards',
    route: '/wallet/gift-cards',
    color: '#10B981',
    description: 'Buy gift cards',
  },
  {
    id: 'drops',
    icon: 'calendar',
    label: 'Drops',
    route: '/wallet/scheduled-drops',
    color: '#8B5CF6',
    description: 'Scheduled rewards',
  },
];

interface WalletQuickActionsProps {
  style?: any;
  showTitle?: boolean;
}

export const WalletQuickActions: React.FC<WalletQuickActionsProps> = ({
  style,
  showTitle = true,
}) => {
  const router = useRouter();

  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <View style={styles.header}>
          <ThemedText style={styles.title}>Quick Actions</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your wallet</ThemedText>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {WALLET_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => handleActionPress(action.route)}
            activeOpacity={0.8}
            accessibilityLabel={action.label}
            accessibilityHint={action.description}
            accessibilityRole="button"
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <ThemedText style={styles.actionLabel} numberOfLines={1}>
              {action.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.base,
  },
  header: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minWidth: 80,
    ...Shadows.subtle,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default WalletQuickActions;
