// My Earnings Page
// Shows user's total earnings from videos, projects, referrals, and cashback

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import walletService, { TransactionResponse } from '@/services/walletApi';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { HeaderBackButton } from '@/components/navigation';
import earningsCalculationService, { EarningsStats } from '@/services/earningsCalculationService';
import EarningsPieChart from '@/components/earnings/EarningsPieChart';
import EarningsStatsCard from '@/components/earnings/EarningsStatsCard';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

interface EarningsData extends EarningsStats {
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    status: 'completed' | 'pending';
  }[];
}

const MyEarningsPage = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { goBack } = useSafeNavigation();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleBackPress = useCallback(() => {
    goBack('/profile' as any);
  }, [goBack]);

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);

      if (authState.isLoading) {

        return;
      }

      if (!authState.isAuthenticated || !authState.token) {

        setEarnings(null);
        setLoading(false);
        return;
      }

      // Fetch wallet balance and transactions
      const [balanceResponse, transactionsResponse] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions({ limit: 100 }) // Fetch more for accurate calculations
      ]);

      const balance = balanceResponse.data;
      const transactions = transactionsResponse.data?.transactions || [];

      // Extract available balance
      const availableBalance = typeof balance?.balance === 'object'
        ? (balance.balance as any).available || (balance.balance as any).total || 0
        : balance?.balance || 0;

      // Use earnings calculation service for accurate breakdown
      const stats = earningsCalculationService.calculateStats(
        transactions,
        availableBalance
      );
      const earningsData: EarningsData = {
        ...stats,
        // Override total earnings with backend's totalEarned if available
        totalEarnings: balance?.statistics?.totalEarned || stats.totalEarnings,
        recentTransactions: transactions
          .filter(t => t.type === 'credit')
          .slice(0, 10)
          .map(t => ({
            id: t.id || t.transactionId,
            type: t.source?.type || t.category,
            amount: t.amount,
            description: t.description,
            date: t.createdAt,
            status: t.status?.current === 'completed' ? 'completed' : 'pending'
          }))
      };

      setEarnings(earningsData);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.token]);

  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated) {
      fetchEarnings();
    }
  }, [fetchEarnings, authState.isLoading, authState.isAuthenticated]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarnings();
  }, [fetchEarnings]);

  const handleWithdraw = () => {
    router.push('/WalletScreen' as any);
  };

  const handleExportReport = async () => {
    if (!earnings) return;

    try {
      // Generate CSV report
      const csvHeader = 'Date,Type,Description,Amount,Status\n';
      const csvRows = earnings.recentTransactions
        .map(
          (t) =>
            `${new Date(t.date).toLocaleDateString()},${t.type},"${t.description}",${t.amount},${t.status}`
        )
        .join('\n');

      const csvContent = csvHeader + csvRows;

      // Generate report text
      const reportText = `
📊 EARNINGS REPORT
Generated: ${new Date().toLocaleString()}

💰 SUMMARY
Total Lifetime Earnings: ₹${earnings.totalEarnings.toFixed(2)}
Available Balance: ₹${earnings.availableBalance.toFixed(2)}
Pending Earnings: ₹${earnings.pendingEarnings.toFixed(2)}

📈 BREAKDOWN
Videos: ₹${earnings.breakdown.videos.toFixed(2)} (${earningsCalculationService.calculatePercentage(earnings.breakdown.videos, earnings.breakdown.total)}%)
Projects: ₹${earnings.breakdown.projects.toFixed(2)} (${earningsCalculationService.calculatePercentage(earnings.breakdown.projects, earnings.breakdown.total)}%)
Referrals: ₹${earnings.breakdown.referrals.toFixed(2)} (${earningsCalculationService.calculatePercentage(earnings.breakdown.referrals, earnings.breakdown.total)}%)
Cashback: ₹${earnings.breakdown.cashback.toFixed(2)} (${earningsCalculationService.calculatePercentage(earnings.breakdown.cashback, earnings.breakdown.total)}%)
Social Media: ₹${earnings.breakdown.socialMedia.toFixed(2)} (${earningsCalculationService.calculatePercentage(earnings.breakdown.socialMedia, earnings.breakdown.total)}%)
Bonus: ₹${earnings.breakdown.bonus.toFixed(2)} (${earningsCalculationService.calculatePercentage(earnings.breakdown.bonus, earnings.breakdown.total)}%)

📊 STATISTICS
Daily Average: ₹${earnings.dailyAverage.toFixed(2)}
Weekly Average: ₹${earnings.weeklyAverage.toFixed(2)}
Monthly Average: ₹${earnings.monthlyAverage.toFixed(2)}
Total Transactions: ${earnings.transactionCount}

📋 RECENT TRANSACTIONS
${earnings.recentTransactions.map((t, i) => `${i + 1}. ${new Date(t.date).toLocaleDateString()} - ${t.description} - ₹${t.amount} [${t.status}]`).join('\n')}
      `.trim();

      // Check if file sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Save CSV file using new expo-file-system API
        const file = new File(Paths.document, `earnings_report_${Date.now()}.csv`);
        await file.text().then(() => {}).catch(() => {}); // Ensure file exists
        const writer = file.writableStream();
        const encoder = new TextEncoder();
        const writerObj = writer.getWriter();
        await writerObj.write(encoder.encode(csvContent));
        await writerObj.close();

        // Share the file
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Earnings Report',
        });

        Alert.alert('Success', 'Earnings report exported successfully!');
      } else {
        // Fallback to text sharing
        await Share.share({
          message: reportText,
          title: 'My Earnings Report',
        });
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'Failed to export earnings report. Please try again.');
    }
  };

  const getEarningIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'videocam';
      case 'project':
        return 'briefcase';
      case 'referral':
        return 'people';
      case 'cashback':
        return 'cash';
      default:
        return 'wallet';
    }
  };

  const getEarningColor = (type: string) => {
    switch (type) {
      case 'video':
        return '#EC4899';
      case 'project':
        return '#8B5CF6';
      case 'referral':
        return '#10B981';
      case 'cashback':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#EC4899" />
        <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.header}>
          <View style={styles.headerContent}>
            <HeaderBackButton
              onPress={handleBackPress}
              iconColor="#FFFFFF"
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>My Earnings</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </View>
    );
  }

  if (!earnings) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EC4899" />

      {/* Header */}
      <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.header}>
        <View style={styles.headerContent}>
          <HeaderBackButton
            onPress={handleBackPress}
            iconColor="#FFFFFF"
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>My Earnings</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleExportReport}
            >
              <Ionicons name="download-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/transactions' as any)}
            >
              <Ionicons name="time-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Total Earnings Card */}
        <LinearGradient
          colors={['#EC4899', '#DB2777']}
          style={styles.totalCard}
        >
          <Text style={styles.totalLabel}>Total Lifetime Earnings</Text>
          <Text style={styles.totalAmount}>₹{earnings.totalEarnings}</Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Ionicons name="wallet-outline" size={20} color="rgba(255,255,255,0.8)" />
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Available</Text>
                <Text style={styles.balanceValue}>₹{earnings.availableBalance}</Text>
              </View>
            </View>

            <View style={styles.balanceItem}>
              <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Pending</Text>
                <Text style={styles.balanceValue}>₹{earnings.pendingEarnings}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Ionicons name="arrow-down-circle-outline" size={20} color="#EC4899" />
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
            <Text style={styles.breakdownTotal}>
              Total: {earningsCalculationService.formatCurrency(earnings.breakdown.total)}
            </Text>
          </View>

          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownCard}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#EC489920' }]}>
                <Ionicons name="videocam" size={24} color="#EC4899" />
              </View>
              <Text style={styles.breakdownLabel}>Videos</Text>
              <Text style={styles.breakdownValue}>
                {earningsCalculationService.formatCurrency(earnings.breakdown.videos)}
              </Text>
              <Text style={styles.breakdownPercentage}>
                {earningsCalculationService.calculatePercentage(
                  earnings.breakdown.videos,
                  earnings.breakdown.total
                )}%
              </Text>
            </View>

            <View style={styles.breakdownCard}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="briefcase" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.breakdownLabel}>Projects</Text>
              <Text style={styles.breakdownValue}>
                {earningsCalculationService.formatCurrency(earnings.breakdown.projects)}
              </Text>
              <Text style={styles.breakdownPercentage}>
                {earningsCalculationService.calculatePercentage(
                  earnings.breakdown.projects,
                  earnings.breakdown.total
                )}%
              </Text>
            </View>

            <View style={styles.breakdownCard}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="people" size={24} color="#10B981" />
              </View>
              <Text style={styles.breakdownLabel}>Referrals</Text>
              <Text style={styles.breakdownValue}>
                {earningsCalculationService.formatCurrency(earnings.breakdown.referrals)}
              </Text>
              <Text style={styles.breakdownPercentage}>
                {earningsCalculationService.calculatePercentage(
                  earnings.breakdown.referrals,
                  earnings.breakdown.total
                )}%
              </Text>
            </View>

            <View style={styles.breakdownCard}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="cash" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.breakdownLabel}>Cashback</Text>
              <Text style={styles.breakdownValue}>
                {earningsCalculationService.formatCurrency(earnings.breakdown.cashback)}
              </Text>
              <Text style={styles.breakdownPercentage}>
                {earningsCalculationService.calculatePercentage(
                  earnings.breakdown.cashback,
                  earnings.breakdown.total
                )}%
              </Text>
            </View>

            <View style={styles.breakdownCard}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="logo-instagram" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.breakdownLabel}>Social Media</Text>
              <Text style={styles.breakdownValue}>
                {earningsCalculationService.formatCurrency(earnings.breakdown.socialMedia)}
              </Text>
              <Text style={styles.breakdownPercentage}>
                {earningsCalculationService.calculatePercentage(
                  earnings.breakdown.socialMedia,
                  earnings.breakdown.total
                )}%
              </Text>
            </View>

            <View style={styles.breakdownCard}>
              <View style={[styles.breakdownIcon, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="gift" size={24} color="#EF4444" />
              </View>
              <Text style={styles.breakdownLabel}>Bonus</Text>
              <Text style={styles.breakdownValue}>
                {earningsCalculationService.formatCurrency(earnings.breakdown.bonus)}
              </Text>
              <Text style={styles.breakdownPercentage}>
                {earningsCalculationService.calculatePercentage(
                  earnings.breakdown.bonus,
                  earnings.breakdown.total
                )}%
              </Text>
            </View>
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.section}>
          <EarningsStatsCard stats={earnings} />
        </View>

        {/* Pie Chart Visualization */}
        <View style={styles.section}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Earnings Distribution</Text>
            <EarningsPieChart breakdown={earnings.breakdown} size={220} />
          </View>
        </View>

        {/* Recent Earnings Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Earnings</Text>
            <TouchableOpacity onPress={() => router.push('/transactions' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {earnings.recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View
                style={[
                  styles.transactionIcon,
                  { backgroundColor: `${getEarningColor(transaction.type)}20` },
                ]}
              >
                <Ionicons
                  name={getEarningIcon(transaction.type) as any}
                  size={20}
                  color={getEarningColor(transaction.type)}
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>+₹{transaction.amount}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        transaction.status === 'completed' ? '#10B98120' : '#F59E0B20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          transaction.status === 'completed' ? '#10B981' : '#F59E0B',
                      },
                    ]}
                  >
                    {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  totalCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EC4899',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  breakdownPercentage: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  breakdownTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EC4899',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default MyEarningsPage;
