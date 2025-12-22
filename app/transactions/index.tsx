// Transactions Page
// Displays user's transaction history with filtering and search

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import walletApi, { TransactionResponse, TransactionFilters } from '@/services/walletApi';

interface TransactionItemProps {
  transaction: TransactionResponse;
  onPress: (transaction: TransactionResponse) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const getTransactionIcon = (category: string, type: string) => {
    if (type === 'credit') {
      switch (category) {
        case 'topup': return 'add-circle';
        case 'cashback': return 'cash';
        case 'bonus': return 'gift';
        case 'refund': return 'return-up-back';
        default: return 'arrow-down-circle';
      }
    } else {
      switch (category) {
        case 'spending': return 'card';
        case 'withdrawal': return 'arrow-up-circle';
        case 'penalty': return 'warning';
        default: return 'arrow-up-circle';
      }
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? '#10B981' : '#EF4444';
  };

  const formatAmount = (amount: number, currency: string, type: string) => {
    const sign = type === 'credit' ? '+' : '-';
    return `${sign}${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={getTransactionIcon(transaction.category, transaction.type) as any}
          size={24} 
          color={getTransactionColor(transaction.type)} 
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </Text>
        <View style={styles.transactionStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: transaction.status.current === 'completed' ? '#D1FAE5' : '#FEF3C7' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: transaction.status.current === 'completed' ? '#065F46' : '#92400E' }
            ]}>
              {transaction.status.current.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: getTransactionColor(transaction.type) }
        ]}>
          {formatAmount(transaction.amount, transaction.currency, transaction.type)}
        </Text>
        <Text style={styles.balanceText}>
          Balance: {transaction.currency} {transaction.balanceAfter.toLocaleString()}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const loadTransactions = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await walletApi.getTransactions({
        ...filters,
        page,
      });

      if (response.success && response.data) {
        if (page === 1) {
          setTransactions(response.data.transactions);
        } else {
          setTransactions(prev => [...prev, ...response.data!.transactions]);
        }
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.error || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('❌ [Transactions] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  const handleRefresh = useCallback(() => {
    loadTransactions(1, true);
  }, [loadTransactions]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasNext && !isLoading) {
      loadTransactions(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, isLoading, loadTransactions]);

  const handleTransactionPress = useCallback((transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
  }, []);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleFilterChange = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setShowFilters(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const renderTransactionItem = ({ item }: { item: TransactionResponse }) => (
    <TransactionItem 
      transaction={item} 
      onPress={handleTransactionPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyStateText}>
        Your transaction history will appear here once you start using your wallet.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.errorStateTitle}>Failed to Load Transactions</Text>
      <Text style={styles.errorStateText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#8B5CF6'] as const} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      {error && transactions.length === 0 ? (
        renderErrorState()
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#7C3AED']}
              tintColor="#7C3AED"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={7}
          ListFooterComponent={
            isLoading && transactions.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Transaction Detail Modal */}
      <Modal
        visible={!!selectedTransaction}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTransaction(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTransaction && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Transaction Details</Text>
                  <TouchableOpacity onPress={() => setSelectedTransaction(null)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <Text style={styles.modalDescription}>
                    {selectedTransaction.description}
                  </Text>
                  <Text style={styles.modalAmount}>
                    {selectedTransaction.type === 'credit' ? '+' : '-'}
                    {selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.modalDate}>
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.modalStatus}>
                    Status: {selectedTransaction.status.current.toUpperCase()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  transactionStatus: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 16,
  },
  modalDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  modalStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
});