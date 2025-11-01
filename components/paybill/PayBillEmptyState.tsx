import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { PayBillEmptyStateProps, PAYBILL_FILTERS } from '@/types/paybill.types';

export function PayBillEmptyState({
  filter,
  searchQuery,
  onClearSearch,
  onClearFilters,
}: PayBillEmptyStateProps) {
  const router = useRouter();

  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: 'search-outline',
        title: 'No Results Found',
        subtitle: `No transactions found for "${searchQuery}"`,
        actionText: 'Clear Search',
        onAction: onClearSearch,
      };
    }

    switch (filter) {
      case PAYBILL_FILTERS.TYPE.CREDIT:
        return {
          icon: 'add-circle-outline',
          title: 'No Money Added Yet',
          subtitle: 'You haven\'t added any money to your PayBill balance yet',
          actionText: 'Add Money',
          onAction: () => router.push('/paybill-add-money' as any),
        };
      case PAYBILL_FILTERS.TYPE.DEBIT:
        return {
          icon: 'remove-circle-outline',
          title: 'No Spending Yet',
          subtitle: 'You haven\'t spent any PayBill balance yet',
          actionText: 'Browse Products',
          onAction: () => router.push('/' as any),
        };
      default:
        return {
          icon: 'receipt-outline',
          title: 'No Transactions Yet',
          subtitle: 'Your PayBill transactions will appear here once you start using it',
          actionText: 'Get Started',
          onAction: () => router.push('/paybill-add-money' as any),
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={content.icon as any} size={64} color="#D1D5DB" />
      </View>
      
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
      
      {content.onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={content.onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{content.actionText}</Text>
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
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
