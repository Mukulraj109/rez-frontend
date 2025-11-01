// Cashback Page
// View and manage cashback earnings

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import cashbackService, {
  CashbackSummary,
  UserCashback,
  CashbackCampaign,
} from '@/services/cashbackApi';
// import { generateSampleCashbackData } from '@/utils/cashbackSampleData';

type TabType = 'all' | 'pending' | 'credited' | 'expired';

export default function CashbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [summary, setSummary] = useState<CashbackSummary>({
    totalEarned: 0,
    pending: 0,
    credited: 0,
    expired: 0,
    cancelled: 0,
    pendingCount: 0,
    creditedCount: 0,
    expiredCount: 0,
    cancelledCount: 0,
  });
  const [cashbacks, setCashbacks] = useState<UserCashback[]>([]);
  const [pendingReady, setPendingReady] = useState<UserCashback[]>([]);
  const [campaigns, setCampaigns] = useState<CashbackCampaign[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab) {
      loadCashbackHistory();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, pendingRes, campaignsRes] = await Promise.all([
        cashbackService.getCashbackSummary(),
        cashbackService.getPendingCashback(),
        cashbackService.getActiveCampaigns(),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        console.warn('Failed to load cashback summary:', summaryRes.error);
        setError('Failed to load cashback summary');
      }

      if (pendingRes.success && pendingRes.data) {
        setPendingReady(pendingRes.data.cashbacks);
      } else {
        console.warn('Failed to load pending cashback:', pendingRes.error);
      }

      if (campaignsRes.success && campaignsRes.data) {
        setCampaigns(campaignsRes.data.campaigns);
      } else {
        console.warn('Failed to load campaigns:', campaignsRes.error);
      }

      await loadCashbackHistory();
    } catch (error) {
      console.error('Failed to load cashback data:', error);
      setError('Failed to load cashback data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCashbackHistory = async () => {
    try {
      const filters = activeTab !== 'all' ? { status: activeTab as any } : {};
      const response = await cashbackService.getCashbackHistory(filters);

      if (response.success && response.data) {
        setCashbacks(response.data.cashbacks);
      } else {
        console.warn('Failed to load cashback history:', response.error);
        setCashbacks([]);
      }
    } catch (error) {
      console.error('Failed to load cashback history:', error);
      setCashbacks([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRedeemCashback = async () => {
    if (pendingReady.length === 0) {
      Alert.alert('No Cashback', 'No cashback is ready for redemption yet.');
      return;
    }

    const totalAmount = pendingReady.reduce((sum, cb) => sum + cb.amount, 0);

    Alert.alert(
      'Redeem Cashback',
      `Redeem ₹${totalAmount} cashback to your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              const response = await cashbackService.redeemCashback();
              if (response.success) {
                Alert.alert(
                'Success',
                `₹${response.data?.totalAmount || totalAmount} cashback redeemed successfully!`
              );
              loadData();
              } else {
                Alert.alert('Error', response.error || 'Failed to redeem cashback');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to redeem cashback');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'order':
        return 'cart';
      case 'referral':
        return 'people';
      case 'promotion':
        return 'gift';
      case 'special_offer':
        return 'star';
      case 'bonus':
        return 'trophy';
      case 'signup':
        return 'person-add';
      default:
        return 'cash';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'credited':
        return '#10B981';
      case 'expired':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const renderSummaryCard = (
    title: string,
    amount: number,
    count: number,
    color: string,
    icon: string
  ) => {
    return (
      <View style={[styles.summaryCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <View style={styles.summaryHeader}>
          <View style={[styles.summaryIcon, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <ThemedText style={styles.summaryCount}>{count}</ThemedText>
        </View>
        <ThemedText style={styles.summaryTitle}>{title}</ThemedText>
        <ThemedText style={[styles.summaryAmount, { color }]}>
          ₹{amount.toFixed(2)}
        </ThemedText>
      </View>
    );
  };

  const renderCashbackCard = (cashback: UserCashback) => {
    const statusColor = getStatusColor(cashback.status);
    const sourceIcon = getSourceIcon(cashback.source);

    return (
      <View key={cashback._id} style={styles.cashbackCard}>
        <View style={styles.cashbackHeader}>
          <View style={[styles.sourceIcon, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={sourceIcon as any} size={24} color={statusColor} />
          </View>
          <View style={styles.cashbackInfo}>
            <ThemedText style={styles.cashbackDescription} numberOfLines={2}>
              {cashback.description || 'Cashback earned'}
            </ThemedText>
            <View style={styles.cashbackMeta}>
              <ThemedText style={styles.cashbackDate}>
                {formatDate(cashback.earnedDate)}
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <ThemedText style={[styles.statusText, { color: statusColor }]}>
                  {cashback.status.charAt(0).toUpperCase() + cashback.status.slice(1)}
                </ThemedText>
              </View>
            </View>
          </View>
          <ThemedText style={[styles.cashbackAmount, { color: statusColor }]}>
            ₹{cashback.amount || 0}
          </ThemedText>
        </View>

        {cashback.status === 'pending' && (
          <View style={styles.cashbackFooter}>
            <View style={styles.footerInfo}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <ThemedText style={styles.footerText}>
                Expires: {formatDate(cashback.expiryDate)}
              </ThemedText>
            </View>
            {cashback.cashbackRate && (
              <ThemedText style={styles.rateText}>{cashback.cashbackRate}%</ThemedText>
            )}
          </View>
        )}

        {cashback.status === 'credited' && cashback.creditedDate && (
          <View style={styles.cashbackFooter}>
            <View style={styles.footerInfo}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <ThemedText style={styles.footerText}>
                Credited: {formatDate(cashback.creditedDate)}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderCampaignCard = (campaign: CashbackCampaign) => {
    return (
      <View key={campaign.id} style={styles.campaignCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.campaignGradient}
        >
          <View style={styles.campaignHeader}>
            <ThemedText style={styles.campaignName}>{campaign.name}</ThemedText>
            <View style={styles.campaignRate}>
              <ThemedText style={styles.campaignRateText}>
                {campaign.cashbackRate}%
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.campaignDescription}>{campaign.description}</ThemedText>
          {campaign.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {campaign.categories.slice(0, 3).map((cat, idx) => (
                <View key={idx} style={styles.categoryTag}>
                  <ThemedText style={styles.categoryText}>{cat}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent={true} />

      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Cashback</ThemedText>
          <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.totalEarned}>
          <ThemedText style={styles.totalLabel}>Total Earned</ThemedText>
          <ThemedText style={styles.totalAmount}>₹{summary.totalEarned.toFixed(2)}</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Summary Cards */}
        <View style={styles.section}>
          <View style={styles.summaryGrid}>
            {renderSummaryCard('Pending', summary.pending, summary.pendingCount, '#F59E0B', 'hourglass-outline')}
            {renderSummaryCard('Credited', summary.credited, summary.creditedCount, '#10B981', 'checkmark-circle')}
          </View>
          <View style={styles.summaryGrid}>
            {renderSummaryCard('Expired', summary.expired, summary.expiredCount, '#EF4444', 'close-circle')}
            {renderSummaryCard('Cancelled', summary.cancelled, summary.cancelledCount, '#6B7280', 'ban')}
          </View>
        </View>

        {/* Redeem Button */}
        {pendingReady.length > 0 && (
          <TouchableOpacity style={styles.redeemSection} onPress={handleRedeemCashback}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.redeemGradient}
            >
              <View style={styles.redeemInfo}>
                <ThemedText style={styles.redeemLabel}>Ready to Redeem</ThemedText>
                <ThemedText style={styles.redeemAmount}>
                  ₹{pendingReady.reduce((sum, cb) => sum + cb.amount, 0).toFixed(2)}
                </ThemedText>
              </View>
              <View style={styles.redeemButton}>
                <Ionicons name="arrow-forward-circle" size={32} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Active Campaigns */}
        {campaigns.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Active Campaigns</ThemedText>
            {campaigns.map(renderCampaignCard)}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pending
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'credited' && styles.activeTab]}
            onPress={() => setActiveTab('credited')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'credited' && styles.activeTabText]}>
              Credited
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expired' && styles.activeTab]}
            onPress={() => setActiveTab('expired')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>
              Expired
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Cashback History */}
        <View style={styles.section}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <ThemedText style={styles.loadingText}>Loading cashback data...</ThemedText>
            </View>
          ) : cashbacks.length > 0 ? (
            cashbacks.map(renderCashbackCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
              <ThemedText style={styles.emptyText}>No cashback found</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                {activeTab === 'all' 
                  ? 'Start shopping to earn cashback!' 
                  : `No ${activeTab} cashback found`}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  refreshButton: {
    padding: 8,
  },
  totalEarned: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  redeemSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  redeemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  redeemInfo: {
    flex: 1,
  },
  redeemLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  redeemAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  redeemButton: {},
  campaignCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  campaignGradient: {
    padding: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  campaignRate: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  campaignRateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  campaignDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  cashbackCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cashbackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackDescription: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  cashbackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cashbackDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cashbackAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cashbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  rateText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});
