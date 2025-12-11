import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

// ReZ Brand Colors from TASK.md
const COLORS = {
  primary: '#00C06A',        // ReZ Green
  deepTeal: '#00796B',       // Accent
  sunGold: '#FFC857',        // Coin highlight
  midnightNavy: '#0B2240',   // Dark text
  slate: '#1F2D3D',          // Body text
  coolGray: '#9AA7B2',       // Muted text
};

interface QuickActionsSectionProps {
  voucherCount?: number;
  walletBalance?: number;
  newOffersCount?: number;
}

interface QuickActionItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  value?: string | number;
  valueColor?: string;
}

export default function QuickActionsSection({
  voucherCount = 0,
  walletBalance = 0,
  newOffersCount = 0,
}: QuickActionsSectionProps) {
  const router = useRouter();

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  // Format wallet balance
  const formatWalletBalance = (balance: number) => {
    if (balance === 0) return '₹ 0';
    return `₹ ${balance.toLocaleString('en-IN')}`;
  };

  // Format offers count
  const formatOffersCount = (count: number): string | undefined => {
    // Always show count, even if 0
    if (count === 0) return '0';
    // Show total count of available offers
    return count > 99 ? '99+' : count.toString();
  };

  const QUICK_ACTIONS: QuickActionItem[] = [
    {
      id: 'voucher',
      title: 'Voucher',
      icon: 'ticket-outline',
      route: '/my-vouchers',
      value: voucherCount.toString(),
    },
    {
      id: 'wallet',
      title: 'Wallet',
      icon: 'wallet-outline',
      route: '/WalletScreen',
      value: formatWalletBalance(walletBalance),
    },
    {
      id: 'offers',
      title: 'Offers',
      icon: 'pricetag-outline',
      route: '/offers',
      value: formatOffersCount(newOffersCount),
      valueColor: newOffersCount > 0 ? COLORS.primary : undefined,
    },
    {
      id: 'store',
      title: 'Store',
      icon: 'storefront-outline',
      route: '/Store',
      value: 'Explore',
      valueColor: COLORS.deepTeal,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionItem}
            onPress={() => handlePress(action.route)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={action.icon} size={24} color={COLORS.deepTeal} />
            </View>
            <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
            {action.value && (
              <ThemedText
                style={[
                  styles.actionValue,
                  ...(action.valueColor ? [{ color: action.valueColor }] : []),
                ]}
              >
                {action.value}
              </ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
    marginTop: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 2,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F5F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.midnightNavy,
    textAlign: 'center',
    marginBottom: 2,
  },
  actionValue: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.coolGray,
    textAlign: 'center',
  },
});
