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
  description: string;
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
      description: 'Use & save',
    },
    {
      id: 'wallet',
      title: 'Wallet',
      icon: 'wallet-outline',
      route: '/WalletScreen',
      value: 'Load',
      description: 'Your rewards',
    },
    {
      id: 'offers',
      title: 'Offers',
      icon: 'pricetag-outline',
      route: '/offers',
      value: `${newOffersCount} New`,
      description: 'Extra savings',
    },
    {
      id: 'store',
      title: 'Store',
      icon: 'storefront-outline',
      route: '/Store',
      value: 'Explore',
      description: 'Explore nearby',
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
              <View style={[
                styles.valuePill,
                action.id === 'wallet' && styles.walletPill,
                action.id === 'offers' && styles.offersPill
              ]}>
                {action.id === 'offers' ? (
                  <View style={styles.offersContent}>
                    <ThemedText style={styles.offersNumber}>{newOffersCount}</ThemedText>
                    <ThemedText style={styles.offersNewText}>New</ThemedText>
                  </View>
                ) : action.id === 'voucher' ? (
                  <View style={styles.offersContent}>
                    <ThemedText style={styles.offersNumber}>{voucherCount}</ThemedText>
                    <ThemedText style={styles.offersNewText}>New</ThemedText>
                  </View>
                ) : (
                  <ThemedText style={[
                    styles.actionValue,
                    action.id === 'wallet' && styles.walletText
                  ]}>
                    {action.value}
                  </ThemedText>
                )}
                {action.id === 'wallet' && (
                  <View style={styles.plusButton}>
                    <Ionicons name="add" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
            )}
            <ThemedText style={styles.actionDescription}>{action.description}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    marginTop: -4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 46,
    height: 46,
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
    marginBottom: 3,
  },
  // Gray rectangular background for values
  valuePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  // Wallet specific styles
  walletPill: {
    backgroundColor: '#F3F4F6',
    paddingRight: 5,
  },
  walletText: {
    color: '#6B7280',
  },
  plusButton: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Offers specific styles
  offersPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  offersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  offersNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  offersNewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionDescription: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
