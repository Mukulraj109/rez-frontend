/**
 * Prive Wallet Page
 * Shows detailed coin balance and transaction history with real data
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from '@/components/prive/priveTheme';
import { usePriveSection } from '@/hooks/usePriveSection';
import priveApi, { TransactionItem } from '@/services/priveApi';

const TRANSACTION_ICONS: Record<string, string> = {
  check_in: '✅',
  purchase: '🛍️',
  referral: '👥',
  campaign: '📢',
  content: '✍️',
  review: '⭐',
  redemption: '🎁',
  transfer: '↔️',
  bonus: '💰',
  cashback: '💵',
};

export default function PriveWalletScreen() {
  const router = useRouter();
  const { userData, isLoading: dashboardLoading, refetch } = usePriveSection();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const coins = userData?.coins || { total: 0, rez: 0, prive: 0, branded: 0, brandedBreakdown: [] };

  const fetchTransactions = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsLoadingTransactions(!refresh);
      }

      const response = await priveApi.getTransactions({ page: pageNum, limit: 15 });

      if (response.success && response.data) {
        const { transactions: newTransactions, pagination } = response.data;

        if (pageNum === 1) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }

        setHasMore(pagination.page < pagination.pages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), fetchTransactions(1, true)]);
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isLoadingTransactions && hasMore) {
      fetchTransactions(page + 1);
    }
  };

  const getTransactionIcon = (type: string): string => {
    return TRANSACTION_ICONS[type] || '💎';
  };

  const formatAmount = (amount: number): string => {
    const prefix = amount > 0 ? '+' : '';
    return `${prefix}${amount.toLocaleString()}`;
  };

  const getRelativeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isLoading = dashboardLoading && transactions.length === 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={PRIVE_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prive Wallet</Text>
          <TouchableOpacity
            style={styles.vouchersButton}
            onPress={() => router.push('/prive/vouchers' as any)}
          >
            <Text style={styles.vouchersButtonText}>Vouchers</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIVE_COLORS.gold.primary} />
            <Text style={styles.loadingText}>Loading wallet...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={PRIVE_COLORS.gold.primary}
              />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isNearEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
              if (isNearEnd && hasMore && !isLoadingTransactions) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>{coins.total.toLocaleString()}</Text>
              <Text style={styles.balanceSubtext}>coins</Text>
            </View>

            {/* Coin Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.sectionTitle}>Coin Breakdown</Text>
              <View style={styles.coinRow}>
                <View style={[styles.coinDot, { backgroundColor: PRIVE_COLORS.gold.primary }]} />
                <Text style={styles.coinLabel}>ReZ Coins</Text>
                <Text style={styles.coinValue}>{coins.rez.toLocaleString()}</Text>
              </View>
              <View style={styles.coinRow}>
                <View style={[styles.coinDot, { backgroundColor: '#B8860B' }]} />
                <Text style={styles.coinLabel}>Prive Coins</Text>
                <Text style={styles.coinValue}>{coins.prive.toLocaleString()}</Text>
              </View>
              <View style={[styles.coinRow, styles.coinRowLast]}>
                <View style={[styles.coinDot, { backgroundColor: '#64B5F6' }]} />
                <Text style={styles.coinLabel}>Branded Coins</Text>
                <Text style={styles.coinValue}>{coins.branded.toLocaleString()}</Text>
              </View>

              {/* Branded coins breakdown */}
              {coins.brandedBreakdown && coins.brandedBreakdown.length > 0 && (
                <View style={styles.brandedBreakdown}>
                  {coins.brandedBreakdown.map((brand, index) => (
                    <View key={brand.brandId || index} style={styles.brandedRow}>
                      <Text style={styles.brandedName}>{brand.brandName}</Text>
                      <Text style={styles.brandedAmount}>{brand.amount.toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/prive/redeem' as any)}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>🎁</Text>
                </View>
                <Text style={styles.actionText}>Redeem</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/prive/earnings' as any)}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>📈</Text>
                </View>
                <Text style={styles.actionText}>Earnings</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <View style={styles.transactionsCard}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>

              {isLoadingTransactions && transactions.length === 0 ? (
                <View style={styles.transactionsLoading}>
                  <ActivityIndicator size="small" color={PRIVE_COLORS.gold.primary} />
                </View>
              ) : transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                  <Text style={styles.emptySubtext}>
                    Your coin transactions will appear here
                  </Text>
                </View>
              ) : (
                <>
                  {transactions.map((txn, index) => (
                    <View
                      key={txn.id}
                      style={[
                        styles.transactionRow,
                        index === transactions.length - 1 && styles.transactionRowLast
                      ]}
                    >
                      <View style={styles.transactionIcon}>
                        <Text style={styles.transactionEmoji}>{getTransactionIcon(txn.type)}</Text>
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionTitle}>{txn.description}</Text>
                        <Text style={styles.transactionDate}>{getRelativeDate(txn.createdAt)}</Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          txn.amount > 0 ? styles.amountPositive : styles.amountNegative
                        ]}
                      >
                        {formatAmount(txn.amount)}
                      </Text>
                    </View>
                  ))}

                  {hasMore && (
                    <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                      {isLoadingTransactions ? (
                        <ActivityIndicator size="small" color={PRIVE_COLORS.gold.primary} />
                      ) : (
                        <Text style={styles.loadMoreText}>Load More</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingVertical: PRIVE_SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  vouchersButton: {
    paddingHorizontal: PRIVE_SPACING.md,
    paddingVertical: PRIVE_SPACING.sm,
    borderRadius: PRIVE_RADIUS.md,
    backgroundColor: PRIVE_COLORS.transparent.gold15,
  },
  vouchersButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIVE_COLORS.gold.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: PRIVE_SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: PRIVE_SPACING.md,
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
  },
  balanceCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    marginBottom: PRIVE_SPACING.xl,
  },
  balanceLabel: {
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.sm,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '200',
    color: PRIVE_COLORS.gold.primary,
  },
  balanceSubtext: {
    fontSize: 14,
    color: PRIVE_COLORS.text.tertiary,
  },
  breakdownCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: PRIVE_COLORS.transparent.white08,
  },
  coinRowLast: {
    borderBottomWidth: 0,
  },
  coinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: PRIVE_SPACING.md,
  },
  coinLabel: {
    flex: 1,
    fontSize: 14,
    color: PRIVE_COLORS.text.secondary,
  },
  coinValue: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  brandedBreakdown: {
    marginTop: PRIVE_SPACING.md,
    paddingTop: PRIVE_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: PRIVE_COLORS.transparent.white08,
  },
  brandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: PRIVE_SPACING.sm,
    paddingLeft: PRIVE_SPACING.lg,
  },
  brandedName: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
  },
  brandedAmount: {
    fontSize: 12,
    color: PRIVE_COLORS.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: PRIVE_SPACING.md,
    marginBottom: PRIVE_SPACING.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIVE_COLORS.transparent.gold15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PRIVE_SPACING.sm,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: PRIVE_COLORS.text.primary,
  },
  transactionsCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.xxl,
  },
  transactionsLoading: {
    paddingVertical: PRIVE_SPACING.xxl,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: PRIVE_SPACING.md,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.xs,
  },
  emptySubtext: {
    fontSize: 13,
    color: PRIVE_COLORS.text.tertiary,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: PRIVE_COLORS.transparent.white08,
  },
  transactionRowLast: {
    borderBottomWidth: 0,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIVE_COLORS.transparent.white10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PRIVE_SPACING.md,
  },
  transactionEmoji: {
    fontSize: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    color: PRIVE_COLORS.text.primary,
  },
  transactionDate: {
    fontSize: 11,
    color: PRIVE_COLORS.text.tertiary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountPositive: {
    color: PRIVE_COLORS.status.success,
  },
  amountNegative: {
    color: PRIVE_COLORS.status.error,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.lg,
    marginTop: PRIVE_SPACING.sm,
  },
  loadMoreText: {
    fontSize: 14,
    color: PRIVE_COLORS.gold.primary,
    fontWeight: '500',
  },
});
