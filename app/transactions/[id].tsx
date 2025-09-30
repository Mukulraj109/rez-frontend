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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import walletApi, { TransactionResponse } from '@/services/walletApi';

const TransactionDetailPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTransactionDetail();
    }
  }, [id]);

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📜 [Transaction Detail] Fetching:', id);

      const response = await walletApi.getTransactionById(id);

      if (response.success && response.data) {
        console.log('📜 [Transaction Detail] Loaded:', response.data.transaction.transactionId);
        setTransaction(response.data.transaction);
      } else {
        setError(response.error || 'Transaction not found');
      }
    } catch (err) {
      console.error('📜 [Transaction Detail] Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!transaction) return;

    try {
      const message = `
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
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
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

  const statusColor = getStatusColor(transaction.status.current);
  const typeColor = getTypeColor(transaction.type);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TransactionDetailPage;