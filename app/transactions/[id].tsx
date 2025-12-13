import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Share,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import walletApi, { TransactionResponse } from '@/services/walletApi';
import storePaymentApi from '@/services/storePaymentApi';

// Store Payment type for store payments
interface StorePaymentDetail {
  id: string;
  paymentId: string;
  storeId: string;
  storeName: string;
  storeLogo?: string;
  billAmount: number;
  discountAmount: number;
  coinRedemption: {
    rezCoins: number;
    promoCoins: number;
    payBill: number;
    totalAmount: number;
  };
  coinsUsed: number;
  remainingAmount: number;
  paymentMethod: string;
  offersApplied: string[];
  status: string;
  rewards?: {
    cashbackEarned: number;
    coinsEarned: number;
    bonusCoins: number;
  };
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

const TransactionDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [storePayment, setStorePayment] = useState<StorePaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the ID is a store payment ID (starts with "SP-")
  const isStorePayment = id?.startsWith('SP-');

  useEffect(() => {
    if (id) {
      fetchTransactionDetail();
    }
  }, [id]);

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isStorePayment) {
        // Fetch store payment details
        const paymentData = await storePaymentApi.getPaymentDetails(id);
        setStorePayment(paymentData);
      } else {
        // Fetch wallet transaction
        const response = await walletApi.getTransactionById(id);
        if (response.success && response.data) {
          setTransaction(response.data.transaction);
        } else {
          setError(response.error || 'Transaction not found');
        }
      }
    } catch (err) {
      console.error('📜 [Transaction Detail] Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      let message = '';

      if (storePayment) {
        message = `
REZ Store Payment Receipt

Store: ${storePayment.storeName}
Payment ID: ${storePayment.paymentId}
Amount: ₹${storePayment.billAmount}
Coins Used: ₹${storePayment.coinsUsed}
Paid via: ₹${storePayment.remainingAmount}
Status: ${storePayment.status}
Date: ${new Date(storePayment.createdAt).toLocaleString()}
${storePayment.rewards ? `\nRewards Earned:\n- Cashback: ₹${storePayment.rewards.cashbackEarned}\n- Coins: ${storePayment.rewards.coinsEarned}` : ''}
        `.trim();
      } else if (transaction) {
        message = `
REZ Wallet Transaction

Transaction ID: ${transaction.transactionId}
Type: ${transaction.type.toUpperCase()}
Amount: ${transaction.amount} ${transaction.currency}
Status: ${transaction.status.current}
Date: ${new Date(transaction.createdAt).toLocaleString()}
Description: ${transaction.description}

Balance Before: ${transaction.balanceBefore} ${transaction.currency}
Balance After: ${transaction.balanceAfter} ${transaction.currency}
        `.trim();
      } else {
        return;
      }

      await Share.share({ message });
    } catch (err) {
      console.error('📜 [Transaction Detail] Share error:', err);
      Alert.alert('Error', 'Unable to share transaction details');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const getTypeColor = (type: string) => {
    return type === 'credit' ? '#10B981' : '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
        <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </View>
    );
  }

  if (error || (!transaction && !storePayment)) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
        <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Transaction</Text>
          <Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTransactionDetail}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render store payment details
  if (storePayment) {
    const spStatusColor = getStatusColor(storePayment.status.toLowerCase());

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

        {/* Header */}
        <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Receipt</Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Store Payment Amount Card */}
          <View style={styles.amountCard}>
            <View style={[styles.typeIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="storefront" size={32} color="#10B981" />
            </View>
            <Text style={[styles.amountText, { color: '#FFFFFF' }]}>
              ₹{storePayment.billAmount}
            </Text>
            <Text style={styles.storeNameText}>{storePayment.storeName}</Text>
            <View style={[styles.statusBadgeLarge, { backgroundColor: `${spStatusColor}20` }]}>
              <Text style={[styles.statusTextLarge, { color: spStatusColor }]}>
                {storePayment.status}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Payment Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Breakdown</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Bill Amount" value={`₹${storePayment.billAmount}`} />
              {storePayment.discountAmount > 0 && (
                <InfoRow label="Discount" value={`-₹${storePayment.discountAmount}`} />
              )}
              {storePayment.coinsUsed > 0 && (
                <InfoRow label="Coins Used" value={`-₹${storePayment.coinsUsed}`} />
              )}
              <InfoRow label="Paid via Gateway" value={`₹${storePayment.remainingAmount}`} />
            </View>
          </View>

          {/* Transaction Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Information</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Payment ID" value={storePayment.paymentId} />
              {storePayment.transactionId && (
                <InfoRow label="Transaction ID" value={storePayment.transactionId.slice(-12)} />
              )}
              <InfoRow label="Payment Method" value={storePayment.paymentMethod.toUpperCase()} />
              <InfoRow label="Date" value={formatDate(storePayment.createdAt)} />
              {storePayment.completedAt && (
                <InfoRow label="Completed At" value={formatDate(storePayment.completedAt)} />
              )}
            </View>
          </View>

          {/* Coin Redemption Details */}
          {storePayment.coinsUsed > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coins Redeemed</Text>
              <View style={styles.infoCard}>
                {storePayment.coinRedemption.rezCoins > 0 && (
                  <InfoRow label="ReZ Coins" value={`₹${storePayment.coinRedemption.rezCoins}`} />
                )}
                {storePayment.coinRedemption.promoCoins > 0 && (
                  <InfoRow label="Promo Coins" value={`₹${storePayment.coinRedemption.promoCoins}`} />
                )}
                {storePayment.coinRedemption.payBill > 0 && (
                  <InfoRow label="PayBill Balance" value={`₹${storePayment.coinRedemption.payBill}`} />
                )}
                <InfoRow label="Total Coins Used" value={`₹${storePayment.coinRedemption.totalAmount}`} />
              </View>
            </View>
          )}

          {/* Rewards Earned */}
          {storePayment.rewards && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rewards Earned</Text>
              <View style={[styles.infoCard, { backgroundColor: '#ECFDF5' }]}>
                <View style={styles.rewardsRow}>
                  <View style={styles.rewardItemSmall}>
                    <Ionicons name="cash-outline" size={24} color="#10B981" />
                    <Text style={styles.rewardValueSmall}>₹{storePayment.rewards.cashbackEarned}</Text>
                    <Text style={styles.rewardLabelSmall}>Cashback</Text>
                  </View>
                  <View style={styles.rewardItemSmall}>
                    <Image
                      source={require('@/assets/images/rez-coin.png')}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                    <Text style={styles.rewardValueSmall}>{storePayment.rewards.coinsEarned}</Text>
                    <Text style={styles.rewardLabelSmall}>Coins</Text>
                  </View>
                  {storePayment.rewards.bonusCoins > 0 && (
                    <View style={styles.rewardItemSmall}>
                      <Ionicons name="gift" size={24} color="#8B5CF6" />
                      <Text style={styles.rewardValueSmall}>{storePayment.rewards.bonusCoins}</Text>
                      <Text style={styles.rewardLabelSmall}>Bonus</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // Wallet transaction rendering (original code)
  const statusColor = getStatusColor(transaction!.status.current);
  const typeColor = getTypeColor(transaction!.type);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

      {/* Header */}
      <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Transaction Amount Card */}
        <View style={styles.amountCard}>
          <View style={[styles.typeIconContainer, { backgroundColor: `${typeColor}20` }]}>
            <Ionicons name={getTypeIcon(transaction.type) as any} size={32} color={typeColor} />
          </View>
          <Text style={[styles.amountText, { color: typeColor }]}>
            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} {transaction.currency}
          </Text>
          <View style={[styles.statusBadgeLarge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusTextLarge, { color: statusColor }]}>
              {transaction.status.current}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.infoCard}>
            <Text style={styles.description}>{transaction.description}</Text>
          </View>
        </View>

        {/* Transaction Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Transaction ID" value={transaction.transactionId} />
            <InfoRow label="Type" value={transaction.type.toUpperCase()} />
            <InfoRow label="Category" value={transaction.category} />
            <InfoRow label="Date" value={formatDate(transaction.createdAt)} />
          </View>
        </View>

        {/* Balance Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Balance Before" value={`${transaction.balanceBefore} ${transaction.currency}`} />
            <InfoRow label="Balance After" value={`${transaction.balanceAfter} ${transaction.currency}`} />
            {transaction.fees && transaction.fees > 0 && (
              <InfoRow label="Fees" value={`${transaction.fees} ${transaction.currency}`} />
            )}
            {transaction.netAmount && (
              <InfoRow label="Net Amount" value={`${transaction.netAmount} ${transaction.currency}`} />
            )}
          </View>
        </View>

        {/* Source Information */}
        {transaction.source && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Type" value={transaction.source.type} />
              {transaction.source.description && (
                <InfoRow label="Description" value={transaction.source.description} />
              )}
              <InfoRow label="Reference" value={transaction.source.reference} />
            </View>
          </View>
        )}

        {/* Status History */}
        {transaction.status.history && transaction.status.history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status History</Text>
            <View style={styles.infoCard}>
              {transaction.status.history.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>{item.status}</Text>
                    <Text style={styles.historyDate}>
                      {formatDate(item.timestamp)}
                    </Text>
                    {item.reason && (
                      <Text style={styles.historyReason}>{item.reason}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Info */}
        {transaction.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.infoCard}>
              <Text style={styles.notes}>{transaction.notes}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  typeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  description: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  notes: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C06A',
    marginTop: 6,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  historyReason: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#00C06A',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Store payment specific styles
  storeNameText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rewardItemSmall: {
    alignItems: 'center',
    gap: 4,
  },
  rewardValueSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  rewardLabelSmall: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default TransactionDetailPage;