/**
 * Prive Earnings Page
 * Shows earnings history and breakdown with real data
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
import priveApi, { EarningItem, EarningsSummary } from '@/services/priveApi';

const EARNING_ICONS: Record<string, string> = {
  campaign: '📢',
  purchase: '🛍️',
  referral: '👥',
  content: '✍️',
  check_in: '✅',
  review: '⭐',
  bonus: '🎁',
  cashback: '💰',
};

export default function EarningsScreen() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<EarningItem[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({ thisWeek: 0, thisMonth: 0, allTime: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchEarnings = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setIsLoading(true);
      }
      setError(null);

      const response = await priveApi.getEarnings({ page: pageNum, limit: 20 });

      if (response.success && response.data) {
        const { earnings: newEarnings, summary: newSummary, pagination } = response.data;

        if (pageNum === 1) {
          setEarnings(newEarnings);
        } else {
          setEarnings(prev => [...prev, ...newEarnings]);
        }

        setSummary(newSummary);
        setHasMore(pagination.page < pagination.pages);
        setPage(pageNum);
      } else {
        setError('Failed to load earnings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings(1);
  }, [fetchEarnings]);

  const handleRefresh = () => {
    fetchEarnings(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchEarnings(page + 1);
    }
  };

  const formatAmount = (amount: number): string => {
    return amount > 0 ? `+${amount.toLocaleString()}` : amount.toLocaleString();
  };

  const getEarningIcon = (type: string): string => {
    return EARNING_ICONS[type] || '💎';
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
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIVE_COLORS.gold.primary} />
            <Text style={styles.loadingText}>Loading earnings...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchEarnings(1)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
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
              if (isNearEnd && hasMore && !isLoading) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>This Week</Text>
                <Text style={styles.summaryValue}>{formatAmount(summary.thisWeek)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>This Month</Text>
                <Text style={styles.summaryValue}>{formatAmount(summary.thisMonth)}</Text>
              </View>
            </View>

            {/* All-time earnings */}
            <View style={styles.allTimeCard}>
              <Text style={styles.allTimeLabel}>All-Time Earnings</Text>
              <Text style={styles.allTimeValue}>{summary.allTime.toLocaleString()} coins</Text>
            </View>

            {/* Earnings List */}
            <View style={styles.listCard}>
              <Text style={styles.sectionTitle}>Recent Earnings</Text>
              {earnings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📊</Text>
                  <Text style={styles.emptyText}>No earnings yet</Text>
                  <Text style={styles.emptySubtext}>
                    Start earning coins through purchases, referrals, and campaigns!
                  </Text>
                </View>
              ) : (
                earnings.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.earningRow,
                      index === earnings.length - 1 && styles.earningRowLast
                    ]}
                  >
                    <View style={styles.earningIcon}>
                      <Text style={styles.earningEmoji}>{getEarningIcon(item.type)}</Text>
                    </View>
                    <View style={styles.earningInfo}>
                      <Text style={styles.earningTitle}>{item.description}</Text>
                      <Text style={styles.earningDate}>{getRelativeDate(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.earningAmount}>{formatAmount(item.amount)}</Text>
                  </View>
                ))
              )}

              {hasMore && earnings.length > 0 && (
                <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                  <Text style={styles.loadMoreText}>Load More</Text>
                </TouchableOpacity>
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
  headerSpacer: {
    width: 40,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PRIVE_SPACING.xl,
  },
  errorText: {
    fontSize: 14,
    color: PRIVE_COLORS.status.error,
    textAlign: 'center',
    marginBottom: PRIVE_SPACING.lg,
  },
  retryButton: {
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingVertical: PRIVE_SPACING.md,
    backgroundColor: PRIVE_COLORS.gold.primary,
    borderRadius: PRIVE_RADIUS.lg,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.background.primary,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    marginBottom: PRIVE_SPACING.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.sm,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '300',
    color: PRIVE_COLORS.gold.primary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: PRIVE_COLORS.transparent.white10,
  },
  allTimeCard: {
    backgroundColor: PRIVE_COLORS.transparent.gold10,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    alignItems: 'center',
    marginBottom: PRIVE_SPACING.xl,
  },
  allTimeLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginBottom: PRIVE_SPACING.xs,
  },
  allTimeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIVE_COLORS.gold.primary,
  },
  listCard: {
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: PRIVE_COLORS.transparent.white08,
  },
  earningRowLast: {
    borderBottomWidth: 0,
  },
  earningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIVE_COLORS.transparent.white10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PRIVE_SPACING.md,
  },
  earningEmoji: {
    fontSize: 18,
  },
  earningInfo: {
    flex: 1,
  },
  earningTitle: {
    fontSize: 14,
    color: PRIVE_COLORS.text.primary,
  },
  earningDate: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.status.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: PRIVE_SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.sm,
  },
  emptySubtext: {
    fontSize: 13,
    color: PRIVE_COLORS.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: PRIVE_SPACING.lg,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: PRIVE_SPACING.lg,
    marginTop: PRIVE_SPACING.md,
  },
  loadMoreText: {
    fontSize: 14,
    color: PRIVE_COLORS.gold.primary,
    fontWeight: '500',
  },
});
