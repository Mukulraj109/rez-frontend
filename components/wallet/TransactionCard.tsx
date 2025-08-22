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
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    marginHorizontal: 4,
    marginVertical: 2,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Icon Section
  iconContainer: {
    marginRight: 18,
  },
  merchantLogo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  iconFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  // Details Section
  detailsContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    letterSpacing: 0.1,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  
  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  descriptionContainer: {
    flex: 1,
    marginRight: 16,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  date: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  
  // Status Section
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
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