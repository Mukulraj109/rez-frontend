// Billing History Page
// View subscription payment history and download invoices

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import subscriptionAPI, { BillingTransaction } from '@/services/subscriptionApi';
import BillingHistoryList from '@/components/subscription/BillingHistoryList';

export default function BillingHistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    hasMore: false,
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      // Load history and summary in parallel
      const [historyData, summaryData] = await Promise.all([
        subscriptionAPI.getBillingHistory({ skip: 0, limit: 20 }),
        subscriptionAPI.getBillingSummary(),
      ]);

      setTransactions(historyData.history);
      setPagination(historyData.pagination);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Error loading billing data:', error);
      Alert.alert('Error', error.message || 'Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBillingData();
    setRefreshing(false);
  }, []);

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      Alert.alert(
        'Download Invoice',
        'Invoice download functionality will be available soon. For now, you can view invoice details.',
        [{ text: 'OK' }]
      );

      // In production, this would download the PDF
      // const blob = await subscriptionAPI.downloadInvoice(invoiceId);
      // ... handle file download
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Failed to download invoice');
    }
  };

  const handleViewInvoice = async (transactionId: string) => {
    try {
      const invoice = await subscriptionAPI.getInvoice(transactionId);

      Alert.alert(
        'Invoice Details',
        `Invoice #${invoice.invoiceNumber}\n\n` +
        `Date: ${new Date(invoice.date).toLocaleDateString()}\n` +
        `Amount: ₹${invoice.total}\n` +
        `Status: ${invoice.status}\n` +
        `Payment Method: ${invoice.paymentMethod}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error viewing invoice:', error);
      Alert.alert('Error', 'Failed to load invoice details');
    }
  };

  const loadMore = async () => {
    if (!pagination.hasMore || loading) return;

    try {
      const historyData = await subscriptionAPI.getBillingHistory({
        skip: pagination.skip + pagination.limit,
        limit: pagination.limit,
      });

      setTransactions([...transactions, ...historyData.history]);
      setPagination(historyData.pagination);
    } catch (error: any) {
      console.error('Error loading more transactions:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Billing History</ThemedText>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        {summary && !loading && (
          <View style={styles.summarySection}>
            <View style={styles.summaryGrid}>
              <View
                style={styles.summaryCard}
                accessible={true}
                accessibilityLabel={`Total spent: ${summary.totalSpent} rupees`}
                accessibilityRole="text"
              >
                <Ionicons name="wallet-outline" size={24} color="#8B5CF6" />
                <ThemedText style={styles.summaryValue}>₹{summary.totalSpent}</ThemedText>
                <ThemedText style={styles.summaryLabel}>Total Spent</ThemedText>
              </View>

              <View
                style={styles.summaryCard}
                accessible={true}
                accessibilityLabel={`Total transactions: ${summary.totalTransactions}`}
                accessibilityRole="text"
              >
                <Ionicons name="receipt-outline" size={24} color="#10B981" />
                <ThemedText style={styles.summaryValue}>{summary.totalTransactions}</ThemedText>
                <ThemedText style={styles.summaryLabel}>Transactions</ThemedText>
              </View>

              <View
                style={styles.summaryCard}
                accessible={true}
                accessibilityLabel={`Total savings: ${summary.totalSavings} rupees`}
                accessibilityRole="text"
              >
                <Ionicons name="trending-up-outline" size={24} color="#F59E0B" />
                <ThemedText style={styles.summaryValue}>₹{summary.totalSavings}</ThemedText>
                <ThemedText style={styles.summaryLabel}>Total Savings</ThemedText>
              </View>

              <View
                style={styles.summaryCard}
                accessible={true}
                accessibilityLabel={`Net savings: ${summary.netSavings} rupees`}
                accessibilityRole="text"
              >
                <Ionicons name="analytics-outline" size={24} color="#3B82F6" />
                <ThemedText style={[
                  styles.summaryValue,
                  { color: summary.netSavings >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  ₹{summary.netSavings}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>Net Savings</ThemedText>
              </View>
            </View>

            {summary.memberSince && (
              <View style={styles.membershipInfo}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <ThemedText style={styles.membershipText}>
                  Member since {new Date(summary.memberSince).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Transaction History */}
        <View style={styles.historySection}>
          <ThemedText style={styles.sectionTitle}>Transaction History</ThemedText>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <ThemedText style={styles.loadingText}>Loading billing history...</ThemedText>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
              <ThemedText style={styles.emptyTitle}>No Transactions Yet</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Your billing history will appear here once you make a subscription payment.
              </ThemedText>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/subscription/plans')}
                accessibilityLabel="View subscription plans"
                accessibilityRole="button"
                accessibilityHint="Double tap to explore available subscription plans"
              >
                <ThemedText style={styles.emptyButtonText}>View Plans</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <BillingHistoryList
                transactions={transactions}
                onDownloadInvoice={handleDownloadInvoice}
                onViewInvoice={handleViewInvoice}
                loading={false}
              />

              {/* Load More */}
              {pagination.hasMore && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMore}
                  accessibilityLabel="Load more transactions"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to load additional billing transactions"
                >
                  <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
                  <Ionicons name="chevron-down" size={16} color="#8B5CF6" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <View style={styles.helpCard}>
            <Ionicons name="information-circle-outline" size={24} color="#8B5CF6" />
            <View style={styles.helpContent}>
              <ThemedText style={styles.helpTitle}>Need Help?</ThemedText>
              <ThemedText style={styles.helpText}>
                Contact our support team for billing inquiries or invoice questions.
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => router.push('/support/chat')}
            accessibilityLabel="Contact support"
            accessibilityRole="button"
            accessibilityHint="Double tap to chat with customer support about billing inquiries"
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.supportButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  summarySection: {
    padding: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  membershipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  helpSection: {
    padding: 20,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helpContent: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
