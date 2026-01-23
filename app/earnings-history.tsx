import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { EARN_COLORS } from '@/constants/EarnPageColors';
import { showAlert, alertOk } from '@/utils/alert';

interface EarningsTransaction {
  _id: string;
  type: 'project' | 'referral' | 'social_media' | 'spin' | 'withdrawal';
  source: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  metadata?: {
    projectId?: string;
    projectTitle?: string;
    referralId?: string;
    postId?: string;
    spinId?: string;
  };
  createdAt: string;
  completedAt?: string;
}

interface EarningsHistoryResponse {
  transactions: EarningsTransaction[];
  summary: {
    totalEarned: number;
    totalWithdrawn: number;
    pendingAmount: number;
    breakdown: {
      projects: number;
      referrals: number;
      socialMedia: number;
      spin: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EarningsHistoryPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [summary, setSummary] = useState<EarningsHistoryResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'project' | 'referral' | 'social_media' | 'spin' | 'withdrawal'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [exporting, setExporting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  const filters = [
    { label: 'All', value: 'all', icon: 'list', gradient: ['#8B5CF6', '#7C3AED'] },
    { label: 'Projects', value: 'project', icon: 'briefcase', gradient: ['#8B5CF6', '#7C3AED'] },
    { label: 'Referrals', value: 'referral', icon: 'people', gradient: ['#10B981', '#059669'] },
    { label: 'Social', value: 'social_media', icon: 'share-social', gradient: ['#F59E0B', '#D97706'] },
    { label: 'Spin', value: 'spin', icon: 'trophy', gradient: ['#EC4899', '#DB2777'] },
    { label: 'Withdrawals', value: 'withdrawal', icon: 'cash', gradient: ['#EF4444', '#DC2626'] },
  ];

  const loadEarningsHistory = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }

      const params: any = {
        page: pageNum,
        limit: 20,
      };

      if (selectedFilter !== 'all') {
        params.type = selectedFilter;
      }

      if (startDate) {
        params.startDate = startDate.toISOString();
      }

      if (endDate) {
        params.endDate = endDate.toISOString();
      }

      // For now, we'll use a mock endpoint structure
      // In the future, this should be /api/earnings/history
      const response = await apiClient.get<EarningsHistoryResponse>('/earnings/history', params);

      if (response.success && response.data) {
        const newTransactions = response.data.transactions || [];
        
        if (reset) {
          setTransactions(newTransactions);
          // Animate cards in
          newTransactions.forEach((transaction, index) => {
            if (!cardAnims[transaction._id]) {
              cardAnims[transaction._id] = new Animated.Value(0);
            }
            Animated.timing(cardAnims[transaction._id], {
              toValue: 1,
              duration: 400,
              delay: index * 50,
              useNativeDriver: true,
            }).start();
          });
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }

        if (response.data.summary) {
          setSummary(response.data.summary);
        }

        setHasMore(response.data.pagination?.hasNext || false);
        setPage(pageNum);

        // Animate in
        if (reset) {
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          ]).start();
        }
      } else {
        throw new Error('Failed to load earnings history');
      }
    } catch (err) {
      console.error('❌ [EARNINGS HISTORY] Error loading transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load earnings history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter, startDate, endDate, fadeAnim, slideAnim, cardAnims]);

  useEffect(() => {
    loadEarningsHistory(1, true);
  }, [selectedFilter, startDate, endDate]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEarningsHistory(1, true);
  }, [loadEarningsHistory]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadEarningsHistory(page + 1, false);
    }
  }, [loading, hasMore, page, loadEarningsHistory]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return 'briefcase';
      case 'referral':
        return 'people';
      case 'social_media':
        return 'share-social';
      case 'spin':
        return 'trophy';
      case 'withdrawal':
        return 'cash';
      default:
        return 'wallet';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return ['#8B5CF6', '#7C3AED'];
      case 'referral':
        return ['#10B981', '#059669'];
      case 'social_media':
        return ['#F59E0B', '#D97706'];
      case 'spin':
        return ['#EC4899', '#DB2777'];
      case 'withdrawal':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    }
  };

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Create CSV content
      let csvContent = 'Date,Type,Source,Amount,Status,Description\n';
      
      transactions.forEach((transaction) => {
        const date = new Date(transaction.createdAt).toLocaleDateString('en-US');
        const type = transaction.type;
        const source = transaction.source;
        const amount = transaction.amount;
        const status = transaction.status;
        const description = transaction.description.replace(/,/g, ';'); // Replace commas in description
        
        csvContent += `${date},${type},${source},${amount},${status},${description}\n`;
      });

      // Add summary
      if (summary) {
        csvContent += '\n';
        csvContent += 'Summary\n';
        csvContent += `Total Earned,${summary.totalEarned}\n`;
        csvContent += `Total Withdrawn,${summary.totalWithdrawn}\n`;
        csvContent += `Pending Amount,${summary.pendingAmount}\n`;
        csvContent += '\n';
        csvContent += 'Breakdown\n';
        csvContent += `Projects,${summary.breakdown.projects}\n`;
        csvContent += `Referrals,${summary.breakdown.referrals}\n`;
        csvContent += `Social Media,${summary.breakdown.socialMedia}\n`;
        csvContent += `Spin,${summary.breakdown.spin}\n`;
      }

      // Share the CSV content
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `earnings-history-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        alertOk('Success', 'Earnings history exported successfully');
      } else {
        // For native, use Share API
        await Share.share({
          message: csvContent,
          title: 'Earnings History',
        });
      }
    } catch (error) {
      console.error('Error exporting earnings:', error);
      showAlert('Error', 'Failed to export earnings history');
    } finally {
      setExporting(false);
    }
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    loadEarningsHistory(1, true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <ThemedText style={styles.headerTitle}>Earnings History</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {summary ? `Total: ₹${summary.totalEarned}` : 'Your earning transactions'}
            </ThemedText>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            activeOpacity={0.7}
            disabled={exporting || transactions.length === 0}
            accessibilityLabel={exporting ? "Exporting earnings report" : "Export earnings report"}
            accessibilityRole="button"
            accessibilityState={{ disabled: exporting || transactions.length === 0, busy: exporting }}
            accessibilityHint="Double tap to download earnings history as CSV"
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.exportButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Summary Card */}
      {summary && (
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
          accessibilityLabel={`Earnings summary. Total earned: ₹${summary.totalEarned}. Withdrawn: ₹${summary.totalWithdrawn}. Pending: ₹${summary.pendingAmount}`}
          accessibilityRole="summary"
        >
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            style={styles.summaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Total Earned</ThemedText>
                <ThemedText style={styles.summaryValue}>₹{summary.totalEarned}</ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Withdrawn</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#EF4444' }]}>
                  ₹{summary.totalWithdrawn}
                </ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryLabel}>Pending</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#F59E0B' }]}>
                  ₹{summary.pendingAmount}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Date Range Filter */}
      <Animated.View
        style={[
          styles.dateFilterContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.dateFilterRow}>
          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => {
              const today = new Date();
              const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              setStartDate(lastWeek);
              setEndDate(today);
              loadEarningsHistory(1, true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.dateFilterText}>Last 7 days</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => {
              const today = new Date();
              const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              setStartDate(lastMonth);
              setEndDate(today);
              loadEarningsHistory(1, true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <ThemedText style={styles.dateFilterText}>Last 30 days</ThemedText>
          </TouchableOpacity>

          {(startDate || endDate) && (
            <TouchableOpacity
              style={styles.dateFilterButton}
              onPress={handleClearDateFilter}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <ThemedText style={[styles.dateFilterText, { color: '#EF4444' }]}>
                Clear
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {(startDate || endDate) && (
          <View style={styles.dateRangeDisplay}>
            <ThemedText style={styles.dateRangeText}>
              {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
            </ThemedText>
          </View>
        )}
      </Animated.View>

      {/* Filters */}
      <Animated.View
        style={[
          styles.filtersContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.value as any)}
              activeOpacity={0.7}
              accessibilityLabel={`Filter by ${filter.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedFilter === filter.value }}
              accessibilityHint={`Double tap to show ${filter.label.toLowerCase()} transactions`}
            >
              {selectedFilter === filter.value ? (
                <LinearGradient
                  colors={filter.gradient}
                  style={styles.filterGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={filter.icon as any} size={16} color="#FFFFFF" />
                  <ThemedText style={styles.filterTextActive}>{filter.label}</ThemedText>
                </LinearGradient>
              ) : (
                <>
                  <Ionicons name={filter.icon as any} size={16} color="#6B7280" />
                  <ThemedText style={styles.filterText}>{filter.label}</ThemedText>
                </>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Transactions List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (isCloseToBottom && hasMore && !loading) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && transactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={EARN_COLORS.primary} />
            <ThemedText style={styles.loadingText}>Loading earnings history...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <ThemedText style={styles.errorTitle}>Error</ThemedText>
            <ThemedText style={styles.errorMessage}>{error}</ThemedText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadEarningsHistory(1, true)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.retryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.retryText}>Retry</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.emptyIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="wallet-outline" size={48} color="#FFFFFF" />
            </LinearGradient>
            <ThemedText style={styles.emptyTitle}>No transactions yet</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Start earning to see your transaction history here
            </ThemedText>
          </View>
        ) : (
          transactions.map((transaction, index) => {
            const cardAnim = cardAnims[transaction._id] || new Animated.Value(1);
            return (
              <Animated.View
                key={transaction._id}
                style={[
                  styles.transactionCard,
                  {
                    opacity: cardAnim,
                    transform: [
                      {
                        translateY: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
                accessibilityLabel={`${transaction.type}. ${transaction.description}. Amount: ${transaction.type === 'withdrawal' ? '-' : '+'}₹${transaction.amount}. Date: ${formatDate(transaction.createdAt)}. Status: ${transaction.status}`}
                accessibilityRole="text"
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F9FAFB']}
                  style={styles.transactionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionLeft}>
                      <LinearGradient
                        colors={getTypeColor(transaction.type)}
                        style={styles.typeIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons
                          name={getTypeIcon(transaction.type) as any}
                          size={20}
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                      <View style={styles.transactionInfo}>
                        <ThemedText style={styles.transactionSource}>
                          {transaction.source}
                        </ThemedText>
                        <ThemedText style={styles.transactionDescription} numberOfLines={1}>
                          {transaction.description}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <ThemedText
                        style={[
                          styles.transactionAmount,
                          transaction.type === 'withdrawal' && styles.transactionAmountNegative,
                        ]}
                      >
                        {transaction.type === 'withdrawal' ? '-' : '+'}₹{transaction.amount}
                      </ThemedText>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(transaction.status) + '20' },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.statusText,
                            { color: getStatusColor(transaction.status) },
                          ]}
                        >
                          {transaction.status}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.transactionFooter}>
                    <ThemedText style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </ThemedText>
                    {transaction.metadata?.projectTitle && (
                      <ThemedText style={styles.transactionMeta} numberOfLines={1}>
                        {transaction.metadata.projectTitle}
                      </ThemedText>
                    )}
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })
        )}

        {loading && transactions.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={EARN_COLORS.primary} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  exportButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateFilterContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateFilterText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateRangeDisplay: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 4,
  },
  dateRangeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: -0.3,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    borderWidth: 0,
  },
  filterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterTextActive: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  transactionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionGradient: {
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionSource: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -0.3,
  },
  transactionAmountNegative: {
    color: '#EF4444',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  transactionMeta: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

