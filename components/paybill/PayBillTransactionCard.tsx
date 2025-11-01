import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PayBillTransactionCardProps, PayBillTransaction } from '@/types/paybill.types';

export function PayBillTransactionCard({ 
  transaction, 
  onPress 
}: PayBillTransactionCardProps) {
  const handlePress = () => {
    onPress?.(transaction);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'failed':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'cancelled':
        return { bg: '#F3F4F6', text: '#6B7280' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getTransactionIcon = (type: string, source?: any) => {
    if (type === 'credit') {
      switch (source?.type) {
        case 'stripe':
          return 'card-outline';
        case 'upi':
          return 'qr-code-outline';
        case 'bonus':
          return 'gift-outline';
        case 'refund':
          return 'refresh-outline';
        default:
          return 'add-circle-outline';
      }
    } else {
      switch (source?.type) {
        case 'wallet':
          return 'wallet-outline';
        case 'order':
          return 'bag-outline';
        default:
          return 'remove-circle-outline';
      }
    }
  };

  const statusColors = getStatusColor(transaction.status.current);
  const isCredit = transaction.type === 'credit';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        {/* Transaction Icon */}
        <View style={[
          styles.transactionIcon,
          isCredit ? styles.transactionIconCredit : styles.transactionIconDebit,
        ]}>
          <Ionicons
            name={getTransactionIcon(transaction.type, transaction.source) as any}
            size={24}
            color={isCredit ? '#10B981' : '#EF4444'}
          />
        </View>

        {/* Transaction Info */}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription} numberOfLines={2}>
            {transaction.description || (isCredit ? 'Added to PayBill' : 'Payment')}
          </Text>
          
          <Text style={styles.transactionDate}>
            {formatDate(transaction.createdAt)}
          </Text>
          
          {/* Status Badge */}
          {transaction.status?.current && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusColors.bg }
            ]}>
              <Text style={[
                styles.statusText,
                { color: statusColors.text }
              ]}>
                {transaction.status.current.charAt(0).toUpperCase() + 
                 transaction.status.current.slice(1)}
              </Text>
            </View>
          )}

          {/* Source Info */}
          {transaction.source?.description && (
            <Text style={styles.sourceText}>
              via {transaction.source.description}
            </Text>
          )}
        </View>
      </View>

      {/* Transaction Amount */}
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          isCredit ? styles.transactionAmountCredit : styles.transactionAmountDebit,
        ]}>
          {isCredit ? '+' : '-'}₹{transaction.amount.toLocaleString()}
        </Text>
        
        {/* Bonus indicator for credit transactions */}
        {isCredit && transaction.metadata?.bonusEarned && transaction.metadata.bonusEarned > 0 && (
          <Text style={styles.bonusText}>
            +₹{transaction.metadata.bonusEarned} bonus
          </Text>
        )}
      </View>
    </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  transactionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  transactionIconCredit: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  transactionIconDebit: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sourceText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  transactionAmountCredit: {
    color: '#10B981',
  },
  transactionAmountDebit: {
    color: '#EF4444',
  },
  bonusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
});


