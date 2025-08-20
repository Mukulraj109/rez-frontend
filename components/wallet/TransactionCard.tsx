// Transaction Card Component
// Individual transaction item with Myntra-style design

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Transaction } from '@/types/wallet.types';
import { 
  formatCurrency, 
  getTransactionIcon, 
  getStatusColor, 
  formatTransactionDate 
} from '@/data/walletData';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  showDate?: boolean;
}

export default function TransactionCard({ 
  transaction, 
  onPress, 
  showDate = true 
}: TransactionCardProps) {
  
  const handlePress = () => {
    onPress?.(transaction);
  };

  const statusColor = getStatusColor(transaction.status);
  const isDebit = transaction.type === 'PAYMENT';
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Transaction Icon/Logo */}
      <View style={styles.iconContainer}>
        {transaction.merchantLogo ? (
          <Image 
            source={{ uri: transaction.merchantLogo }} 
            style={styles.merchantLogo}
            defaultSource={require('@/assets/images/wasil-coin.png')}
          />
        ) : (
          <View style={[styles.iconFallback, { backgroundColor: statusColor + '20' }]}>
            <Ionicons
              name={getTransactionIcon(transaction.type) as any}
              size={24}
              color={statusColor}
            />
          </View>
        )}
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {transaction.title}
            </ThemedText>
            {transaction.merchantName && (
              <ThemedText style={styles.merchantName} numberOfLines={1}>
                {transaction.merchantName}
              </ThemedText>
            )}
          </View>
          
          <View style={styles.amountContainer}>
            <ThemedText style={[
              styles.amount,
              { color: isDebit ? '#EF4444' : '#10B981' }
            ]}>
              {isDebit ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.description} numberOfLines={1}>
              {transaction.description}
            </ThemedText>
            {showDate && (
              <ThemedText style={styles.date}>
                {formatTransactionDate(transaction.date)}
              </ThemedText>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '20' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: statusColor }
              ]} />
              <ThemedText style={[
                styles.statusText,
                { color: statusColor }
              ]}>
                {transaction.status.toLowerCase().replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Order ID for reference */}
        {transaction.orderId && (
          <View style={styles.orderIdContainer}>
            <ThemedText style={styles.orderIdLabel}>Order ID: </ThemedText>
            <ThemedText style={styles.orderId}>{transaction.orderId}</ThemedText>
          </View>
        )}
      </View>

      {/* Chevron for navigation */}
      {onPress && (
        <View style={styles.chevronContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color="#9CA3AF" 
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  // Icon Section
  iconContainer: {
    marginRight: 16,
  },
  merchantLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  iconFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Details Section
  detailsContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  descriptionContainer: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  
  // Status Section
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  // Order ID
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  orderId: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  
  // Chevron
  chevronContainer: {
    marginLeft: 8,
  },
});